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
  export let deleteEntryCallback;

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

  let submitHandler = async () => {
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
      await $troiApi.postTimeEntry(
        calculationPositionId,
        moment(values.date).format("YYYY-MM-DD"),
        values.hours,
        values.description
      );

      values.hours = formatHours(values.hours);
      dispatch("submit");
    }
  };

  let editSubmitHandler = async () => {
    await submitHandler();
    if (Object.keys(errors).length === 0) {
      deleteEntryCallback(entry.id);
      cancelEditHandler();
    }
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

<tr>
  <td class="min-w-[140px] pr-2">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <DateInput
      bind:value={values.date}
      format="yyyy-MM-dd"
      placeholder="2022-01-01"
      closeOnSelection={true}
      class="w-full"
    />
  </td>

  <td class="px-2">
    <input
      bind:value={values.hours}
      on:keydown={keydownHandler}
      type="text"
      id="hours"
      class={`w-full px-0 py-0.5 text-sm placeholder:italic placeholder:text-gray-400 ${
        errors.hours
          ? "border border-b-2 border-red-500"
          : "border-0 border-b-[1px] border-gray-400"
      }`}
      placeholder="2:15"
    />
  </td>

  <td class="px-2">
    <input
      on:keydown={keydownHandler}
      bind:value={values.description}
      type="text"
      id="description"
      class={`w-full px-0 py-0.5 text-sm placeholder:italic placeholder:text-gray-400 ${
        errors.description
          ? "border border-b-2 border-red-500"
          : "border-0 border-b-[1px] border-gray-400"
      }`}
      placeholder="Working the work…"
    />
  </td>

  <td class="flex flex flex-row pl-2">
    {#if !editMode}
      <button
        on:click={submitHandler}
        class="mr-2 block rounded-sm border border-indigo-600 bg-indigo-600 px-1 py-0.5 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
      >
        Add
      </button>
      <button
        on:click={generateHandler}
        class="mx-auto block whitespace-nowrap rounded-sm border border-indigo-600 p-0.5 text-sm font-medium text-indigo-500 hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
      >
        I'm lazy
      </button>
    {:else}
      <button
        on:click={editSubmitHandler}
        class="mx-auto block w-12 rounded-sm border border-indigo-600 bg-indigo-600 py-0.5 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
      >
        Save
      </button>
      <button
        on:click={cancelEditHandler}
        class="inline-block w-14 text-sm font-medium text-indigo-500 underline hover:text-indigo-700 hover:no-underline"
      >
        Cancel
      </button>
    {/if}
  </td>
</tr>

<style>
  td :global(.date-time-field input) {
    border: none;
    border-bottom-color: rgb(156 163 175);
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-radius: 0;
    color: rgb(31 41 55);
    font-feature-settings: "kern" 1, "tnum" 1;
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding: 0.125rem 0;
    text-align: right;
    --date-input-width: 100%;
  }

  td :global(.date-time-field input::placeholder) {
    color: rgb(156 163 175);
    font-feature-settings: "kern" 1, "tnum" 1;
    font-style: italic;
  }
</style>
