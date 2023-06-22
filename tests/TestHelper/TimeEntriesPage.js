export default class TimeEntriesPage {
    constructor(page) {
        this.page = page;
    }

    async fillForm(entry) {
        const hoursTestId = "hours-" + entry.project;
        const descriptionTestId = "description-" + entry.project;

        await this.page.getByTestId(hoursTestId).fill(entry.time);
        await this.page
            .getByTestId(descriptionTestId)
            .fill(entry.description);
    }

    async submitForm(projectName, useEnter = false) {
        const addButtonTestId = "add-" + projectName;

        if (useEnter) {
            await this.page.keyboard.press("Enter");
        } else {
            await this.page.getByTestId(addButtonTestId).click();
        }
    }

    async editEntry(year, month, date, hours, description, useEnter = false) {
        await this.page.locator("text=Edit").nth(0).click();
        await this.page.locator('[placeholder="2022-01-01"]').nth(1).click();
        await this.page.locator("select").first().selectOption({ label: month });
        await this.page.locator("select").nth(2).selectOption(year);
        await this.page.locator(`span >> text="${date}"`).click();
        await this.page.locator('[placeholder="2:15"]').nth(1).fill(hours);
        await this.page
            .locator('[placeholder="Working the work…"]')
            .nth(1)
            .fill(description);
        if (useEnter) {
            await this.page.keyboard.press("Enter");
        } else {
            await this.page.locator("button >> text=Save").click();
        }
    }
}