import { expect, test } from "@playwright/test";
import LoginPage from "./TestHelper/LoginPage";
import TroiApiStub, { correctUser, correctPassword } from "./TestHelper/TroiApiStub";

let apiStub;

test.beforeEach(async ({ context }) => {
    apiStub = new TroiApiStub();

    await context.route(
        "https://digitalservice.troi.software/api/v2/rest/**",
        async (route) => {
            const authnHeader = await route.request().headerValue("Authorization");
            if (!apiStub.isAuthorized(authnHeader)) {
                route.fulfill(apiStub.unauthorizedResponse());
                return;
            }

            const method = route.request().method();
            const { pathname, searchParams: params } = new URL(route.request().url());
            const postData = route.request().postDataJSON();
            const matchedResponse = apiStub.match(method, pathname, params, postData);

            if (matchedResponse !== null) {
                route.fulfill(matchedResponse);
            } else {
                console.log({ matchedResponse, method, pathname, params, postData });
                route.abort();
            }
        }
    );

    await context.route("/time_entries/*", async (route) => {
        const { pathname } = new URL(route.request().url());
        const method = route.request().method();

        const id = parseInt(pathname.split("/").at(-1));

        if (method === "DELETE") {
            apiStub.deleteEntry(id);
            route.fulfill(apiStub._response({}));
        } else {
            route.continue();
        }
    });
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