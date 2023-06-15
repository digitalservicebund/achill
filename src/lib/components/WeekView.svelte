<!-- svelte-ignore a11y-missing-attribute -->
<script>
  import { beforeUpdate, onMount } from "svelte";
  import { convertFloatTimeToHHMM } from "$lib/utils/timeConverter.js";
  import {
    datesEqual,
    getDayNumberFor,
    getWeekNumberFor,
  } from "$lib/utils/dateUtils.js";

  // @ts-nocheck

  export let selectedWeek;
  export let times;
  export let calendarEvents = [];
  export let selectedDate;
  export let setSelectedDate;
  export let reduceWeekClicked;
  export let increaseWeekClicked;
  export let todayClicked;

  const today = new Date();
  let selectedWeekday;
  let selectedWeekNumber;
  let selectedMonth;
  let selectedYear;
  let displayHours = [];
  let selectedCalendarEvents = [];
  const weekdays = ["M", "T", "W", "T", "F"];

  beforeUpdate(() => {
    updateComponent();
  });

  function updateComponent() {
    selectedMonth = selectedDate.toLocaleString("default", { month: "long" });
    selectedYear = selectedDate.getFullYear();
    selectedWeekNumber = getWeekNumberFor(selectedDate);
    selectedWeekday = selectedDate.toLocaleDateString("de-DE", {
      weekday: "long",
    });
    displayHours = [];
    selectedCalendarEvents = calendarEvents[getDayNumberFor(selectedDate)]
      ? calendarEvents[getDayNumberFor(selectedDate)]
      : [];
    times.forEach((time) => {
      displayHours.push(time == 0 ? "0" : convertFloatTimeToHHMM(time));
    });
  }

  function getDateClasses(index, selectedDate) {
    let dateClasses = "flex h-8 w-8 items-center justify-center rounded-full ";
    let date = selectedWeek[index];

    if (datesEqual(date, today)) {
      dateClasses += "outline-none ring-2 ring-black ring-offset-2 ";
    }

    if (datesEqual(date, selectedDate)) {
      dateClasses += "bg-blue-600 text-white hover:bg-blue-700 ";
    } else {
      if (calendarEvents.length > 0 && calendarEvents[index].length) {
        dateClasses += "text-gray-500 bg-blue-200 hover:bg-[#B8BDC3] ";
      } else {
        dateClasses += "text-black hover:bg-[#B8BDC3] ";
      }
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

<div class="flex py-8">
  <div class="w-full">
    <div>
      <a
        class="angie-link pb-8"
        href="https://digitalservicebund.atlassian.net/wiki/spaces/DIGITALSER/pages/359301512/Time+Tracking"
        >Read about how to track your time in confluence</a
      >
    </div>
    <div class="mt-8 flex gap-8">
      <!-- Date Label Box -->
      <div class="min-w-[30ch]">
        <div class="mb-3 flex items-center">
          <button
            aria-label="calendar backward"
            class="-ml-1.5 flex items-center justify-center text-gray-600 hover:text-gray-400"
            on:click={() => reduceWeekClicked()}
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
            aria-label="calendar forward"
            class="flex items-center justify-center text-gray-600 hover:text-gray-400"
            on:click={() => increaseWeekClicked()}
          >
            <span class="material-symbols-outlined"> chevron_right </span>
          </button>
          <button
            aria-label="today"
            class="min-w-[7ch] text-center font-bold text-blue-600 hover:text-blue-700"
            on:click={() => {
              todayClicked();
            }}
          >
            Today
          </button>
        </div>
        <div
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

        {#each selectedCalendarEvents as calendarEvent}
          <div aria-label="TODO" class="my-2 flex items-center text-gray-600">
            <!-- See https://v2.troi.dev/#tag/calendarEvents/paths/~1calendarEvents/get -->
            {#if calendarEvent.type == "R"}
              <!-- regular TODO -->
              <span class="material-symbols-outlined"> event </span>
            {:else if calendarEvent.type == "H"}
              <!-- public holiday -->
              <span class="material-symbols-outlined"> wb_sunny </span>
            {:else if calendarEvent.type == "G"}
              <!-- general TODO -->
              <span class="material-symbols-outlined"> event </span>
            {:else if calendarEvent.type == "P"}
              <!-- private/vacation -->
              <span class="material-symbols-outlined"> beach_access </span>
            {:else if calendarEvent.type == "T"}
              <!-- assigment (sic!) -->
              <span class="material-symbols-outlined"> assignment </span>
            {/if}
            <p class="ml-2">
              {calendarEvent.subject}
            </p>
          </div>
        {/each}
      </div>

      <!-- Calendar -->
      <div class="rounded-t bg-white">
        <div class="flex items-center justify-between overflow-x-auto">
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
                      on:click={() => setSelectedDate(date)}
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
                {#each displayHours as time}
                  <td>
                    <div class="flex min-w-[6ch] justify-center px-2 py-2">
                      {#if time == 0}
                        <p class="text-base font-medium text-gray-500">
                          {time}
                        </p>
                      {:else}
                        <p class="text-base font-medium text-blue-600">
                          {time}
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
