import { TrackyTask } from "~/apis/tasks/TrackyTask";
import { CalculationPosition, TroiProjectTime } from "~/apis/troi/troi.types";
import { convertFloatTimeToHHMM } from "~/utils/dateTimeUtils";
import { ProjectTimeForm } from "../routes/project_time.($id)";

interface Props {
  selectedDate: Date;
  calculationPositions: CalculationPosition[];
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  projectTimes: TroiProjectTime[];
  disabled: boolean;
}

export function ProjectTimes({
  selectedDate,
  calculationPositions,
  recurringTasks,
  phaseTasks,
  projectTimes,
  disabled = false,
}: Props) {
  return calculationPositions.map((position) => (
    <div key={position.id} className="mb-4 container mx-auto">
      {!projectTimes.some(
        ({ calculationPosition }) => calculationPosition === position.id,
      ) ? (
        <ProjectTimeForm
          date={selectedDate}
          calculationPosition={position}
          recurringTasks={recurringTasks}
          phaseTasks={phaseTasks}
          disabled={disabled}
        />
      ) : (
        projectTimes
          .filter(
            ({ calculationPosition }) => calculationPosition === position.id,
          )
          .map((projectTime) => (
            <div
              key={projectTime.id}
              data-testid={`projectTimeCard-${position.id}`}
            >
              <ProjectTimeForm
                date={selectedDate}
                projectTimeId={projectTime.id}
                values={{
                  hours: convertFloatTimeToHHMM(projectTime.hours),
                  description: projectTime.description,
                }}
                recurringTasks={recurringTasks}
                phaseTasks={phaseTasks}
                calculationPosition={position}
                disabled={disabled}
              />
            </div>
          ))
      )}
    </div>
  ));
}
