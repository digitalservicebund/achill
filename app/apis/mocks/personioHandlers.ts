import { HttpResponse, http } from "msw";
import type { PersonioAttendanceAttributes } from "../personio/PersonioApiController";

const attendances = [
  {
    id: 0,
    type: "AttendancePeriod",
    attributes: {
      employee: 19,
      date: "2023-12-20",
      start_time: "09:00",
      end_time: "18:00",
      break: 60,
    },
  },
];

export const handlers = [
  http.post("https://api.personio.de/v1/auth", () => {
    return HttpResponse.json(require("./stubs/personio/auth.json"));
  }),
  http.get("https://api.personio.de/v1/company/employees", () => {
    return HttpResponse.json(require("./stubs/personio/employees.json"));
  }),
  http.get("https://api.personio.de/v1/company/employees/:id", () => {
    return HttpResponse.json(require("./stubs/personio/employee.json"));
  }),
  http.get("https://api.personio.de/v1/company/attendances", () => {
    return HttpResponse.json({
      success: true,
      metadata: {
        total_elements: 1,
        current_page: 0,
        total_pages: 1,
      },
      data: attendances,
      offset: "0",
      limit: "200",
    });
  }),
  http.post(
    "https://api.personio.de/v1/company/attendances",
    async ({ request }) => {
      const body = (await request.json()) as {
        attendances: PersonioAttendanceAttributes[];
      };
      const attendanceAttributes: PersonioAttendanceAttributes =
        body.attendances[0];
      attendances.push({
        id: attendances.length + 1,
        type: "AttendancePeriod",
        attributes: attendanceAttributes,
      });
      return HttpResponse.json(
        {
          success: true,
          data: {
            message: "Attendance created successfully.",
            id: [0],
          },
        },
        { status: 200 },
      );
    },
  ),
  http.patch(
    "https://api.personio.de/v1/company/attendances/:id",
    async ({ params, request }) => {
      const { id } = params;
      const attendanceAttributes =
        (await request.json()) as PersonioAttendanceAttributes;
      const attendanceToUpdate = attendances.find(
        (att) => att.id === parseInt(id as string),
      );
      if (attendanceToUpdate) {
        attendanceToUpdate.attributes = attendanceAttributes;
      }
      return HttpResponse.json(
        {
          success: true,
          data: {
            message: "Attendance updated successfully.",
          },
        },
        { status: 200 },
      );
    },
  ),
  http.delete(
    "https://api.personio.de/v1/company/attendances/:id",
    async ({ params }) => {
      const { id } = params;
      const attendance = attendances.find(
        (attendance) => attendance.id === parseInt(id as string),
      );
      if (attendance) {
        attendances.splice(attendances.indexOf(attendance), 1);
      }
      return HttpResponse.json(
        {
          success: true,
          data: {
            message: "Attendance deleted successfully.",
          },
        },
        { status: 200 },
      );
    },
  ),
];
