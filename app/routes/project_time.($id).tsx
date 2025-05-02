import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { data, redirect, useFetcher } from "react-router";
import { ZodError } from "zod";
import type { TrackyPhase } from "~/apis/tasks/TrackyPhase";
import type { TrackyTask } from "~/apis/tasks/TrackyTask";
import type { CalculationPosition, ProjectTime } from "~/apis/troi/Troi.types";
import {
  addProjectTime,
  deleteProjectTime,
  updateProjectTime,
} from "~/apis/troi/TroiApiController";
import ProjectTimeDescription from "~/components/projectTime/ProjectTimeDescription";
import { getSessionAndThrowIfInvalid } from "~/sessions.server";
import { convertFloatTimeToHHMM } from "~/utils/dateTimeUtils";
import { projectTimeSaveFormSchema } from "~/utils/projectTimeFormValidator";
import type { Route } from "./+types/project_time.($id)";

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getSessionAndThrowIfInvalid(request);
  const formData = await request.formData();
  const { _action, ...formDataObj } = Object.fromEntries(formData.entries());

  try {
    switch (_action) {
      case "POST": {
        const parsedData = projectTimeSaveFormSchema.parse(formDataObj);
        return await addProjectTime(session, parsedData);
      }
      case "PUT": {
        if (params.id === undefined) {
          throw new Response("ProjectTime ID is required.", { status: 400 });
        }
        const id = parseInt(params.id);
        const parsedData = projectTimeSaveFormSchema.parse(formDataObj);
        return await updateProjectTime(session, id, parsedData);
      }
      case "DELETE": {
        if (params.id === undefined) {
          throw new Response("ProjectTime ID is required.", { status: 400 });
        }
        const id = parseInt(params.id);
        return await deleteProjectTime(session, id);
      }
      default:
        throw new Response("Method Not Allowed", { status: 405 });
    }
  } catch (e) {
    if (e instanceof ZodError) {
      const issues = e.issues.reduce(
        (acc, issue) => ({
          ...acc,
          [issue.path[0]]: acc[issue.path[0]] ?? issue.message,
        }),
        {} as Record<string, string>,
      );
      return data({ issues }, 422);
    }
    if (e instanceof Error && e.message === "Invalid credentials") {
      console.error("Troi auth failed", e);
      throw redirect("/login");
    }
    throw e;
  }
}

