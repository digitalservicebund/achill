import { test, expect } from "@playwright/test";
import LoginPage from "./LoginPage";

test.describe("login page", () => {
  test("should redirect to login page from index", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("should not login when passed incorrect password", async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aWrongPassword");
    await expect(page.locator("text=Login failed")).toBeVisible();
  });

  test("should login and logout", async ({ page }) => {
    await new LoginPage(page).logIn("max.mustermann", "aSafePassword");
    await expect(
      page.locator("nav div >> text=Logged in as max.mustermann"),
    ).toBeVisible();

    await page.locator("text=LOGOUT").click();
    await expect(page).toHaveURL("/login");
  });
});
