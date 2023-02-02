<!-- svelte-ignore a11y-missing-attribute -->
<script>
  // @ts-nocheck

  import c from "calendar";
  export let times;
  export let selectedDate;
  const today = new Date();
  let selectedWeekday;
  let selectedWeekNumber;
  let selectedWeek;
  let selectedMonth;
  let selectedYear;
  const weekdays = ["M", "T", "W", "T", "F"];
  let cal = new c.Calendar(1); // pass 1 to start week at Monday
  setWeeksForSelectedDate();

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
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
  }

  function setWeeksForSelectedDate() {
    console.log(selectedDate);

    let weeks = cal.monthDates(
      selectedDate.getFullYear(),
      selectedDate.getMonth()
    );
    for (const week of weeks) {
      const lastDateOfWeek = new Date(week[6]);
      if (selectedDate <= lastDateOfWeek) {
        selectedWeek = week.slice(0, 5);
        break;
      }
    }

    selectedMonth = selectedDate.toLocaleString("default", { month: "long" });
    selectedYear = selectedDate.getFullYear();
    selectedWeekNumber = getWeekNumber();
    selectedWeekday = selectedDate.toLocaleDateString("de-DE", {
      weekday: "long",
    });
    console.log(weeks);
  }

  /**
   * Clicking arrow to change week
   */
  function addDays(days) {
    selectedDate.setDate(selectedDate.getDate() + days);
    setWeeksForSelectedDate();
  }

  /**
   * Clicking date
   */
  function changeSelectedDate(date) {
    selectedDate = date;
    setWeeksForSelectedDate();
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
    <div class="pb-8">
      <a
        class="angie-link pb-8"
        href="https://digitalservicebund.atlassian.net/wiki/spaces/DIGITALSER/pages/359301512/Time+Tracking"
        >Read about how to track your time in confluence</a
      >
    </div>
    <div class="flex gap-8">
      <div>
        <div class="flex items-center">
          <button
            aria-label="calendar backward"
            class="-ml-1.5 flex items-center justify-center text-gray-800 hover:text-gray-400 focus:text-gray-400 dark:text-gray-100"
            on:click={() => addDays(-7)}
          >
            <span class="material-symbols-outlined"> chevron_left </span>
          </button>
          <div
            tabindex="0"
            class="px-2 text-sm text-gray-800 focus:outline-none dark:text-gray-100"
          >
            Week {selectedWeekNumber}
          </div>
          <button
            aria-label="calendar forward"
            class="flex items-center justify-center text-gray-800 hover:text-gray-400 focus:text-gray-400 dark:text-gray-100"
            on:click={() => addDays(7)}
          >
            <span class="material-symbols-outlined"> chevron_right </span>
          </button>
        </div>
        <div
          tabindex="0"
          class="text-base font-bold text-gray-800 focus:outline-none dark:text-gray-100"
        >
          {selectedMonth}, {selectedYear}, {selectedWeekNumber}, {selectedWeekday}
        </div>
      </div>

      <!-- Calendar -->
      <div class="rounded-t bg-white dark:bg-gray-800">
        <div class="flex items-center justify-between overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr>
                {#each weekdays as weekday}
                  <th>
                    <div class="flex w-full justify-center">
                      <p
                        class="text-center text-base font-medium text-gray-800 dark:text-gray-100"
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
                {#each selectedWeek as date}
                  <td>
                    <div
                      class="h-full w-full "
                      on:click={() => changeSelectedDate(date)}
                    >
                      <div
                        class="flex w-full cursor-pointer items-center justify-center rounded-full px-2 py-2 text-base font-medium"
                      >
                        <!-- SELECTED TODAY -->
                        {#if datesEqual(date, today) && datesEqual(date, selectedDate)}
                          <a
                            role="link"
                            tabindex="0"
                            class="flex  h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-white outline-none ring-2 ring-gray-700 ring-offset-2 hover:bg-indigo-500"
                            >{getDayOf(date)}</a
                          >

                          <!-- UNSELECTED TODAY -->
                        {:else if datesEqual(date, today)}
                          <a
                            role="link"
                            tabindex="0"
                            class="flex  h-8 w-8 items-center justify-center rounded-full text-gray-500 outline-none ring-2 ring-gray-700 ring-offset-2 dark:text-gray-100"
                            >{getDayOf(date)}</a
                          >
                          <!-- SELECTED -->
                        {:else if datesEqual(date, selectedDate)}
                          <p
                            class="flex  h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-white hover:bg-indigo-500 focus:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
                          >
                            {getDayOf(date)}
                          </p>
                          <!-- UNSELECTED -->
                        {:else}
                          <p class="flex text-gray-500 dark:text-gray-100">
                            {getDayOf(date)}
                          </p>
                        {/if}
                      </div>
                    </div>
                  </td>
                {/each}
              </tr>
              <tr>
                {#each times as time}
                  <td>
                    <div class="flex w-full justify-center px-2 py-2">
                      <p
                        class="text-base font-medium text-gray-500 dark:text-gray-100"
                      >
                        {time}
                      </p>
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
