import { expect, test } from "@playwright/test";
import LoginPage from "./TestHelper/LoginPage";
import TroiApiStub, { correctUser, correctPassword } from "./TestHelper/TroiApiStub";
import { initilaizeTestSetup } from "./TestHelper/TestHelper";

test.beforeEach(async ({ context }) => {
    initilaizeTestSetup(context);
});

test.describe("Auth", async () => {
    test("failed log in", async ({ page }) => {
        await new LoginPage(page).logIn(correctUser, "wrong password");

        await expect(page.locator("text=Login failed")).toBeVisible();
    });

    test("log in and back out", async ({ page }) => {
        await new LoginPage(page).logIn(correctUser, correctPassword);
        await expect(
            page.locator("nav div >> text=Logged in as user.name")
        ).toBeVisible();

        await page.locator("text=LOGOUT").click();
        await expect(page.locator("h2 >> text=Enter. Time.")).toBeVisible();
    });
});