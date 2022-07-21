<script>
  import { troiApi } from "./troiApiService";
  import moment from "moment";
  import TroiEntryForm from "./TroiEntryForm.svelte";

  export let calculationPositionId;
  export let startDate;
  export let endDate;

  let entriesPromise;
  let editEntryIndex;
  let dateHeaders = [];

  $: {
    cancelEdit();
    entriesPromise = $troiApi.getTimeEntries(
      calculationPositionId,
      startDate,
      endDate
    );
  }

  async function refresh() {
    entriesPromise = await $troiApi.getTimeEntries(
      calculationPositionId,
      startDate,
      endDate
    );
    dateHeaders = [];
  }

  async function deleteEntry(id) {
    await $troiApi.deleteTimeEntryViaServerSideProxy(id);
    refresh();
  }

  async function editEntry(index) {
    editEntryIndex = index;
  }

  async function cancelEdit() {
    editEntryIndex = null;
  }

  function getWeekday(dayIndex) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekdays[dayIndex];
  }

  function getSumByDay(entries, entry) {
    const summedEntries = entries
      .filter((e) => e.date === entry.date)
      .reduce(
        (previous, current) => {
          console.log(previous.hours, current.hours);
          return { hours: previous.hours + current.hours };
        },
        { hours: 0 }
      );
    return summedEntries.hours;
  }

  function getDateHeader(entry) {
    if (dateHeaders.indexOf(entry.date) === -1) {
      dateHeaders.push(entry.date);
      return moment(entry.date).format("MMM DD");
    } else {
      return null;
    }
  }
</script>

<div data-test="time-entries">
  <TroiEntryForm
    disabled={editEntryIndex != null}
    on:submit={refresh}
    {calculationPositionId}
  />
  {#await entriesPromise}
    <p>Loading…</p>
  {:then entries}
    {#each entries.sort((a, b) => (a.date > b.date ? -1 : 1)) as entry, index}
      {#if editEntryIndex === index}
        <TroiEntryForm
          on:submit={refresh}
          on:cancelEdit={cancelEdit}
          {calculationPositionId}
          {entry}
          editMode={true}
          updateEntryCallback={refresh}
        />{:else}
        {#if getDateHeader(entry)}
          <h1 class="font-medium leading-tight text-lg mt-2 ml-2 text-blue-600">
            {moment(entry.date).format("DD.MM.YYYY")}
            <span class="font-normal ml-2">
              {moment
                .duration({ hours: getSumByDay(entries, entry) })
                .asHours()} hours</span
            >
          </h1>
        {/if}
        <div data-test="entry-card" class="flex justify-center my-2">
          <div class="block p-4 rounded-lg shadow-lg bg-white w-full">
            <div class="flex flex-row">
              <div class="basis-3/4 p-1">
                <h5
                  class="text-gray-900 text-base leading-tight font-normal mb-2"
                >
                  {getWeekday(new Date(entry.date).getDay())}
                  {moment(entry.date).format("DD.MM.YYYY")} -
                  {Math.floor(entry.hours)}:{String(
                    Math.floor((entry.hours - Math.floor(entry.hours)) * 60)
                  ).padStart(2, "0")} Hours
                </h5>
                <p class="text-gray-700 text-base">
                  {entry.description}
                </p>
              </div>
              <div class="basis-1/4 flex justify-end">
                <div class="flex flex-col justify-center gap-1">
                  <button
                    on:click={() => editEntry(index)}
                    class="h-auto inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                  >
                    Edit
                  </button>

                  <button
                    on:click={() => deleteEntry(entry.id)}
                    class="inline-block px-6 py-2.5 bg-white text-red-600 font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-red-100 hover:shadow-lg focus:bg-red-100 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-200 active:shadow-lg transition duration-150 ease-in-out"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>{/if}
    {/each}
  {/await}
</div>
