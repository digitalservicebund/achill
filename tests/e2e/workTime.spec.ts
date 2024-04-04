import { type Page, expect, test } from "@playwright/test";
import LoginPage from "./LoginPage";

test.describe("work time form", () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
  });

  async function fillWorkTimeFormAndSubmit(
    page: Page,
    startTime: string,
    breakTime: string,
    endTime: string,
  ) {
    await page.getByLabel("Start time").fill(startTime);
    await page.getByLabel("Break").fill(breakTime);
    await page.getByLabel("End time").fill(endTime);
    await clickWorkTimeButton(page, "Save");
  }

  function clickWorkTimeButton(page: Page, buttonText: string) {
    return page
      .locator("#work-time-form button")
      .filter({ hasText: buttonText })
      .click();
  }

  test("should add, edit and delete work time", async ({ page }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", "01:00", "17:00");
    await expect(page.getByText("8:00")).toBeVisible();

    await clickWorkTimeButton(page, "Edit");
    await page.getByLabel("Start time").fill("09:00");
    await clickWorkTimeButton(page, "Update");
    await expect(page.getByText("7:00")).toBeVisible();

    await clickWorkTimeButton(page, "Delete");
    await expect(page.getByText("7:00")).not.toBeVisible();
  });

  test("should be disabled after submitting, enabled after edit, disabled after cancel or update and enabled after deleting", async ({
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

    await fillWorkTimeFormAndSubmit(page, "08:00", "01:00", "17:00");
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

  test("should function with less or equal to 6h work and no break", async ({
    page,
  }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", "00:00", "14:00");
    await expect(page.getByText("6:00")).toBeVisible();
  });

  test("should show error with 6h - 9h work and break less than 30min", async ({
    page,
  }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", "00:15", "17:00");
    await expect(page.getByText("&#x26A0; Break time too short")).toBeVisible();
  });

  test("should show error with more than 9h work and break less than 45min", async ({
    page,
  }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", "00:30", "19:00");
    await expect(page.getByText("&#x26A0; Break time too short")).toBeVisible();
  });

  test("should show error with more than 10h work", async ({ page }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", "01:00", "22:00");
    await expect(page.getByText("&#x26A0; Work time too short")).toBeVisible();
  });

  test("should show error with break longer than work", async ({ page }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", "02:00", "09:00");
    await expect(page.getByText("&#x26A0; Break time too short")).toBeVisible();
  });
});
