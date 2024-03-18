import { HttpResponse, http } from "msw";

export const handlers = [
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/noco/ds4g-data/Tracky-Position-Phase/views/Tracky-Position-Phase`,
    () =>
      HttpResponse.json(require("./stubs/nocodb/Tracky-Position-Phase.json")),
  ),
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/noco/ds4g-data/Tracky-Subproject-Phase/views/Tracky-Subproject-Phase`,
    () =>
      HttpResponse.json(require("./stubs/nocodb/Tracky-Subproject-Phase.json")),
  ),
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/noco/ds4g-data/Tracky-Phase/views/Tracky-Phase`,
    () => HttpResponse.json(require("./stubs/nocodb/Tracky-Phase.json")),
  ),
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/v1/ds4g-data/Tracky-Task`,
    () => HttpResponse.json(require("./stubs/nocodb/Tracky-Task.json")),
  ),
];
