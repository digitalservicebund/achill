<!-- svelte-ignore a11y-missing-attribute -->
<script>
  import { clear_loops } from "svelte/internal";
  import { beforeUpdate } from "svelte";
  import { convertFloatTimeToHHMM } from "./timeConverter.js";

  // @ts-nocheck

  export let selectedWeek;
  export let times;
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
  const weekdays = ["M", "T", "W", "T", "F"];

  beforeUpdate(() => {
    updateComponent();
  });

  function datesEqual(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  function getDayOf(date) {
    return date.getDate();
  }

  /**
   * ISO-8601 week number
   */
  function getWeekNumber() {
    var tdt = new Date(selectedDate.valueOf());
    var dayn = (selectedDate.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
      tdt.setMonth(0, 1 + ((4 - tdt.getDay() + 7) % 7));
    }
    // @ts-ignore
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
  }

  function updateComponent() {
    selectedMonth = selectedDate.toLocaleString("default", { month: "long" });
    selectedYear = selectedDate.getFullYear();
    selectedWeekNumber = getWeekNumber();
    selectedWeekday = selectedDate.toLocaleDateString("de-DE", {
      weekday: "long",
    });
    displayHours = [];
    times.forEach((time) => {
      displayHours.push(time == 0 ? "0" : convertFloatTimeToHHMM(time));
    });
  }

  function getDateClasses(index, selectedDate) {
    let dateClasses = "flex h-8 w-8 items-center justify-center rounded-full ";
    let date = selectedWeek[index];
    // let calendarEvents = calendarEventsForWeek[index];

    if (datesEqual(date, today)) {
      dateClasses += "outline-none ring-2 ring-black ring-offset-2 ";
    }

    if (datesEqual(date, selectedDate)) {
      dateClasses += "bg-blue-600 text-white hover:bg-blue-700 ";
    } else {
      // if (calendarEvents.length) {
      //   dateClasses += "text-gray-500 bg-blue-200 hover:bg-[#B8BDC3] ";
      // } else {
      dateClasses += "text-black hover:bg-[#B8BDC3] ";
      // }
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
                          {getDayOf(date)}
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
