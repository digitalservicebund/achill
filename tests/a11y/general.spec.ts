import axeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import LoginPage from "../e2e/LoginPage";

test.describe("index", () => {
  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");

    const accessibilityScanResults = await new axeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
