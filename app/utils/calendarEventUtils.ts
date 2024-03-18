import type { CalendarEventType } from "./transformCalendarEvents";

export function getItemForEventType(type?: CalendarEventType) {
  switch (type) {
    case "Holiday":
      return "wb_sunny";
    case "Training":
      return "school";
    case "PaidVacation":
      return "beach_access";
    case "UnpaidVacation":
      return "beach_access";
    case "CompensatoryTimeOff":
      return "beach_access";
    case "Sick":
      return "sick";
    default:
      return "close";
  }
}

export function getDescriptionForEventType(type?: CalendarEventType) {
  switch (type) {
    case "Holiday":
      return "Public holiday, working impossible";
    case "Training":
      return "Learning";
    case "PaidVacation":
      return "You are on paid vacation";
    case "UnpaidVacation":
      return "You are on unpaid vacation";
    case "CompensatoryTimeOff":
      return "Looks like you had some over hours";
    case "Sick":
      return "Sick leave";
    default:
      return "Unknown";
  }
}
