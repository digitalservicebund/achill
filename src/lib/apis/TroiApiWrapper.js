export default class TroiApiWrapper {
  async init(api) {
    this.api = api;
    this.clientId = await this.api.getClientId();
    this.employeeId = await this.api.getEmployeeId();
  }

  async updateEntry(projectId, entry) {
    const payload = {
      Client: {
        Path: `/clients/${this.clientId}`,
      },
      CalculationPosition: {
        Path: `/calculationPositions/${projectId}`,
      },
      Employee: {
        Path: `/employees/${this.employeeId}`,
      },
      Date: entry.date,
      Quantity: entry.hours,
      Remark: entry.description,
    };

    return await this.api.makeRequest({
      url: `/billings/hours/${entry.id}`,
      headers: { "Content-Type": "application/json" },
      method: "put",
      body: JSON.stringify(payload),
    });
  }

  async addEntry(projectId, date, hours, description) {
    const payload = {
      Client: {
        Path: `/clients/${this.clientId}`,
      },
      CalculationPosition: {
        Path: `/calculationPositions/${projectId}`,
      },
      Employee: {
        Path: `/employees/${this.employeeId}`,
      },
      Date: date,
      Quantity: hours,
      Remark: description,
    };

    return await this.api.makeRequest({
      url: "/billings/hours",
      headers: { "Content-Type": "application/json" },
      method: "post",
      body: JSON.stringify(payload),
    });
  }
}
