import { useId } from "react";
import { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import { TrackyTask } from "~/apis/tasks/TrackyTask";

function descriptionToSegments(description: string): string[] {
  return description !== ""
    ? description
        .split(",")
        .map((segment) => segment.trim())
        .filter((segment) => segment !== "")
    : [];
}

function segmentsToDescription(segments: string[]): string {
  return segments.join(", ");
}

type ProjectTimeDescriptionProps = {
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  phases: TrackyPhase[];
  children: React.ReactNode;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  hasErrors: boolean;
  resetErrors: () => void;
};
export default function ProjectTimeDescription({
  description,
  setDescription,
  recurringTasks,
  phaseTasks,
  phases,
  children,
  onKeyDown,
  hasErrors,
  resetErrors,
}: ProjectTimeDescriptionProps) {
  const id = useId();

  const descriptionSegments = descriptionToSegments(description);

  const phasesToDisplay = phases.map((phase) => ({
    name: phase["Phase Name"],
    open: phaseTasks.some((task) =>
      descriptionSegments.includes([task.name, phase["Phase Name"]].join(" ")),
    ),
  }));

  function addDescriptionSegment(segment: string) {
    resetErrors();
    setDescription((description) =>
      segmentsToDescription([...descriptionToSegments(description), segment]),
    );
  }

  function removeDescriptionSegment(segment: string) {
    setDescription((description) => {
      const segments = descriptionToSegments(description);
      return segmentsToDescription(
        segments.filter((projectTime) => projectTime !== segment),
      );
    });
  }

  function onRecurringTaskChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      addDescriptionSegment(event.target.value);
    } else {
      removeDescriptionSegment(event.target.value);
    }
  }

  function toggleDescriptionSegment(segment: string) {
    if (description.includes(segment)) {
      removeDescriptionSegment(segment);
    } else {
      addDescriptionSegment(segment);
    }
  }

  function removeDuplicatedCommas(description: string) {
    const segments = descriptionToSegments(description);
    return segmentsToDescription(
      segments.filter(
        (projectTime, index) =>
          projectTime !== "" || index === segments.length - 1,
      ),
    );
  }

  function hasDuplicatedCommas(description: string) {
    return description.match(/\,\s*\,/g) !== null;
  }

  function handleDescriptionChange(
    event: React.FormEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.nativeEvent instanceof InputEvent &&
      event.target instanceof HTMLTextAreaElement
    ) {
      if (event.nativeEvent.inputType !== "insertLineBreak") {
        resetErrors();
      }
      let newDescription = event.target.value;
      if (hasDuplicatedCommas(newDescription)) {
        newDescription = removeDuplicatedCommas(newDescription);
      }
      setDescription(newDescription);
    } else {
      console.error("handleDescriptionChange", event);
      // todo throw something
    }
  }

  function handleChipClick(phaseAndTask: string) {
    toggleDescriptionSegment(phaseAndTask);
  }

  function removeChip(phaseAndTask: string) {
    removeDescriptionSegment(phaseAndTask);
  }

  return (
    <>
      {recurringTasks && phases.length > 0 && (
        <fieldset className="mb-5">
          <legend className="basis-1/4">Recurring tasks</legend>
          <div className="mt-2 flex flex-col gap-1 md:flex-row md:gap-4">
            {recurringTasks.map((task) => (
              <label
                key={task.Id}
                htmlFor={`recurring-task-${task.name}-${id}`}
                className="flex items-center"
              >
                <input
                  checked={descriptionSegments.includes(task.name)}
                  className="rounded-md border border-gray-300 bg-white p-2 mr-2"
                  id={`recurring-task-${task.name}-${id}`}
                  value={task.name}
                  type="checkbox"
                  onChange={onRecurringTaskChange}
                />
                {task.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {phasesToDisplay.map((phase) => (
        <details key={phase.name} className="mb-5" open={phase.open}>
          <summary className="flex w-full flex-row items-center gap-4 rounded-t border-b-2 border-solid border-b-[#CED4DA] bg-[#E5E5E5] p-4">
            <span>{phase.name}</span>
            <svg
              className={`ml-auto h-4 w-4 transform transition-transform ${
                phase.open ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          {phaseTasks && (
            <div className="flex h-auto flex-wrap border-b-2 border-solid border-b-[#CED4DA] bg-white p-2">
              {phaseTasks.map((task) => (
                <div
                  key={task.Id}
                  className={`m-2 flex cursor-pointer items-center rounded-full border py-1 px-3 text-sm transition-all duration-150 ease-in-out ${
                    descriptionSegments.includes(
                      [task.name, phase.name].join(" "),
                    )
                      ? "border-black bg-white"
                      : "bg-[#212121] bg-opacity-10 hover:bg-gray-300"
                  }`}
                  onClick={() =>
                    handleChipClick([task.name, phase.name].join(" "))
                  }
                >
                  <span>{task.name}</span>
                  {descriptionSegments.includes(
                    [task.name, phase.name].join(" "),
                  ) && (
                    <button
                      className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-800"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeChip([task.name, phase.name].join(" "));
                      }}
                    >
                      &#x2715;
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </details>
      ))}
      <div className="flex w-full flex-col md:flex-row items-stretch">
        <div className="w-full md:mb-0 md:mr-5">
          <textarea
            name="description"
            value={description}
            onKeyDown={onKeyDown}
            onInput={handleDescriptionChange}
            id="description"
            className={`h-full w-full leading-4 ${hasErrors ? " error" : ""} `}
            placeholder="Working the work…"
          />
        </div>
        <div className="flex flex-row space-x-2 md:flex-col md:space-x-0 md:space-y-2 self-end">
          {children}
        </div>
      </div>
    </>
  );
}
