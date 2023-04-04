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
      "2023-03-27": 4,
      "2023-03-28": 5.6,
      ...
    }
    troi api returns hours as float value
  */
  let times = [];
  let startDate = "";
  let endDate = "";

  const reload = async () => {
    calculateWeek();
    setCacheInterval();
    initHoursPerDay();
    console.log(selectedWeek);
    console.log(hoursPerDay);

    // No clue why I need to call that here, but without it, fetching the time entries does not work
    await $troiApi;

    projects.forEach(async (project) => {
      const entries = await $troiApi.getTimeEntries(
        project.id,
        moment(startDate).format("YYYYMMDD"),
        moment(endDate).format("YYYYMMDD")
      );
      console.log(project.id, "entries", entries);
      if (entries.length > 0) {
        addHoursToDay(entries);
      }
      times = extractSelectedWeekEntries();
    });
  };

  function extractSelectedWeekEntries() {
    let entries = {};
    for (let date in selectedWeek) {
      entries[date] = hoursPerDay[date];
    }
    return Object.values(entries);
  }

  function initHoursPerDay() {
    hoursPerDay = {};
    selectedWeek.forEach((day) => {
      day.setHours(0, 0, 0, 0); // troi api returns date with 01:00:00 GMT+0100, set to zero for comparison
      hoursPerDay[day] = 0;
    });
  }

  onMount(async () => {
    projects = await $troiApi.getCalculationPositions();
    console.log(projects);
    /*
      projects returned as array
      0: 
        id: 515
        name: "DigitalService / MK_22_0009 / Musterprojekt / Unterprojekt 1 / Regular Engineering"
      1: 
      ...
    */
    reload();
  });

  const calculateWeek = () => {
    let weeks = cal.monthDates(
      selectedDate.getFullYear(),
      selectedDate.getMonth()
    );
    console.log("-----");
    console.log(weeks);
    for (const week of weeks) {
      const lastDateOfWeek = new Date(week[6]);
      if (selectedDate <= lastDateOfWeek) {
        selectedWeek = week.slice(0, 5);
        console.log("-----");
        console.log(selectedWeek);

        break;
      }
    }
  };

  function setCacheInterval() {
    startDate = addDaysToDate(selectedWeek[0], -35);
    endDate = addDaysToDate(selectedWeek[4], 7);
    console.log(startDate);
    console.log(endDate);
  }

  const addHoursToDay = (entries) => {
    /*
      entries as array
        0: {id: 14696, date: '2023-03-13', hours: 2.1666666667, description: ''}
        1: {id: 14695, date: '2023-03-16', hours: 2.25, description: ''}
    */
    entries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0); // troi api returns date with 01:00:00 GMT+0100, set to zero for comparison
      // if user quickly goes through calender we need to ignore dates that are not within the desired selectedWeek
      if (entryDate >= selectedWeek[0] && entryDate <= selectedWeek[4]) {
        console.log(entryDate, "✅ range");
        hoursPerDay[entryDate] += entry.hours;
      } else {
        console.log(entryDate, "❌ range");
      }
    });
    console.log(hoursPerDay);
  };

  const weekChanged = (days) => {
    selectedDate = addDaysToDate(selectedDate, days);
    calculateWeek();
    reload();
  };

  const selectedDateChanged = (date) => {
    selectedDate = date;
  };

  const addDaysToDate = (date, days) => {
    date.setDate(date.getDate() + days);
    return date;
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
