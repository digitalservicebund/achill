<script>
  import c from "calendar"
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"]
  let cal = new c.Calendar(1)
  let currentDate = new Date()
  let day = currentDate.getDate()
  let month = currentDate.getMonth()
  let year = currentDate.getFullYear()
  
  let weeks = cal.monthDates(year, month)
  weeks.forEach((week, i) => {
    const lastDateOfWeek = new Date(week[6])
    console.log(lastDateOfWeek)
    
  });
  console.log(weeks)
  export let dates
  export let times
  export let selectedDay

  function changeSelectedDay(day) {
    selectedDay = day
  }
</script>

<div class="flex items-center justify-center py-8 px-4">
  <!--- more free and premium Tailwind CSS components at https://tailwinduikit.com/ --->

  <div class="w-full max-w-md shadow-lg">
    <div class="rounded-t bg-white p-5 dark:bg-gray-800 md:p-8">
      <div class="flex items-center justify-between px-4">
        <span
          tabindex="0"
          class="text-base  font-bold text-gray-800 focus:outline-none dark:text-gray-100"
          >November 2020</span
        >
        <div class="flex items-center">
          <button
            aria-label="calendar backward"
            class="text-gray-800 hover:text-gray-400 focus:text-gray-400 dark:text-gray-100"
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
              {#each dates as date}
                <td>
                  {#if date == selectedDay}
                    <div class="h-full w-full">
                      <div
                        class="flex w-full cursor-pointer items-center justify-center rounded-full"
                      >
                        <a
                          role="link"
                          tabindex="0"
                          class="flex  h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-base font-medium text-white hover:bg-indigo-500 focus:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
                          >{date}</a
                        >
                      </div>
                    </div>
                  {:else}
                    <div
                      class="flex w-full cursor-pointer justify-center px-2 py-2"
                      on:click={() => changeSelectedDay(date)}
                    >
                      <p
                        class="text-base font-medium text-gray-500 dark:text-gray-100"
                      >
                        {date}
                      </p>
                    </div>
                  {/if}
                </td>
              {/each}
            </tr>
            <tr>
              {#each times as time}
                <td>
                  <div
                    class="flex w-full cursor-pointer justify-center px-2 py-2"
                  >
                    <p
                      class="text-base font-medium text-gray-500 dark:text-gray-100"
                    >
                      1:00
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
