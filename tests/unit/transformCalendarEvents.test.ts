import type { CalendarEvent } from "~/apis/troi/Troi.types";
import { utcMidnightDateFromString } from "~/utils/dateTimeUtils";
import { transformCalendarEvent } from "~/utils/transformCalendarEvents";

const singleDayEventsMockData: { [key: string]: CalendarEvent } = {
  holiday: {
    id: "12824",
    startDate: "2023-07-04 00:00:00",
    endDate: "2023-07-04 23:59:59",
    subject: "Christi Himmelfahrt",
    type: "H",
  },
  training: {
    id: "P6887",
    startDate: "2023-07-04 00:09:00",
    endDate: "2023-07-04 18:00:00",
    subject: "Fortbildung",
    type: "P",
  },
  paidVacation: {
    id: "P6889",
    startDate: "2023-07-04 09:00:00",
    endDate: "2023-07-04 18:00:00",
    subject: "Bezahlter Urlaub",
    type: "P",
  },
  paidVacationMorning: {
    id: "P6889",
    startDate: "2023-07-04 09:00:00",
    endDate: "2023-07-04 13:00:00",
    subject: "Bezahlter Urlaub",
    type: "P",
  },
  paidVacationAfternoon: {
    id: "P6889",
    startDate: "2023-07-04 14:00:00",
    endDate: "2023-07-04 18:00:00",
    subject: "Bezahlter Urlaub",
    type: "P",
  },
  unpaidVacation: {
    id: "P6889",
    startDate: "2023-07-04 09:00:00",
    endDate: "2023-07-04 18:00:00",
    subject: "Unbezahlter Urlaub",
    type: "P",
  },
  compensatoryTimeOff: {
    id: "P6888",
    startDate: "2023-07-04 9:00:00",
    endDate: "2023-07-04 18:00:00",
    subject: "Freizeitausgleich (Überstunden)",
    type: "P",
  },
  sick: {
    id: "P6804",
    startDate: "2023-07-04 09:00:00",
    endDate: "2023-07-04 18:00:00",
    subject: "Krankheit",
    type: "P",
  },
};

const multiDayEventsMockData: { [key: string]: CalendarEvent } = {
  paidVacation: {
    id: "P6889",
    startDate: "2023-07-04 09:00:00",
    endDate: "2023-07-07 18:00:00",
    subject: "Bezahlter Urlaub",
    type: "P",
  },
  paidVacationMorning: {
    id: "P6889",
    startDate: "2023-07-04 09:00:00",
    endDate: "2023-07-07 13:00:00",
    subject: "Bezahlter Urlaub",
    type: "P",
  },
  paidVacationStartingAfternoon: {
    id: "P6889",
    startDate: "2023-07-04 14:00:00",
    endDate: "2023-07-07 18:00:00",
    subject: "Bezahlter Urlaub",
    type: "P",
  },
  paidVacationStartingAfternoonToMorning: {
    id: "P6889",
    startDate: "2023-07-04 14:00:00",
    endDate: "2023-07-07 13:00:00",
    subject: "Bezahlter Urlaub",
    type: "P",
  },
};

describe("Single day event tests", () => {
  test("holiday is tranformed correctly", () => {
    // GIVEN
    const mockEvent = singleDayEventsMockData.holiday;
    const minDate = utcMidnightDateFromString("2023-07-03");
    const maxDate = utcMidnightDateFromString("2023-07-05");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = {
      type: "Holiday",
      duration: "AllDay",
      date: utcMidnightDateFromString(mockEvent.startDate),
    };
    expect(tranformedEvents).toStrictEqual([expected]);
  });

  test("training is tranformed correctly", () => {
    // GIVEN
    const mockEvent = singleDayEventsMockData.training;
    const minDate = utcMidnightDateFromString("2023-07-03");
    const maxDate = utcMidnightDateFromString("2023-07-05");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = {
      type: "Training",
      duration: "AllDay",
      date: utcMidnightDateFromString(mockEvent.startDate),
    };
    expect(tranformedEvents).toStrictEqual([expected]);
  });

  test("paidVacation is tranformed correctly", () => {
    // GIVEN
    const mockEvent = singleDayEventsMockData.paidVacation;
    const minDate = utcMidnightDateFromString("2023-07-03");
    const maxDate = utcMidnightDateFromString("2023-07-05");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = {
      type: "PaidVacation",
      duration: "AllDay",
      date: utcMidnightDateFromString(mockEvent.startDate),
    };
    expect(tranformedEvents).toStrictEqual([expected]);
  });

  test("paidVacation half day morning is tranformed correctly", () => {
    // GIVEN
    const mockEvent = singleDayEventsMockData.paidVacationMorning;
    const minDate = utcMidnightDateFromString("2023-07-03");
    const maxDate = utcMidnightDateFromString("2023-07-05");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = {
      type: "PaidVacation",
      duration: "HalfDay",
      date: utcMidnightDateFromString(mockEvent.startDate),
    };
    expect(tranformedEvents).toStrictEqual([expected]);
  });

  test("paidVacation half day afternoon is tranformed correctly", () => {
    // GIVEN
    const mockEvent = singleDayEventsMockData.paidVacationAfternoon;
    const minDate = utcMidnightDateFromString("2023-07-03");
    const maxDate = utcMidnightDateFromString("2023-07-05");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = {
      type: "PaidVacation",
      duration: "HalfDay",
      date: utcMidnightDateFromString(mockEvent.startDate),
    };
    expect(tranformedEvents).toStrictEqual([expected]);
  });

  test("unpaidVacation is tranformed correctly", () => {
    // GIVEN
    const mockEvent = singleDayEventsMockData.unpaidVacation;
    const minDate = utcMidnightDateFromString("2023-07-03");
    const maxDate = utcMidnightDateFromString("2023-07-05");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = {
      type: "UnpaidVacation",
      duration: "AllDay",
      date: utcMidnightDateFromString(mockEvent.startDate),
    };
    expect(tranformedEvents).toStrictEqual([expected]);
  });

  test("compensatoryTimeOff is tranformed correctly", () => {
    // GIVEN
    const mockEvent = singleDayEventsMockData.compensatoryTimeOff;
    const minDate = utcMidnightDateFromString("2023-07-03");
    const maxDate = utcMidnightDateFromString("2023-07-05");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = {
      type: "CompensatoryTimeOff",
      duration: "AllDay",
      date: utcMidnightDateFromString(mockEvent.startDate),
    };
    expect(tranformedEvents).toStrictEqual([expected]);
  });

  test("sick is tranformed correctly", () => {
    // GIVEN
    const mockEvent = singleDayEventsMockData.sick;
    const minDate = utcMidnightDateFromString("2023-07-03");
    const maxDate = utcMidnightDateFromString("2023-07-05");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = {
      type: "Sick",
      duration: "AllDay",
      date: utcMidnightDateFromString(mockEvent.startDate),
    };
    expect(tranformedEvents).toStrictEqual([expected]);
  });
});

