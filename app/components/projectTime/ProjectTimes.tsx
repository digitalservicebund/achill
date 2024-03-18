import type { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import {
  filterPhaseTasks,
  filterRecurringTasks,
  type TrackyTask,
} from "~/apis/tasks/TrackyTask";
import type { CalculationPosition, ProjectTime } from "~/apis/troi/Troi.types";
import { findProjectTimesOfDate } from "~/routes/_index";
import { ProjectTimeForm } from "~/routes/project_time.($id)";
import { convertFloatTimeToHHMM } from "~/utils/dateTimeUtils";

interface Props {
  selectedDate: Date;
  calculationPositions: CalculationPosition[];
  tasks: TrackyTask[];
  phasesPerCalculationPosition: Record<number, TrackyPhase[]>;
  projectTimes: ProjectTime[];
  setProjectTimes: (projectTimes: ProjectTime[]) => void;
}
export function ProjectTimes({
  selectedDate,
  calculationPositions,
  tasks,
  phasesPerCalculationPosition,
  projectTimes,
  setProjectTimes,
}: Props) {
  function addProjectTime(projectTime: ProjectTime) {
    setProjectTimes([...projectTimes, projectTime]);
  }

  function updateProjectTime(projectTime: ProjectTime) {
    setProjectTimes(
      projectTimes.map((pt) => (pt.id === projectTime.id ? projectTime : pt)),
    );
  }

  function deleteProjectTime(projectTimeId: number) {
    setProjectTimes(projectTimes.filter((pt) => pt.id !== projectTimeId));
  }

  const projectTimesForSelectedDate = findProjectTimesOfDate(
    projectTimes,
    selectedDate,
  );

  const timesForCalculationPosition = calculationPositions.map((position) => ({
    position,
    projectTimes: projectTimesForSelectedDate.filter(
      (pt) => pt.calculationPositionId === position.id,
    ),
  }));

  const recurringTasks = filterRecurringTasks(tasks);
  const phaseTasks = filterPhaseTasks(tasks);

  return timesForCalculationPosition.map(({ position, projectTimes }) =>
    projectTimes.length ? (
      projectTimes.map((projectTime) => (
        <ProjectTimeForm
          key={projectTime.id}
          date={selectedDate}
          projectTime={projectTime}
          calculationPosition={position}
          recurringTasks={recurringTasks}
          phaseTasks={phaseTasks}
          phases={phasesPerCalculationPosition[position.id]}
          onUpdateProjectTime={updateProjectTime}
          onDeleteProjectTime={deleteProjectTime}
        />
      ))
    ) : (
      <ProjectTimeForm
        key={position.id}
        date={selectedDate}
        calculationPosition={position}
        recurringTasks={recurringTasks}
        phaseTasks={phaseTasks}
        phases={phasesPerCalculationPosition[position.id]}
        onAddProjectTime={addProjectTime}
      />
    ),
  );
}
