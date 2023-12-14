<script>
  import nocodbApi from "$lib/nocodbClient.js";
  import { onMount } from "svelte";
  import { buttonRed, buttonBlue } from "$lib/components/colors.js";
  import AchillButton from "$lib/components/TroiButton.svelte";
  import { validateForm } from "../EntryForm/timeEntryFormValidator";

  export let values = {
    hours: "",
    description: "",
  };
  export let errors = {};

  export let addOrUpdateClicked;
  export let deleteClicked = () => {};
  export let recurringTasks;
  export let phaseTasks;
  export let position;
  export let disabled;
  export let minRows = 4;
  export let maxRows = 40;
  export let addMode = false;
  export let updateMode = false;

  let hoursTestId = `hours-${position.id}`;
  let descriptionTestId = `description-${position.id}`;

  $: minHeight = `${1 + minRows * 1.2}em`;
  $: maxHeight = maxRows ? `${1 + maxRows * 1.2}em` : `auto`;

  let descriptionSegments =
    values.description !== "" ? values.description.split(", ") : [];
  $: description = descriptionSegments.join(", ");

  const normalAppearance = "border-1 border-b-[1px] border-gray-300 ";
  const errorAppearance =
    "border border-b-2 border-red-500 focus:ring-red-500 focus:border-red-500";

  const inputClass =
    "w-full basis-3/4 rounded px-3 py-2 text-sm placeholder:italic placeholder:text-gray-400 leading-6 ";
  const inputNormalAppearance = inputClass + normalAppearance;
  const inputErrorAppearance = inputClass + errorAppearance;

  const textAreaClass =
    "inherit border-box absolute top-0 overflow-hidden p-[0.5em] leading-4 ";
  const textareaNormalAppearance = textAreaClass + normalAppearance;
  const textareaErrorAppearance = textAreaClass + errorAppearance;

  async function onKeyDown(e) {
    if (e.keyCode === 13) {
      errors = await validateForm({
        hours: values.hours,
        description: description,
      });
      if (Object.keys(errors).length === 0) {
        addOrUpdateClicked(values.hours, values.description);
        values.hours = "";
        values.description = "";
      }
    }
  }
  function handleDescriptionChange(event) {
    if (event.inputType !== "insertLineBreak") {
      errors = {};
    }
    if (
      event.inputType === "deleteContentBackward" &&
      description.charAt(description.length - 1) === " "
    ) {
      description = event.target.value;
    } else {
      description = event.target.value;
      if (event.data !== " ") {
        descriptionSegments = event.target.value
          .split(",")
          .map((value) => value.trim());
      }
    }
    const indexEmptyEntry = descriptionSegments.indexOf("");
    if (
      indexEmptyEntry !== -1 &&
      indexEmptyEntry !== descriptionSegments.length - 1
    ) {
      descriptionSegments = descriptionSegments.filter(
        (entry, index) =>
          entry !== "" || index === descriptionSegments.length - 1
      );
    }
  }

  function onRecurringTaskChange(event) {
    if (event.target.checked) {
      descriptionSegments = [...descriptionSegments, event.target.id].filter(
        (f) => f !== ""
      );
    } else {
      descriptionSegments = descriptionSegments.filter(
        (segment) => segment !== event.target.id
      );
    }
  }

  function handleChipClick(phaseAndTask) {
    if (!descriptionSegments.includes(phaseAndTask)) {
      descriptionSegments = [...descriptionSegments, phaseAndTask].filter(
        (f) => f !== ""
      );
    }
  }

  function removeChip(phaseAndTask) {
    descriptionSegments = descriptionSegments.filter(
      (segment) => segment !== phaseAndTask
    );
  }

  async function handleAdd() {
    values.description = description;
    errors = await validateForm(values);
    if (Object.keys(errors).length === 0) {
      addOrUpdateClicked(values.hours, values.description);
      values.hours = "";
      values.description = "";
    }
  }

  async function handleUpdate() {
    values.description = description;
    errors = await validateForm(values);

    if (Object.keys(errors).length === 0) {
      addOrUpdateClicked(values.hours, values.description);
      values.hours = "";
      values.description = "";

      // TODO noci: do like with handleAdd
      setTimeout(() => {
        updateMode = false;
        phases.forEach((phase) => (phase.open = false));
      }, 2000);
    }
  }

  async function pollPhaseNames(positionId, subprojectId) {
    let whereClause = [];
    const phaseIdsForPosition = await nocodbApi.dbViewRow.list(
      "noco",
      "ds4g-data",
      "Tracky-Position-Phase",
      "Tracky-Position-Phase",
      {
        where: `(Position ID,eq,${positionId})`,
      }
    );
    phaseIdsForPosition.list.forEach((phaseId) =>
      whereClause.push(`(Phase ID,eq,${phaseId["Phase ID"]})`)
    );

    const phaseIdsForSubproject = await nocodbApi.dbViewRow.list(
      "noco",
      "ds4g-data",
      "Tracky-Subproject-Phase",
      "Tracky-Subproject-Phase",
      {
        where: `(Subproject ID,eq,${subprojectId})`,
      }
    );
    phaseIdsForSubproject.list.forEach((phaseId) =>
      whereClause.push(`(Phase ID,eq,${phaseId["Phase ID"]})`)
    );

    if (whereClause.length > 0) {
      return nocodbApi.dbViewRow.list(
        "noco",
        "ds4g-data",
        "Tracky-Phase",
        "Tracky-Phase",
        {
          where: whereClause.join("~or"),
        }
      );
    }
  }

  let phases = [];

  onMount(async () => {
    const phaseNames = await pollPhaseNames(position.id, position.subproject);
    if (phaseNames) {
      phases = phaseNames.list
        .map((phase) => phase["Phase Name"])
        .map((value) => ({ name: value, open: false }));
      openPhases();
    }
  });

  function togglePhase(phase) {
    phase.open = !phase.open;
  }

  function openPhases() {
    for (const phase of phases) {
      for (const phaseTask of phaseTasks) {
        if (
          descriptionSegments.includes([phaseTask.name, phase.name].join(" "))
        ) {
          phase.open = true;
          break;
        }
      }
    }
  }
