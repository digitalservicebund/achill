<script>
  import { DateInput } from "date-picker-svelte";
  import moment from "moment";
  import * as yup from "yup";
  import { createEventDispatcher } from "svelte";

  import { troiApi } from "./troiApiService";
  import { formatHours } from "./formatHours.js";

  export let calculationPositionId;
  export let entry;
  export let editMode;
  export let updateEntryCallback;
  export let disabled;

  const dispatch = createEventDispatcher();

  const schema = yup.object().shape({
    date: yup.date().required("Date is required"),
    hours: yup
      .string()
      .required("Hours are required, must be hh:mm")
      .matches(/\d?\d:\d\d/),
    description: yup.string().required("Description is required"),
  });

  let values = {
    date: entry?.date ? new Date(entry.date) : new Date(),
    description: entry?.description ? entry.description : "",
    hours: entry?.hours ? entry.hours : "",
  };
  let errors = {};

  let handleSubmit = async (update = false, billingId = null) => {
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
        values.hours = parseInt(hoursStr) + parseInt(minutesStr) / 60;
      }
      if (update) {
        await $troiApi.updateTimeEntry(
          calculationPositionId,
          moment(values.date).format("YYYY-MM-DD"),
          values.hours,
          values.description,
          billingId
        );
      } else {
        await $troiApi.postTimeEntry(
          calculationPositionId,
          moment(values.date).format("YYYY-MM-DD"),
          values.hours,
          values.description
        );
      }

      values.hours = formatHours(values.hours);
      dispatch("submit");
      values.hours = "";
      values.description = "";
      let nextDate = new Date(values.date.getTime());
      // 5 = Friday, then jump over the weekend
      nextDate.setDate(nextDate.getDate() + (nextDate.getDay() === 5 ? 3 : 1));
      values.date = nextDate;
    }
  };

  let editSubmitHandler = async () => {
    await handleSubmit(true, entry.id);
    if (Object.keys(errors).length === 0) {
      await updateEntryCallback();
      cancelEditHandler();
    }
  };

  let submitHandler = async () => {
    await handleSubmit(false, null);
  };

  let cancelEditHandler = () => {
    dispatch("cancelEdit");
  };

  let keydownHandler = (event) => {
    if (event.key === "Enter") {
      if (editMode) {
        editSubmitHandler();
      } else {
        submitHandler();
      }
    }
  };

  let generateHandler = () => {
    const randomChoice = (list) => {
      return list[Math.floor(list.length * Math.random())];
    };

    const subjectList = [
      "Code",
      "Architektur",
      "Backlog",
      "Roadmap",
      "Wireframes",
      "Designs",
      "Figma",
      "Review",
      "Planning",
      "Refinement",
      "User Tests",
      "Supportanfragen",
      "Skizzen",
      "User Needs",
      "Stakeholder",
      "Däumchen",
      "Bugs",
      "Stackoverflow",
      "Probleme",
      "Herausforderungen",
      "Software",
      "Quellcode",
      "Besprechung",
    ];
    const verbList = [
      "analysieren",
      "refactorn",
      "reinzeichnen",
      "organisieren",
      "vorbereiten",
      "definieren",
      "durchführen",
      "untersuchen",
      "verstehen",
      "drehen",
      "bauen",
      "festlegen",
      "spezifizieren",
      "iterieren",
      "nachbereiten",
      "diskutieren",
      "anpassen",
      "fixen",
      "beantworten",
      "lesen",
      "ideaten",
      "brainstormen",
      "abhalten",
      "verfassen",
      "kreieren",
      "lösen",
      "überstehen",
      "retten",
    ];

    const generatedEntry =
      randomChoice(subjectList) + " " + randomChoice(verbList);
    values.description = values.description
      ? values.description + ", " + generatedEntry
      : generatedEntry;
  };
</script>

<div
  data-test="entry-form"
  class="my-2 flex justify-center"
  class:opacity-50={disabled}
  class:pointer-events-none={disabled}
>
  <div class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
    <div class="flex flex-row">
      <div class="basis-3/4 p-1">
        <h5 class="mb-1 text-base font-medium leading-tight text-gray-900">
          {#if editMode}Edit Entry{:else}Add an entry{/if}
        </h5>
        <div class="flex place-items-center justify-start">
          <label for="date" class="basis-1/4">Date</label>
          <DateInput
            bind:value={values.date}
            format="yyyy-MM-dd"
            id="date"
            placeholder="2022-01-01"
            closeOnSelection={true}
          />
        </div>
        <div class="my-1 flex place-items-center justify-start">
          <label for="hours" class="basis-1/4">Hours</label>
          <input
            bind:value={values.hours}
            on:keydown={keydownHandler}
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
            on:keydown={keydownHandler}
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
          {#if !editMode}
            <button
              on:click={submitHandler}
              data-test="add-button"
              class="inline-block h-auto rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
            >
              Add
            </button>

            <button
              on:click={generateHandler}
              class="inline-block rounded bg-white px-6 py-2.5 text-xs font-medium uppercase leading-tight text-blue-600 shadow-md transition duration-150 ease-in-out hover:bg-blue-100 hover:shadow-lg focus:bg-blue-100 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-200 active:shadow-lg"
            >
              Suggest
            </button>
          {:else}
            <button
              on:click={editSubmitHandler}
              class="inline-block h-auto rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
            >
              Save
            </button>
            <button
              on:click={cancelEditHandler}
              class="inline-block rounded bg-white px-6 py-2.5 text-xs font-medium uppercase leading-tight text-red-600 shadow-md transition duration-150 ease-in-out hover:bg-red-100 hover:shadow-lg focus:bg-red-100 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-200 active:shadow-lg"
            >
              Cancel
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
