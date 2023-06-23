<script>
  import TimeEntryForm from "$lib/components/EntryForm/TimeEntryForm.svelte";
  import { convertTimeStringToFloat } from "$lib/utils/timeConverter.js";
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
      const convertedHours = convertTimeStringToFloat(values.hours);
      onAddClick(project, convertedHours, values.description);
      values.hours = "";
      values.description = "";
    }
  }
</script>

<div data-test="entry-form" class="my-2 flex justify-center">
  <div class="block w-full rounded-lg bg-gray-100 p-4 shadow-lg">
    <div class="flex flex-col">
      <div class="basis-3/4 p-1">
        <TimeEntryForm
          {values}
          {errors}
          errorTestId={`error-${project.id}`}
          enterPressed={handleSubmit}
          hoursTestId={"hours-" + project.id}
          descriptionTestId={"description-" + project.id}
        />
      </div>
      <div>
        <AchillButton
          text={"Add"}
          testId={"add-" + project.id}
          onClick={handleSubmit}
          color={buttonBlue}
        />
      </div>
    </div>
  </div>
</div>
