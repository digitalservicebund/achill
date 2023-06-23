import md5 from "crypto-js/md5.js";
import { sleep } from "./TestHelper";
import moment from "moment";

export const username = "user.name";
export const password = "s3cr3t";

const mockData = {
  client: {
    Name: "DigitalService GmbH des Bundes",
    Id: 123,
  },
  employee: {
    Id: 456,
  },
  calculationPositions: [
    {
      DisplayPath: "FirstProject",
      Id: 100,
    },
    {
      DisplayPath: "SecondProject",
      Id: 101,
    },
  ],
  calendarEvents: [
    {
      id: "12826",
      Start: "2023-05-29 00:00:00",
      End: "2023-05-29 23:59:59",
      Subject: "Pfingstmontag",
      Type: "H",
    },
    {
      id: "P6646",
      Start: "2023-06-15 09:00:00",
      End: "2023-06-16 18:00:00",
      Subject: "Bezahlter Urlaub",
      Type: "P",
    },
  ],
};

export default class TroiApiStub {
  constructor() {
    this.entries = {};
    mockData.calculationPositions.forEach((project) => {
      this.entries[project.Id] = [];
    });

    this.correctAuthnHeader = `Basic ${btoa(`${username}:${md5(password)}`)}`;
  }

  addEntry(projectId, entry) {
    this.entries[projectId].push(entry);
  }

  deleteEntry(id) {
    mockData.calculationPositions.forEach((project) => {
      this.entries[project.Id] = this.entries[project.Id].filter(
        (entry) => entry.Id !== id
      );
    });
  }

  updateEntry(projectId, id, updatedEntry) {
    this.entries[projectId] = this.entries[projectId].map((entry) => {
      if (entry.id === id) {
        return updatedEntry;
      }
      return entry;
    });
  }

  isAuthorized(authnHeader) {
    return authnHeader === this.correctAuthnHeader;
  }

  unauthorizedResponse() {
    return this._response({ status: 401 });
  }

  async match(method, pathname, params, postData) {
    if (method === "GET" && pathname.endsWith("/clients")) {
      return this._response({ jsonBody: [mockData.client] });
    } else if (
      method === "GET" &&
      pathname.endsWith("/employees") &&
      params.get("clientId") === mockData.client.Id.toString() &&
      params.get("employeeLoginName") === username
    ) {
      return this._response({ jsonBody: [mockData.employee] });
    } else if (
      method === "GET" &&
      pathname.endsWith("/calculationPositions") &&
      params.get("clientId") === mockData.client.Id.toString() &&
      params.get("favoritesOnly") === "true"
    ) {
      return this._response({ jsonBody: mockData.calculationPositions });
    } else if (
      method === "GET" &&
      pathname.endsWith("/billings/hours") &&
      params.get("clientId") === mockData.client.Id.toString() &&
      params.get("employeeId") === mockData.employee.Id.toString()
    ) {
      return this._response({
        jsonBody: this.entries[params.get("calculationPositionId")],
      });
    } else if (method === "POST" && pathname.endsWith("/billings/hours")) {
      const projectId = parseInt(
        postData.CalculationPosition.Path.split("/").at(-1)
      );
      const newEntryId = `${projectId}${this.entries[projectId].length}`;
      this.addEntry(projectId, {
        id: newEntryId,
        Date: postData.Date,
        Quantity: postData.Quantity,
        Remark: postData.Remark,
      });
      return this._response({
        jsonBody: {
          id: newEntryId,
          Date: postData.Date,
          Quantity: postData.Quantity,
          Name: postData.Remark,
        },
      });
    } else if (method === "PUT" && pathname.indexOf("/billings/hours") > -1) {
      const splittedPath = pathname.split("/");
      const entryId = parseInt(splittedPath[splittedPath.length - 1], 10);
      const projectId = parseInt(
        postData.CalculationPosition.Path.split("/").at(-1)
      );
      this.updateEntry(projectId, entryId, {
        entryId,
        Date: postData.Date,
        Quantity: postData.Quantity,
        Remark: postData.Remark,
      });
      return this._response({
        jsonBody: {
          id: entryId,
          Date: postData.Date,
          Quantity: postData.Quantity,
          Name: postData.Remark,
        },
      });
    } else if (method === "GET" && pathname.endsWith("/calendarEvents")) {
      const startDate = moment(params.get("start"), "YYYYMMDD").toDate();
      const endDate = moment(params.get("end"), "YYYYMMDD").toDate();
      const type = params.get("type");

      const result = mockData.calendarEvents.filter((calEvent) => {
        const calEventStart = Date.parse(calEvent["Start"]);
        const calEventEnd = Date.parse(calEvent["Start"]);
        const isInRange =
          (calEventStart >= startDate && calEventStart <= endDate) ||
          (calEventEnd >= startDate && calEventEnd <= endDate);
        const typeMatches = type == "" ? true : calEvent["Type"] == type;

        return isInRange && typeMatches;
      });

      return this._response({ jsonBody: result });
    } else {
      return null;
    }
  }

  async _response({ status = 200, jsonBody = {} }) {
    // Simulate trois api delay
    await sleep(100);
    return {
      status: status,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(jsonBody),
    };
  }
}
