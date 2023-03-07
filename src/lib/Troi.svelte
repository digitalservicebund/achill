<script>
  import c from "calendar";
  import { DateInput } from "date-picker-svelte";
  import moment from "moment";
  import { onMount } from "svelte";

  import { troiApi } from "./troiApiService";
  import TroiTimeEntries from "./TroiTimeEntries.svelte";

  import WeekView from "./weekview/weekView.svelte";

  const cal = new c.Calendar(1); // pass 1 to start week at Monday
  let selectedDate = new Date();
  let selectedWeek = [];
  let projects = [];
  let hours = ["0", "0", "4:23", "0:25", "8:00"];
  $: startDate = selectedWeek[0];
  $: endDate = selectedWeek[4];

  const reload = async () => {
    calculateWeek();

    projects = await $troiApi.getCalculationPositions();

    // maybe loop for all days
    $troiApi
      .getTimeEntries(
        515,
        moment(startDate).format("YYYYMMDD"),
        moment(endDate).format("YYYYMMDD")
      )
      .then((entries) => {
        console.log("entries", entries);
      });
  };

  onMount(() => {
    reload();
  });

  const calculateWeek = () => {
    let weeks = cal.monthDates(
      selectedDate.getFullYear(),
      selectedDate.getMonth()
    );
    for (const week of weeks) {
      const lastDateOfWeek = new Date(week[6]);
      if (selectedDate <= lastDateOfWeek) {
        selectedWeek = week.slice(0, 5);
        break;
      }
    }
  };

  const weekChanged = (days) => {
    console.log("clicked", days);
    // has to be reassigned for the component to rerender
    let selectedDateCopy = new Date(selectedDate);
    selectedDateCopy.setDate(selectedDateCopy.getDate() + days);
    selectedDate = selectedDateCopy;
    calculateWeek();
  };

  const selectedDateChanged = (date) => {
    selectedDate = date;
  };
</script>

<section>
  <WeekView
    {selectedWeek}
    {hours}
    {selectedDate}
    {selectedDateChanged}
    {weekChanged}
  />
  <div class="flex gap-4">
    <div class="py-4">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="text-sm"
        >Show from:
        <DateInput
          bind:value={startDate}
          format="yyyy-MM-dd"
          closeOnSelection={true}
        />
      </label>
    </div>

    <div class="inline-block py-4">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="text-sm"
        >to:
        <DateInput
          bind:value={endDate}
          format="yyyy-MM-dd"
          closeOnSelection={true}
        />
      </label>
    </div>
    <div class="inline-block content-center pt-8">
      <button
        class="rounded-sm border border-blue-500 px-2 py-1 hover:bg-blue-100"
        on:click={() => {
          (projects = []), reload();
        }}
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#0063eb"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg></button
      >
    </div>
  </div>
</section>

{#each projects as project}
  {console.log(project.id)}
  <!-- TODO: make into single component Project -->
  <section class="bg-white">
    <div class="container mx-auto pt-4 pb-2">
      <h2
        class="text-lg font-semibold text-gray-900"
        title="Position ID: {project.id}"
      >
        {project.name}
      </h2>
      <TroiTimeEntries
        calculationPositionId={project.id}
        startDate={moment(startDate).format("YYYYMMDD")}
        endDate={moment(endDate).format("YYYYMMDD")}
      />
    </div>
  </section>
{:else}
  <p>Loading…</p>
{/each}

<section class="mt-8 text-xs text-gray-600">
  <p>
    Project not showing up? Make sure it's available in Troi and marked as a
    "favorite". <br />
    The "Suggest" function is not intended for actual use, it is just a fun feature.
  </p>
</section>

<style>
  div :global(.date-time-field input) {
    color: rgb(31 41 55);
    font-feature-settings: "kern" 1, "tnum" 1;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  :root {
    --date-input-width: 6.5rem;
  }
</style>
