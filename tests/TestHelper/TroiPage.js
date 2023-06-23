import { expect } from "@playwright/test";

export default class TroiPage {
    constructor(page) {
        this.page = page;
    }

    async expectEntryVisible(entry) {
        const entryCard = this.page.locator(
            "data-testid=entryCard-" + entry.project
        );
        const enrtyCardContent = entryCard.locator("data-testid=entry-card-content");
        const expectedText =
            entry.time + " Hour(s) " + entry.description;
        await expect(enrtyCardContent).toHaveText(expectedText);

        await this._expectAddEntryFormHidden(entry.project)
        await this._expectOnlyDeleteAndEditVisible(entry.project)
    }

    async expectNoEntryVisible(projectName) {
        await this._expectAddEntryFormVisible(projectName)
        await this._expectOnlyAddVisible(projectName)
    }

    async _expectAddEntryFormHidden(projectName) {
        await this._expectAddEntryForm(true, projectName)
    }

    async _expectAddEntryFormVisible(projectName) {
        await this._expectAddEntryForm(false, projectName)
    }

    async _expectAddEntryForm(hidden, projectName) {
        const hoursTestId = "hours-" + projectName;
        const descriptionTestId = "description-" + projectName;
        if (hidden) {
            await expect(this.page.getByTestId(hoursTestId)).toBeHidden();
            await expect(this.page.getByTestId(descriptionTestId)).toBeHidden();
        } else {
            await expect(this.page.getByTestId(hoursTestId)).toBeVisible();
            await expect(this.page.getByTestId(descriptionTestId)).toBeVisible();
        }
    }

    async _expectOnlyDeleteAndEditVisible(projectName) {
        await expect(this.page.getByTestId(`delete-${projectName}`)).toBeVisible();
        await expect(this.page.getByTestId(`edit-${projectName}`)).toBeVisible();
        await expect(this.page.getByTestId(`add-${projectName}`)).toBeHidden();
        await expect(this.page.getByTestId(`cancel-${projectName}`)).toBeHidden();
        await expect(this.page.getByTestId(`save-${projectName}`)).toBeHidden();
    }

    async _expectOnlyAddVisible(projectName) {
        await expect(this.page.getByTestId(`delete-${projectName}`)).toBeHidden();
        await expect(this.page.getByTestId(`edit-${projectName}`)).toBeHidden();
        await expect(this.page.getByTestId(`add-${projectName}`)).toBeVisible();
        await expect(this.page.getByTestId(`cancel-${projectName}`)).toBeHidden();
        await expect(this.page.getByTestId(`save-${projectName}`)).toBeHidden();
    }

    async expectOnlyCancelAndSaveVisible(projectName) {
        await expect(this.page.getByTestId(`delete-${projectName}`)).toBeHidden();
        await expect(this.page.getByTestId(`edit-${projectName}`)).toBeHidden();
        await expect(this.page.getByTestId(`add-${projectName}`)).toBeHidden();
        await expect(this.page.getByTestId(`cancel-${projectName}`)).toBeVisible();
        await expect(this.page.getByTestId(`save-${projectName}`)).toBeVisible();
    }

    async expectLoading() {
        await expect(this.page.getByTestId("loadingOverlay")).toBeVisible();
        await expect(this.page.getByTestId("loadingOverlay")).toBeHidden();
    }

    async clickOnWeekDay(dayIndex) {
        const testId = [
            "btn-mon",
            "btn-tue",
            "btn-wed",
            "btn-thu",
            "btn-fri",
        ][dayIndex]

        await this.page.getByTestId(testId).click()
    }

    async editEntry(projectName) {
        await this.page.getByTestId(`edit-${projectName}`).click();
    }

    async saveEntry(projectName) {
        await this.page.getByTestId(`save-${projectName}`).click();
    }

    async deleteEntry(projectName) {
        await this.page.getByTestId(`delete-${projectName}`).click();
    }

    async fillForm(entry) {
        const hoursTestId = "hours-" + entry.project;
        const descriptionTestId = "description-" + entry.project;

        await this.page.getByTestId(hoursTestId).fill(entry.time);
        await this.page.getByTestId(descriptionTestId).fill(entry.description);
    }

    async submitForm(projectName, useEnter = false) {
        const addButtonTestId = "add-" + projectName;

        if (useEnter) {
            await this.page.keyboard.press("Enter");
        } else {
            await this.page.getByTestId(addButtonTestId).click();
        }
    }
}