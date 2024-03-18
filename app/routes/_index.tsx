import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import moment from "moment";
import { useState } from "react";
import { PersonioAttendance } from "~/apis/personio/Personio.types";
import { getAttendances } from "~/apis/personio/PersonioApiController";
import {
  loadPhases,
  loadPositionPhases,
  loadSubprojectPhases,
  getPhasesPerCalculationPosition,
} from "~/apis/tasks/TrackyPhase";
import { loadTasks } from "~/apis/tasks/TrackyTask";
import type { ProjectTime } from "~/apis/troi/Troi.types";
import {
  getCalculationPositions,
  getCalendarEvents,
  getProjectTimes,
} from "~/apis/troi/TroiApiController";
import Section from "~/components/common/Section";
import { ProjectTimes } from "~/components/projectTime/ProjectTimes";
import { WeekView } from "~/components/week/WeekView";
import { WorkTimeForm } from "~/routes/work_time.($id)";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import { mergeAttendendancesForDays } from "~/utils/attendanceUtils";
import { END_DATE, START_DATE } from "~/utils/dateTimeUtils";
import {
  transformCalendarEvent,
  TransformedCalendarEvent,
} from "~/utils/transformCalendarEvents";

const HOW_TO_URL = "https://digitalservicebund.atlassian.net/wiki/x/iIFqFQ";
const SET_UP_URL = "https://digitalservicebund.atlassian.net/wiki/x/T4BfJg";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);
  const { personioId, workingHours } = session.get("personioEmployee");

  console.time("loader");

  // await all the promises in parallel
  const [
    calendarEvents,
    calculationPositions,
    projectTimes,
    attendances,
    tasks,
    phases,
    positionPhases,
    subprojectPhases,
  ] = await Promise.all([
    // TROI API calls
    getCalendarEvents(session),
    getCalculationPositions(session),
    getProjectTimes(session),
    // PERSONIO API call
    getAttendances(personioId),
    // NOCODB API calls
    loadTasks(),
    loadPhases(),
    loadPositionPhases(),
    loadSubprojectPhases(),
  ]);

  console.timeLog("loader", "loaded data");

  // load phases for each calculation position in parallel
  const phasesPerCalculationPosition = getPhasesPerCalculationPosition(
    phases,
    positionPhases,
    subprojectPhases,
    calculationPositions,
  );

  console.timeEnd("loader");

  return json({
    timestamp: Date.now(),
    username: session.get("username")!,
    calculationPositions,
    calendarEvents,
    projectTimes,
    tasks,
    phasesPerCalculationPosition,
    workingHours,
    attendances,
  });
}

export function findEventsOfDate(
  calendarEvents: TransformedCalendarEvent[],
  date: Date,
) {
  return calendarEvents.filter((calendarEvent) =>
    moment(calendarEvent.date).isSame(date, "day"),
  );
}

export function findProjectTimesOfDate(
  projectTimes: ProjectTime[],
  date: Date,
) {
  return projectTimes.filter((projectTime) =>
    moment(projectTime.date).isSame(date, "day"),
  );
}

export default function TrackYourTime() {
  const loaderData = useLoaderData<typeof loader>();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [attendances, setAttendances] = useState<PersonioAttendance[]>(
    mergeAttendendancesForDays(loaderData.attendances),
  );
  const [projectTimes, setProjectTimes] = useState(loaderData.projectTimes);

  // set state to loader data after loading
  const [prevTimestamp, setPrevTimestamp] = useState(loaderData.timestamp);
  if (loaderData.timestamp !== prevTimestamp) {
    setPrevTimestamp(loaderData.timestamp);
    setAttendances(mergeAttendendancesForDays(loaderData.attendances));
    setProjectTimes(loaderData.projectTimes);
  }

  const calendarEvents = loaderData.calendarEvents.flatMap((calendarEvent) =>
    transformCalendarEvent(calendarEvent, START_DATE, END_DATE),
  );
  const selectedDayEvents = findEventsOfDate(calendarEvents, selectedDate);

  return (
    <div className="container mx-auto md:mt-8 w-full max-w-screen-lg text-sm text-gray-800 md:px-2">
      <main className="rounded-sm bg-white p-2 shadow-md sm:w-full md:px-8 md:py-6">
        <nav className="flex h-16 justify-between items-center border-1 w-full border-b pb-1 text-left">
          <img
            src="timetracking_blue.svg"
            alt="Track-Your-Time logo"
            className="pr-4 py-1"
          />
          <div className="flex-grow">
            <h1 className="font-bold">Track-Your-Time</h1>
            <div className="text-sm">Logged in as {loaderData.username}.</div>
          </div>
          <Form method="post" action="/logout">
            <button className="tracky-btn">Logout</button>
          </Form>
        </nav>
        <div>
          <Section>
            <a className="angie-link" href={HOW_TO_URL} target="_blank">
              Read about how to track your time in confluence
            </a>
          </Section>
          <Section extraClasses="pt-2 z-10 w-full bg-white md:sticky md:top-0">
            <WeekView
              selectedDate={selectedDate}
              projectTimes={projectTimes}
              calendarEvents={calendarEvents}
              onSelectDate={setSelectedDate}
              attendances={attendances}
              selectedDayEvents={selectedDayEvents}
            />
          </Section>

          <Section title="Total working hours (Personio)">
            <WorkTimeForm
              key={selectedDate.toDateString()}
              selectedDate={selectedDate}
              workingHours={loaderData.workingHours}
              attendances={attendances}
              setAttendances={setAttendances}
            />
          </Section>

          {!selectedDayEvents?.some((event) => event.type == "Holiday") && (
            <Section title="Project hours (Troi)">
              <ProjectTimes
                key={selectedDate.toDateString()}
                selectedDate={selectedDate}
                calculationPositions={loaderData.calculationPositions ?? []}
                tasks={loaderData.tasks}
                phasesPerCalculationPosition={
                  loaderData.phasesPerCalculationPosition
                }
                projectTimes={projectTimes}
                setProjectTimes={setProjectTimes}
              />
            </Section>
          )}

          <Section>
            <p className="text-xs text-gray-600">
              Project not showing up?{" "}
              <a className="angie-link" href={SET_UP_URL} target="_blank">
                Make sure it's available in Troi and marked as a "favorite".
              </a>
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
