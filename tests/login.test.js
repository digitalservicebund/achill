import { expect, test } from "@playwright/test";
import LoginPage from "./TestHelper/LoginPage";
import TroiApiStub, { username, password } from "./TestHelper/TroiApiStub";
import { initializeTestSetup } from "./TestHelper/TestHelper";

test.beforeEach(async ({ context, page }) => {
  page.on("console", (msg) => console.log(msg.text()));
  const mockApi = new TroiApiStub();
  initializeTestSetup(context, mockApi);
});

test.describe("Auth", async () => {
  test("failed log in", async ({ page }) => {
    await new LoginPage(page).logIn(username, "wrong password");

    await expect(page.locator("text=Login failed")).toBeVisible();
  });

  test("log in and back out", async ({ page }) => {
    await new LoginPage(page).logIn(username, password);
    await expect(
      page.locator("nav div >> text=Logged in as user.name")
    ).toBeVisible();

    await page.locator("text=LOGOUT").click();
    await expect(page.locator("h2 >> text=Enter. Time.")).toBeVisible();
  });
});
