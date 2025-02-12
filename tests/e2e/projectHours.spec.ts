import { expect, test } from "@playwright/test";
import LoginPage from "tests/e2e/LoginPage";

test.describe("project time actions", () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
  });

  test("should add, edit and delete project time", async ({ page }) => {
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

    // Delete project time as teardown
    await projectLocator.getByRole("button", { name: "Delete" }).click();
  });

  test("form is disabled while saving", async ({ page }) => {
    const projectLocator = page.locator("form").filter({ hasText: "cool" });

    // Add project time
    await projectLocator.getByLabel("Hours").fill("4");
    await projectLocator.getByPlaceholder("Working the work…").fill("Meeting");
    await projectLocator.getByRole("button").click();
    await expect(page.getByTestId("week-view")).toHaveAttribute("inert", "");
    await expect(projectLocator).toHaveAttribute("inert", "");

    // Edit project time
    await projectLocator.getByRole("button", { name: "Edit" }).click();
    await projectLocator.getByLabel("Hours").fill("5");
    await projectLocator.getByText("Meeting").fill("Daily");
    await projectLocator.getByRole("button", { name: "Update" }).click();
    await expect(page.getByTestId("week-view")).toHaveAttribute("inert", "");
    await expect(projectLocator).toHaveAttribute("inert", "");

    // Delete project time
    await projectLocator.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByTestId("week-view")).toHaveAttribute("inert", "");
    await expect(projectLocator).toHaveAttribute("inert", "");
  });
});

test.describe("project time validation", () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
  });

  test("shows error when adding project time without hours", async ({
    page,
  }) => {
    const projectLocator = page.locator("form").filter({ hasText: "cool" });
    await projectLocator.getByPlaceholder("Working the work…").fill("Meeting");
    await projectLocator.getByRole("button").click();
    await expect(projectLocator).toContainText("Time is required");
  });

  test("shows error when adding project time in wrong format", async ({
    page,
  }) => {
    const projectLocator = page.locator("form").filter({ hasText: "cool" });
    await projectLocator.getByLabel("Hours").fill("invalid");
    await projectLocator.getByPlaceholder("Working the work…").fill("Meeting");
    await projectLocator.getByRole("button").click();
    await expect(projectLocator).toContainText("wrong format");
  });

  test("shows error when adding project time with more than 10 hours", async ({
    page,
  }) => {
    const projectLocator = page.locator("form").filter({ hasText: "cool" });
    await projectLocator.getByLabel("Hours").fill("11");
    await projectLocator.getByPlaceholder("Working the work…").fill("Meeting");
    await projectLocator.getByRole("button").click();
    await expect(projectLocator).toContainText("more than 10");
  });

  test("shows error when adding project time withour description", async ({
    page,
  }) => {
    const projectLocator = page.locator("form").filter({ hasText: "cool" });
    await projectLocator.getByLabel("Hours").fill("4");
    await projectLocator.getByRole("button").click();
    await expect(projectLocator).toContainText("Description is required");
  });
});

test.describe("invoiced projects", () => {
  test("invoiced project times cannot be modified", async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
    // date of invoiced project time is replaced by one week ago in mock so we need to go back a week
    await page.getByTestId("btn-previous-week").click();
    const projectLocator = page.locator("form").filter({ hasText: "2nd" });
    await expect(projectLocator.getByRole("button")).not.toBeVisible();
  });
});

test.describe("holidays", () => {
  test("can't book on holidays", async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
    // date of holiday is replaced by two weeks ago in mock so we need to go back
    await page.getByTestId("btn-previous-week").click();
    await page.getByTestId("btn-previous-week").click();
    await expect(page.getByTestId("week-view")).toContainText("holiday");
    await expect(
      page.locator("form").filter({ hasText: "2nd" }),
    ).not.toBeVisible();
  });
});