interface Props {
  date: Date;
  calculationPosition: CalculationPosition;
  projectTime?:
    | ProjectTime
    | {
        hours: number;
        description: string;
        isBillable: boolean;
        isInvoiced: boolean;
      };
  recurringTasks: TrackyTask[];
  phaseTasks: TrackyTask[];
  phases: TrackyPhase[];
  setProjectTimes: React.Dispatch<React.SetStateAction<ProjectTime[]>>;
}
export function ProjectTimeForm({
  date,
  calculationPosition,
  projectTime = {
    hours: 0,
    description: "",
    isBillable: calculationPosition.isBillable,
    isInvoiced: false,
  },
  recurringTasks,
  phaseTasks,
  phases,
  setProjectTimes,
}: Readonly<Props>) {
  const fetcher = useFetcher<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);

  const isCreate = !("id" in projectTime);
  const [isEdit, setIsEdit] = useState(isCreate);
  const initialHours = isCreate
    ? ""
    : convertFloatTimeToHHMM(projectTime.hours);
  const [hours, setHours] = useState(initialHours);
  const [description, setDescription] = useState(projectTime.description);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (fetcher.state === "submitting" || !fetcher.data) return;
    if ("issues" in fetcher.data) {
      setValidationErrors(fetcher.data.issues);
    } else if (fetcher.data.id && fetcher.formData) {
      const submittedProjectTime = fetcher.data;

      switch (fetcher.formData.get("_action")) {
        case "POST":
          setProjectTimes((prevProjectTimes) => [
            ...prevProjectTimes,
            submittedProjectTime as ProjectTime,
          ]);
          break;
        case "PUT":
          setProjectTimes((prevProjectTimes) =>
            prevProjectTimes.map((pt) =>
              pt.id === submittedProjectTime.id
                ? (submittedProjectTime as ProjectTime)
                : pt,
            ),
          );
          setIsEdit(false);
          break;
        case "DELETE":
          setProjectTimes((prevProjectTimes) =>
            prevProjectTimes.filter((pt) => pt.id !== submittedProjectTime.id),
          );
          break;
      }
    }
  }, [fetcher.data, fetcher.formData, fetcher.state, setProjectTimes]);

  function saveForm() {
    if (!formRef.current) return;
    const method = isCreate ? "POST" : "PUT";
    const formData = new FormData(formRef.current);
    formData.append("_action", method);
    fetcher.submit(formData, {
      method,
      action: `/project_time/${isCreate ? "" : projectTime.id}`,
    });
  }

  async function onKeyDown(e: React.KeyboardEvent) {
    // allow shift + enter to add newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // dont add newline on enter
      saveForm();
    }
  }

  function handleCancel() {
    setHours(initialHours);
    setDescription(projectTime.description);
    setIsEdit(false);
  }

  function resetError(errorKey: string) {
    const validationErrorsCopy = { ...validationErrors };
    delete validationErrorsCopy[errorKey];
    setValidationErrors(validationErrorsCopy);
  }

  const isDisabled = fetcher.state === "submitting";

  return (
    <fetcher.Form
      ref={formRef}
      method="POST"
      action={`/project_time/${isCreate ? "" : projectTime.id}`}
      id="project-time-form"
      className={`w-full mb-5 rounded-lg bg-gray-100 p-4 shadow-lg${isDisabled ? " opacity-50" : ""}`}
      {...{ inert: isDisabled ? "" : undefined }} // syntax needed until React 19 https://github.com/facebook/react/issues/17157
    >
      <h3 className="mb-4 text-base text-gray-900">
        {calculationPosition.name}
      </h3>
      <input
        type="hidden"
        name="calculationPositionId"
        value={calculationPosition.id}
      />
      <input
        type="hidden"
        name="date"
        value={moment(date).format("YYYY-MM-DD")}
      />
      <input
        type="hidden"
        name="isBillable"
        value={projectTime.isBillable.toString()}
      />
      <input
        type="hidden"
        name="isInvoiced"
        value={projectTime.isInvoiced.toString()}
      />
      {isEdit ? (
        <>
          <div className="flex w-full items-center mb-5">
            <div className="flex items-center">
              <label htmlFor="hours" className="mr-4">
                Hours
              </label>
              <input
                name="hours"
                value={hours}
                onKeyDown={onKeyDown}
                onChange={(e) => {
                  resetError("hours");
                  setHours(e.target.value);
                }}
                type="text"
                id="hours"
                className={`w-20${validationErrors.hours ? " error" : ""}`}
                placeholder="2:15"
              />
            </div>
            {Object.entries(validationErrors).length > 0 && (
              <ul className="mt-1 ml-2 font-bold text-red-600">
                {Object.entries(validationErrors).map(([key, value]) => (
                  <li key={key}>&#x26A0; {value}</li>
                ))}
              </ul>
            )}
          </div>
          <ProjectTimeDescription
            description={description}
            setDescription={setDescription}
            recurringTasks={recurringTasks}
            phaseTasks={phaseTasks}
            phases={phases}
            onKeyDown={onKeyDown}
            hasErrors={!!validationErrors.description}
            resetErrors={() => resetError("description")}
          >
            {isCreate ? (
              <button name="_action" value="POST" className="tracky-btn">
                Save
              </button>
            ) : (
              <>
                <button name="_action" value="PUT" className="tracky-btn">
                  Update
                </button>
                <button
                  type="reset"
                  onClick={handleCancel}
                  className="tracky-btn danger"
                >
                  Cancel
                </button>
              </>
            )}
          </ProjectTimeDescription>
        </>
      ) : (
        <div data-testid="projectTime-card-content">
          <b>{projectTime.hours} Hour(s)</b>
          <p>{projectTime.description}</p>
          {!projectTime.isInvoiced && (
            <div className="mt-2 flex space-x-2">
              <button
                name="_action"
                value="DELETE"
                className="tracky-btn danger"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setIsEdit(true)}
                className="tracky-btn"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      )}
    </fetcher.Form>
  );
}
