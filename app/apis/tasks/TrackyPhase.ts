import type { CalculationPosition } from "../troi/Troi.types";
import nocodbApi from "./NocoDBClient.server";

type TrackyPositionPhase = {
  Id: number;
  "Phase ID": number;
  "Position ID": string;
};

type TrackySubprojectPhase = {
  Id: number;
  "Phase ID": number;
  "Subproject ID": number;
};

export type TrackyPhase = {
  Id: number;
  "Phase ID": number;
  "Phase Name": string;
};

export async function loadView<T>(view: string) {
  const response = await nocodbApi.dbViewRow.list(
    "noco",
    "ds4g-data",
    view,
    view,
  );
  console.log("[NocoDB] GET", view, 200);
  return response.list as T[];
}

export async function loadPositionPhases() {
  return loadView<TrackyPositionPhase>("Tracky-Position-Phase");
}

export async function loadSubprojectPhases() {
  return loadView<TrackySubprojectPhase>("Tracky-Subproject-Phase");
}

export async function loadPhases() {
  return loadView<TrackyPhase>("Tracky-Phase");
}

export function getPhasesPerCalculationPosition(
  phases: TrackyPhase[],
  positionPhases: TrackyPositionPhase[],
  subprojectPhases: TrackySubprojectPhase[],
  calculationPositions: CalculationPosition[],
) {
  return Object.fromEntries(
    calculationPositions.map(({ id, subprojectId }) => {
      const filteredPositionPhases = positionPhases.filter(
        (positionPhase) => positionPhase["Position ID"] === id.toString(),
      );
      const filteredSubprojectPhases = subprojectPhases.filter(
        (subprojectPhase) => subprojectPhase["Subproject ID"] === subprojectId,
      );

      const joinedPhaseIds = [
        ...filteredPositionPhases,
        ...filteredSubprojectPhases,
      ].map((phase) => phase["Phase ID"]);
      const trackyPhases = phases.filter((phase) =>
        joinedPhaseIds.includes(phase["Phase ID"]),
      );

      return [id, trackyPhases];
    }),
  );
}
