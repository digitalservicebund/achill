<script>
  import { DateInput } from "date-picker-svelte";
  import moment from "moment";
  import { onMount } from "svelte";

  // import { troiApi } from "./troiApiService";
  import { troiApi } from "./troiApiService";
  import TroiTimeEntries from "./TroiTimeEntries.svelte";

  import nocodbApi from "./nocodbClient";

  let endDate = new Date();
  let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  const getCalculationPositions = async () => {
    const calculationPositions = await $troiApi.makeRequest({
      url: "/calculationPositions",
      params: {
        clientId: $troiApi.getClientId(),
        favoritesOnly: true,
      },
    });
    return calculationPositions.map((obj) => {
      return {
        name: obj.DisplayPath,
        id: obj.Id,
        subproject: obj.Subproject.id,
      };
    });
  };

  const getProjectData = async () => {
    // instead of getCalculationPositions() make a custom request to also return the subprojects
    // get phases assigned by calculation position
    let positions = await getCalculationPositions();

    // get phases assigned by calculation position
    for (const position of positions) {
      await nocodbApi.dbViewRow
        .list(
          "noco",
          "ds4g-data",
          "Tracky-Position-Phase",
          "Tracky-Position-Phase",
          {
            where: `(Position ID,eq,${position.id})`,
          }
        )
        .then(function (positionPhaseData) {
          positionPhaseData.list.forEach((positionPhase) => {
            nocodbApi.dbViewRow
              .list("noco", "ds4g-data", "Tracky-Phase", "Tracky-Phase", {
                where: `(Phase ID,eq,${positionPhase["Phase ID"]})`,
              })
              .then(function (data) {
                data.list.forEach((phase) => {
                  if (!("phases" in position)) position.phases = [];
                  position.phases.push(phase["Phase Name"]);
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
    }

    // assign per subproject
    for (const position of positions) {
      await nocodbApi.dbViewRow
        .list(
          "noco",
          "ds4g-data",
          "Tracky-Subproject-Phase",
          "Tracky-Subproject-Phase",
          {
            where: `(Subproject ID,eq,${position.subproject})`,
          }
        )
        .then(function (positionPhaseData) {
          positionPhaseData.list.forEach((positionPhase) => {
            nocodbApi.dbViewRow
              .list("noco", "ds4g-data", "Tracky-Phase", "Tracky-Phase", {
                where: `(Phase ID,eq,${positionPhase["Phase ID"]})`,
              })
              .then(function (data) {
                data.list.forEach((phase) => {
                  if (!("phases" in position)) position.phases = [];
                  position.phases.push(phase["Phase Name"]);
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
    }

    let tasks = await nocodbApi.dbTableRow.list(
      "v1",
      "ds4g-data",
      "Tracky-Task"
    );
    let phaseTasks = tasks.list.filter((keyword) => keyword.type == "PHASE");
    let recurringTasks = tasks.list.filter(
      (keyword) => keyword.type == "RECURRING"
    );

    return (componentModel = {
      recurringTasks: recurringTasks,
      phaseTasks: phaseTasks,
      positions: positions,
    });
  };

  let componentModel = getProjectData();

  const reload = async () => {
    if ($troiApi == undefined) {
      return;
    }
    componentModel = getProjectData();
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
          reload();
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

{#await componentModel}
  <p>...Loading</p>
{:then componentModel}
  {#each componentModel.positions as project}
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
          phaseTasks={componentModel.phaseTasks}
          recurringTasks={componentModel.recurringTasks}
          position={project}
          startDate={moment(startDate).format("YYYYMMDD")}
          endDate={moment(endDate).format("YYYYMMDD")}
        />
      </div>
    </section>
  {/each}
{/await}

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
