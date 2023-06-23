import { expect, test } from "@playwright/test";
import LoginPage from "./TestHelper/LoginPage";
import { fixedCurrentDate, initializeTestSetup, setFixedCurrentDate } from "./TestHelper/TestHelper";
import TroiApiStub from "./TestHelper/TroiApiStub";
import { username, password } from "./TestHelper/TroiApiStub";
import { convertToCacheFormat } from "../src/lib/stores/TimeEntryCache.js";
import TroiPage from "./TestHelper/TroiPage";

let troiPage;

test.beforeEach(async ({ page }) => {
  // https://playwright.dev/docs/api/class-consolemessage
  page.on("console", (msg) => console.log(msg.text()));
  setFixedCurrentDate(page);
  troiPage = new TroiPage(page)
});

test("load entry", async ({ context, page }) => {
  const apiEntry = {
    id: 17431,
    Date: convertToCacheFormat(fixedCurrentDate),
    Quantity: 4.75,
    Remark: "a task",
  };

  let mockApi = new TroiApiStub();
  mockApi.addEntry(apiEntry);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const existingEntry = {
    project: "My Project",
    time: "4:45",
    description: "a task",
  };

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(existingEntry)
});

test("add entry works", async ({ context, page }) => {
  let mockApi = new TroiApiStub();
  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const entryToAdd = {
    project: "My Project",
    time: "4:45",
    description: "a task",
  };

  await troiPage.expectLoading();

  await troiPage.fillForm(entryToAdd);
  await troiPage.submitForm(entryToAdd.project);

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(entryToAdd)
});

test("add entry with enter works", async ({ context, page }) => {
  let mockApi = new TroiApiStub();
  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const entryToAdd = {
    project: "My Project",
    time: "4:45",
    description: "a task",
  };

  await troiPage.expectLoading();

  await troiPage.fillForm(entryToAdd);
  await troiPage.submitForm(entryToAdd.project, true);

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(entryToAdd)
});

test("add entry with invalid data shows error", async ({ context, page }) => {
  let mockApi = new TroiApiStub();
  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const entryToAdd = {
    project: "My Project",
    time: "a",
    description: "",
  };

  await troiPage.expectLoading();

  await troiPage.fillForm(entryToAdd);
  await expect(page.getByTestId(`error-${entryToAdd.project}`)).toBeHidden();
  await troiPage.submitForm(entryToAdd.project);
  await expect(page.getByTestId("loadingOverlay")).toBeHidden();
  await expect(page.getByTestId("error-" + entryToAdd.project)).toBeVisible();
});

test("delete existing entry works", async ({ context, page }) => {
  const apiEntry = {
    id: 17431,
    Date: convertToCacheFormat(fixedCurrentDate),
    Quantity: 4.75,
    Remark: "a task",
  };

  let mockApi = new TroiApiStub();
  mockApi.addEntry(apiEntry);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const existingEntry = {
    project: "My Project",
    time: "4:45",
    description: "a task",
  };

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(existingEntry)

  await troiPage.deleteEntry(existingEntry.project);
  await troiPage.expectLoading();

  await troiPage.expectNoEntryVisible(existingEntry.project);
});

test("edit entry works", async ({ context, page }) => {
  const apiEntry = {
    id: 17431,
    Date: convertToCacheFormat(fixedCurrentDate),
    Quantity: 4.75,
    Remark: "a task",
  };

  let mockApi = new TroiApiStub();
  mockApi.addEntry(apiEntry);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  const existingEntry = {
    project: "My Project",
    time: "4:45",
    description: "a task",
  };

  const newEntry = {
    project: "My Project",
    time: "3:10",
    description: "i got edited",
  };

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(existingEntry)

  await troiPage.editEntry(existingEntry.project);
  await troiPage.expectOnlyCancelAndSaveVisible(existingEntry.project)

  await troiPage.fillForm(newEntry)
  await troiPage.saveEntry(newEntry.project);

  await troiPage.expectLoading();

  await troiPage.expectEntryVisible(newEntry)
});
