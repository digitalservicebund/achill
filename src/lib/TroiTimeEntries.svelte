<script>
  export let entries;
</script>

{#each Object.keys(entries) as projectId}
  <section class="bg-white">
    <div class="container mx-auto pt-4 pb-2">
      <h2
        class="text-lg font-semibold text-gray-900"
        title="Position ID: {projectId}"
      >
        {entries[projectId]["name"]} Id: {projectId}
      </h2>
      {#each entries[projectId]["entries"] as entry}
        <div>
          entryHours: {entry.hours} <br />
          entryDescription: {entry.description} <br />
          entryDate: {entry.date} <br />
        </div>
        <br />
      {/each}
    </div>
  </section>
{/each}
