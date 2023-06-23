<script>
  import {
    buttonBlue,
    buttonGreen,
    buttonRed,
  } from "$lib/components/colors.js";
  import AchillButton from "$lib/components/TroiButton.svelte";
  import {
    convertFloatTimeToHHMM,
    convertTimeStringToFloat,
  } from "$lib/utils/timeConverter.js";
  import TimeEntryForm from "$lib/components/EntryForm/TimeEntryForm.svelte";
  import { validateForm } from "./EntryForm/timeEntryFormValidator";
  import NewTimeEntryForm from "$lib/components/NewTimeEntryForm.svelte";

  export let projects;
  export let entries;
  export let deleteClicked;
  export let onUpdateEntry;
  export let onAddEntry;
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
      entry.hours = convertTimeStringToFloat(values.hours);
      entry.description = values.description;
      onUpdateEntry(projectId, entry);
    }
  }
</script>

{#each projects as project}
  <section class="bg-white p-4">
    <div class="container mx-auto pt-4 pb-2">
      <h2
        class="mb-4 text-lg font-semibold text-gray-900"
        title="Position ID: {project.id}"
        data-testid="project-heading-{project.id}"
      >
        {project.name}
      </h2>
      {#if !entries[project.id] || entries[project.id].length == 0}
        <NewTimeEntryForm {project} onAddClick={onAddEntry} />
      {:else}
        {#each entries[project.id] as entry}
          <div
            class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg"
            data-testid="entryCard-{project.id}"
          >
            {#if entry.id == editState.id}
              <div data-test="entry-form" class="my-2 flex justify-center">
                <div class="block w-full">
                  <TimeEntryForm
                    {values}
                    {errors}
                    errorTestId={`error-${project.id}`}
                    enterPressed={() => saveClicked(project.id, entry)}
                    hoursTestId={"hours-" + project.id}
                    descriptionTestId={"description-" + project.id}
                  />
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
                    testId={`cancel-${project.id}`}
                    onClick={() => (editState = { id: -1 })}
                    color={buttonRed}
                  />
                  <AchillButton
                    text={"Save"}
                    testId={`save-${project.id}`}
                    onClick={() => saveClicked(project.id, entry)}
                    color={buttonGreen}
                  />
                {:else}
                  <AchillButton
                    text={"Delete"}
                    testId={`delete-${project.id}`}
                    onClick={() => deleteClicked(entry, project.id)}
                    color={buttonRed}
                  />
                  <AchillButton
                    text={"Edit"}
                    testId={`edit-${project.id}`}
                    onClick={() => editClicked(entry)}
                    color={buttonBlue}
                  />
                {/if}
              </div>
            {/if}
          </div>
          <br />
        {/each}
      {/if}
    </div>
  </section>
{/each}
