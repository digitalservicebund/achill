import { test } from "@playwright/test";
import LoginPage from "./TestHelper/LoginPage";
import {
  fixedCurrentDate,
  initializeTestSetup,
  setFixedCurrentDate,
} from "./TestHelper/TestHelper";
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

test("select day in current week works", async ({ context, page }) => {
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
  mockApi.addEntry(100, apiEntry0);
  mockApi.addEntry(100, apiEntry1);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const existingEntry0 = {
    projectId: 100,
    time: "4:45",
    description: "a task",
  };

  const existingEntry1 = {
    projectId: 100,
    time: "3:00",
    description: "Some task",
  };

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(existingEntry1);
  await troiPage.expectSelectedDateToBe("Wednesday, 7 June 2023");
  await troiPage.expectHoursOfWeekdayToBe(2, existingEntry1.time);
  await troiPage.clickOnWeekDay(0); // Select the monday

  await troiPage.expectEntryVisible(existingEntry0);
  await troiPage.expectSelectedDateToBe("Monday, 5 June 2023");
  await troiPage.expectHoursOfWeekdayToBe(0, existingEntry0.time);
});

test("displays correct hours sum of two projects", async ({
  context,
  page,
}) => {
  const firstProjectEntry = {
    id: 1000,
    Date: convertToCacheFormat(fixedCurrentDate),
    Quantity: 4.75,
    Remark: "first task",
  };

  const secondProjectEntry = {
    id: 1010,
    Date: convertToCacheFormat(fixedCurrentDate),
    Quantity: 3,
    Remark: "second task",
  };

  let mockApi = new TroiApiStub();
  mockApi.addEntry(100, firstProjectEntry);
  mockApi.addEntry(101, secondProjectEntry);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const firstValidationEntry = {
    projectId: 100,
    time: "4:45",
    description: "first task",
  };

  const secondValidationEntry = {
    projectId: 101,
    time: "3:00",
    description: "second task",
  };

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(firstValidationEntry);
  await troiPage.expectEntryVisible(secondValidationEntry);
  await troiPage.expectSelectedDateToBe("Wednesday, 7 June 2023");
  await troiPage.expectHoursOfWeekdayToBe(2, "7:45");
});

