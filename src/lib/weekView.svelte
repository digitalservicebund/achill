<script>
  export let dates;
  export let times;
</script>

<div class="gap-2 bg-gray-100 p-4">
  July 2022
  <div class="flex justify-between align-middle">
    <div>M</div>
    <div>T</div>
    <div>W</div>
    <div>T</div>
    <div>F</div>
    <div>S</div>
    <div>S</div>
  </div>
  <div class="flex justify-between align-middle">
    {#each dates as date}
      <div>
        {date}
      </div>
    {/each}
  </div>
  <div class="flex justify-between align-middle">
    {#each times as time}
      <div>
        {time}
      </div>
    {/each}
  </div>
</div>
