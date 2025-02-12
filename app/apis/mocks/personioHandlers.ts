import { HttpResponse, http } from "msw";
import type {
  PersonioAttendanceAttributes,
  PersonioAttendancePeriod,
} from "../personio/PersonioApiController";
import AUTH from "./stubs/personio/auth.json";
import EMPLOYEE from "./stubs/personio/employee.json";
import EMPLOYEES from "./stubs/personio/employees.json";

export class AttendancesService {
  private static instance: AttendancesService;
  private attendances: PersonioAttendancePeriod[] = [];

  private constructor() {
    this.attendances = [];
  }

  public static getInstance(): AttendancesService {
    if (!AttendancesService.instance) {
      AttendancesService.instance = new AttendancesService();
    }
    return AttendancesService.instance;
  }

  getAttendances() {
    return this.attendances;
  }

  getAttendance(id: number) {
    return this.attendances.find((attendance) => attendance.id === id);
  }

  createAttendance(
    attendance: PersonioAttendanceAttributes,
  ): PersonioAttendancePeriod {
    const newAttendance: PersonioAttendancePeriod = {
      id: this.attendances.length + 1,
      type: "AttendancePeriod",
      attributes: attendance,
    };
    this.attendances.push(newAttendance);
    return newAttendance;
  }

  updateAttendance(
    id: number,
    attendance: PersonioAttendanceAttributes,
  ): PersonioAttendancePeriod | undefined {
    const attendanceToUpdate = this.getAttendance(id);
    if (attendanceToUpdate) {
      attendanceToUpdate.attributes = attendance;
    }
    return attendanceToUpdate;
  }

  deleteAttendance(id: number) {
    this.attendances = this.attendances.filter(
      (attendance) => attendance.id !== id,
    );
  }

  resetAttendances() {
    this.attendances = [];
  }
}

const attendanceService = AttendancesService.getInstance();

export const handlers = [
  http.post("https://api.personio.de/v1/auth", () => {
    return HttpResponse.json(AUTH);
  }),
  http.get("https://api.personio.de/v1/company/employees", () => {
    return HttpResponse.json(EMPLOYEES);
  }),
  http.get("https://api.personio.de/v1/company/employees/:id", () => {
    return HttpResponse.json(EMPLOYEE);
  }),
  http.get("https://api.personio.de/v1/company/attendances", () => {
    return HttpResponse.json({
      success: true,
      metadata: {
        total_elements: 1,
        current_page: 0,
        total_pages: 1,
      },
      data: attendanceService.getAttendances(),
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
      const newAttendance =
        attendanceService.createAttendance(attendanceAttributes);
      return HttpResponse.json(
        {
          success: true,
          data: {
            message: "Attendance created successfully.",
            id: [newAttendance.id],
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
      const attendanceToUpdate = attendanceService.updateAttendance(
        parseInt(id as string),
        attendanceAttributes,
      );
      if (!attendanceToUpdate) {
        return HttpResponse.json(
          {
            success: false,
            data: {
              message: "Attendance not found.",
            },
          },
          { status: 404 },
        );
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
      attendanceService.deleteAttendance(parseInt(id as string));
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
