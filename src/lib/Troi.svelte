<script>
  // @ts-nocheck

  import moment from "moment";
  import { onMount } from "svelte";

  import { troiApi } from "./troiApiService";
  import TroiTimeEntries from "./TroiTimeEntries.svelte";

  import WeekView from "./WeekView/WeekView.svelte";
  import TroiEntryForm from "./TroiEntryForm/TroiEntryForm.svelte";
  import LoadingOverlay from "./loadingOverlay.svelte";
  import { TimeEntryCache } from "./TimeEntryCache/TimeEntryCache";

  const timeEntryCache = new TimeEntryCache();
  let selectedWeek = [];
  let projects = [];
  let times = [];
  let entriesOfSelectedDate = [];

  // both variables used to jump back when today button pressed
  let initalDate = new Date();
  let initalWeek = [];

  let isLoading = true;
  let projectSuccessCounter = 0;
  let currentEditId = -1; //TODO: Rework update of component after edit was saved

  let selectedDate = new Date();
  $: entriesOfSelectedDate = timeEntryCache.entriesFor(selectedDate);

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
    loadTimeEntries(
      addDaysToDate(selectedWeek[0], -timeEntryCache.getIntervallInDays()),
      addDaysToDate(selectedWeek[4], timeEntryCache.getIntervallInDays())
    );
  });

  async function loadTimeEntries(startDate, endDate) {
    isLoading = true;
    projectSuccessCounter = 0;
    //TODO: ERROR COUNTER + WARNING FOR USER IN CASE SUCCESS COUNTER IS NOT REACHED
    projects.forEach(async (project) => {
      const entries = await $troiApi.getTimeEntries(
        project.id,
        formatDate(startDate),
        formatDate(endDate)
      );
      console.log(project.id, "entries", entries);
      projectSuccessCounter++;
      if (entries.length > 0) {
        timeEntryCache.addEntries(project, entries);
      }

      if (projectSuccessCounter == projects.length) {
        // switch weeks at cache borders
        if (timeEntryCache.isAtCacheBottom()) {
          timeEntryCache.increaseBottomBorderByIntervall();
          reduceSelectedWeek();
        } else if (timeEntryCache.isAtCacheTop()) {
          timeEntryCache.increaseTopBorderByIntervall();
          increaseSelectedWeek();
        } else {
          // initial loading
          setTimesForSelectedWeek();
          selectedDate = initalDate;
        }
        isLoading = false;
      }
    });
  }

  function setTimesForSelectedWeek() {
    times = [];
    selectedWeek.forEach((date) => {
      times.push(timeEntryCache.totalHoursOf(date));
    });
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

  function reduceWeekClicked() {
    if (timeEntryCache.isAtCacheBottom()) {
      triggerBottomFetch();
    } else {
      reduceSelectedWeek();
    }
  }

  function increaseWeekClicked() {
    if (timeEntryCache.isAtCacheTop()) {
      triggerTopFetch();
    } else {
      increaseSelectedWeek();
    }
  }

  function reduceSelectedWeek() {
    selectedDate = addDaysToDate(selectedDate, -7);
    selectedWeek = selectedWeek.map((day) => addDaysToDate(day, -7));
    setTimesForSelectedWeek();
    timeEntryCache.decreaseWeekIndex();
  }

  function increaseSelectedWeek() {
    selectedDate = addDaysToDate(selectedDate, 7);
    selectedWeek = selectedWeek.map((day) => addDaysToDate(day, 7));
    setTimesForSelectedWeek();
    timeEntryCache.increaseWeekIndex();
  }

  function triggerBottomFetch() {
    loadTimeEntries(
      addDaysToDate(selectedWeek[0], -timeEntryCache.getIntervallInDays()),
      addDaysToDate(selectedWeek[4], -7)
    );
  }

  function triggerTopFetch() {
    loadTimeEntries(
      addDaysToDate(selectedWeek[0], 7),
      addDaysToDate(selectedWeek[4], timeEntryCache.getIntervallInDays())
    );
  }

  function todayClicked() {
    timeEntryCache.weekIndex = 0;
    selectedDate = initalDate;
    selectedWeek = initalWeek;
    setTimesForSelectedWeek();
  }

  function setSelectedDate(date) {
    selectedDate = date;
  }

  async function onDeleteEntry(entry, projectId) {
    console.log("Delete entry ", entry.id);
    isLoading = true;
    let result = await $troiApi.deleteTimeEntryViaServerSideProxy(entry.id);
    console.log("Delete result: ", result);
    if (result.ok) {
      const index =
        timeEntryCache.cache[formatDate(selectedDate)]["projects"][
          projectId
        ].entries.indexOf(entry);
      console.log("Index: ", index);
      timeEntryCache.cache[formatDate(selectedDate)]["projects"][
        projectId
      ].entries.splice(index, 1);
      entriesOfSelectedDate =
        timeEntryCache.cache[formatDate(selectedDate)]["projects"];

      timeEntryCache.cache[formatDate(selectedDate)]["sum"] =
        timeEntryCache.cache[formatDate(selectedDate)]["sum"] -
        Number(entry.hours);
    }

    setTimesForSelectedWeek();
    isLoading = false;
  }

  async function onAddEntry(project, hours, description) {
    isLoading = true;
    console.log("add ", project.id, hours, description);

    const apiFormattedSelectedDate = moment(selectedDate).format("YYYY-MM-DD");

    let clientId = await $troiApi.getClientId();
    let employeeId = await $troiApi.getEmployeeId();

    const payload = {
      Client: {
        Path: `/clients/${clientId}`,
      },
      CalculationPosition: {
        Path: `/calculationPositions/${project.id}`,
      },
      Employee: {
        Path: `/employees/${employeeId}`,
      },
      Date: apiFormattedSelectedDate,
      Quantity: hours,
      Remark: description,
    };

    let result = await $troiApi.makeRequest({
      url: "/billings/hours",
      headers: { "Content-Type": "application/json" },
      method: "post",
      body: JSON.stringify(payload),
    });
    // console.log(result);

    // date: "2023-05-19";
    // description: "Finish cross vendor webauthn research #995, finish tenant id fix #1045";
    // hours: 8;
    // id: 17487;

    const entry = {
      date: apiFormattedSelectedDate,
      description: result.Name,
      hours: +result.Quantity,
      id: result.Id,
    };
    console.log(entry);

    collectEntriesPerDay(project, [entry]);

    setTimesForSelectedWeek();
    isLoading = false;
  }

  async function onUpdateEntry(projectId, entry) {
    console.log("Update entry ", entry);
    isLoading = true;

    let clientId = await $troiApi.getClientId();
    let employeeId = await $troiApi.getEmployeeId();

    const payload = {
      Client: {
        Path: `/clients/${clientId}`,
      },
      CalculationPosition: {
        Path: `/calculationPositions/${projectId}`,
      },
      Employee: {
        Path: `/employees/${employeeId}`,
      },
      Date: entry.date,
      Quantity: entry.hours,
      Remark: entry.description,
    };

    const result = await $troiApi.makeRequest({
      url: `/billings/hours/${entry.id}`,
      headers: { "Content-Type": "application/json" },
      method: "put",
      body: JSON.stringify(payload),
    });

    if (result.Id == entry.id) {
      console.log("Update successful");
      // TODO
      // const index =
      //   timeEntryCache.cache[formatDate(selectedDate)]["projects"][
      //     projectId
      //   ].entries.indexOf(entry);

      // console.log("INDEX: ", index);

      // const oldEntry =
      //   timeEntryCache.cache[formatDate(selectedDate)]["projects"][projectId].entries[
      //     index
      //   ];

      // console.log("Old entry: ", oldEntry);

      // timeEntryCache.cache[formatDate(selectedDate)]["sum"] =
      //   timeEntryCache.cache[formatDate(selectedDate)]["sum"] - Number(oldEntry.hours);

      // timeEntryCache.cache[formatDate(selectedDate)]["projects"][projectId].entries[
      //   index
      // ] = entry;

      // timeEntryCache.cache[formatDate(selectedDate)]["sum"] =
      //   timeEntryCache.cache[formatDate(selectedDate)]["sum"] + Number(entry.hours);

      // currentEditId = -1;
      // setTimesForSelectedWeek();
    }

    isLoading = false;
  }
</script>

{#if isLoading}
  <LoadingOverlay message={"Please wait..."} />
{/if}
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

{#each projects as project}
  <TroiEntryForm {project} onAddClick={onAddEntry} />
{/each}

<TroiTimeEntries
  entries={entriesOfSelectedDate}
  deleteClicked={onDeleteEntry}
  {onUpdateEntry}
  {currentEditId}
/>

<section class="mt-8 text-xs text-gray-600">
  <p>
    Project not showing up? Make sure it's available in Troi and marked as a
    "favorite". <br />
    The "Suggest" function is not intended for actual use, it is just a fun feature.
  </p>
</section>

<style>
  :root {
    --date-input-width: 6.5rem;
  }
</style>
