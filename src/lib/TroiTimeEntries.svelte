<script>
  import { troiApi } from "./troiApiService";
  import moment from "moment";
  import TroiEntryForm from "./TroiEntryForm.svelte";

  export let calculationPositionId;
  // export let startDate;
  // export let endDate;
  export let entries;

  // let entriesPromise;
  let editEntryIndex;
  let dateHeaders = [];

  // $: {
  //   cancelEdit();
  //   entriesPromise = $troiApi.getTimeEntries(
  //     calculationPositionId,
  //     startDate,
  //     endDate
  //   );
  // }

  // async function refresh() {
  //   entriesPromise = await $troiApi
  //     .getTimeEntries
  //   calculationPositionId,
  //   startDate,
  //   endDate
  //   ();
  //   dateHeaders = [];
  // }

  async function deleteEntry(id) {
    await $troiApi.deleteTimeEntryViaServerSideProxy(id);
    // refresh();
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
  <!-- <TroiEntryForm
    disabled={editEntryIndex != null}
    on:submit={refresh}
    {calculationPositionId}
  /> -->
  <!-- {#await entriesPromise}
    <p>Loading…</p>
  {:then entries} -->
  {#each entries.sort((a, b) => (a.date > b.date ? -1 : 1)) as entry, index}
    {console.log("Entry: ", entry)}
    {#if editEntryIndex === index}
      <!-- <TroiEntryForm
        on:submit={refresh}
        on:cancelEdit={cancelEdit}
        {calculationPositionId}
        {entry}
        editMode={true}
        updateEntryCallback={refresh} -->
      />{:else}
      {#if getDateHeader(entry)}
        <h1 class="mt-2 ml-2 text-lg font-medium leading-tight text-blue-600">
          {moment(entry.date).format("DD.MM.YYYY")}
          <span class="ml-2 font-normal">
            {moment.duration({ hours: getSumByDay(entries, entry) }).asHours()} hours</span
          >
        </h1>
      {/if}
      <div data-test="entry-card" class="my-2 flex justify-center">
        <div class="block w-full rounded-lg bg-white p-4 shadow-lg">
          <div class="flex flex-row">
            <div class="basis-3/4 p-1">
              <h5
                class="mb-2 text-base font-normal leading-tight text-gray-900"
              >
                {getWeekday(new Date(entry.date).getDay())}
                {moment(entry.date).format("DD.MM.YYYY")} -
                {Math.floor(entry.hours)}:{String(
                  Math.floor((entry.hours - Math.floor(entry.hours)) * 60)
                ).padStart(2, "0")} Hours
              </h5>
              <p class="text-base text-gray-700">
                {entry.description}
              </p>
            </div>
            <div class="flex basis-1/4 justify-end">
              <div class="flex flex-col justify-center gap-1">
                <button
                  on:click={() => editEntry(index)}
                  class="inline-block h-auto rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
                >
                  Edit
                </button>

                <button
                  on:click={() => deleteEntry(entry.id)}
                  class="inline-block rounded bg-white px-6 py-2.5 text-xs font-medium uppercase leading-tight text-red-600 shadow-md transition duration-150 ease-in-out hover:bg-red-100 hover:shadow-lg focus:bg-red-100 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-200 active:shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>{/if}
  {/each}
  <!-- {/await} -->
</div>
