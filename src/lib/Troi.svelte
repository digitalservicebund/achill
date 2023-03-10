<script>
  import { DateInput } from "date-picker-svelte";
  import moment from "moment";
  import { onMount } from "svelte";

  import { troiApi } from "./troiApiService";
  import TroiTimeEntries from "./TroiTimeEntries.svelte";

  import nocodbApi from "./nocodbClient";

  let endDate = new Date();
  let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  let positions = [];
  let componentModel = {};

  const reload = async () => {
    if ($troiApi == undefined) {
      return;
    }

    positions = await $troiApi.getCalculationPositions();
    positions.forEach((position) => {
      nocodbApi.dbViewRow
        .list(
          "noco",
          "ds4g-data",
          "Tracky-Position-Phase",
          "Tracky-Position-Phase",
          {
            where: `(Position ID,like,%${position["id"]}%)`,
          }
        )
        .then(function (data) {
          data.list.forEach((relation) => {
            nocodbApi.dbViewRow
              .list("noco", "ds4g-data", "Tracky-Phase", "Phase", {
                where: `(Id,eq,${relation["Phase ID"]})`,
              })
              .then(function (data) {
                data.list.forEach((phase) => {
                  if (!("phases" in position)) position.phases = [];
                  position.phases.push(phase.name);
                });
              })
              .catch(function (error) {
                console.error("ERROR GETTING PHASE: " + error);
              });
          });
        })
        .catch(function (error) {
          console.error("ERROR GETTING POSITION-PHASE: " + error);
        });
    });

    let tasks = await nocodbApi.dbTableRow.list(
      "v1",
      "ds4g-data",
      "Tracky-Task"
    );
    let phaseTasks = tasks.list.filter((keyword) => keyword.type == "PHASE");
    let recurringTasks = tasks.list.filter(
      (keyword) => keyword.type == "RECURRING"
    );

    componentModel = {
      recurringTasks: recurringTasks,
      phaseTasks: phaseTasks,
      positions: positions,
    };
  };

  onMount(() => {
    reload();
  });
</script>

<section>
  <div class="flex gap-4">
    <div class="py-4">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="text-sm"
        >Show from:
        <DateInput
          bind:value={startDate}
          format="yyyy-MM-dd"
          closeOnSelection={true}
        />
      </label>
    </div>

    <div class="inline-block py-4">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="text-sm"
        >to:
        <DateInput
          bind:value={endDate}
          format="yyyy-MM-dd"
          closeOnSelection={true}
        />
      </label>
    </div>
    <div class="inline-block content-center pt-8">
      <button
        class="rounded-sm border border-blue-500 px-2 py-1 hover:bg-blue-100"
        on:click={() => {
          (positions = []), reload();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#0063eb"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  </div>
</section>

{#each positions as project}
  <!-- TODO: make into single component Project -->
  <section class="bg-white">
    <div class="container mx-auto pt-4 pb-2">
      <h2
        class="text-lg font-semibold text-gray-900"
        title="Position ID: {project.id}"
      >
        {project.name}
      </h2>
      <TroiTimeEntries
        calculationPositionId={project.id}
        {componentModel}
        startDate={moment(startDate).format("YYYYMMDD")}
        endDate={moment(endDate).format("YYYYMMDD")}
      />
    </div>
  </section>
{:else}
  <p>Loading…</p>
{/each}

<section class="mt-8 text-xs text-gray-600">
  <p>
    Project not showing up? Make sure it's available in Troi and marked as a
    "favorite". <br />
    The "Suggest" function is not intended for actual use, it is just a fun feature.
  </p>
</section>

<style>
  div :global(.date-time-field input) {
    color: rgb(31 41 55);
    font-feature-settings: "kern" 1, "tnum" 1;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  :root {
    --date-input-width: 6.5rem;
  }
</style>
