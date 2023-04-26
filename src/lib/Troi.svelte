<script>
  // @ts-nocheck

  import moment from "moment";
  import { onMount } from "svelte";

  import { troiApi } from "./troiApiService";
  import TroiTimeEntries from "./TroiTimeEntries.svelte";

  import WeekView from "./weekview/weekView.svelte";

  let loadingEntries = true;
  let projectSuccessCounter = 0;

  let selectedDate = new Date();
  $: if (entriesPerDay[formatDate(selectedDate)] != null) {
    entriesOfSelectedDate = entriesPerDay[formatDate(selectedDate)]["projects"];
  } else {
    entriesOfSelectedDate = {};
  }

  let selectedWeek = [];
  let projects = [];
  let times = [];
  let entriesOfSelectedDate = [];
  let entriesPerDay = {};
  /* 
    '20230313': {
      projects: {
        254: {
          name: Grundsteuer,
          entries: [
            {id: 14694, date: '2023-03-13', hours: 1},
            {id: 14695, date: '2023-03-13', hours: 2}
          ]
        }
      },
      sum: 3
    },
    ...
  */
  const cacheIntervallWeeks = 6;
  const cacheIntervallInDays = cacheIntervallWeeks * 7;
  let cacheTopBorder = 0;
  let cacheBottomBorder = 0;
  let cacheWeekIndex = 0;

  // both variables used to jump back when today button pressed
  let initalDate = new Date();
  let initalWeek = [];

  onMount(async () => {
    //TODO: troiApi sometimes is null, and then will raise an error when calling .getCalculationPositions
    if ($troiApi == undefined) return;
    projects = await $troiApi.getCalculationPositions();
    console.log(projects);
    /*
      projects returned as array
      0: 
        id: 515
        name: "DigitalService / MK_22_0009 / Musterprojekt / Unterprojekt 1 / Regular Engineering"
      1: ...
    */
    fillSelectedWeekWithCurrent();
    increaseBottomCacheByIntervall();
    increaseTopCacheByIntervall();
    loadTimeEntries(
      addDaysToDate(selectedWeek[0], -cacheIntervallInDays),
      addDaysToDate(selectedWeek[4], cacheIntervallInDays)
    );
  });

  async function loadTimeEntries(startDate, endDate) {
    loadingEntries = true;
    projectSuccessCounter = 0;
    //TODO: ERROR COUNTER + WARNING FOR USER IN CASE SUCCESS COUNTER IS NOT REACHED
    projects.forEach(async (project) => {
      const entries = await $troiApi.getTimeEntries(
        project.id,
        moment(startDate).format("YYYYMMDD"),
        moment(endDate).format("YYYYMMDD")
      );
      console.log(project.id, "entries", entries);
      projectSuccessCounter++;
      if (entries.length > 0) {
        collectEntriesPerDay(project, entries);
      }
      if (projectSuccessCounter == projects.length) {
        // switch weeks at cache borders
        if (isAtCacheBottom()) {
          increaseBottomCacheByIntervall();
          reduceSelectedWeek();
        } else if (isAtCacheTop()) {
          increaseTopCacheByIntervall();
          increaseSelectedWeek();
        } else {
          // initial loading
          setTimesForSelectedWeek();
          selectedDate = initalDate;
        }
        loadingEntries = false;
      }
    });
  }

  function collectEntriesPerDay(project, entries) {
    const projectId = project.id.toString();
    entries.forEach((entry) => {
      const entryDate = formatDate(entry.date);
      if (!(entryDate in entriesPerDay)) {
        entriesPerDay[entryDate] = {
          projects: {},
          sum: 0,
        };
      }

      let projectEntries = entriesPerDay[entryDate]["projects"];
      if (!(projectId in projectEntries)) {
        projectEntries[projectId] = {
          entries: [],
          name: project.name,
        };
      }
      projectEntries[projectId]["entries"].push(entry);
      entriesPerDay[entryDate].sum += entry.hours;
    });
  }

  function setTimesForSelectedWeek() {
    let entries = {};
    selectedWeek.forEach((date) => {
      if (formatDate(date) in entriesPerDay) {
        entries[date] = entriesPerDay[formatDate(date)].sum;
      } else {
        entries[date] = 0; // assign zero if no hours for that day are present
      }
    });
    console.log("entries", entries);
    times = Object.values(entries);
  }

  function fillSelectedWeekWithCurrent() {
    // calc Monday of current week
    const dayNumberToday = selectedDate.getDay() || 7; // get current day number, converting Sunday to 7
    var monday = new Date();
    if (dayNumberToday !== 1) monday.setHours(-24 * (dayNumberToday - 1)); // only manipulate the date if it isn't Monday

    // assign Monday to Friday based on Monday
    selectedWeek[0] = monday;
    for (let i = 1; i < 5; i++) {
      selectedWeek[i] = addDaysToDate(monday, i);
    }
    // if hours set to 0, summer and winter time will interfere and change the day. Setting to 5 is somewhat "safe"
    selectedWeek.map((date) => date.setHours(5, 0, 0, 0));
    selectedDate.setHours(5, 0, 0, 0);

    // values for today button to come back to
    initalDate = selectedDate;
    initalWeek = selectedWeek;
  }

  // subtraction also possible
  function addDaysToDate(date, days) {
    return new Date(date.getTime() + days * 86400000); // 24*60*60*1000
  }

  function formatDate(date) {
    return moment(date).format("YYYYMMDD");
  }

  function increaseBottomCacheByIntervall() {
    cacheBottomBorder -= cacheIntervallWeeks;
  }

  function increaseTopCacheByIntervall() {
    cacheTopBorder += cacheIntervallWeeks;
  }

  function isAtCacheBottom() {
    return cacheWeekIndex == cacheBottomBorder;
  }

  function isAtCacheTop() {
    return cacheWeekIndex == cacheTopBorder;
  }

  function reduceWeekClicked() {
    if (isAtCacheBottom()) {
      triggerBottomFetch();
    } else {
      reduceSelectedWeek();
    }
  }

  function increaseWeekClicked() {
    if (isAtCacheTop()) {
      triggerTopFetch();
    } else {
      increaseSelectedWeek();
    }
  }

  function reduceSelectedWeek() {
    selectedDate = addDaysToDate(selectedDate, -7);
    selectedWeek = selectedWeek.map((day) => addDaysToDate(day, -7));
    setTimesForSelectedWeek();
    cacheWeekIndex--;
  }

  function increaseSelectedWeek() {
    selectedDate = addDaysToDate(selectedDate, 7);
    selectedWeek = selectedWeek.map((day) => addDaysToDate(day, 7));
    setTimesForSelectedWeek();
    cacheWeekIndex++;
  }

  function triggerBottomFetch() {
    loadTimeEntries(
      addDaysToDate(selectedWeek[0], -cacheIntervallInDays),
      addDaysToDate(selectedWeek[4], -7)
    );
  }

  function triggerTopFetch() {
    loadTimeEntries(
      addDaysToDate(selectedWeek[0], 7),
      addDaysToDate(selectedWeek[4], cacheIntervallInDays)
    );
  }

  function todayClicked() {
    cacheWeekIndex = 0;
    selectedDate = initalDate;
    selectedWeek = initalWeek;
    setTimesForSelectedWeek();
  }

  function setSelectedDate(date) {
    selectedDate = date;
  }
</script>

{#if loadingEntries}
  <div class="mt-8 flex flex-col items-center justify-center">
    <div
      class="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-gray-900"
    />
    <div class="mt-8">Fetching your time entries 🤗</div>
  </div>
{:else}
  <section>
    <WeekView
      {selectedWeek}
      {times}
      {selectedDate}
      {setSelectedDate}
      {reduceWeekClicked}
      {increaseWeekClicked}
      {todayClicked}
    />
  </section>
  <TroiTimeEntries entries={entriesOfSelectedDate} />
{/if}

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
