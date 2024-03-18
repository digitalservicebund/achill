import { HttpResponse, http } from "msw";
import md5 from "crypto-js/md5.js";

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
    () => HttpResponse.json(require("./stubs/troi/billings_hours.json")),
  ),
];
