<script>
  // @ts-nocheck

  import moment from "moment";
  import { onMount } from "svelte";
  import { troiApi } from "./apis/troiApiService";
  import TimeEntryCache, {
    convertToCacheFormat,
  } from "$lib/stores/TimeEntryCache";
  import TroiApiWrapper from "./apis/TroiApiWrapper";
  import TroiTimeEntries from "$lib/components/TroiTimeEntries.svelte";
  import WeekView from "$lib/components/WeekView.svelte";
  import TroiEntryForm from "$lib/components/NewTimeEntryForm.svelte";
  import LoadingOverlay from "$lib/components/LoadingOverlay.svelte";

  const timeEntryCache = new TimeEntryCache();
  const troiApiWrapper = new TroiApiWrapper();
  let selectedWeek = [];
  let projects = [];
  let times = [];
  let calendarEvents = [];
  let projectsOfSelectedDate = [];

  // both variables used to jump back when today button pressed
  let initalDate = new Date();
  let initalWeek = [];

  let isLoading = true;
  let projectSuccessCounter = 0;
  let timeEntryEditState = { id: -1 };

  let selectedDate = new Date();
  $: projectsOfSelectedDate = timeEntryCache.projectsFor(selectedDate);

  onMount(async () => {
    // make sure $troiApi from store is not used before it is initialized
    if ($troiApi == undefined) return;
    troiApiWrapper.init($troiApi);
    projects = await troiApiWrapper.api.getCalculationPositions();
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

  function updateUI() {
    projectsOfSelectedDate = timeEntryCache.projectsFor(selectedDate);

    times = [];
    calendarEvents = [];
    selectedWeek.forEach((date) => {
      times.push(timeEntryCache.totalHoursOf(date));
      calendarEvents.push(timeEntryCache.getEventsForDate(date));
    });
  }

  async function loadTimeEntries(startDate, endDate) {
    isLoading = true;
    projectSuccessCounter = 0;
    //TODO: ERROR COUNTER + WARNING FOR USER IN CASE SUCCESS COUNTER IS NOT REACHED
    await loadCalendarEvents(startDate, endDate);

    projects.forEach(async (project) => {
      const entries = await troiApiWrapper.api.getTimeEntries(
        project.id,
        formatDateToYYYYMMDD(startDate),
        formatDateToYYYYMMDD(endDate)
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
          selectedDate = initalDate;
        }
        updateUI();
        isLoading = false;
      }
    });
  }

  async function loadCalendarEvents(startDate, endDate) {
    const calendarEvents = await $troiApi.getCalendarEvents(
      "H",
      formatDateToYYYYMMDD(startDate),
      formatDateToYYYYMMDD(endDate)
    );

    calendarEvents.forEach((calendarEvent) => {
      let dates = getDatesBetween(
        new Date(Math.max(new Date(calendarEvent.startDate), startDate)),
        new Date(Math.min(new Date(calendarEvent.endDate), endDate))
      );

      dates.forEach((date) => {
        timeEntryCache.addEventForDate(
          {
            id: calendarEvent.id,
            subject: calendarEvent.subject,
            type: calendarEvent.type,
          },
          date
        );
      });
    });
  }

  function getDatesBetween(startDate, endDate) {
    // Set equal hours for start and endDate so the hour difference
    // doesn't influence the date comparison
    startDate.setHours(5, 0, 0, 0);
    endDate.setHours(5, 0, 0, 0);
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate = addDaysToDate(currentDate, 1);
    }
    return dateArray;
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

  function formatDateToYYYYMMDD(date) {
    return moment(date).format("YYYYMMDD");
  }

  function reduceWeekClicked() {
    if (timeEntryCache.isAtCacheBottom()) {
      triggerBottomFetch();
    } else {
      reduceSelectedWeek();
      updateUI();
    }
  }

  function increaseWeekClicked() {
    if (timeEntryCache.isAtCacheTop()) {
      triggerTopFetch();
    } else {
      increaseSelectedWeek();
      updateUI();
    }
  }

  function reduceSelectedWeek() {
    changeWeek(-1);
    timeEntryCache.decreaseWeekIndex();
  }

  function increaseSelectedWeek() {
    changeWeek(+1);
    timeEntryCache.increaseWeekIndex();
  }

  function changeWeek(direction) {
    selectedDate = addDaysToDate(selectedDate, 7 * direction);
    selectedWeek = selectedWeek.map((day) => addDaysToDate(day, 7 * direction));
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
    updateUI();
  }

  function setSelectedDate(date) {
    selectedDate = date;
  }

  function getProjectById(projectId) {
    const index = projects
      .map((project) => project.id)
      .indexOf(Number(projectId));
    return projects[index];
  }

  async function onDeleteEntry(entry, projectId) {
    isLoading = true;
    let result = await troiApiWrapper.api.deleteTimeEntryViaServerSideProxy(
      entry.id
    );
    if (result.ok) {
      timeEntryCache.deleteEntry(entry, projectId, updateUI);
    }
    isLoading = false;
  }

  async function onAddEntry(project, hours, description) {
    isLoading = true;
    const troiFormattedSelectedDate = convertToCacheFormat(selectedDate);
    const result = await troiApiWrapper.addEntry(
      project.id,
      troiFormattedSelectedDate,
      hours,
      description
    );

    const entry = {
      date: troiFormattedSelectedDate,
      description: result.Name,
      hours: Number(result.Quantity),
      id: result.Id,
    };

    timeEntryCache.addEntry(project, entry, updateUI);
    isLoading = false;
  }

  async function onUpdateEntry(projectId, entry) {
    isLoading = true;
    const result = await troiApiWrapper.updateEntry(projectId, entry);
    const project = getProjectById(projectId);

    const troiFormattedSelectedDate = convertToCacheFormat(selectedDate);
    const updatedEntry = {
      date: troiFormattedSelectedDate,
      description: result.Name,
      hours: Number(result.Quantity),
      id: result.Id,
    };

    // updated entry still has unique description
    timeEntryCache.updateEntry(project, updatedEntry, () => {
      timeEntryEditState = { id: -1 };
      updateUI();
    });
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
    {calendarEvents}
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
  projects={projectsOfSelectedDate}
  deleteClicked={onDeleteEntry}
  {onUpdateEntry}
  editState={timeEntryEditState}
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
