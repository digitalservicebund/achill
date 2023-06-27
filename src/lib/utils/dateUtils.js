import moment from "moment";

// subtraction also possible
export function addDaysToDate(date, days) {
  return new Date(date.getTime() + days * 86400000); // 24*60*60*1000
}

export function formatDateToYYYYMMDD(date) {
  return moment(date).format("YYYYMMDD");
}

export function getDatesBetween(startDate, endDate) {
  // TODO: Find a better solution??
  // Adapt hours in respect to time zones so the timezone
  // doesn't influence the date comparison
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(5, end.getTimezoneOffset(), 0, 0);
  end.setHours(5, start.getTimezoneOffset(), 0, 0);

  var dateArray = new Array();
  var currentDate = start;
  while (currentDate <= end) {
    dateArray.push(new Date(currentDate));
    currentDate = addDaysToDate(currentDate, 1);
  }

  return dateArray;
}

export function datesEqual(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function getWeekDaysFor(date) {
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

/**
 * ISO-8601 week number
 */
export function getWeekNumberFor(date) {
  var tdt = new Date(date.valueOf());
  var dayn = getDayNumberFor(date);
  tdt.setDate(tdt.getDate() - dayn + 3);
  var firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay() + 7) % 7));
  }
  // @ts-ignore
  return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

export function getDayNumberFor(date) {
  return (date.getDay() + 6) % 7;
}
