import type { CalculationPosition, ProjectTime } from "~/apis/troi/Troi.types";
import { findProjectTimesOfDate } from "~/routes/_index";
import { ProjectTimeForm } from "~/routes/project_time.($id)";

interface Props {
  selectedDate: Date;
  calculationPositions: CalculationPosition[];
  projectTimes: ProjectTime[];
  setProjectTimes: React.Dispatch<React.SetStateAction<ProjectTime[]>>;
}
export function ProjectTimes({
  selectedDate,
  calculationPositions,
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

  return timesForCalculationPosition.map(({ position, projectTimes }) =>
    projectTimes.length ? (
      projectTimes.map((projectTime) => (
        <ProjectTimeForm
          key={projectTime.id}
          date={selectedDate}
          projectTime={projectTime}
          calculationPosition={position}
          setProjectTimes={setProjectTimes}
        />
      ))
    ) : (
      <ProjectTimeForm
        key={position.id}
        date={selectedDate}
        calculationPosition={position}
        setProjectTimes={setProjectTimes}
      />
    ),
  );
}
