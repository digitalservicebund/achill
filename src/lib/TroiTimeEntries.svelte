<script>
  // @ts-nocheck

  import {
    convertFloatTimeToHHMM,
    convertHHMMTimeToFloat,
  } from "./timeConverter.js";
  import { format } from "./svelteHelper.js";
  import { troiEntryFormValidationScheme } from "./TroiEntryForm/troiEntryFormValidationScheme.js";

  export let entries;
  export let deleteClicked;
  export let onUpdateEntry;
  export let currentEditId;

  let values = {
    hours: "",
    description: "",
  };

  let errors = {};

  function editClicked(entry) {
    currentEditId = entry.id;
    values.hours = entry.hours;
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

{#each Object.keys(entries) as projectId}
  <section class="bg-white">
    <div class="container mx-auto pt-4 pb-2">
      <h2
        class="text-lg font-semibold text-gray-900"
        title="Position ID: {projectId}"
      >
        {entries[projectId]["name"]}
      </h2>
      {#each entries[projectId]["entries"] as entry}
        {#if entry.id == currentEditId}
          <div data-test="entry-form" class="my-2 flex justify-center">
            <div class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
              <div class="flex flex-row">
                <div class="basis-3/4 p-1">
                  <div class="my-1 flex place-items-center justify-start">
                    <label for="hours" class="basis-1/4">Hours</label>
                    <input
                      bind:value={values.hours}
                      use:format={convertFloatTimeToHHMM}
                      type="text"
                      id="hours"
                      data-test-id="hours"
                      class={`w-auto basis-1/4 rounded px-1 py-0.5 text-sm placeholder:italic placeholder:text-gray-400 ${
                        errors.hours
                          ? "border border-b-2 border-red-500"
                          : "border-1 border-b-[1px] border-gray-300"
                      }`}
                      placeholder="2:15"
                    />
                  </div>
                  <div class="my-1 flex place-items-center justify-start">
                    <label for="description" class="basis-1/4">What</label>
                    <textarea
                      bind:value={values.description}
                      type="text"
                      id="description"
                      class={`w-auto basis-3/4 rounded px-1 py-0.5 text-sm placeholder:italic placeholder:text-gray-400 ${
                        errors.description
                          ? "border border-b-2 border-red-500"
                          : "border-1 border-b-[1px] border-gray-300"
                      }`}
                      placeholder="Working the work…"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        {:else}
          {convertFloatTimeToHHMM(entry.hours)} Hour(s)<br />
          {entry.description} <br />
        {/if}
        <div>
          <button
            type="button"
            class="ease focus:shadow-outline m-2 select-none rounded-md border border-red-500 bg-red-500 px-4 py-2 text-white transition duration-500 hover:bg-red-600 focus:outline-none"
            on:click={() => deleteClicked(entry, projectId)}
          >
            Delete
          </button>

          {#if entry.id == currentEditId}
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
        <br />
      {/each}
    </div>
  </section>
{/each}
