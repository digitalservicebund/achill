import md5 from "crypto-js/md5.js";
import { HttpResponse, http } from "msw";
import { ProjectTime } from "../troi/Troi.types";

const projectTimes = require("./stubs/troi/billings_hours.json");

export const handlers = [
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/calculationPositions",
    () => HttpResponse.json(require("./stubs/troi/calculationPositions.json")),
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/clients",
    ({ request }) => {
      const expectedAuthHeader =
        "Basic " + btoa(`max.mustermann:${md5("aSafePassword")}`);
      if (request.headers.get("authorization") === expectedAuthHeader) {
        return HttpResponse.json(require("./stubs/troi/clients.json"));
      } else {
        return new HttpResponse(null, { status: 403 });
      }
    },
  ),
  http.get("https://digitalservice.troi.software/api/v2/rest/employees", () =>
    HttpResponse.json(require("./stubs/troi/employees.json")),
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/calendarEvents",
    () => HttpResponse.json(require("./stubs/troi/calendarEvents.json")),
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours",
    () => {
      return HttpResponse.json(projectTimes);
    },
  ),
  http.post(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours",
    async ({ request }) => {
      const body = (await request.json()) as {
        Date: string;
        Quantity: number;
        Remark: string;
        IsBillable: boolean;
      };

      const id = projectTimes.length + 1;
      const exampleProjectTime = projectTimes[0];
      projectTimes.push({
        ...exampleProjectTime,
        id,
        Date: body.Date,
        Quantity: body.Quantity,
        Remark: body.Remark,
        IsBillable: body.IsBillable,
      });
      return HttpResponse.json({
        id: 1234,
      });
    },
  ),
  http.put(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours/:id",
    async ({ params, request }) => {
      const { id } = params;
      const body = (await request.json()) as {
        Quantity: number;
        Remark: string;
      };

      const projectTime = projectTimes.find(
        (pt: ProjectTime) => pt.id === parseInt(id as string),
      );
      if (!projectTime) {
        return HttpResponse.json(null, { status: 404 });
      }

      projectTime.Quantity = body.Quantity;
      projectTime.Remark = body.Remark;

      return HttpResponse.json({});
    },
  ),
  http.delete(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours/:id",
    async ({ params }) => {
      const { id } = params;
      const projectTimeIndex = projectTimes.findIndex(
        (pt: ProjectTime) => pt.id === parseInt(id as string),
      );
      if (projectTimeIndex === -1) {
        return HttpResponse.json(null, { status: 404 });
      }

      projectTimes.splice(projectTimeIndex, 1);
      return HttpResponse.json({});
    },
  ),
];
