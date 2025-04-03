import {
  getDescriptionForEventType,
  getItemForEventType,
} from "~/utils/calendarEventUtils";
import type { CalendarEventType } from "~/utils/transformCalendarEvents";

test("getItemForEventType should return correct icons", () => {
  expect(getItemForEventType("Holiday")).toBe("wb_sunny");
  expect(getItemForEventType("Training")).toBe("school");
  expect(getItemForEventType("PaidVacation")).toBe("beach_access");
  expect(getItemForEventType("UnpaidVacation")).toBe("beach_access");
  expect(getItemForEventType("CompensatoryTimeOff")).toBe("beach_access");
  expect(getItemForEventType("Sick")).toBe("sick");
  expect(getItemForEventType("NonExistentEventType" as CalendarEventType)).toBe(
    "close",
  );
});

test("getDescriptionForEventType should return correct descriptions", () => {
  expect(getDescriptionForEventType("Holiday")).toBe(
    "Public holiday, working impossible",
  );
  expect(getDescriptionForEventType("Training")).toBe(
    "Learning, please still track working hours",
  );
  expect(getDescriptionForEventType("PaidVacation")).toBe(
    "You are on paid vacation",
  );
  expect(getDescriptionForEventType("UnpaidVacation")).toBe(
    "You are on unpaid vacation",
  );
  expect(getDescriptionForEventType("CompensatoryTimeOff")).toBe(
    "Looks like you had some over hours",
  );
  expect(getDescriptionForEventType("Sick")).toBe("Sick leave");
  expect(
    getDescriptionForEventType("NonExistentEventType" as CalendarEventType),
  ).toBe("Unknown");
});
