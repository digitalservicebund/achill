<!-- svelte-ignore a11y-missing-attribute -->
<script>
  import { convertFloatTimeToHHMM } from "$lib/utils/timeConverter.js";
  import {
    addDaysToDate,
    datesEqual,
    getWeekDaysFor,
    getWeekNumberFor,
  } from "$lib/utils/dateUtils.js";
  import { onMount } from "svelte";

  // @ts-nocheck

  export let timesAndEventsOfSelectedWeek = [];
  export let selectedDateChanged;

  const weekdays = ["M", "T", "W", "T", "F"];

  let selectedDate = new Date();
  let selectedWeek = [];

  $: selectedWeekNumber = getWeekNumberFor(selectedDate);
  $: {
    selectedDateChanged(selectedDate);
  }

  onMount(() => {
    selectedDate = new Date();
    selectedWeek = getWeekDaysFor(selectedDate);
  });

  function changeWeek(direction) {
    selectedDate = addDaysToDate(selectedDate, 7 * direction);
    selectedWeek = getWeekDaysFor(selectedDate);
  }

  function getDateClasses(index, selectedDate) {
    let dateClasses = "flex h-8 w-8 items-center justify-center rounded-full ";
    let date = selectedWeek[index];

    if (datesEqual(date, new Date())) {
      dateClasses += "outline-none ring-2 ring-black ring-offset-2 ";
    }

    if (datesEqual(date, selectedDate)) {
      dateClasses += "bg-blue-600 text-white hover:bg-blue-700 ";
    } else {
      dateClasses += "text-black hover:bg-[#B8BDC3] ";
    }

    return dateClasses;
  }
</script>

<!-- svelte-ignore a11y-no-redundant-roles -->

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
  />
</svelte:head>

<div class="flex p-4">
  <div class="w-full">
    <div>
      <div class="flex flex-wrap gap-8">
        <!-- Date Label Box -->
        <div class="min-w-[30ch]">
          <div class="mb-3 flex items-center">
            <button
              data-testid="btn-previous-week"
              aria-label="calendar backward"
              class="-ml-1.5 flex items-center justify-center text-gray-600 hover:text-gray-400"
              on:click={() => changeWeek(-1)}
            >
              <span class="material-symbols-outlined"> chevron_left </span>
            </button>
            <div
              tabindex="0"
              class="min-w-[9ch] px-2 text-center text-sm text-gray-600 focus:outline-none"
            >
              Week {selectedWeekNumber}
            </div>
            <button
              data-testid="btn-next-week"
              aria-label="calendar forward"
              class="flex items-center justify-center text-gray-600 hover:text-gray-400"
              on:click={() => changeWeek(1)}
            >
              <span class="material-symbols-outlined"> chevron_right </span>
            </button>
            <button
              data-testid="btn-today"
              aria-label="today"
              class="min-w-[7ch] text-center font-bold text-blue-600 hover:text-blue-700"
              on:click={() => {
                selectedDate = new Date();
                selectedWeek = getWeekDaysFor(selectedDate);
              }}
            >
              Today
            </button>
          </div>
          <div
            data-testid="date"
            tabindex="0"
            class="text-base font-bold text-gray-800 focus:outline-none"
          >
            {selectedDate.toLocaleDateString("en-gb", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <!-- Calendar -->
        <div class="rounded-t bg-white">
          <div class="flex items-center justify-between">
            <table class="w-full">
              <thead>
                <tr>
                  {#each weekdays as weekday}
                    <th>
                      <div class="flex w-full justify-center">
                        <p
                          class="text-center text-base font-medium text-gray-600"
                        >
                          {weekday}
                        </p>
                      </div>
                    </th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {#each selectedWeek as date, index}
                    <td>
                      <div
                        class="h-full w-full"
                        data-testid={[
                          "btn-mon",
                          "btn-tue",
                          "btn-wed",
                          "btn-thu",
                          "btn-fri",
                        ][index]}
                        on:click={() => (selectedDate = date)}
                      >
                        <div
                          class="flex w-full cursor-pointer items-center justify-center rounded-full px-2 py-2 text-base font-medium"
                        >
                          <p class={getDateClasses(index, selectedDate)}>
                            {date.getDate()}
                          </p>
                        </div>
                      </div>
                    </td>
                  {/each}
                </tr>
                <tr>
                  {#each timesAndEventsOfSelectedWeek as data, index}
                    <td>
                      <div
                        class="flex min-w-[6ch] cursor-pointer justify-center px-2 py-2"
                        on:click={() => (selectedDate = selectedWeek[index])}
                      >
                        {#if data.events.length && data.events[0].type === "H"}
                          <span class="material-symbols-outlined">
                            wb_sunny
                          </span>
                        {:else if data.events.length && data.events[0].type === "P"}
                          <span class="material-symbols-outlined">
                            beach_access
                          </span>
                        {:else}
                          <p
                            data-testid={[
                              "hours-mon",
                              "hours-tue",
                              "hours-wed",
                              "hours-thu",
                              "hours-fri",
                            ][index]}
                            class="text-base font-medium {data.hours == 0
                              ? 'text-gray-500'
                              : 'text-blue-600'}"
                          >
                            {convertFloatTimeToHHMM(data.hours)}
                          </p>
                        {/if}
                      </div>
                    </td>
                  {/each}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
