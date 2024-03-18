import nocodbApi from "./NocoDBClient.server";

export type TrackyTask = {
  Id: number;
  CreatedAt: string;
  UpdatedAt: string;
  type: "PHASE" | "RECURRING";
  name: string;
};

export function filterPhaseTasks(tasks: TrackyTask[]) {
  return tasks.filter((keyword) => keyword.type === "PHASE");
}

export function filterRecurringTasks(tasks: TrackyTask[]) {
  return tasks.filter((keyword) => keyword.type === "RECURRING");
}

export async function loadTasks() {
  const tasks = await nocodbApi.dbTableRow.list(
    "v1",
    "ds4g-data",
    "Tracky-Task",
  );

  return tasks.list as TrackyTask[];
}