test("go to previous week works", async ({ context, page }) => {
  const apiEntry0 = {
    id: 17431,
    Date: convertToCacheFormat(addDaysToDate(fixedCurrentDate, -7)), // Wednesday the week before
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
  mockApi.addEntry(100, apiEntry0);
  mockApi.addEntry(100, apiEntry1);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const existingEntry0 = {
    projectId: 100,
    time: "4:45",
    description: "a task",
  };

  const existingEntry1 = {
    projectId: 100,
    time: "3:00",
    description: "Some task",
  };

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(existingEntry1);
  await troiPage.expectSelectedDateToBe("Wednesday, 7 June 2023");
  await troiPage.clickOnPreviousWeek();

  await troiPage.expectEntryVisible(existingEntry0);
  await troiPage.expectSelectedDateToBe("Wednesday, 31 May 2023");
});

test("go to next week works", async ({ context, page }) => {
  const apiEntry0 = {
    id: 17431,
    Date: convertToCacheFormat(addDaysToDate(fixedCurrentDate, 7)), // Wednesday the week before
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
  mockApi.addEntry(100, apiEntry0);
  mockApi.addEntry(100, apiEntry1);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const existingEntry0 = {
    projectId: 100,
    time: "4:45",
    description: "a task",
  };

  const existingEntry1 = {
    projectId: 100,
    time: "3:00",
    description: "Some task",
  };

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(existingEntry1);
  await troiPage.expectSelectedDateToBe("Wednesday, 7 June 2023");
  await troiPage.clickOnNextWeek();

  await troiPage.expectEntryVisible(existingEntry0);
  await troiPage.expectSelectedDateToBe("Wednesday, 14 June 2023");
});

test("going back to today in same week works", async ({ context, page }) => {
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
  mockApi.addEntry(100, apiEntry0);
  mockApi.addEntry(100, apiEntry1);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const existingEntry0 = {
    projectId: 100,
    time: "4:45",
    description: "a task",
  };

  const existingEntry1 = {
    projectId: 100,
    time: "3:00",
    description: "Some task",
  };

  await troiPage.expectLoading();

  await troiPage.clickOnWeekDay(0); // Select the monday

  await troiPage.expectEntryVisible(existingEntry0);
  await troiPage.expectSelectedDateToBe("Monday, 5 June 2023");

  await troiPage.clickOnToday();

  await troiPage.expectEntryVisible(existingEntry1);
  await troiPage.expectSelectedDateToBe("Wednesday, 7 June 2023");
});

test("going back to today from different week works", async ({
  context,
  page,
}) => {
  const apiEntry0 = {
    id: 17431,
    Date: convertToCacheFormat(addDaysToDate(fixedCurrentDate, -8)), // Wednesday the week before
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
  mockApi.addEntry(100, apiEntry0);
  mockApi.addEntry(100, apiEntry1);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const existingEntry0 = {
    projectId: 100,
    time: "4:45",
    description: "a task",
  };

  const existingEntry1 = {
    projectId: 100,
    time: "3:00",
    description: "Some task",
  };

  await troiPage.expectLoading();

  await troiPage.clickOnPreviousWeek();
  await troiPage.clickOnWeekDay(1);

  await troiPage.expectEntryVisible(existingEntry0);
  await troiPage.expectSelectedDateToBe("Tuesday, 30 May 2023");

  await troiPage.clickOnToday();

  await troiPage.expectEntryVisible(existingEntry1);
  await troiPage.expectSelectedDateToBe("Wednesday, 7 June 2023");
});

test("holiday banner is shown when holiday is selected", async ({
  context,
  page,
}) => {
  let mockApi = new TroiApiStub();

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  await troiPage.expectLoading();

  await troiPage.clickOnPreviousWeek();
  await troiPage.clickOnWeekDay(0);

  await troiPage.expectSelectedDateToBe("Monday, 29 May 2023");
  await troiPage.expectHoldiayBannerToBeVisible();
});

test("vacation banner is shown when vacation day is selected", async ({
  context,
  page,
}) => {
  let mockApi = new TroiApiStub();

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  await troiPage.expectLoading();

  await troiPage.clickOnNextWeek();
  await troiPage.clickOnWeekDay(3);

  await troiPage.expectSelectedDateToBe("Thursday, 15 June 2023");
  await troiPage.expectVacationBannerToBeVisible();
});

test("new entries are loaded when bottom cache border is crossed", async ({
  context,
  page,
}) => {
  const apiEntry = {
    id: 17431,
    Date: convertToCacheFormat(addDaysToDate(fixedCurrentDate, -7 * 7)),
    Quantity: 4.75,
    Remark: "a task",
  };

  let mockApi = new TroiApiStub();
  mockApi.addEntry(100, apiEntry);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const existingEntry = {
    projectId: 100,
    time: "4:45",
    description: "a task",
  };

  await troiPage.expectLoading();

  await troiPage.expectSelectedDateToBe("Wednesday, 7 June 2023");
  for (let index = 0; index < 7; index++) {
    await troiPage.clickOnPreviousWeek();
  }

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(existingEntry);
  await troiPage.expectSelectedDateToBe("Wednesday, 19 April 2023");
});

test("new entries are loaded when top cache border is crossed", async ({
  context,
  page,
}) => {
  const apiEntry = {
    id: 17431,
    Date: convertToCacheFormat(addDaysToDate(fixedCurrentDate, 7 * 7)),
    Quantity: 4.75,
    Remark: "a task",
  };

  let mockApi = new TroiApiStub();
  mockApi.addEntry(100, apiEntry);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const existingEntry = {
    projectId: 100,
    time: "4:45",
    description: "a task",
  };

  await troiPage.expectLoading();

  await troiPage.expectSelectedDateToBe("Wednesday, 7 June 2023");
  for (let index = 0; index < 7; index++) {
    await troiPage.clickOnNextWeek();
  }

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(existingEntry);
  await troiPage.expectSelectedDateToBe("Wednesday, 26 July 2023");
});
