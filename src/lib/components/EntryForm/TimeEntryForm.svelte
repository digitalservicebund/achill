<script>
    export let values = {
        hours: "",
        description: "",
    };

    export let errors = {};
    export let hoursTestId = "hours";
    export let descriptionTestId = "description";

    const inputClass =
        "w-auto basis-3/4 rounded px-1 py-0.5 text-sm placeholder:italic placeholder:text-gray-400 ";
    const normalAppearance =
        inputClass + "border-1 border-b-[1px] border-gray-300";
    const errorAppearance = inputClass + "border border-b-2 border-red-500";
</script>

<!-- <div data-test="entry-form" class="my-2 flex justify-center"> -->
<!-- <div class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg"> -->
<div class="flex flex-row">
    <div class="basis-3/4 p-1">
        <div class="my-1 flex place-items-center justify-start">
            <label for="hours" class="basis-1/4">Hours</label>
            <input
                bind:value={values.hours}
                type="text"
                id="hours"
                data-testid={hoursTestId}
                class={errors.hours ? errorAppearance : normalAppearance}
                placeholder="2:15"
            />
        </div>
        <div class="my-1 flex place-items-center justify-start">
            <label for="description" class="basis-1/4">What</label>
            <textarea
                bind:value={values.description}
                id="description"
                data-testid={descriptionTestId}
                class={errors.description ? errorAppearance : normalAppearance}
                placeholder="Working the work…"
            />
        </div>
    </div>
</div>
<!-- </div> -->
<!-- </div> -->
