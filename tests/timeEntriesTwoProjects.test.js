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
import TroiPage from "./TestHelper/TroiPage";

let troiPage;

test.beforeEach(async ({ page }) => {
  // https://playwright.dev/docs/api/class-consolemessage
  page.on("console", (msg) => console.log(msg.text()));
  setFixedCurrentDate(page);
  troiPage = new TroiPage(page);
});

test("load entry", async ({ context, page }) => {
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
});

test("add entry works", async ({ context, page }) => {
  const firstProjectEntry = {
    id: 1000,
    Date: convertToCacheFormat(fixedCurrentDate),
    Quantity: 4.75,
    Remark: "first task",
  };

  let mockApi = new TroiApiStub();
  mockApi.addEntry(100, firstProjectEntry);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const firstValidationEntry = {
    projectId: 100,
    time: "4:45",
    description: "first task",
  };

  const entryToAdd = {
    projectId: 101,
    time: "3:00",
    description: "second task",
  };

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(firstValidationEntry);
  await troiPage.expectNoEntryVisible(entryToAdd.projectId);

  await troiPage.fillForm(entryToAdd);
  await troiPage.submitForm(entryToAdd.projectId);

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(firstValidationEntry);
  await troiPage.expectEntryVisible(entryToAdd);
});

test("delete existing entry works", async ({ context, page }) => {
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

  await troiPage.deleteEntry(firstValidationEntry.projectId);
  await troiPage.expectLoading();

  await troiPage.expectNoEntryVisible(firstValidationEntry.projectId);
  await troiPage.expectEntryVisible(secondValidationEntry);
});

test("edit entry works", async ({ context, page }) => {
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

  const newEntry = {
    projectId: 100,
    time: "3:10",
    description: "i got edited",
  };

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(firstValidationEntry);
  await troiPage.expectEntryVisible(secondValidationEntry);

  await troiPage.editEntry(firstValidationEntry.projectId);
  await troiPage.expectOnlyCancelAndSaveVisible(firstValidationEntry.projectId);

  await troiPage.fillForm(newEntry);
  await troiPage.saveEntry(newEntry.projectId);

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(newEntry);
  await troiPage.expectEntryVisible(secondValidationEntry);
});
