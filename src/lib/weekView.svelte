<script>
  import c from "calendar";
  export let times;
  export let selectedDate;
  let selectedWeekNumber;
  let selectedWeek;
  let selectedMonth;
  let selectedYear;
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];
  let cal = new c.Calendar(1); // pass 1 to start week at Monday
  setWeeksForSelectedDate();

  function addDays(days) {
    selectedDate.setDate(selectedDate.getDate() + days);
    setWeeksForSelectedDate();
  }

  function changeSelectedDate(date) {
    selectedDate = date;
    setMonthAndYear();
  }

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

  function getWeekNumber() {
    // TODO change to ISO week-numbering year
    
    // let firstDateOfYear = new Date(selectedDate.getFullYear(), 0, 1)
    // const diffTime = Math.abs(selectedDate - firstDateOfYear);
    // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    // console.log(firstDateOfYear);
    // console.log(selectedDate);
    
    // return Math.ceil(diffDays/7) + 1
  }

  function setMonthAndYear() {
    selectedMonth = selectedDate.toLocaleString("default", { month: "long" });
    selectedYear = selectedDate.getFullYear();
    selectedWeekNumber = getWeekNumber();
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

    setMonthAndYear();
    console.log(weeks);
  }
</script>

<div class="flex items-center justify-center py-8 px-4">
  <div class="w-full max-w-md shadow-lg">
    <div class="rounded-t bg-white p-5 dark:bg-gray-800 md:p-8">
      <div class="flex items-center justify-between px-4">
        <span
          tabindex="0"
          class="text-base  font-bold text-gray-800 focus:outline-none dark:text-gray-100"
          >{selectedMonth}, {selectedYear}, {selectedWeekNumber}</span
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
                  {#if datesEqual(date, selectedDate)}
                    <div class="h-full w-full">
                      <div
                        class="flex w-full cursor-pointer items-center justify-center rounded-full"
                      >
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <!-- svelte-ignore a11y-no-redundant-roles -->
                        <a
                          role="link"
                          tabindex="0"
                          class="flex  h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-base font-medium text-white hover:bg-indigo-500 focus:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
                          >{getDayOf(date)}</a
                        >
                      </div>
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
                    </div>
                  {/if}
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
