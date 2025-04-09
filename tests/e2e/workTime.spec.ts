import { type Page, expect, test } from "@playwright/test";
import LoginPage from "./LoginPage";

async function fillWorkTimeFormAndSubmit(
  page: Page,
  startTime: string,
  breakTime: number,
  endTime: string,
) {
  await page.getByLabel("Break").fill(breakTime.toString(), { timeout: 50 });
  await page.getByLabel("Start time").fill(startTime, { timeout: 50 });
  await page.getByLabel("End time").fill(endTime, { timeout: 50 });
  await clickWorkTimeButton(page, "Save");
}

async function clickWorkTimeButton(page: Page, buttonText: string) {
  await page
    .locator("#work-time-form button")
    .filter({ hasText: buttonText })
    .click();
}

test.beforeEach(async ({ page }) => {
  await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
});

test.describe("work time form validation", () => {
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

  test("should function with <=6h work and no break", async ({ page }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", 0, "14:00");
    await expect(page.getByRole("table")).toContainText("6:00");
    await clickWorkTimeButton(page, "Delete");
    await expect(page.getByLabel("Start time")).toBeEnabled();
  });
});

test.describe("work time form", () => {
  test("should add, edit and delete work time", async ({ page }) => {
    await fillWorkTimeFormAndSubmit(page, "08:00", 60, "17:00");
    await expect(page.getByRole("table")).toContainText("8:00");

    await clickWorkTimeButton(page, "Edit");
    await page.getByLabel("Start time").fill("09:00");
    await clickWorkTimeButton(page, "Update");
    await expect(page.getByRole("table")).toContainText("7:00");

    await clickWorkTimeButton(page, "Delete");
    await expect(page.getByRole("table")).not.toContainText("7:00");
  });

  test("should be disabled after submitting, enabled after edit, disabled after cancel or update and enabled after deleting", async ({
    page,
  }) => {
    async function expectFormToBeDisabled() {
      for (const label of ["Start time", "Break", "End time"]) {
        await expect(page.getByLabel(label)).toBeDisabled();
      }
    }

    async function expectFormToBeEnabled() {
      for (const label of ["Start time", "Break", "End time"]) {
        await expect(page.getByLabel(label)).toBeEnabled();
      }
    }

    await fillWorkTimeFormAndSubmit(page, "08:00", 60, "17:00");
    await expectFormToBeDisabled();

    await clickWorkTimeButton(page, "Edit");
    await expectFormToBeEnabled();

    await clickWorkTimeButton(page, "Update");
    await expectFormToBeDisabled();

    await clickWorkTimeButton(page, "Edit");
    await expectFormToBeEnabled();

    await clickWorkTimeButton(page, "Cancel");
    await expectFormToBeDisabled();

    await clickWorkTimeButton(page, "Delete");
    await expectFormToBeEnabled();
  });
});
