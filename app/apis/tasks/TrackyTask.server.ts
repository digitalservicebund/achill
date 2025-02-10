import nocodbApi from "./NocoDBClient.server";
import type { TrackyTask } from "./TrackyTask";

export async function loadTasks() {
  const tasks = await nocodbApi.dbTableRow.list(
    "v1",
    "ds4g-data",
    "Tracky-Task",
  );

  return tasks.list as TrackyTask[];
}