</script>

<div data-test="entry-form" class="my-2 flex justify-center">
  <div class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
    <div class="flex flex-col">
      <div class="basis-3/4 p-1">
        <h2
          class="mb-4 text-lg font-semibold text-gray-900"
          title="Position ID: {position.id}"
          data-testid="project-heading-{position.id}"
        >
          {position.name}
        </h2>
        {#if addMode || updateMode}
          <div id="timeEntryForm">
            <div class="relative flex w-full items-center">
              <div>
                <label for="hours" class="pr-2">Hours</label>
                <input
                  bind:value={values.hours}
                  on:keydown={onKeyDown}
                  type="text"
                  id="hours"
                  data-testid={hoursTestId}
                  class={`${
                    errors.hours ? inputErrorAppearance : inputNormalAppearance
                  } w-3/12`}
                  placeholder="2:15"
                />
              </div>
              <div class="mt-1">
                {#if Object.values(errors).length > 0}
                  <div class="font-bold text-red-600">
                    <ul>
                      {#each Object.values(errors) as error}
                        <li>
                          &#x26A0; {error}
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              </div>
            </div>
            <div class="my-8">
              {#if recurringTasks && phases}
                <label for="recurring" class="basis-1/4">Recurring tasks</label>
                <div id="recurring" class="mt-2">
                  {#each recurringTasks as entry}
                    <div class="flex items-start space-x-2 md:inline-flex">
                      <input
                        checked={descriptionSegments.includes(entry.name)}
                        class="rounded-md border border-gray-300 bg-white p-2"
                        id={entry.name}
                        type="checkbox"
                        on:change={onRecurringTaskChange}
                      />
                      <label class="pr-5" for={entry.name}>{entry.name}</label>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
            <div class="mb-4">
              {#if phases}
                {#each phases as phase}
                  <details class="mb-[20px]" bind:open={phase.open}>
                    <summary
                      class="flex w-full flex-row items-center gap-4 rounded-t border-b-2 border-solid border-b-[#CED4DA] bg-[#E5E5E5] px-[16px] py-[20px]"
                      on:click={() => togglePhase(phase)}
                    >
                      <span>{phase.name}</span>
                      <svg
                        class="ml-auto h-4 w-4 transform transition-transform {phase.open
                          ? 'rotate-180'
                          : ''}"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    {#if phaseTasks}
                      <div
                        class="flex h-auto flex-wrap border-b-2 border-solid border-b-[#CED4DA] bg-white p-2"
                      >
                        {#each phaseTasks as task}
                          <div
                            class="m-2 flex cursor-pointer items-center rounded-full border py-1 px-3 text-sm transition-all duration-150 ease-in-out {descriptionSegments.includes(
                              [task.name, phase.name].join(' ')
                            )
                              ? 'border-black bg-white'
                              : 'bg-[#212121] bg-opacity-10 hover:bg-gray-300'}"
                            on:click={() =>
                              handleChipClick(
                                [task.name, phase.name].join(" ")
                              )}
                          >
                            <span>{task.name}</span>
                            {#if descriptionSegments.includes([task.name, phase.name].join(" "))}
                              <button
                                class="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-800"
                                on:click={(event) => {
                                  event.stopPropagation();
                                  removeChip([task.name, phase.name].join(" "));
                                }}
                              >
                                &#x2715;
                              </button>
                            {/if}
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </details>
                {/each}
              {/if}
            </div>
            <div
              class="relative mb-4 flex w-full flex-col items-center justify-between md:flex-row"
            >
              <div class="mb-2 w-full md:mb-0 md:w-4/6">
                <pre
                  aria-hidden="true"
                  class="inherit border-box overflow-hidden p-[0.5em] leading-4"
                  style="min-height: {minHeight}; max-height: {maxHeight}">{description +
                    "\n"}</pre>

                <textarea
                  value={description}
                  on:keydown={onKeyDown}
                  on:input={handleDescriptionChange}
                  id="description"
                  data-testid={descriptionTestId}
                  class={`${
                    errors.description
                      ? textareaErrorAppearance
                      : textareaNormalAppearance
                  } h-3/5 w-full md:h-full md:w-5/6`}
                  placeholder="Working the work…"
                />
              </div>
              <div class="flex flex-row space-x-2 md:flex-col md:space-y-2">
                {#if !disabled}
                  {#if updateMode}
                    <AchillButton
                      text={"Save"}
                      testId={`update-${position.id}`}
                      onClick={handleUpdate}
                      color={buttonBlue}
                    />
                    <AchillButton
                      text={"Cancel"}
                      testId={`cancel-${position.id}`}
                      onClick={() => {
                        updateMode = false;
                      }}
                      color={buttonRed}
                    />
                  {/if}
                  {#if addMode}
                    <AchillButton
                      text={"Save"}
                      testId={"add-" + position.id}
                      onClick={handleAdd}
                      color={buttonBlue}
                    />
                  {/if}
                {/if}
              </div>
            </div>
          </div>
        {:else}
          <div data-testid="entry-card-content">
            <b>{values.hours} Hour(s)</b><br />
            <p>{values.description}</p>
            <br />
            <AchillButton
              text={"Delete"}
              testId={`delete-${position.id}`}
              onClick={() => {
                deleteClicked();
              }}
              color={buttonRed}
            />
            {#if !disabled}
              <AchillButton
                text={"Edit"}
                testId={`edit-${position.id}`}
                onClick={() => {
                  openPhases();
                  updateMode = true;
                }}
                color={buttonBlue}
              />
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
