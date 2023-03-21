<script>
  import c from "calendar";
  import moment from "moment";
  import { onMount } from "svelte";

  import { troiApi } from "./troiApiService";
  import TroiTimeEntries from "./TroiTimeEntries.svelte";

  import WeekView from "./weekview/weekView.svelte";

  const cal = new c.Calendar(1); // pass 1 to start week at Monday
  let selectedDate = new Date();
  let selectedWeek = [];
  let projects = [];
  let hoursPerDay = {};
  /*
    hoursPerDay as object, key is the date and value is the sum of hours for that day
    {
      Montag: 4,
      Dienstag: 5.6,
      ...
    }
    troi api returns hours as float value
  */
  let times = [];
  $: startDate = selectedWeek[0];
  $: endDate = selectedWeek[4];

  const reload = async () => {
    calculateWeek();
    initHoursPerDay();
    console.log(hoursPerDay);

    projects = await $troiApi.getCalculationPositions();
    console.log(projects);
    /*
      projects as array
      0: 
        id: 515
        name: "DigitalService / MK_22_0009 / Musterprojekt / Unterprojekt 1 / Regular Engineering"
      1: 
      ...
    */

    projects.forEach((project) => {
      $troiApi
        .getTimeEntries(
          project.id,
          moment(startDate).format("YYYYMMDD"),
          moment(endDate).format("YYYYMMDD")
        )
        .then((entries) => {
          console.log(project.id, "entries", entries);
          addToHoursPerDay(entries);
          times = Object.values(hoursPerDay);
        });
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

  const initHoursPerDay = () => {
    hoursPerDay = {
      Montag: 0,
      Dienstag: 0,
      Mittwoch: 0,
      Donnerstag: 0,
      Freitag: 0,
    };
  };

  const getWeekdayName = (date) => {
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
    });
  };

  const addToHoursPerDay = (entries) => {
    /*
      entries as array
        0: {id: 14696, date: '2023-03-13', hours: 2.1666666667, description: ''}
        1: {id: 14695, date: '2023-03-16', hours: 2.25, description: ''}
    */
    entries.forEach((entry) => {
      const weekday = getWeekdayName(new Date(entry.date));
      hoursPerDay[weekday] += entry.hours;
    });
    console.log(hoursPerDay);
  };

  const weekChanged = (days) => {
    // has to be reassigned for the component to rerender
    let selectedDateCopy = new Date(selectedDate);
    selectedDateCopy.setDate(selectedDateCopy.getDate() + days);
    selectedDate = selectedDateCopy;
    calculateWeek();
    reload();
  };

  const selectedDateChanged = (date) => {
    selectedDate = date;
  };
</script>

<section>
  <WeekView
    {selectedWeek}
    {times}
    {selectedDate}
    {selectedDateChanged}
    {weekChanged}
  />
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
