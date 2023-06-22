import { expect, test } from "@playwright/test";
import LoginPage from "./TestHelper/LoginPage";
import { initializeTestSetup } from "./TestHelper/TestHelper";
import TroiApiStub from "./TestHelper/TroiApiStub";
import { username, password } from "./TestHelper/TroiApiStub";

test.beforeEach(async ({ page }) => {
  // https://playwright.dev/docs/api/class-consolemessage
  page.on("console", (msg) => console.log(msg.text()));
});

test("load entry", async ({ context, page }) => {
  const apiEntry = {
    id: 17431,
    Date: "2023-06-22",
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

  await expectLoading(page);

  const entryCard = page.locator(
    "data-testid=entryCard-" + existingEntry.project
  );
  const enrtyCardContent = entryCard.locator("data-testid=entry-card-content");
  const expectedText =
    existingEntry.time + " Hour(s) " + existingEntry.description;
  await expect(enrtyCardContent).toHaveText(expectedText);
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

  await expectLoading(page);

  await fillForm(entryToAdd, page);
  await submitForm(entryToAdd.project, page);

  await expectLoading(page);

  const entryCard = page.locator("data-testid=entryCard-" + entryToAdd.project);
  const enrtyCardContent = entryCard.locator("data-testid=entry-card-content");
  const expectedText = entryToAdd.time + " Hour(s) " + entryToAdd.description;
  await expect(enrtyCardContent).toHaveText(expectedText);

  const hoursTestId = "hours-" + entryToAdd.project;
  const descriptionTestId = "description-" + entryToAdd.project;
  await expect(page.getByTestId(hoursTestId)).toBeHidden();
  await expect(page.getByTestId(descriptionTestId)).toBeHidden();
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

  await expectLoading(page);

  await fillForm(entryToAdd, page);
  await submitForm(entryToAdd.project, page, true);

  await expectLoading(page);

  const entryCard = page.locator("data-testid=entryCard-" + entryToAdd.project);
  const enrtyCardContent = entryCard.locator("data-testid=entry-card-content");
  const expectedText = entryToAdd.time + " Hour(s) " + entryToAdd.description;
  await expect(enrtyCardContent).toHaveText(expectedText);

  const hoursTestId = "hours-" + entryToAdd.project;
  const descriptionTestId = "description-" + entryToAdd.project;
  await expect(page.getByTestId(hoursTestId)).toBeHidden();
  await expect(page.getByTestId(descriptionTestId)).toBeHidden();
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

  await expectLoading(page);

  await fillForm(entryToAdd, page);
  await expect(page.getByTestId(`error-${entryToAdd.project}`)).toBeHidden();
  await submitForm(entryToAdd.project, page);
  await expect(page.getByTestId("loadingOverlay")).toBeHidden();
  await expect(page.getByTestId("error-" + entryToAdd.project)).toBeVisible();
});

test("delete existing entry works", async ({ context, page }) => {
  const apiEntry = {
    id: 17431,
    Date: "2023-06-22",
    Quantity: 4.75,
    Remark: "a task",
  };

  let mockApi = new TroiApiStub();
  mockApi.addEntry(apiEntry);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  await expectLoading(page);

  const existingEntry = {
    project: "My Project",
    time: "4:45",
    description: "a task",
  };

  let entryCard = page.locator(
    "data-testid=entryCard-" + existingEntry.project
  );
  let enrtyCardContent = entryCard.locator("data-testid=entry-card-content");
  let expectedText =
    existingEntry.time + " Hour(s) " + existingEntry.description;
  await expect(enrtyCardContent).toHaveText(expectedText);

  await expect(page.getByTestId(`add-${existingEntry.project}`)).toBeHidden();
  await expect(page.getByTestId(`edit-${existingEntry.project}`)).toBeVisible();
  await expect(
    page.getByTestId(`delete-${existingEntry.project}`)
  ).toBeVisible();

  await deleteEntry(existingEntry.project, page);
  await expectLoading(page);

  await expect(page.getByTestId(`add-${existingEntry.project}`)).toBeVisible();
  await expect(page.getByTestId(`edit-${existingEntry.project}`)).toBeHidden();
  await expect(
    page.getByTestId(`delete-${existingEntry.project}`)
  ).toBeHidden();
});

test("edit entry works", async ({ context, page }) => {
  const apiEntry = {
    id: 17431,
    Date: "2023-06-22",
    Quantity: 4.75,
    Remark: "a task",
  };

  let mockApi = new TroiApiStub();
  mockApi.addEntry(apiEntry);

  initializeTestSetup(context, mockApi);
  await new LoginPage(page).logIn(username, password);

  await expectLoading(page);

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

  let entryCard = page.locator(
    "data-testid=entryCard-" + existingEntry.project
  );
  let enrtyCardContent = entryCard.locator("data-testid=entry-card-content");
  let expectedText =
    existingEntry.time + " Hour(s) " + existingEntry.description;
  await expect(enrtyCardContent).toHaveText(expectedText);

  await expect(page.getByTestId(`add-${existingEntry.project}`)).toBeHidden();
  await expect(page.getByTestId(`edit-${existingEntry.project}`)).toBeVisible();
  await expect(
    page.getByTestId(`delete-${existingEntry.project}`)
  ).toBeVisible();

  await editEntry(existingEntry.project, page);

  await expect(
    page.getByTestId(`cancel-${existingEntry.project}`)
  ).toBeVisible();
  await expect(page.getByTestId(`save-${existingEntry.project}`)).toBeVisible();

  await fillForm(newEntry, page);
  await saveEntry(newEntry.project, page);

  await expectLoading(page);

  await expect(page.getByTestId(`edit-${existingEntry.project}`)).toBeVisible();
  await expect(
    page.getByTestId(`delete-${existingEntry.project}`)
  ).toBeVisible();

  expectedText = newEntry.time + " Hour(s) " + newEntry.description;
  await expect(enrtyCardContent).toHaveText(expectedText);
});

async function expectLoading(page) {
  await expect(page.getByTestId("loadingOverlay")).toBeVisible();
  await expect(page.getByTestId("loadingOverlay")).toBeHidden();
}

async function editEntry(projectName, page) {
  await page.getByTestId(`edit-${projectName}`).click();
}

async function saveEntry(projectName, page) {
  await page.getByTestId(`save-${projectName}`).click();
}

async function deleteEntry(projectName, page) {
  await page.getByTestId(`delete-${projectName}`).click();
}

async function fillForm(entry, page) {
  const hoursTestId = "hours-" + entry.project;
  const descriptionTestId = "description-" + entry.project;

  await page.getByTestId(hoursTestId).fill(entry.time);
  await page.getByTestId(descriptionTestId).fill(entry.description);
}

async function submitForm(projectName, page, useEnter = false) {
  const addButtonTestId = "add-" + projectName;

  if (useEnter) {
    await page.keyboard.press("Enter");
  } else {
    await page.getByTestId(addButtonTestId).click();
  }
}
