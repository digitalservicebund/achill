import { Time } from "~/utils/dateTimeUtils";

export type WorkingHours = {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
};

export const DAYS_OF_WEEK: Array<keyof WorkingHours> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export type PersonioEmployee = {
  personioId: number;
  workingHours: WorkingHours;
};

export interface PersonioAttendance {
  id: number;
  date: string;
  startTime: Time;
  endTime: Time;
  breakTime: number;
}