describe("Multi day event tests", () => {
  test("multi day vacation is tranformed correctly", () => {
    // GIVEN
    const mockEvent = multiDayEventsMockData.paidVacation;
    const minDate = utcMidnightDateFromString("2023-07-04");
    const maxDate = utcMidnightDateFromString("2023-07-07");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = [
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString(mockEvent.startDate),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-05"),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-06"),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString(mockEvent.endDate),
      },
    ];

    expect(tranformedEvents).toStrictEqual(expected);
  });

  test("multi day vacation last day half day morning is tranformed correctly", () => {
    // GIVEN
    const mockEvent = multiDayEventsMockData.paidVacationMorning;
    const minDate = utcMidnightDateFromString("2023-07-04");
    const maxDate = utcMidnightDateFromString("2023-07-07");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = [
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString(mockEvent.startDate),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-05"),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-06"),
      },
      {
        type: "PaidVacation",
        duration: "HalfDay",
        date: utcMidnightDateFromString(mockEvent.endDate),
      },
    ];

    expect(tranformedEvents).toStrictEqual(expected);
  });

  test("multi day vacation first day half day afternoon is tranformed correctly", () => {
    // GIVEN
    const mockEvent = multiDayEventsMockData.paidVacationStartingAfternoon;
    const minDate = utcMidnightDateFromString("2023-07-04");
    const maxDate = utcMidnightDateFromString("2023-07-07");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = [
      {
        type: "PaidVacation",
        duration: "HalfDay",
        date: utcMidnightDateFromString(mockEvent.startDate),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-05"),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-06"),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString(mockEvent.endDate),
      },
    ];

    expect(tranformedEvents).toStrictEqual(expected);
  });

  test("multi day vacation first day half day afternoon last day half day morning is tranformed correctly", () => {
    // GIVEN
    const mockEvent =
      multiDayEventsMockData.paidVacationStartingAfternoonToMorning;
    const minDate = utcMidnightDateFromString("2023-07-04");
    const maxDate = utcMidnightDateFromString("2023-07-07");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = [
      {
        type: "PaidVacation",
        duration: "HalfDay",
        date: utcMidnightDateFromString(mockEvent.startDate),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-05"),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-06"),
      },
      {
        type: "PaidVacation",
        duration: "HalfDay",
        date: utcMidnightDateFromString(mockEvent.endDate),
      },
    ];

    expect(tranformedEvents).toStrictEqual(expected);
  });

  test("multi day vacation first day half day afternoon cut off after second day", () => {
    // GIVEN
    const mockEvent =
      multiDayEventsMockData.paidVacationStartingAfternoonToMorning;
    const minDate = utcMidnightDateFromString("2023-07-02");
    const maxDate = utcMidnightDateFromString("2023-07-05");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = [
      {
        type: "PaidVacation",
        duration: "HalfDay",
        date: utcMidnightDateFromString(mockEvent.startDate),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-05"),
      },
    ];

    expect(tranformedEvents).toStrictEqual(expected);
  });

  test("multi day vacation first hald cut off", () => {
    // GIVEN
    const mockEvent =
      multiDayEventsMockData.paidVacationStartingAfternoonToMorning;
    const minDate = utcMidnightDateFromString("2023-07-06");
    const maxDate = utcMidnightDateFromString("2023-07-15");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = [
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-06"),
      },
      {
        type: "PaidVacation",
        duration: "HalfDay",
        date: utcMidnightDateFromString(mockEvent.endDate),
      },
    ];

    expect(tranformedEvents).toStrictEqual(expected);
  });

  test("multi day vacation start and end cut off", () => {
    // GIVEN
    const mockEvent =
      multiDayEventsMockData.paidVacationStartingAfternoonToMorning;
    const minDate = utcMidnightDateFromString("2023-07-05");
    const maxDate = utcMidnightDateFromString("2023-07-06");

    // WHEN
    const tranformedEvents = transformCalendarEvent(
      mockEvent,
      minDate,
      maxDate,
    );

    // THEN
    const expected = [
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-05"),
      },
      {
        type: "PaidVacation",
        duration: "AllDay",
        date: utcMidnightDateFromString("2023-07-06"),
      },
    ];

    expect(tranformedEvents).toStrictEqual(expected);
  });
});
