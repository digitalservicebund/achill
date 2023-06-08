<script>
  // @ts-nocheck

  import {
    convertFloatTimeToHHMM,
    convertHHMMTimeToFloat,
  } from "./timeConverter.js";
  import { troiEntryFormValidationScheme } from "./TroiEntryForm/troiEntryFormValidationScheme.js";
  import EntryForm from "./UiComponents/EntryForm.svelte";

  export let projects;
  export let deleteClicked;
  export let onUpdateEntry;
  export let editState = { id: -1 };

  let values = {
    hours: "",
    description: "",
  };

  let errors = {};

  function editClicked(entry) {
    editState.id = entry.id;
    values.hours = convertFloatTimeToHHMM(entry.hours);
    values.description = entry.description;
  }

  let saveClicked = async (projectId, entry) => {
    try {
      // `abortEarly: false` to get all the errors
      await troiEntryFormValidationScheme.validate(values, {
        abortEarly: false,
      });
      errors = {};
    } catch (err) {
      errors = err.inner.reduce((acc, err) => {
        return { ...acc, [err.path]: err.message };
      }, {});
    }

    if (Object.keys(errors).length === 0) {
      entry.hours = convertHHMMTimeToFloat(values.hours);
      entry.description = values.description;
      onUpdateEntry(projectId, entry);
    }
  };
</script>

{#each Object.keys(projects) as projectId}
  <section class="bg-white">
    <div class="container mx-auto pt-4 pb-2">
      {#if projects[projectId].entries.length > 0}
        <h2
          class="text-lg font-semibold text-gray-900"
          title="Position ID: {projectId}"
          data-testid="project-heading-{projects[projectId]['name']}"
        >
          {projects[projectId]["name"]}
        </h2>
      {/if}
      {#each projects[projectId]["entries"].sort((a, b) => a.id - b.id) as entry}
        <div
          class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg"
          data-testid="entryCard-{projects[projectId]['name']}"
        >
          {#if entry.id == editState.id}
            <div data-test="entry-form" class="my-2 flex justify-center">
              <div class="block w-full">
                <EntryForm {values} {errors} />
              </div>
            </div>
          {:else}
            <div data-testid="entry-card-content">
              {convertFloatTimeToHHMM(entry.hours)} Hour(s)<br />
              {entry.description} <br />
            </div>
          {/if}
          <div>
            <button
              type="button"
              class="ease focus:shadow-outline select-none rounded-md border border-red-500 bg-red-500 px-4 py-2 text-white transition duration-500 hover:bg-red-600 focus:outline-none"
              on:click={() => deleteClicked(entry, projectId)}
            >
              Delete
            </button>

            {#if entry.id == editState.id}
              <button
                type="button"
                class="ease focus:shadow-outline m-2 select-none rounded-md border border-green-500 bg-green-500 px-4 py-2 text-white transition duration-500 hover:bg-green-600 focus:outline-none"
                on:click={() => saveClicked(projectId, entry)}
                >Save
              </button>
            {:else}
              <button
                type="button"
                class="ease focus:shadow-outline m-2 select-none rounded-md border border-blue-500 bg-blue-500 px-4 py-2 text-white transition duration-500 hover:bg-blue-600 focus:outline-none"
                on:click={() => editClicked(entry)}
                >Edit
              </button>
            {/if}
          </div>
        </div>
        <br />
      {/each}
    </div>
  </section>
{/each}
