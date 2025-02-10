import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import moment from "moment";
import { useState } from "react";
import type { PersonioAttendance } from "~/apis/personio/Personio.types";
import { getAttendances } from "~/apis/personio/PersonioApiController";
import {
  getPhasesPerCalculationPosition,
  loadPhases,
  loadPositionPhases,
  loadSubprojectPhases,
} from "~/apis/tasks/TrackyPhase";
import { loadTasks } from "~/apis/tasks/TrackyTask.server";
import type { ProjectTime } from "~/apis/troi/Troi.types";
import {
  getCalculationPositions,
  getCalendarEvents,
  getProjectTimes,
} from "~/apis/troi/TroiApiController";
import Header from "~/components/common/Header";
import Section from "~/components/common/Section";
import { ProjectTimes } from "~/components/projectTime/ProjectTimes";
import { WeekView } from "~/components/week/WeekView";
import { WorkTimeForm } from "~/routes/work_time.($id)";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import { mergeAttendendancesForDays } from "~/utils/attendanceUtils";
import { END_DATE, START_DATE } from "~/utils/dateTimeUtils";
import type { TransformedCalendarEvent } from "~/utils/transformCalendarEvents";
import { transformCalendarEvent } from "~/utils/transformCalendarEvents";

const HOW_TO_URL = "https://digitalservicebund.atlassian.net/wiki/x/iIFqFQ";
const SET_UP_URL =
  "https://digitalservicebund.atlassian.net/wiki/spaces/DIGITALSER/pages/359301512/Project+Hours+-+What+and+How+to+Book#Setting-up";

export function ErrorBoundary() {
  const error = useRouteError();

  let errorComponent = <h1>Unknown Error</h1>;
  if (isRouteErrorResponse(error)) {
    errorComponent = (
      <>
        <h1 className="text-red-600 text-lg font-semibold mt-4 mb-1">
          {error.status} {error.statusText}
        </h1>
        <pre className="overflow-auto">{error.data}</pre>
      </>
    );
  } else if (error instanceof Error) {
    errorComponent = (
      <>
        <h1 className="text-red-600 text-lg font-semibold mt-4 mb-1">Error</h1>
        <pre>{error.message}</pre>
        <pre className="overflow-auto bg-gray-800 text-white p-2 mt-2">
          {error.stack}
        </pre>
      </>
    );
  }

  return (
    <div className="container mx-auto md:mt-8 w-full max-w-screen-lg text-sm text-gray-800 md:px-2">
      <main className="rounded-sm bg-white p-2 shadow-md sm:w-full md:px-8 md:py-6">
        <Header />
        {errorComponent}
      </main>
    </div>
  );
}

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
  const [projectTimes, setProjectTimes] = useState<ProjectTime[]>(
    loaderData.projectTimes,
  );

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
        <Header username={loaderData.username} />
        <div>
          <Section>
            <a
              className="angie-link"
              href={HOW_TO_URL}
              target="_blank"
              rel="noreferrer"
            >
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
              <a
                className="angie-link"
                href={SET_UP_URL}
                target="_blank"
                rel="noreferrer"
              >
                Make sure it&apos;s available in Troi and marked as a
                &quot;favorite&quot;.
              </a>
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
