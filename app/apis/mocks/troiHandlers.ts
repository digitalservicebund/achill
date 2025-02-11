import md5 from "crypto-js/md5.js";
import { HttpResponse, delay, http } from "msw";
import projectTimes from "./stubs/troi/billings_hours.json";
import calculationPositions from "./stubs/troi/calculationPositions.json";
import calendarEvents from "./stubs/troi/calendarEvents.json";
import clients from "./stubs/troi/clients.json";
import employees from "./stubs/troi/employees.json";

// Replace holiday with two weeks ago
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const holiday = calendarEvents.find((event) => event.Subject === "Holiday")!;
const holidayDate = new Date(Date.now() - 14 * 86400000)
  .toISOString()
  .split("T")[0];
holiday.Start = `${holidayDate} 00:00:00`;
holiday.End = `${holidayDate} 23:59:59`;

// Replace invoiced project time date with one week ago
const oneWeekAgo = new Date(Date.now() - 7 * 86400000)
  .toISOString()
  .split("T")[0];
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
projectTimes.find((pt) => pt.Remark === "Invoiced")!.Date = oneWeekAgo;

export const handlers = [
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/calculationPositions",
    () => HttpResponse.json(calculationPositions),
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/clients",
    ({ request }) => {
      const expectedAuthHeader =
        "Basic " + btoa(`max.mustermann:${md5("aSafePassword")}`);
      if (request.headers.get("authorization") === expectedAuthHeader) {
        return HttpResponse.json(clients);
      } else {
        return new HttpResponse(null, { status: 403 });
      }
    },
  ),
  http.get("https://digitalservice.troi.software/api/v2/rest/employees", () =>
    HttpResponse.json(employees),
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/calendarEvents",
    () => {
      return HttpResponse.json(calendarEvents);
    },
  ),
  http.get(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours",
    () => HttpResponse.json(projectTimes),
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
      projectTimes.push({
        CalculationPosition: {
          id: 4,
        },
        id,
        Date: body.Date,
        Quantity: body.Quantity,
        Remark: body.Remark,
        IsBillable: body.IsBillable,
        IsInvoiced: false,
      });

      await delay(50);
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
        (pt) => pt.id === parseInt(id as string),
      );
      if (!projectTime) {
        return HttpResponse.json(null, { status: 404 });
      }

      projectTime.Quantity = body.Quantity;
      projectTime.Remark = body.Remark;

      await delay(50);
      return HttpResponse.json({});
    },
  ),
  http.delete(
    "https://digitalservice.troi.software/api/v2/rest/billings/hours/:id",
    async ({ params }) => {
      const { id } = params;
      const projectTimeIndex = projectTimes.findIndex(
        (pt) => pt.id === parseInt(id as string),
      );
      if (projectTimeIndex === -1) {
        return HttpResponse.json(null, { status: 404 });
      }

      projectTimes.splice(projectTimeIndex, 1);
      await delay(50);
      return HttpResponse.json({});
    },
  ),
];
