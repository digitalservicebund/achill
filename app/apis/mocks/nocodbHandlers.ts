import { HttpResponse, http } from "msw";
import TrackyPositionPhase from "./stubs/nocodb/Tracky-Position-Phase.json";
import TrackySubprojectPhase from "./stubs/nocodb/Tracky-Subproject-Phase.json";
import TrackyPhase from "./stubs/nocodb/Tracky-Phase.json";
import TrackyTask from "./stubs/nocodb/Tracky-Task.json";

export const handlers = [
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/noco/ds4g-data/Tracky-Position-Phase/views/Tracky-Position-Phase`,
    () => HttpResponse.json(TrackyPositionPhase),
  ),
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/noco/ds4g-data/Tracky-Subproject-Phase/views/Tracky-Subproject-Phase`,
    () => HttpResponse.json(TrackySubprojectPhase),
  ),
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/noco/ds4g-data/Tracky-Phase/views/Tracky-Phase`,
    () => HttpResponse.json(TrackyPhase),
  ),
  http.get(
    `${process.env.NOCODB_BASE_URL}/api/v1/db/data/v1/ds4g-data/Tracky-Task`,
    () => HttpResponse.json(TrackyTask),
  ),
];
