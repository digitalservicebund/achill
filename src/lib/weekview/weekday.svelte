<script>
  export let selectedDate
  
  export let isToday;
  export let isSelected;
  export let dayNumber;

  let classes
  // // NOTHING
  // <td>
  //   <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
  //       <p class="text-base text-gray-500 dark:text-gray-100 font-medium">7</p>
  //   </div>

  // </td>

  // // SELECTED
  // <td>
  //     <div class="w-full h-full">
  //         <div class="flex items-center justify-center w-full rounded-full cursor-pointer">
  //             <a  role="link" tabindex="0" class="focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 focus:bg-indigo-500 hover:bg-indigo-500 text-base w-8 h-8 flex items-center justify-center font-medium text-white bg-indigo-700 rounded-full">8</a>
  //         </div>
  //     </div>
  // </td> 

  classes = '"w-full h-full"'

  // if (isSelected) {
  //   classes =
  //     '"flex h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-base font-medium text-white"'
  // } else {
  //   classes = '"text-base font-medium text-gray-500 dark:text-gray-100"'
  // }
  // if (isToday) {
  //   classes += "outline-none ring-2 ring-gray-500"
  // }
</script>
<p class={classes}>
  {dayNumber}
</p>
