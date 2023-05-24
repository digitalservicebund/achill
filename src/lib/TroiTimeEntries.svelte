<script>
  import { formatHours } from "./formatHours.js";

  export let entries;
  export let deleteClicked;
  export let saveClicked;

  let currentEditId = -1;

  function editClicked(entryId) {
    currentEditId = entryId;
  }
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
          {formatHours(entry.hours)} Hour(s)<br />
          {entry.description} <br />
          <button
            type="button"
            class="ease focus:shadow-outline m-2 select-none rounded-md border border-red-500 bg-red-500 px-4 py-2 text-white transition duration-500 hover:bg-red-600 focus:outline-none"
            on:click={() => deleteClicked(entry, projectId)}
          >
            Delete
          </button>

          {#if currentEditId >= 0}
            <button
              type="button"
              class="ease focus:shadow-outline m-2 select-none rounded-md border border-green-500 bg-green-500 px-4 py-2 text-white transition duration-500 hover:bg-green-600 focus:outline-none"
              on:click={() => saveClicked(entry)}
              >Save
            </button>
          {/if}
          {#if currentEditId == -1}
            <button
              type="button"
              class="ease focus:shadow-outline m-2 select-none rounded-md border border-blue-500 bg-blue-500 px-4 py-2 text-white transition duration-500 hover:bg-blue-600 focus:outline-none"
              on:click={() => editClicked(entry.id)}
              >Edit
            </button>
          {/if}
        </div>
        <br />
      {/each}
    </div>
  </section>
{/each}
