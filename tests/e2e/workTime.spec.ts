import { type Page, expect, test } from "@playwright/test";
import LoginPage from "./LoginPage";

test.describe("work time actions", () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
  });

  function clickWorkTimeButton(page: Page, buttonText: string) {
    return page
      .locator("#work-time-form button")
      .filter({ hasText: buttonText })
      .click();
  }

  test("should add, edit and delete work time", async ({ page }) => {
    // Input start time, break and end time and submit form
    await page.getByLabel("Start time").fill("08:00");
    await page.getByLabel("Break").fill("01:00");
    await page.getByLabel("End time").fill("17:00");
    await clickWorkTimeButton(page, "Save");

    // Check if the new work time is visible
    await expect(page.getByText("8:00")).toBeVisible();

    await clickWorkTimeButton(page, "Edit");

    // Change the start time and submit the form
    await page.getByLabel("Start time").fill("09:00");
    await clickWorkTimeButton(page, "Update");

    // Check if the new work time is visible
    await expect(page.getByText("7:00")).toBeVisible();

    await clickWorkTimeButton(page, "Delete");

    // Check if the work time is no longer visible
    await expect(page.getByText("7:00")).not.toBeVisible();
  });

  test("work time form should be disabled after submitting, enabled after edit, disabled after cancel or update and enabled after deleting", async ({
    page,
  }) => {
    function expectFormToBeDisabled() {
      for (const label of ["Start time", "Break", "End time"]) {
        expect(page.getByLabel(label)).toBeDisabled();
      }
    }

    function expectFormToBeEnabled() {
      for (const label of ["Start time", "Break", "End time"]) {
        expect(page.getByLabel(label)).toBeEnabled();
      }
    }

    // Input start time, break and end time and submit form
    await page.getByLabel("Start time").fill("08:00");
    await page.getByLabel("Break").fill("01:00");
    await page.getByLabel("End time").fill("17:00");

    await clickWorkTimeButton(page, "Save");
    expectFormToBeDisabled();

    await clickWorkTimeButton(page, "Edit");
    expectFormToBeEnabled();

    await clickWorkTimeButton(page, "Update");
    expectFormToBeDisabled();

    await clickWorkTimeButton(page, "Edit");
    expectFormToBeEnabled();

    await clickWorkTimeButton(page, "Cancel");
    expectFormToBeDisabled();

    await clickWorkTimeButton(page, "Delete");
    expectFormToBeEnabled();
  });
});
