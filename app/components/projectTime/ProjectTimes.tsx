import type { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import {
  filterPhaseTasks,
  filterRecurringTasks,
  type TrackyTask,
} from "~/apis/tasks/TrackyTask";
import type { CalculationPosition, ProjectTime } from "~/apis/troi/Troi.types";
import { findProjectTimesOfDate } from "~/routes/_index";
import { ProjectTimeForm } from "~/routes/project_time.($id)";

interface Props {
  selectedDate: Date;
  calculationPositions: CalculationPosition[];
  tasks: TrackyTask[];
  phasesPerCalculationPosition: Record<number, TrackyPhase[]>;
  projectTimes: ProjectTime[];
  setProjectTimes: React.Dispatch<React.SetStateAction<ProjectTime[]>>;
}
export function ProjectTimes({
  selectedDate,
  calculationPositions,
  tasks,
  phasesPerCalculationPosition,
  projectTimes,
  setProjectTimes,
}: Readonly<Props>) {
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
          setProjectTimes={setProjectTimes}
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
        setProjectTimes={setProjectTimes}
      />
    ),
  );
}
