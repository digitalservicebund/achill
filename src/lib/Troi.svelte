<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import { troiApi } from "./apis/troiApiService";
  import TroiTimeEntries from "$lib/components/TroiTimeEntries.svelte";
  import WeekView from "$lib/components/WeekView.svelte";
  import LoadingOverlay from "$lib/components/LoadingOverlay.svelte";
  import { getWeekDaysFor } from "$lib/utils/dateUtils";
  import InfoBanner from "$lib/components/InfoBanner.svelte";
  import TroiController from "$lib/troiController";

  const troiController = new TroiController();

  let selectedDate = new Date();
  let selectedWeek = getWeekDaysFor(selectedDate);

  let projects = [];
  let timesAndEventsOfSelectedWeek = [];
  let selectedDayIsHoliday = false;
  let selectedDayIsVacation = false;
  let entriesForSelectedDate = {};

  let isLoading = true;
  let timeEntryEditState = { id: -1 };

  onMount(async () => {
    // make sure $troiApi from store is not used before it is initialized
    if ($troiApi == undefined) return;

    await troiController.init($troiApi, showLoadingSpinner, hideLoadingSpinner);
    projects = troiController.getProjects();
    updateUI();
    hideLoadingSpinner();
  });

  function showLoadingSpinner() {
    isLoading = true;
  }

  function hideLoadingSpinner() {
    isLoading = false;
  }

  async function updateUI() {
    entriesForSelectedDate = await troiController.getEntriesFor(selectedDate);
    timesAndEventsOfSelectedWeek =
      troiController.getTimesAndEventsFor(selectedWeek);
    setSelectedDayEvents();
  }

  async function onSelectedDateChangedTo(date) {
    selectedDate = date;
    selectedWeek = getWeekDaysFor(selectedDate);
    updateUI();
  }

  function setSelectedDayEvents() {
    const selectedDayCalendarEvents = troiController.getEventsFor(selectedDate);

    selectedDayIsHoliday = selectedDayCalendarEvents.some(
      (event) => event.type === "H"
    );

    selectedDayIsVacation = selectedDayCalendarEvents.some(
      (event) => event.type === "P"
    );
  }

  // TODO: move to controller
  function getProjectById(projectId) {
    const index = projects
      .map((project) => project.id)
      .indexOf(Number(projectId));
    return projects[index];
  }

  async function onDeleteEntryClicked(entry, projectId) {
    showLoadingSpinner();
    await troiController.deleteEntry(entry, projectId, updateUI);
    hideLoadingSpinner();
  }

  async function onAddEntryClicked(project, hours, description) {
    showLoadingSpinner();
    await troiController.addEntry(
      selectedDate,
      project,
      hours,
      description,
      updateUI
    );
    hideLoadingSpinner();
  }

  async function onUpdateEntryClicked(projectId, entry) {
    showLoadingSpinner();
    const project = getProjectById(projectId);
    await troiController.updateEntry(project, entry, () => {
      timeEntryEditState = { id: -1 };
      updateUI();
    });
    hideLoadingSpinner();
  }
</script>

{#if isLoading}
  <LoadingOverlay message={"Please wait..."} />
{/if}
<section class="p-4">
  <a
    class="angie-link"
    href="https://digitalservicebund.atlassian.net/wiki/spaces/DIGITALSER/pages/359301512/Time+Tracking"
    target="_blank">Read about how to track your time in confluence</a
  >
</section>
<section class="w-full bg-white md:sticky md:top-0">
  <WeekView
    {timesAndEventsOfSelectedWeek}
    selectedDateChanged={onSelectedDateChangedTo}
  />
</section>

{#if !selectedDayIsHoliday}
  {#if selectedDayIsVacation}
    <InfoBanner
      text={"You are on vacation."}
      symbol={"beach_access"}
      testId={"vacation-banner"}
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
  <InfoBanner
    text={"Public holiday, working impossible."}
    symbol={"wb_sunny"}
    testId={"holiday-banner"}
  />
{/if}

<section class="mt-8 text-xs text-gray-600">
  <p>
    Project not showing up? Make sure it's available in Troi and marked as a
    "favorite".
  </p>
</section>

<style>
  :root {
    --date-input-width: 6.5rem;
  }
</style>
