import moment from "moment";
import type { ZodSchema, ZodTypeDef } from "zod";
import { z } from "zod";

const HH_MM_FORMAT_WITH_LEADING_0 = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
export const YYYY_MM_DD_FORMAT =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;

export const START_DATE = addDaysToDate(new Date(), -366);
export const END_DATE = addDaysToDate(new Date(), 366);

type Hours =
  | ("00" | "01" | "02" | "03" | "04" | "05")
  | ("06" | "07" | "08" | "09" | "10" | "11")
  | ("12" | "13" | "14" | "15" | "16" | "17")
  | ("18" | "19" | "20" | "21" | "22" | "23");
type FirstDigit = "1" | "2" | "3" | "4" | "5";
type SecondDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Minutes = `${FirstDigit}${SecondDigit}`;
export type Time = `${Hours}:${Minutes}`;

export const timeSchema = z
  .string()
  .regex(HH_MM_FORMAT_WITH_LEADING_0, "Time must be in format HH:MM.")
  .transform((time): Time => time as Time) satisfies ZodSchema<
  Time,
  ZodTypeDef,
  unknown
>;

export function timeToMinutes(time: Time) {
  return moment.duration(time).asMinutes();
}

export function minutesToTime(minutes: number) {
  return moment()
    .set("minutes", 0)
    .set("hours", 0)
    .add(minutes, "minutes")
    .format("HH:mm") as Time;
}

export function padLeadingZeros(num: string) {
  const s = "0" + num;
  const length = 2;
  return s.substring(s.length - length);
}

export function convertFloatTimeToHHMM(time: number) {
  if (time == 0) return "0";
  // times are float input and we need to parse them to "H:MM", e.g 2.25 -> 2:15
  const minutes = time % 1; // extracts 0.25 from 2.25
  const displayMinutes = (+minutes * 60).toFixed(0);
  const displayHours = Math.floor(time).toFixed(0);
  return `${displayHours}:${padLeadingZeros(displayMinutes)}`;
}

export function minuteStringToInt(minutes: string): number {
  if (minutes.length === 1) {
    return parseInt(minutes, 10) * 10;
  }
  return parseInt(minutes);
}

export function convertTimeToFloat(time: Time) {
  const [hours, minutes] = time.split(":");
  let minuteFractions = parseInt(minutes) / 60;
  return parseInt(hours) + minuteFractions;
}

export function convertTimeStringToFloat(time: string) {
  if (time.includes(":")) {
    let [hours, minutes] = time.split(":");

    let minuteFractions = minuteStringToInt(minutes) / 60;

    return Number(hours) + minuteFractions;
  } else if (time.includes(",")) {
    return Number(time.replace(",", "."));
  } else {
    return Number(time);
  }
}

// Use this to make the date compareble, regardless of its time and timezone
// see https://stackoverflow.com/a/38050824
export function convertToUTCMidnight(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function utcMidnightDateFromString(dateString: string) {
  return new Date(dateString.split(" ")[0] + "T00:00:00Z");
}

// subtraction also possible
export function addDaysToDate(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000); // 24*60*60*1000
}

export function getDatesBetween(startDate: Date, endDate: Date) {
  var dateArray = [];
  var currentDate = startDate;
  while (currentDate <= endDate) {
    dateArray.push(convertToUTCMidnight(currentDate));
    currentDate = addDaysToDate(currentDate, 1);
  }

  return dateArray;
}

export function datesEqual(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function getWeekDaysFor(date: Date) {
  // calc Monday of current week
  const dateDayNumber = date.getDay() || 7; // get current day number, converting Sunday to 7
  var monday = new Date(date);
  if (dateDayNumber !== 1) monday.setHours(-24 * (dateDayNumber - 1)); // only manipulate the date if it isn't Monday

  // assign Monday to Friday based on Monday
  let weekDates = [];
  weekDates[0] = monday;
  for (let i = 1; i < 5; i++) {
    weekDates[i] = addDaysToDate(monday, i);
  }
  // if hours set to 0, summer and winter time will interfere and change the day. Setting to 5 is somewhat "safe"
  weekDates.forEach((date) => date.setHours(5, 0, 0, 0));

  return weekDates;
}

export function getDayNumberFor(date: Date) {
  return (date.getDay() + 6) % 7;
}

/**
 * ISO-8601 week number
 */
export function getWeekNumberFor(date: Date) {
  var tdt: Date = new Date(date.valueOf());
  var dayn = getDayNumberFor(date);
  tdt.setDate(tdt.getDate() - dayn + 3);
  var firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - tdt.getTime()) / 604800000);
}
