<script>
  import EntryForm from "$lib/components/EntryForm/TimeEntryForm.svelte";
  import { convertHHMMTimeToFloat } from "$lib/utils/timeConverter.js";
  import AchillButton from "$lib/components/TroiButton.svelte";
  import { buttonBlue } from "$lib/components/colors.js";
  import { validateForm } from "$lib/components/EntryForm/timeEntryFormValidator.js";

  export let project;
  export let onAddClick;

  let values = {
    description: "",
    hours: "",
  };
  let errors = {};

  async function handleSubmit() {
    errors = await validateForm(values);

    if (Object.keys(errors).length === 0) {
      const convertedHours = convertHHMMTimeToFloat(values.hours);
      onAddClick(project, convertedHours, values.description);
      values.hours = "";
      values.description = "";
    }
  }
</script>

<div data-test="entry-form" class="my-2 flex justify-center">
  <div class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
    <div class="flex flex-row">
      <div class="basis-3/4 p-1">
        <h5 class="mb-1 text-base font-medium leading-tight text-gray-900">
          {project.name}
        </h5>
        <EntryForm
          {values}
          {errors}
          hoursTestId={"hours-" + project.name}
          descriptionTestId={"description-" + project.name}
        />
      </div>

      <div class="flex basis-1/4 justify-end">
        <div class="flex flex-col justify-center gap-1">
          <AchillButton
            text={"ADD"}
            testId={"-" + project.name}
            onClick={handleSubmit}
            color={buttonBlue}
          />
        </div>
      </div>
    </div>
  </div>
</div>
