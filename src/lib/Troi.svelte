<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import { troiApi } from "./apis/troiApiService";
  import TroiTimeEntries from "$lib/components/TroiTimeEntries.svelte";
  import WeekView from "$lib/components/WeekView.svelte";
  import LoadingOverlay from "$lib/components/LoadingOverlay.svelte";
  import {
    addDaysToDate,
    formatDateToYYYYMMDD,
    getDatesBetween,
  } from "$lib/utils/dateUtils";
  import InfoBanner from "$lib/components/InfoBanner.svelte";
  import TroiController, {
    timeEntryCache,
    troiApiWrapper,
  } from "$lib/controllers/TroiController";

  const troiController = new TroiController();

  let selectedWeek = [];
  let projects = [];
  let times = [];
  let calendarEvents = [];
  let selectedDayIsHoliday = false;
  let selectedDayIsVacation = false;
  let entriesForSelectedDate = {};

  // both variables used to jump back when today button pressed
  let initalDate = new Date();
  let initalWeek = [];

  let isLoading = true;
  let projectSuccessCounter = 0;
  let timeEntryEditState = { id: -1 };

  let selectedDate = new Date();
  $: entriesForSelectedDate = getEntriesFor(selectedDate);

  onMount(async () => {
    // make sure $troiApi from store is not used before it is initialized
    if ($troiApi == undefined) return;
    troiController.init($troiApi);
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
    entriesForSelectedDate = getEntriesFor(selectedDate);

    times = [];
    calendarEvents = [];
    selectedWeek.forEach((date) => {
      times.push(timeEntryCache.totalHoursOf(date));
      calendarEvents.push(timeEntryCache.getEventsForDate(date));
    });

    setSelectedDayEvents();
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
          setSelectedDate(initalDate);
        }
        updateUI();
        isLoading = false;
      }
    });
  }

  function getEntriesFor(date) {
    let entriesForDate = {};

    if (projects.length == 0) {
      return entriesForDate;
    }

    projects.forEach((project) => {
      entriesForDate[project.id] = timeEntryCache.entriesForProject(
        date,
        project.id
      );
    });

    return entriesForDate;
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
    selectedWeek = selectedWeek.map((day) => addDaysToDate(day, 7 * direction));
    setSelectedDate(addDaysToDate(selectedDate, 7 * direction));
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
    setSelectedDate(initalDate);
    selectedWeek = initalWeek;
    updateUI();
  }

  function setSelectedDate(date) {
    selectedDate = date;
    setSelectedDayEvents();
  }

  function setSelectedDayEvents() {
    const selectedDayCalendarEvents =
      calendarEvents[(selectedDate.getDay() + 6) % 7];

    if (selectedDayCalendarEvents == undefined) {
      return;
    }

    const holidayEvent = selectedDayCalendarEvents.find(
      (event) => event.type == "H"
    );

    selectedDayIsHoliday = holidayEvent != undefined;

    const vacationEvent = selectedDayCalendarEvents.find(
      (event) => event.type == "P"
    );

    selectedDayIsVacation = vacationEvent != undefined;
  }

  function getProjectById(projectId) {
    const index = projects
      .map((project) => project.id)
      .indexOf(Number(projectId));
    return projects[index];
  }

  async function onDeleteEntryClicked(entry, projectId) {
    isLoading = true;
    await troiController.deleteEntry(entry, projectId, () => {
      updateUI();
      isLoading = false;
    });
  }

  async function onAddEntryClicked(project, hours, description) {
    isLoading = true;
    await troiController.addEntry(
      selectedDate,
      project,
      hours,
      description,
      () => {
        updateUI();
        isLoading = false;
      }
    );
  }

  async function onUpdateEntryClicked(projectId, entry) {
    isLoading = true;
    const project = getProjectById(projectId);
    await troiController.updateEntry(project, entry, () => {
      timeEntryEditState = { id: -1 };
      updateUI();
      isLoading = false;
    });
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

{#if !selectedDayIsHoliday}
  {#if selectedDayIsVacation}
    <InfoBanner
      text={"Are you sure you want to book time on a vacation day?!"}
    />
  {/if}
  <TroiTimeEntries
    {projects}
    entries={entriesForSelectedDate}
    deleteClicked={onDeleteEntryClicked}
    onUpdateEntry={onUpdateEntryClicked}
    onAddEntry={onAddEntryClicked}
    editState={timeEntryEditState}
    disabled={selectedDayIsHoliday}
  />
{:else}
  <InfoBanner text={"You can't log time on a holiday!"} />
{/if}

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
