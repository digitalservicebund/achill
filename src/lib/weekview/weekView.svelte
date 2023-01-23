<script>
  // @ts-nocheck

  import weekday from "./weekday.svelte";

  import c from "calendar";
  import Weekday from "./weekday.svelte";
  export let times;
  export let selectedDate;
  const today = new Date();
  let selectedWeekday;
  let selectedWeekNumber;
  let selectedWeek;
  let selectedMonth;
  let selectedYear;
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];
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
        selectedWeek = week;
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

<div class="flex items-center justify-center py-8 px-4">
  <div class="w-full max-w-md shadow-lg">
    <div class="rounded-t bg-white p-5 dark:bg-gray-800 md:p-8">
      <div class="flex items-center justify-between px-4">
        <span
          tabindex="0"
          class="text-base  font-bold text-gray-800 focus:outline-none dark:text-gray-100"
          >{selectedMonth}, {selectedYear}, {selectedWeekNumber}, {selectedWeekday}</span
        >
        <div class="flex items-center">
          <button
            aria-label="calendar backward"
            class="text-gray-800 hover:text-gray-400 focus:text-gray-400 dark:text-gray-100"
            on:click={() => addDays(-7)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler icon-tabler-chevron-left"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <polyline points="15 6 9 12 15 18" />
            </svg>
          </button>
          <button
            aria-label="calendar forward"
            class="ml-3 text-gray-800 hover:text-gray-400 focus:text-gray-400 dark:text-gray-100"
            on:click={() => addDays(7)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler  icon-tabler-chevron-right"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex items-center justify-between overflow-x-auto pt-12">
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
                    <div class="flex cursor-pointer items-center justify-center rounded-full w-full px-2 py-2">
                    <!-- SELECTED TODAY -->
                    {#if datesEqual(date, today) && datesEqual(date, selectedDate)}
                          <a
                            role="link"
                            tabindex="0"
                            class="flex  h-8 w-8 items-center justify-center rounded-full bg-indigo-700 bg-indigo-500 text-base font-medium text-white outline-none ring-2 ring-indigo-700 ring-offset-2 hover:bg-indigo-500"
                            >{getDayOf(date)}</a
                          >

                      <!-- UNSELECTED TODAY -->
                    {:else if datesEqual(date, today)}
                          <a
                            role="link"
                            tabindex="0"
                            class="flex  h-8 w-8 items-center justify-center rounded-full text-base font-medium text-gray-500 outline-none ring-2 ring-indigo-700 ring-offset-2 dark:text-gray-100"
                            >{getDayOf(date)}</a
                          >
                      <!-- SELECTED -->
                    {:else if datesEqual(date, selectedDate)}
                          <p
                            class="flex  h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-base font-medium text-white hover:bg-indigo-500 focus:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
                          >
                            {getDayOf(date)}
                          </p>
                      <!-- UNSELECTED -->
                    {:else}
                        <p
                          class="text-base font-medium text-gray-500 dark:text-gray-100"
                        >
                          {getDayOf(date)}
                        </p>
                    {/if}
                      
                  </div>
                  </div>

                  <!-- <div class="flex items-center justify-center w-full rounded-full cursor-pointer">
                    <Weekday isToday={false} isSelected={false} dayNumber={getDayOf(date)} />
                  </div> -->

                  <!-- 
                    // NOTHING
                    <td>
                      <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                          <p class="text-base text-gray-500 dark:text-gray-100 font-medium">7</p>
                      </div>

                    </td>

                    // SELECTED
                    <td>
                        <div class="w-full h-full">
                            <div class="flex items-center justify-center w-full rounded-full cursor-pointer">
                                <a  role="link" tabindex="0" class="focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 focus:bg-indigo-500 hover:bg-indigo-500 text-base w-8 h-8 flex items-center justify-center font-medium text-white bg-indigo-700 rounded-full">8</a>
                            </div>
                        </div>
                    </td> 
                    -->

                  <!-- {#if datesEqual(date, selectedDate)} -->
                  <!-- <div
                        class="flex w-full cursor-pointer items-center justify-center rounded-full"
                      > -->
                  <!-- </div> -->
                  <!-- {:else if datesEqual(date, today)}
                    <div
                      class="flex w-full cursor-pointer justify-center px-2 py-2"
                      on:click={() => changeSelectedDate(date)}
                    >
                    <Weekday isSelected={false} dayNumber={getDayOf(date)} isToday={true} />
                    </div>
                  {:else}
                    <div
                      class="flex w-full cursor-pointer justify-center px-2 py-2"
                      on:click={() => changeSelectedDate(date)}
                    >
                      <p
                        class="text-base font-medium text-gray-500 dark:text-gray-100"
                      >
                        {getDayOf(date)}
                      </p>
                    </div> -->
                  <!-- {/if} -->
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
