import { data } from "react-router";
import moment from "moment";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import type { Time } from "~/utils/dateTimeUtils";
import {
  END_DATE,
  START_DATE,
  convertTimeStringToFloat,
} from "~/utils/dateTimeUtils";
import type { PersonioAttendance, PersonioEmployee } from "./Personio.types";

const PERSONIO_BASE_URL = "https://api.personio.de/v1";
const PERSONIO_AUTH_URL = `${PERSONIO_BASE_URL}/auth`;
const PERSONIO_EMPLOYEES_URL = `${PERSONIO_BASE_URL}/company/employees`;
const PERSONIO_ATTENDANCES_URL = `${PERSONIO_BASE_URL}/company/attendances`;
const PERSONIO_PARTNER_ID = "DIGITALSERVICE";
const DIGITALSERVICE_MAIL_DOMAIN = "digitalservice.bund.de";

async function getAuthToken(): Promise<string> {
  console.log("Loading new Personio auth token...");

  const response = await fetch(PERSONIO_AUTH_URL, {
    method: "POST",
    headers: {
      "X-Personio-Partner-ID": PERSONIO_PARTNER_ID,
    },
    body: JSON.stringify({
      client_id: process.env.PERSONIO_CLIENT_ID,
      client_secret: process.env.PERSONIO_CLIENT_SECRET,
    }),
  });

  console.log("[Personio API]", "POST", PERSONIO_AUTH_URL, response.status);

  const { success, data } = await response.json();

  if (!success) {
    console.error(
      "Couldn't load new Personio auth token! Is the client_id and client_secret still correct?",
    );
    throw new Error("Personio Api Auth Failed");
  }

  return data.token;
}

let authToken: Promise<string> | undefined;
async function fetchWithPersonioAuth(
  input: string | URL,
  init?: RequestInit | undefined,
) {
  if (authToken === undefined) {
    authToken = getAuthToken();
  }

  const url = new URL(input);

  const fetchData = async (authToken: string) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "X-Personio-Partner-ID": PERSONIO_PARTNER_ID,
        ...init?.headers,
      },
    });
    console.log(
      "[Personio]",
      init?.method ?? "GET",
      url.pathname,
      response.status,
    );
    return response;
  };

  const response = await fetchData(await authToken);
  if (response.status === 401) {
    authToken = getAuthToken();
    return (await fetchData(await authToken)).json();
  }

  return await response.json();
}

interface Employee {
  type: "Employee";
  attributes: {
    id: {
      value: number;
    };
    work_schedule: {
      value: {
        attributes: {
          monday: string;
          tuesday: string;
          wednesday: string;
          thursday: string;
          friday: string;
          saturday: string;
          sunday: string;
        };
      };
    };
  };
}
export interface PersonioApiEmployees {
  success: true;
  data: Employee[];
}
export async function initializePersonioApi(
  username: string,
): Promise<PersonioEmployee> {
  console.time("initializePersonioApi");
  const url = new URL(PERSONIO_EMPLOYEES_URL);
  const mailAddress = `${username}@${DIGITALSERVICE_MAIL_DOMAIN}`;
  url.searchParams.set("email", mailAddress);
  url.searchParams.set("limit", "1");
  url.searchParams.set("offset", "0");

  const employeeData = await fetchWithPersonioAuth(url);

  if (!employeeData.success) {
    throw new Error("Personio employee not found");
  }

  const schedule =
    employeeData.data[0].attributes.work_schedule.value.attributes;
  console.timeEnd("initializePersonioApi");
  return {
    personioId: employeeData.data[0].attributes.id.value,
    workingHours: {
      monday: convertTimeStringToFloat(schedule.monday),
      tuesday: convertTimeStringToFloat(schedule.tuesday),
      wednesday: convertTimeStringToFloat(schedule.wednesday),
      thursday: convertTimeStringToFloat(schedule.thursday),
      friday: convertTimeStringToFloat(schedule.friday),
    },
  };
}

export type PersonioAttendanceAttributes = {
  employee: number;
  date: string;
  start_time: string;
  end_time: string;
  break: number;
};
type PersonioAttendancePeriod = {
  id: number;
  type: "AttendancePeriod";
  attributes: PersonioAttendanceAttributes;
};
export type PersonioApiAttendances = {
  success: boolean;
  metadata: {
    total_elements: number;
    current_page: number;
    total_pages: number;
  };
  data: PersonioAttendancePeriod[];
  offset: string;
  limit: string;
};
export async function getAttendances(
  employeeId: number,
): Promise<PersonioAttendance[]> {
  // There is a limit of 200 attendances per API request so we loop ofer the pagniated data and combine the results
  const LIMIT = 200;
  let offset = 0;
  let data: PersonioAttendancePeriod[] = [];
  let hasMorePages = true;

  while (hasMorePages) {
    const url = new URL(PERSONIO_ATTENDANCES_URL);
    url.searchParams.set("start_date", moment(START_DATE).format("YYYY-MM-DD"));
    url.searchParams.set("end_date", moment(END_DATE).format("YYYY-MM-DD"));
    url.searchParams.set("employees", employeeId.toString());
    url.searchParams.set("offset", offset.toString());
    url.searchParams.set("limit", LIMIT.toString());

    const result = await fetchWithPersonioAuth(url);
    data = [...data, ...result.data];

    hasMorePages =
      result.metadata.current_page < result.metadata.total_pages - 1;
    offset += LIMIT;
  }

  return data.map(
    ({
      id,
      attributes: {
        date,
        start_time: startTime,
        end_time: endTime,
        break: breakTime,
      },
    }) =>
      ({
        id,
        date,
        startTime,
        endTime,
        breakTime,
      }) as PersonioAttendance,
  );
}

type PersonioPostResponse = {
  success: boolean;
  data: {
    message: string;
    id: number[];
  };
};
export async function postAttendance(
  request: Request,
  date: string,
  startTime: Time,
  endTime: Time,
  breakTime: number,
) {
  const session = await getSessionAndThrowIfInvalid(request);
  const employee = session.get("personioEmployee")?.personioId;

  const response = (await fetchWithPersonioAuth(PERSONIO_ATTENDANCES_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      attendances: [
        {
          employee,
          date,
          start_time: startTime,
          end_time: endTime,
          break: breakTime,
        },
      ],
    }),
  })) as PersonioPostResponse;

  if (!response.success) {
    throw new Response("Failed to create attendance");
  }

  return data(
    {
      success: true,
      id: response.data.id[0],
      date,
      startTime,
      endTime,
      breakTime,
    },
    { status: 201 },
  );
}

export async function patchAttendance(
  attendanceId: string,
  date: string,
  startTime: Time,
  endTime: Time,
  breakTime: number,
) {
  const response = await fetchWithPersonioAuth(
    `${PERSONIO_ATTENDANCES_URL}/${attendanceId}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        date,
        start_time: startTime,
        end_time: endTime,
        break: breakTime,
      }),
    },
  );

  if (!response.success) {
    throw new Response("Failed to update attendance");
  }

  return {
    success: true,
    id: parseInt(attendanceId),
    date,
    startTime,
    endTime,
    breakTime,
  };
}

export async function deleteAttendance(attendanceId: string) {
  const response = await fetchWithPersonioAuth(
    `${PERSONIO_ATTENDANCES_URL}/${attendanceId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.success) {
    throw new Response("Failed to delete attendance");
  }

  return { success: true, id: parseInt(attendanceId) };
}
