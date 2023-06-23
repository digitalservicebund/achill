import { test } from "@playwright/test";
import LoginPage from "./TestHelper/LoginPage";
import { fixedCurrentDate, initializeTestSetup, setFixedCurrentDate, sleep } from "./TestHelper/TestHelper";
import TroiApiStub from "./TestHelper/TroiApiStub";
import { username, password } from "./TestHelper/TroiApiStub";
import { convertToCacheFormat } from "../src/lib/stores/TimeEntryCache.js";
import { addDaysToDate } from "../src/lib/utils/dateUtils.js";
import TroiPage from "./TestHelper/TroiPage";

let troiPage;

test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => console.log(msg.text()));
    setFixedCurrentDate(page);
    troiPage = new TroiPage(page);
});

test("select date in current week works", async ({ context, page }) => {

    const apiEntry0 = {
        id: 17431,
        Date: convertToCacheFormat(addDaysToDate(fixedCurrentDate, -2)), // Monday
        Quantity: 4.75,
        Remark: "a task",
    };

    const apiEntry1 = {
        id: 17431,
        Date: convertToCacheFormat(fixedCurrentDate), // Wednesday
        Quantity: 3.0,
        Remark: "Some task",
    };

    let mockApi = new TroiApiStub();
    mockApi.addEntry(apiEntry0);
    mockApi.addEntry(apiEntry1);

    initializeTestSetup(context, mockApi);
    await new LoginPage(page).logIn(username, password);

    const existingEntry0 = {
        project: "My Project",
        time: "4:45",
        description: "a task",
    };

    const existingEntry1 = {
        project: "My Project",
        time: "3:00",
        description: "Some task",
    };

    await troiPage.expectLoading();

    await troiPage.expectEntryVisible(existingEntry1);
    await troiPage.clickOnWeekDay(0); // Select the monday

    await troiPage.expectEntryVisible(existingEntry0);
});


