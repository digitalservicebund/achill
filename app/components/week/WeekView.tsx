import { useFetchers } from "react-router";
import moment from "moment";
import type { PersonioAttendance } from "~/apis/personio/Personio.types";
import type { ProjectTime } from "~/apis/troi/Troi.types";
import { findEventsOfDate, findProjectTimesOfDate } from "~/routes/_index";
import { getWeekDaysFor } from "~/utils/dateTimeUtils";
import type { TransformedCalendarEvent } from "~/utils/transformCalendarEvents";
import { InfoBanner } from "./InfoBanner";
import { WeekSelect } from "./WeekSelect";
import { WeekTable } from "./WeekTable";

function calcHoursOfDate(projectTimes: ProjectTime[], date: Date) {
  return findProjectTimesOfDate(projectTimes, date).reduce(
    (acc, projectTime) => acc + projectTime.hours,
    0,
  );
}

interface Props {
  selectedDate: Date;
  projectTimes: ProjectTime[];
  calendarEvents: TransformedCalendarEvent[];
  onSelectDate: (newDate: Date) => unknown;
  attendances: PersonioAttendance[];
  selectedDayEvents: TransformedCalendarEvent[];
}
export function WeekView({
  selectedDate,
  projectTimes,
  calendarEvents,
  onSelectDate,
  attendances,
  selectedDayEvents,
}: Readonly<Props>) {
  const selectedWeek = getWeekDaysFor(selectedDate);
  const timesAndEventsOfSelectedWeek = selectedWeek.map((weekday) => ({
    hours: calcHoursOfDate(projectTimes, weekday),
    events: findEventsOfDate(calendarEvents, weekday),
  }));

  const attendancesOfSelectedWeek: (PersonioAttendance | undefined)[] =
    selectedWeek.map((day) => {
      const date = moment(day).format("YYYY-MM-DD");
      return attendances.find((attendance) => attendance.date === date);
    });

  const isDisabled = useFetchers().some((f) => f.state === "submitting");

  return (
    <div
      data-testid="week-view"
      className={`flex flex-wrap gap-8${isDisabled ? " opacity-50" : ""}`}
      {...{ inert: isDisabled ? "" : undefined }} // syntax needed until React 19 https://github.com/facebook/react/issues/17157
    >
      <div className="min-w-[30ch]">
        <WeekSelect selectedDate={selectedDate} onSelectDate={onSelectDate} />
        <div
          data-testid="date"
          className="text-base text-gray-800 focus:outline-none"
        >
          {moment(selectedDate).format("dddd, MMMM Do YYYY")}
        </div>
      </div>

      <WeekTable
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        timesAndEventsOfSelectedWeek={timesAndEventsOfSelectedWeek}
        attendancesOfSelectedWeek={attendancesOfSelectedWeek}
      />

      {selectedDayEvents?.map((event) => (
        <InfoBanner
          key={`${event.date.getTime()}-${event.type ?? ""}`}
          event={event}
        />
      ))}
    </div>
  );
}
