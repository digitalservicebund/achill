import { expect, test } from "@playwright/test";
import LoginPage from "./TestHelper/LoginPage";
import TimeEntriesPage from "./TestHelper/TimeEntriesPage";
import { initilaizeTestSetup } from "./TestHelper/TestHelper";

const correctUser = "user.name";
const correctPassword = "s3cr3t";

test.beforeEach(async ({ context, page }) => {
  initilaizeTestSetup(context);
  await new LoginPage(page).logIn(correctUser, correctPassword);
});

test.describe("Time entries", async () => {
  test("add entry", async ({ page }) => {

    const entryToAdd = {
      project: "My Project",
      time: "4:45",
      description: "a task"
    }

    const timeEntriesPage = new TimeEntriesPage(page);

    await timeEntriesPage.fillForm(entryToAdd);
    await timeEntriesPage.submitForm(entryToAdd.project);

    await expect(page.getByTestId("loadingOverlay")).toBeVisible()
    await expect(page.getByTestId("loadingOverlay")).toBeHidden()

    const entryCard = page.locator("data-testid=entryCard-" + entryToAdd.project);
    const enrtyCardContent = entryCard.locator("data-testid=entry-card-content")
    const expectedText = entryToAdd.time + " Hour(s) " + entryToAdd.description
    await expect(enrtyCardContent).toHaveText("4:45 Hour(s) a task");

    const hoursTestId = "hours-" + entryToAdd.project;
    const descriptionTestId = "description-" + entryToAdd.project;
    await expect(page.getByTestId(hoursTestId)).toBeEmpty()
    await expect(page.getByTestId(descriptionTestId)).toBeEmpty()
  });

  // test("add entry - with enter", async ({ page }) => {

  //   await new TimeEntriesPage(page).addEntry(
  //     "2022",
  //     "January",
  //     "17",
  //     "4:45",
  //     "a task",
  //     true
  //   );

  //   await expect(page.locator("data-test=entry-card")).toHaveCount(1);

  //   const card = page.locator("data-test=entry-card");
  //   await expect(card.locator("h5")).toHaveText("Mon 17.01.2022 - 4:45 Hours");

  //   const form = page.locator("data-test=entry-form");
  //   await expect(form.locator("data-testid=hours")).toBeEmpty();
  //   await expect(form.locator("id=description")).toBeEmpty();
  // });

  // test("add entry with secondary hour fraction format", async ({ page }) => {

  //   await new TimeEntriesPage(page).addEntry(
  //     "2022",
  //     "January",
  //     "17",
  //     "2.333333333333333",
  //     "a task"
  //   );

  //   await expect(page.locator("data-test=entry-card")).toHaveCount(1);

  //   const card = page.locator("data-test=entry-card");
  //   await expect(card.locator("h5")).toHaveText("Mon 17.01.2022 - 2:20 Hours");
  // });

  // test("add entry without a leading hour format - minutes only", async ({
  //   page,
  // }) => {

  //   await new TimeEntriesPage(page).addEntry(
  //     "2022",
  //     "February",
  //     "14",
  //     ":30",
  //     "a task"
  //   );

  //   await expect(page.locator("data-test=entry-card")).toHaveCount(1);

  //   const card = page.locator("data-test=entry-card");
  //   await expect(card.locator("h5")).toHaveText("Mon 14.02.2022 - 0:30 Hours");
  // });

  // test("add entry - invalid data", async ({ page }) => {

  //   await new TimeEntriesPage(page).addEntry(
  //     "2022",
  //     "January",
  //     "17",
  //     "4:5t",
  //     ""
  //   );

  //   const form = page.locator("data-test=entry-form");
  //   await expect(form.locator("data-testid=hours")).toHaveCSS(
  //     "border-color",
  //     "rgb(239, 68, 68)"
  //   );
  //   await expect(form.locator("id=description")).toHaveCSS(
  //     "border-color",
  //     "rgb(239, 68, 68)"
  //   );
  // });

  // test("edit entry", async ({ page }) => {

  //   await new TimeEntriesPage(page).addEntry(
  //     "2022",
  //     "January",
  //     "17",
  //     "1:00",
  //     "a task"
  //   );
  //   await new TimeEntriesPage(page).editEntry(
  //     "2022",
  //     "January",
  //     "18",
  //     "2:00",
  //     "a task - edited"
  //   );

  //   await expect(page.locator("data-test=entry-card")).toHaveCount(1);

  //   const card = page.locator("data-test=entry-card");
  //   await expect(card.locator("h5")).toHaveText("Tue 18.01.2022 - 2:00 Hours");
  //   await expect(card.locator("p")).toHaveText("a task - edited");
  // });

  // test("edit entry - invalid data", async ({ page }) => {

  //   // fixme - the to selection does not close anymore
  //   // await new TimeEntriesPage(page).setFromTo("2022-01-01", "2022-12-31");
  //   await new TimeEntriesPage(page).addEntry(
  //     "2022",
  //     "January",
  //     "17",
  //     "1:00",
  //     "a task"
  //   );
  //   await new TimeEntriesPage(page).editEntry(
  //     "2022",
  //     "January",
  //     "17",
  //     "4:5t",
  //     ""
  //   );

  //   await expect(page.locator("data-test=entry-card")).toHaveCount(0);
  //   await expect(page.locator("data-test=entry-form")).toHaveCount(2);

  //   const form = page.locator("data-test=entry-form").nth(1);
  //   await expect(form.locator("data-testid=hours")).toHaveCSS(
  //     "border-color",
  //     "rgb(239, 68, 68)"
  //   );
  //   await expect(form.locator("id=description")).toHaveCSS(
  //     "border-color",
  //     "rgb(239, 68, 68)"
  //   );
  // });

  // test("edit entry - with enter", async ({ page }) => {

  //   // fixme - the to selection does not close anymore
  //   // await new TimeEntriesPage(page).setFromTo("2022-01-01", "2022-12-31");
  //   await new TimeEntriesPage(page).addEntry(
  //     "2022",
  //     "January",
  //     "17",
  //     "4:45",
  //     "a task"
  //   );
  //   await new TimeEntriesPage(page).editEntry(
  //     "2022",
  //     "January",
  //     "18",
  //     "2:00",
  //     "a task - edited",
  //     true
  //   );

  //   await expect(page.locator("data-test=entry-card")).toHaveCount(1);
  //   await expect(page.locator("data-test=entry-form")).toHaveCount(1);

  //   const card = page.locator("data-test=entry-card");
  //   await expect(card.locator("h5")).toHaveText("Tue 18.01.2022 - 2:00 Hours");
  //   await expect(card.locator("p")).toHaveText("a task - edited");
  // });

  // test("delete entry", async ({ page }) => {

  //   apiStub.addEntry({
  //     id: 1,
  //     Date: "2022-01-22",
  //     Quantity: 1.25,
  //     Remark: "delete me",
  //   });

  //   await page.click('text="Delete"');

  //   await expect(page.locator("data-test=entry-card")).toHaveCount(0);
  //   await expect(page.locator("data-test=time-entries")).not.toContainText(
  //     "delete me"
  //   );
  // });

  // test("generate entry", async ({ page }) => {

  //   const form = page.locator("data-test=entry-form");
  //   await expect(form.locator('[placeholder="Working the work…"]')).toBeEmpty();
  //   await page.click('text="Suggest"');

  //   await expect(
  //     form.locator('[placeholder="Working the work…"]')
  //   ).not.toBeEmpty();
  // });
});
