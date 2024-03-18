import { test, expect } from "@playwright/test";
import LoginPage from "./LoginPage";

test.describe("work time actions", () => {
  test("should add, edit and delete work time", async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
    await expect(page.locator("text=Total working hours")).toBeVisible();

    // Input start time, break and end time and submit form
    await page.getByLabel("Start time").fill("08:00");
    await page.getByLabel("Break").fill("01:00");
    await page.getByLabel("End time").fill("17:00");
    await page
      .locator("#work-time-form button")
      .filter({ hasText: "Save" })
      .click();

    // Check if the new work time is visible
    await expect(page.getByText("8:00")).toBeVisible();

    // Click on the edit button
    await page
      .locator("#work-time-form button")
      .filter({ hasText: "Edit" })
      .click();

    // Change the start time and submit the form
    await page.getByLabel("Start time").fill("09:00");
    await page
      .locator("#work-time-form button")
      .filter({ hasText: "Update" })
      .click();

    // Check if the new work time is visible
    await expect(page.getByText("7:00")).toBeVisible();

    // Click on the delete button
    await page
      .locator("#work-time-form button")
      .filter({ hasText: "Delete" })
      .click();

    // Check if the work time is no longer visible
    await expect(page.getByText("7:00")).not.toBeVisible();
  });
});
