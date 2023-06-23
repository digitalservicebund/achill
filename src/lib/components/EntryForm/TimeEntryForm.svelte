<script>
  export let values = {
    hours: "",
    description: "",
  };

  export let errors = {};
  export let hoursTestId = "hours";
  export let descriptionTestId = "description";
  export let errorTestId = "";
  export let enterPressed;

  const inputClass =
    "w-auto basis-3/4 rounded px-1 py-0.5 text-sm placeholder:italic placeholder:text-gray-400";
  const normalAppearance =
    inputClass + "border-1 border-b-[1px] border-gray-300";
  const errorAppearance =
    inputClass +
    "border border-b-2 border-red-500 focus:ring-red-500 focus:border-red-500";

  function onKeyDown(e) {
    if (e.keyCode === 13) {
      enterPressed();
    }
  }
</script>

<div class="flex">
  <div class="basis-3/4 p-1">
    <div class="flex">
      {#if Object.values(errors).length > 0}
        <div class="basis-1/4" data-testid={errorTestId} />
        <div class="mb-4 font-bold text-red-600">
          {#each Object.values(errors) as error}
            {error}
            <br />
          {/each}
        </div>
      {/if}
    </div>
    <div class="my-1 flex place-items-center justify-start">
      <label for="hours" class="basis-1/4">Hours</label>
      <input
        bind:value={values.hours}
        on:keydown={onKeyDown}
        type="text"
        id="hours"
        data-testid={hoursTestId}
        class={errors.hours ? errorAppearance : normalAppearance}
        placeholder="2:15"
      />
    </div>
    <div class="my-1 flex place-items-center justify-start">
      <label for="description" class="basis-1/4">Description</label>
      <textarea
        bind:value={values.description}
        on:keydown={onKeyDown}
        id="description"
        data-testid={descriptionTestId}
        class={errors.description ? errorAppearance : normalAppearance}
        placeholder="Working the work…"
      />
    </div>
  </div>
</div>
