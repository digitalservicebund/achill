import md5 from "crypto-js/md5.js";
import { HttpResponse, delay, http } from "msw";
import PROJECT_TIMES from "./stubs/troi/billings_hours.json";
import CALCULATION_POSITIONS from "./stubs/troi/calculationPositions.json";
import CALENDAR_EVENTS from "./stubs/troi/calendarEvents.json";
import CLIENTS from "./stubs/troi/clients.json";
import EMPLOYEES from "./stubs/troi/employees.json";
import { TroiProjectTime } from "../troi/TroiApiController";

// Replace holiday with two weeks ago
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const HOLIDAY = CALENDAR_EVENTS.find((event) => event.Subject === "Holiday")!;
const HOLIDAY_DATE = new Date(Date.now() - 14 * 86400000)
  .toISOString()
  .split("T")[0];
HOLIDAY.Start = `${HOLIDAY_DATE} 00:00:00`;
HOLIDAY.End = `${HOLIDAY_DATE} 23:59:59`;

// Replace invoiced project time date with one week ago
const oneWeekAgo = new Date(Date.now() - 7 * 86400000)
  .toISOString()
  .split("T")[0];
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
PROJECT_TIMES.find((pt) => pt.Remark === "Invoiced")!.Date = oneWeekAgo;

export class ProjectTimesService {
  private static instance: ProjectTimesService;
  private projectTimes: TroiProjectTime[] = [];

  private constructor() {
    this.projectTimes = [...PROJECT_TIMES];
  }

  public static getInstance(): ProjectTimesService {
    if (!ProjectTimesService.instance) {
      ProjectTimesService.instance = new ProjectTimesService();
    }
    return ProjectTimesService.instance;
  }

  getProjectTimes() {
    return this.projectTimes;
  }

  getProjectTime(id: number) {
    return this.projectTimes.find((projectTime) => projectTime.id === id);
  }

  createProjectTime(projectTime: Omit<TroiProjectTime, "id">): TroiProjectTime {
    const newProjectTime: TroiProjectTime = {
      ...projectTime,
      id: this.projectTimes.length + 1,
    };
    this.projectTimes.push(newProjectTime);
    return newProjectTime;
  }

  updateProjectTime(
    id: number,
    projectTime: TroiProjectTime,
  ): TroiProjectTime | undefined {
    const projectTimeToUpdate = this.getProjectTime(id);
    if (projectTimeToUpdate) {
      projectTimeToUpdate.Quantity = projectTime.Quantity;
      projectTimeToUpdate.Remark = projectTime.Remark;
    }
    return projectTimeToUpdate;
  }

  deleteProjectTime(id: number): boolean {
    const projectTimeIndex = this.projectTimes.findIndex(
      (projectTime) => projectTime.id === id,
    );
    if (projectTimeIndex === -1) {
      return false;
    }
    this.projectTimes.splice(projectTimeIndex, 1);
    return true;
  }

  resetProjectTimes() {
    this.projectTimes = [...PROJECT_TIMES];
  }
}

const projectTimesService = ProjectTimesService.getInstance();

export const handlers = [
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/calculationPositions",
    () => HttpResponse.json(CALCULATION_POSITIONS),
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/clients",
    ({ request }) => {
      const expectedAuthHeader =
        "Basic " + btoa(`max.mustermann:${md5("aSafePassword")}`);
      if (request.headers.get("authorization") === expectedAuthHeader) {
        return HttpResponse.json(CLIENTS);
      } else {
        return new HttpResponse(null, { status: 403 });
      }
    },
  ),
  http.get("https://digitalservice.troi.software/api/v2/rest/employees", () =>
    HttpResponse.json(EMPLOYEES),
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/calendarEvents",
    () => HttpResponse.json(CALENDAR_EVENTS),
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours",
    () => {
      return HttpResponse.json(projectTimesService.getProjectTimes());
    },
  ),
  http.post(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours",
    async ({ request }) => {
      const body = (await request.json()) as TroiProjectTime;
      const projectTime = projectTimesService.createProjectTime({
        ...body,
        IsInvoiced: false,
        CalculationPosition: {
          id: 4,
        },
      });

      await delay(50);
      return HttpResponse.json({
        id: projectTime.id,
      });
    },
  ),
  http.put(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours/:id",
    async ({ params, request }) => {
      const { id } = params;
      const body = (await request.json()) as TroiProjectTime;
      const projectTime = projectTimesService.updateProjectTime(
        parseInt(id as string),
        body,
      );
      if (!projectTime) {
        return HttpResponse.json(null, { status: 404 });
      }

      await delay(50);
      return HttpResponse.json({});
    },
  ),
  http.delete(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours/:id",
    async ({ params }) => {
      const { id } = params;
      const success = projectTimesService.deleteProjectTime(
        parseInt(id as string),
      );
      if (!success) {
        return HttpResponse.json(null, { status: 404 });
      }

      await delay(50);
      return HttpResponse.json({});
    },
  ),
];
