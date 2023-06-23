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
  calculationPosition: {
    DisplayPath: "My Project",
    Id: 789,
  },
  calendarEvents: [
    {
      "id": "12826",
      "Start": "2023-05-29 00:00:00",
      "End": "2023-05-29 23:59:59",
      "Subject": "Pfingstmontag",
      "Type": "H"
    },
    {
      "id": "P6646",
      "Start": "2023-06-15 09:00:00",
      "End": "2023-06-16 18:00:00",
      "Subject": "Bezahlter Urlaub",
      "Type": "P"
    }
  ],
};

export default class TroiApiStub {
  constructor() {
    this.entries = [];

    this.correctAuthnHeader = `Basic ${btoa(`${username}:${md5(password)}`)}`;
  }

  addEntry(entry) {
    this.entries.push(entry);
  }

  deleteEntry(id) {
    this.entries = this.entries.filter((entry) => entry.id !== id);
  }

  updateEntry(id, data) {
    this.entries = this.entries.map((entry) => {
      if (entry.id === id) {
        return data;
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
      return this._response({ jsonBody: [mockData.calculationPosition] });
    } else if (
      method === "GET" &&
      pathname.endsWith("/billings/hours") &&
      params.get("clientId") === mockData.client.Id.toString() &&
      params.get("employeeId") === mockData.employee.Id.toString() &&
      params.get("calculationPositionId") ===
      mockData.calculationPosition.Id.toString()
    ) {
      return this._response({ jsonBody: this.entries });
    } else if (method === "POST" && pathname.endsWith("/billings/hours")) {
      this.addEntry({
        id: this.entries.length,
        Date: postData.Date,
        Quantity: postData.Quantity,
        Remark: postData.Remark,
      });
      return this._response({
        jsonBody: {
          id: this.entries.length,
          Date: postData.Date,
          Quantity: postData.Quantity,
          Name: postData.Remark,
        },
      });
    } else if (method === "PUT" && pathname.indexOf("/billings/hours") > -1) {
      const splittedPath = pathname.split("/");
      const id = parseInt(splittedPath[splittedPath.length - 1], 10);
      this.updateEntry(id, {
        id,
        Date: postData.Date,
        Quantity: postData.Quantity,
        Remark: postData.Remark,
      });
      return this._response({
        jsonBody: {
          id: id,
          Date: postData.Date,
          Quantity: postData.Quantity,
          Name: postData.Remark,
        },
      });
    } else if (method === "GET" && pathname.endsWith("/calendarEvents")) {
      const startDate = moment(params.get("start"), "YYYYMMDD").toDate()
      const endDate = moment(params.get("end"), "YYYYMMDD").toDate()
      const type = params.get("type")

      const result = mockData.calendarEvents.filter(calEvent => {
        const calEventStart = Date.parse(calEvent["Start"])
        const calEventEnd = Date.parse(calEvent["Start"])
        const isInRange = (calEventStart >= startDate && calEventStart <= endDate) ||
          (calEventEnd >= startDate && calEventEnd <= endDate)
        const typeMatches = type == "" ? true : calEvent["Type"] == type

        return isInRange && typeMatches
      })

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
