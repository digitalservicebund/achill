import { test, expect } from "@playwright/test";
import LoginPage from "tests/e2e/LoginPage";

test.describe("project time actions", () => {
  test("should add, edit and delete project time", async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");

    // Add project time
    await page.getByLabel("Hours").click();
    await page.getByLabel("Hours").fill("4");
    await page
      .locator("form")
      .filter({
        hasText:
          "DigitalService / DS_23_0001 / A cool Project / Regular EngineeringHoursSave",
      })
      .getByPlaceholder("Working the work…")
      .click();
    await page
      .locator("form")
      .filter({
        hasText:
          "DigitalService / DS_23_0001 / A cool Project / Regular EngineeringHoursSave",
      })
      .getByPlaceholder("Working the work…")
      .fill("Meeting");

    await page
      .locator("form")
      .filter({
        hasText: "DigitalService / DS_23_0001 / A cool Project / Regular",
      })
      .getByRole("button")
      .click();

    await expect(page.getByRole("table")).toContainText("4:00");

    await expect(page.getByTestId("projectTime-card-content")).toContainText(
      "4 Hour(s)",
    );
    await expect(page.getByTestId("projectTime-card-content")).toContainText(
      "Meeting",
    );

    // Edit project time
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Hours").fill("5");
    await page.getByText("Meeting").fill("Daily");

    await page.getByRole("button", { name: "Update" }).click();

    await expect(page.getByRole("table")).toContainText("5:00");
    await expect(page.getByTestId("projectTime-card-content")).toContainText(
      "5 Hour(s)",
    );
    await expect(page.getByTestId("projectTime-card-content")).toContainText(
      "Daily",
    );

    // Delete project time
    await page.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByRole("table")).not.toContainText("5:00");
    await expect(
      page.getByTestId("projectTime-card-content"),
    ).not.toContainText("5 Hour(s)");
    await expect(
      page.getByTestId("projectTime-card-content"),
    ).not.toContainText("Daily");
  });
});
