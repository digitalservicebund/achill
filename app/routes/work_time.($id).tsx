import {
  json,
  redirect,
  type ActionFunctionArgs,
  type TypedResponse,
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import moment from "moment";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { ZodError } from "zod";
import {
  DAYS_OF_WEEK,
  type PersonioAttendance,
} from "~/apis/personio/Personio.types";
import {
  deleteAttendance,
  patchAttendance,
  postAttendance,
} from "~/apis/personio/PersonioApiController";
import { TimeInput } from "~/components/common/TimeInput";
import {
  addMinutesToTime,
  minutesToTime,
  type Time,
} from "~/utils/dateTimeUtils";
import { workTimeFormDataSchema } from "~/utils/workTimeFormValidator";

type ActionResponse =
  | (PersonioAttendance & { success: boolean })
  | { id: number; success: boolean }
  | ZodError<any>;
export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> {
  const formData = await request.formData();
  const id = params.id;

  try {
    const { _action, ...formDataObj } = Object.fromEntries(formData.entries());

    switch (_action) {
      case "POST": {
        const { date, startTime, breakTime, endTime } =
          workTimeFormDataSchema.parse(formDataObj);
        return await postAttendance(
          request,
          date,
          startTime,
          endTime,
          breakTime,
        );
      }
      case "PATCH": {
        if (!id) {
          throw new Response("Attendance ID is required.", { status: 400 });
        }
        const { date, startTime, breakTime, endTime } =
          workTimeFormDataSchema.parse(formDataObj);
        return await patchAttendance(id, date, startTime, endTime, breakTime);
      }
      case "DELETE":
        if (!id) {
          throw new Response("Attendance ID is required.", { status: 400 });
        }
        return await deleteAttendance(id);
      default:
        throw new Response("Method Not Allowed", { status: 405 });
    }
  } catch (e) {
    if (e instanceof ZodError) {
      return json(e, { status: 422 });
    }
    if (e instanceof Error && e.message === "Invalid credentials") {
      console.error("Personio auth failed", e);
      throw redirect("/login");
    }
    throw e;
  }
}

const DEFAULT_START_TIME: Time = "09:00";
const DEFAULT_BREAK_TIME = 60;

function getEndTime(workTime: number) {
  // calculate end time based on daily work time from personio
  const momentStartTime = moment(DEFAULT_START_TIME, "HH:mm");
  // e.g. 36h work week results in 7:12 hours -> round up/down to full fifteen minutes
  const workTimeMinutes = Math.round((workTime * 60) / 15) * 15;
  const momentWorkTime = moment(minutesToTime(workTimeMinutes), "HH:mm");

  return momentStartTime
    .add(DEFAULT_BREAK_TIME, "minutes")
    .add(momentWorkTime.hours(), "hours")
    .add(momentWorkTime.minutes(), "minutes")
    .format("HH:mm") as Time;
}

interface Props {
  selectedDate: Date;
  workingHours: Record<string, number>;
  attendances: PersonioAttendance[];
  setAttendances: Dispatch<SetStateAction<PersonioAttendance[]>>;
}
export function WorkTimeForm({
  selectedDate,
  workingHours,
  attendances,
  setAttendances,
}: Readonly<Props>) {
  const fetcher = useFetcher<typeof action>();

  const attendanceOfSelectedDate = attendances.find(
    (attendance) =>
      attendance.date === moment(selectedDate).format("YYYY-MM-DD"),
  );

  const workTime =
    workingHours[DAYS_OF_WEEK[moment(selectedDate).weekday() - 1]];

  const [startTime, setStartTime] = useState(
    attendanceOfSelectedDate
      ? attendanceOfSelectedDate.startTime
      : DEFAULT_START_TIME,
  );
  const [breakTime, setBreakTime] = useState(
    attendanceOfSelectedDate
      ? attendanceOfSelectedDate.breakTime
      : DEFAULT_BREAK_TIME,
  );
  const [endTime, setEndTime] = useState(
    attendanceOfSelectedDate
      ? attendanceOfSelectedDate.endTime
      : getEndTime(workTime),
  );
  const [isEdit, setIsEdit] = useState(!attendanceOfSelectedDate);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  function setIsEditPreventSubmit(event: any, value: boolean) {
    event.preventDefault();
    setIsEdit(value);
  }

  useEffect(() => {
    if (fetcher.state !== "loading" || !fetcher.data) return;
    if ("issues" in fetcher.data) {
      const errors = fetcher.data.issues.reduce(
        (errors, issue) => ({
          ...errors,
          [issue.path[0]]: issue.message,
        }),
        {},
      );
      setValidationErrors(errors);
    } else if (
      fetcher.state === "loading" &&
      fetcher.data?.success &&
      fetcher.formData
    ) {
      const submittedAttendance = fetcher.data;

      switch (fetcher.formData.get("_action")) {
        case "POST":
          setIsEdit(false);
          setAttendances((prevAttendances) => [
            ...prevAttendances,
            submittedAttendance as PersonioAttendance,
          ]);
          break;
        case "PATCH":
          setIsEdit(false);
          setAttendances((prevAttendances) =>
            prevAttendances.map((attendance) =>
              attendance.id === submittedAttendance.id
                ? (submittedAttendance as PersonioAttendance)
                : attendance,
            ),
          );
          break;
        case "DELETE":
          setIsEdit(true);
          setAttendances((prevAttendances) =>
            prevAttendances.filter(
              (attendance) => attendance.id !== submittedAttendance.id,
            ),
          );
          break;
        default:
          break;
      }
    }
  }, [fetcher.state, fetcher.data, fetcher.formData, setAttendances]);

  function setTime<T extends string | number>(
    time: T,
    setter: Dispatch<SetStateAction<T>>,
  ) {
    setter(time);
    setValidationErrors({});
  }

  const isDisabled = fetcher.state === "submitting";

  return (
    <fetcher.Form
      method="POST"
      action={`/work_time/${attendanceOfSelectedDate?.id ?? ""}`}
      id="work-time-form"
      className={`relative flex justify-between rounded-lg bg-gray-100 p-4 shadow-lg${isDisabled ? " opacity-50" : ""}`}
      {...{ inert: isDisabled ? "" : undefined }} // syntax needed until React 19 https://github.com/facebook/react/issues/17157
    >
      <div className="flex flex-col md:flex-row gap-3 md:gap-0 md:flex-grow justify-between self-start">
        <TimeInput
          name="startTime"
          time={startTime}
          label="Start time"
          readOnly={!isEdit}
          hasError={!!validationErrors.allTimes}
          onAdd={() => setTime(addMinutesToTime(startTime, 15), setStartTime)}
          onRemove={() =>
            setTime(addMinutesToTime(startTime, -15), setStartTime)
          }
          onChange={(e) => setTime(e.target.value as Time, setStartTime)}
        />
        <TimeInput
          name="breakTime"
          time={breakTime}
          label="Break"
          readOnly={!isEdit}
          hasError={!!validationErrors.allTimes || !!validationErrors.breakTime}
          onAdd={() => setTime(breakTime + 15, setBreakTime)}
          onRemove={() => setTime(breakTime - 15, setBreakTime)}
          onChange={(e) => setTime(Number(e.target.value), setBreakTime)}
        />
        <TimeInput
          name="endTime"
          time={endTime}
          label="End time"
          readOnly={!isEdit}
          hasError={!!validationErrors.allTimes}
          onAdd={() => setTime(addMinutesToTime(endTime, 15), setEndTime)}
          onRemove={() => setTime(addMinutesToTime(endTime, -15), setEndTime)}
          onChange={(e) => setTime(e.target.value as Time, setEndTime)}
        />
      </div>
      <input
        name="date"
        value={moment(selectedDate).format("YYYY-MM-DD")}
        readOnly
        hidden
      />
      {Object.entries(validationErrors).length > 0 && (
        <ul className="font-bold text-red-600 absolute -top-6 right-4">
          {Object.entries(validationErrors).map(([key, value]) => (
            <li key={key}>&#x26A0; {value}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-col lg:flex-row gap-2 self-end justify-end items-end basis-40 lg:basis-60">
        {attendanceOfSelectedDate ? (
          isEdit ? (
            <>
              <button
                type="reset"
                onClick={(e) => setIsEditPreventSubmit(e, false)}
                className="tracky-btn danger"
              >
                Cancel
              </button>
              <button name="_action" value="PATCH" className="tracky-btn">
                Update
              </button>
            </>
          ) : (
            <>
              <button
                name="_action"
                value="DELETE"
                className="tracky-btn danger"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={(e) => setIsEditPreventSubmit(e, true)}
                className="tracky-btn"
              >
                Edit
              </button>
            </>
          )
        ) : (
          <button name="_action" value="POST" className="tracky-btn">
            Save
          </button>
        )}
      </div>
    </fetcher.Form>
  );
}
