import { expect, test } from "@playwright/test";
import LoginPage from "tests/e2e/LoginPage";

test.describe("project time actions", () => {
  test("should add, edit and delete project time", async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
    const projectLocator = page.locator("form").filter({ hasText: "cool" });

    // Add project time
    await page.getByLabel("Hours").fill("4");
    await projectLocator.getByPlaceholder("Working the work…").fill("Meeting");
    await projectLocator.getByRole("button").click();

    await expect(page.getByRole("table")).toContainText("4:00");
    await expect(projectLocator).toContainText("4 Hour(s)");
    await expect(projectLocator).toContainText("Meeting");

    // Edit project time
    await projectLocator.getByRole("button", { name: "Edit" }).click();
    await projectLocator.getByLabel("Hours").fill("5");
    await projectLocator.getByText("Meeting").fill("Daily");

    await projectLocator.getByRole("button", { name: "Update" }).click();

    await expect(page.getByRole("table")).toContainText("5:00");
    await expect(projectLocator).toContainText("5 Hour(s)");
    await expect(projectLocator).toContainText("Daily");

    // Delete project time
    await projectLocator.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByRole("table")).not.toContainText("5:00");
    await expect(projectLocator).not.toContainText("5 Hour(s)");
    await expect(projectLocator).not.toContainText("Daily");
  });

  test("add and update with enter", async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
    const projectLocator = page.locator("form").filter({ hasText: "cool" });

    // Add project time
    await projectLocator.getByLabel("Hours").fill("4");
    await projectLocator.getByPlaceholder("Working the work…").fill("Meeting");
    await projectLocator.getByText("Meeting").press("Enter");

    await expect(page.getByRole("table")).toContainText("4:00");
    await expect(projectLocator).toContainText("4 Hour(s)");
    await expect(projectLocator).toContainText("Meeting");

    // Edit project time
    await projectLocator.getByRole("button", { name: "Edit" }).click();
    await projectLocator.getByLabel("Hours").fill("5");
    await projectLocator.getByText("Meeting").fill("Daily");
    await projectLocator.getByText("Daily").press("Enter");

    await expect(page.getByRole("table")).toContainText("5:00");
    await expect(projectLocator).toContainText("5 Hour(s)");
    await expect(projectLocator).toContainText("Daily");
  });
});
