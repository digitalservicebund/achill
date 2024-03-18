import type { PersonioAttendance } from "../apis/personio/Personio.types";
import { type Time, minutesToTime, timeToMinutes } from "./dateTimeUtils";

type MergedAttendance = {
  id: number;
  date: string;
  startTime: Time;
  endTime: Time;
  breakTime: number;
  ids: number[];
  workTime: number;
  comment?: string;
};
export function mergeAttendendancesForDays(attendances: PersonioAttendance[]) {
  const mergedData = attendances
    .map((attendance) => ({
      ...attendance,
      ids: [attendance.id],
      workTime:
        timeToMinutes(attendance.endTime) -
        timeToMinutes(attendance.startTime) -
        attendance.breakTime,
    }))
    .reduce<MergedAttendance[]>((merged, attendance) => {
      const existing = merged.find((item) => item.date === attendance.date);
      if (existing) {
        const startMinutes = timeToMinutes(attendance.startTime);
        const oldStartMinutes = timeToMinutes(existing.startTime);
        const newStartMinutes = Math.min(startMinutes, oldStartMinutes);
        existing.startTime = minutesToTime(newStartMinutes);

        const endMinutes = timeToMinutes(attendance.endTime);
        const oldEndMinutes = timeToMinutes(existing.endTime);
        const newEndMinutes = Math.max(endMinutes, oldEndMinutes);
        existing.endTime = minutesToTime(newEndMinutes);

        existing.workTime += attendance.workTime;
        existing.breakTime =
          newEndMinutes - newStartMinutes - existing.workTime;
        existing.ids.push(attendance.id);
        existing.comment = `Merged ${existing.ids.length} attendances`;
      } else {
        merged.push(attendance);
      }

      return merged;
    }, []);
  return mergedData;
}
