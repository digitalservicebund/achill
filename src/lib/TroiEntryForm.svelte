<script>
  // @ts-nocheck

  import * as yup from "yup";

  import { formatHours } from "./formatHours.js";

  export let project;
  export let onAddClick;

  const schema = yup.object().shape({
    hours: yup
      .string()
      .required("Hours are required, must be hh:mm")
      .matches(/\d?\d?:\d\d/),
    description: yup.string().required("Description is required"),
  });

  let values = {
    description: "",
    hours: "",
  };
  let errors = {};

  let handleSubmit = async () => {
    values.hours = formatHours(values.hours);
    try {
      // `abortEarly: false` to get all the errors
      await schema.validate(values, { abortEarly: false });
      errors = {};
    } catch (err) {
      errors = err.inner.reduce((acc, err) => {
        return { ...acc, [err.path]: err.message };
      }, {});
    }

    if (Object.keys(errors).length === 0) {
      if (values.hours.includes(":")) {
        const [hoursStr, minutesStr] = values.hours.split(":");
        values.hours = parseInt(hoursStr || 0) + parseInt(minutesStr) / 60;
      }
      onAddClick(project, values.hours, values.description);
    }
  };

  let submitHandler = async () => {
    await handleSubmit(false, null);
  };
</script>

<div data-test="entry-form" class="my-2 flex justify-center">
  <div class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
    <div class="flex flex-row">
      <div class="basis-3/4 p-1">
        <h5 class="mb-1 text-base font-medium leading-tight text-gray-900">
          {project.name}
        </h5>

        <div class="my-1 flex place-items-center justify-start">
          <label for="hours" class="basis-1/4">Hours</label>
          <input
            bind:value={values.hours}
            type="text"
            id="hours"
            data-test-id="hours"
            class={`w-auto basis-1/4 rounded px-1 py-0.5 text-sm placeholder:italic placeholder:text-gray-400 ${
              errors.hours
                ? "border border-b-2 border-red-500"
                : "border-1 border-b-[1px] border-gray-300"
            }`}
            placeholder="2:15"
          />
        </div>
        <div class="my-1 flex place-items-center justify-start">
          <label for="description" class="basis-1/4">What</label>
          <textarea
            bind:value={values.description}
            type="text"
            id="description"
            class={`w-auto basis-3/4 rounded px-1 py-0.5 text-sm placeholder:italic placeholder:text-gray-400 ${
              errors.description
                ? "border border-b-2 border-red-500"
                : "border-1 border-b-[1px] border-gray-300"
            }`}
            placeholder="Working the work…"
          />
        </div>
      </div>
      <div class="flex basis-1/4 justify-end">
        <div class="flex flex-col justify-center gap-1">
          <button
            on:click={submitHandler}
            data-test="add-button"
            class="inline-block h-auto rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
