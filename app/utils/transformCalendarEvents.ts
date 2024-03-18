import moment from "moment";
import type { CalendarEvent } from "~/apis/troi/Troi.types";
import {
  convertToUTCMidnight,
  getDatesBetween,
  utcMidnightDateFromString,
} from "./dateTimeUtils";

export type TransformedCalendarEvent = {
  type?: CalendarEventType;
  duration?: string;
  date: Date;
};

export type CalendarEventType =
  | "Holiday"
  | "Training"
  | "PaidVacation"
  | "UnpaidVacation"
  | "CompensatoryTimeOff"
  | "Sick";

const _CalendarEventDuration = {
  HalfDay: "HalfDay",
  AllDay: "AllDay",
};

export const CalendarEventDuration = Object.freeze(_CalendarEventDuration);

/*
    API format of calendar events:
    {
        “id”: “12824",
        “startDate”: “2023-05-18 00:00:00",
        “endDate”: “2023-05-18 23:59:59",
        “subject”: “Christi Himmelfahrt”,
        “type”: “H”
    }

    // TODO: the transformed format might need an additional field which
    // contains the translated subject / phrase
    Tranformed Format:
    {
        type: CalendarEventType,
        duration: CalendarEventDuartion,
        date: Date
    }
*/
export function transformCalendarEvent(
  eventInApiFormat: CalendarEvent,
  minDate: Date,
  maxDate: Date,
) {
  const synthesisedEventsInApiFormat = _synthesiseMultiDayEvents(
    eventInApiFormat,
    minDate,
    maxDate,
  );
  const tranformedEvents = synthesisedEventsInApiFormat.map((event) => {
    return _transformSingleDayEvent(event);
  });

  return tranformedEvents;
}

function _transformSingleDayEvent(
  eventInApiFormat: CalendarEvent,
): TransformedCalendarEvent {
  const normalizedDate = utcMidnightDateFromString(eventInApiFormat.startDate);
  const tranformedEvent = {
    type: _getCalendarEventTypForEvent(eventInApiFormat),
    duration: _getCalendarEventDurationForEvent(eventInApiFormat),
    date: normalizedDate,
  };

  return tranformedEvent;
}

function _synthesiseMultiDayEvents(
  eventInApiFormat: CalendarEvent,
  minDate: Date,
  maxDate: Date,
) {
  const synthesisedEventsInApiFormat: CalendarEvent[] = [];

  let datesBetween = getDatesBetween(
    new Date(
      Math.max(
        utcMidnightDateFromString(eventInApiFormat.startDate).getTime(),
        convertToUTCMidnight(minDate).getTime(),
      ),
    ),
    new Date(
      Math.min(
        utcMidnightDateFromString(eventInApiFormat.endDate).getTime(),
        convertToUTCMidnight(maxDate).getTime(),
      ),
    ),
  );

  datesBetween.forEach((date) => {
    const event = Object.assign({}, eventInApiFormat);
    if (
      utcMidnightDateFromString(eventInApiFormat.startDate).getTime() ===
      date.getTime()
    ) {
      event.startDate =
        moment(date).format("YYYY-MM-DD") +
        " " +
        eventInApiFormat.startDate.split(" ")[1];
    } else {
      event.startDate = moment(date).format("YYYY-MM-DD") + " 09:00:00";
    }

    if (
      utcMidnightDateFromString(eventInApiFormat.endDate).getTime() ===
      date.getTime()
    ) {
      event.endDate =
        moment(date).format("YYYY-MM-DD") +
        " " +
        eventInApiFormat.endDate.split(" ")[1];
    } else {
      event.endDate = moment(date).format("YYYY-MM-DD") + " 18:00:00";
    }

    synthesisedEventsInApiFormat.push(event);
  });

  return synthesisedEventsInApiFormat;
}

function _getCalendarEventTypForEvent(
  event: CalendarEvent,
): CalendarEventType | undefined {
  if (event === undefined) {
    return undefined;
  }

  switch (event.type) {
    case "H":
      return "Holiday";
    case "P":
      switch (event.subject) {
        case "Fortbildung":
          return "Training";
        case "Bezahlter Urlaub":
          return "PaidVacation";
        case "Unbezahlter Urlaub":
          return "UnpaidVacation";
        case "Freizeitausgleich (Überstunden)":
          return "CompensatoryTimeOff";
        case "Krankheit":
          return "Sick";
        default:
          return undefined;
      }
    default:
      return undefined;
  }
}

function _getCalendarEventDurationForEvent(event: CalendarEvent) {
  if (event === undefined) {
    return undefined;
  }

  if (
    event.startDate.split(" ")[1] === "09:00:00" &&
    event.endDate.split(" ")[1] === "13:00:00"
  ) {
    return CalendarEventDuration.HalfDay;
  } else if (
    event.startDate.split(" ")[1] === "14:00:00" &&
    event.endDate.split(" ")[1] === "18:00:00"
  ) {
    return CalendarEventDuration.HalfDay;
  } else {
    return CalendarEventDuration.AllDay;
  }
}
