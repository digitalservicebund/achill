import { type Page, expect, test } from "@playwright/test";
import LoginPage from "./LoginPage";

test.describe("work time form", () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
  });

  async function fillWorkTimeFormAndSubmit(
    page: Page,
    startTime: string,
    breakTime: number,
    endTime: string,
  ) {
    await page.getByLabel("Start time").fill(startTime);
    await page.getByLabel("Break").fill(breakTime.toString());
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
    await fillWorkTimeFormAndSubmit(page, "08:00", 60, "17:00");
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

    await fillWorkTimeFormAndSubmit(page, "08:00", 60, "17:00");
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

  test("should function with <=6h work and no break", async ({ page }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", 0, "14:00");
    await expect(page.getByText("6:00")).toBeVisible();
    await clickWorkTimeButton(page, "Delete");
  });

  test("should show error for negative break", async ({ page }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", -15, "12:00");
    await expect(page.locator("#work-time-form")).toContainText("negative");
  });

  test("should show error with 6h - 9h work and break <30min", async ({
    page,
  }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", 15, "17:00");
    await expect(page.locator("#work-time-form")).toContainText(
      "Break must be at least 30 minutes.",
    );
  });

  test("should show error with >9h work and break <45min", async ({ page }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", 30, "18:00");
    await expect(page.locator("#work-time-form")).toContainText(
      "Break must be at least 45 minutes.",
    );
  });

  test("should show error with >10h work", async ({ page }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", 60, "22:00");
    await expect(page.locator("#work-time-form")).toContainText(
      "Work time must be less than 10 hours.",
    );
  });

  test("should show error with break longer than work", async ({ page }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", 120, "09:00");
    await expect(page.locator("#work-time-form")).toContainText(
      "Invalid work time.",
    );
  });
});
