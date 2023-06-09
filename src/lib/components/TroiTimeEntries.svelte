<script>
  import {
    buttonBlue,
    buttonGreen,
    buttonRed,
  } from "$lib/components/colors.js";
  import AchillButton from "$lib/components/TroiButton.svelte";
  import {
    convertFloatTimeToHHMM,
    convertHHMMTimeToFloat,
  } from "$lib/utils/timeConverter.js";
  import EntryForm from "$lib/components/EntryForm/TimeEntryForm.svelte";
  import { validateForm } from "./EntryForm/timeEntryFormValidator";

  export let projects;
  export let deleteClicked;
  export let onUpdateEntry;
  export let editState = { id: -1 };
  export let disabled = false;

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

  async function saveClicked(projectId, entry) {
    errors = await validateForm(values);

    if (Object.keys(errors).length === 0) {
      entry.hours = convertHHMMTimeToFloat(values.hours);
      entry.description = values.description;
      onUpdateEntry(projectId, entry);
    }
  }
</script>

{#each Object.keys(projects) as projectId}
  <section class="bg-white">
    <div class="container mx-auto pt-4 pb-2">
      {#if projects[projectId].entries.length > 0}
        <h2
          class="mb-4 text-lg font-semibold text-gray-900"
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
              <b>{convertFloatTimeToHHMM(entry.hours)} Hour(s)</b><br />
              <p>{entry.description}</p>
              <br />
            </div>
          {/if}
          {#if !disabled}
            <div>
              {#if entry.id == editState.id}
                <AchillButton
                  text={"Cancel"}
                  testId={"TODO"}
                  onClick={() => (editState = { id: -1 })}
                  color={buttonRed}
                />
                <AchillButton
                  text={"Save"}
                  testId={"TODO"}
                  onClick={() => saveClicked(projectId, entry)}
                  color={buttonGreen}
                />
              {:else}
                <AchillButton
                  text={"Delete"}
                  testId={"TODO"}
                  onClick={() => deleteClicked(entry, projectId)}
                  color={buttonRed}
                />
                <AchillButton
                  text={"Edit"}
                  testId={"TODO"}
                  onClick={() => editClicked(entry)}
                  color={buttonBlue}
                />
              {/if}
            </div>
          {/if}
        </div>
        <br />
      {/each}
    </div>
  </section>
{/each}
