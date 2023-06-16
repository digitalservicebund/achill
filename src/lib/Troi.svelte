<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import { troiApi } from "./apis/troiApiService";
  import TroiTimeEntries from "$lib/components/TroiTimeEntries.svelte";
  import WeekView from "$lib/components/WeekView.svelte";
  import LoadingOverlay from "$lib/components/LoadingOverlay.svelte";
  import { getWeekDaysFor } from "$lib/utils/dateUtils";
  import InfoBanner from "$lib/components/InfoBanner.svelte";
  import TroiController from "$lib/controllers/TroiController";

  const troiController = new TroiController();

  let selectedDate = new Date();
  let selectedWeek = getWeekDaysFor(selectedDate);

  let projects = [];
  let timesAndEventsOfSelectedWeek = [];
  let calendarEvents = [];
  let selectedDayIsHoliday = false;
  let selectedDayIsVacation = false;
  let entriesForSelectedDate = {};

  let isLoading = true;
  let timeEntryEditState = { id: -1 };

  onMount(async () => {
    // make sure $troiApi from store is not used before it is initialized
    if ($troiApi == undefined) return;

    await troiController.init($troiApi);
    projects = troiController.getProjects();
    console.log("Try to trigger Initial reload of weekView");
    updateUI();
  });

  async function updateUI() {
    entriesForSelectedDate = await troiController.getEntriesFor(selectedDate);
    timesAndEventsOfSelectedWeek =
      troiController.getTimesAndEventsFor(selectedWeek);
    isLoading = false;
  }

  async function onSelectedDateChangedTo(date) {
    entriesForSelectedDate = await troiController.getEntriesFor(date);
    selectedDate = date;
    setSelectedDayEvents();
  }

  function onSelectedWeekChangedTo(week) {
    timesAndEventsOfSelectedWeek = troiController.getTimesAndEventsFor(week);
    selectedWeek = week;
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
    await troiController.deleteEntry(entry, projectId, updateUI);
  }

  async function onAddEntryClicked(project, hours, description) {
    isLoading = true;
    await troiController.addEntry(
      selectedDate,
      project,
      hours,
      description,
      updateUI
    );
  }

  async function onUpdateEntryClicked(projectId, entry) {
    isLoading = true;
    const project = getProjectById(projectId);
    await troiController.updateEntry(project, entry, () => {
      timeEntryEditState = { id: -1 };
      updateUI();
    });
  }
</script>

{#if isLoading}
  <LoadingOverlay message={"Please wait..."} />
{/if}
<section>
  <WeekView
    {timesAndEventsOfSelectedWeek}
    selectedDateChanged={onSelectedDateChangedTo}
    selectedWeekChanged={onSelectedWeekChangedTo}
  />
</section>

{#if !selectedDayIsHoliday}
  {#if selectedDayIsVacation}
    <InfoBanner text={"You are on vacation."} symbol={"beach_access"} />
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
  <InfoBanner
    text={"Public holiday, working impossible."}
    symbol={"wb_sunny"}
  />
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
