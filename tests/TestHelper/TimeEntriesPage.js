export default class TimeEntriesPage {
    constructor(page) {
        this.page = page;
    }

    async setFromTo(from, to) {
        await this.page.locator('label:has-text("Show from:")').fill(from);
        await this.page.locator('label:has-text("to:")').fill(to);
    }

    async addEntry(projectName, hours, description, useEnter = false) {
        const hoursTestId = "hours-" + projectName;
        const descriptionTestId = "description-" + projectName;
        const addButtonTestId = "add-button-" + projectName;
        await this.page.getByTestId(hoursTestId).fill(hours);
        await this.page
            .getByTestId(descriptionTestId)
            .fill(description);

        if (useEnter) {
            await this.page.keyboard.press("Enter");
        } else {
            await this.page.getByTestId(addButtonTestId).click();
        }
    }

    // async addEntry(year, month, date, hours, description, useEnter = false) {
    //     await this.page.locator('[placeholder="2022-01-01"]').click();
    //     await this.page
    //         .locator('[placeholder="2022-01-01"] + .picker >> select')
    //         .first()
    //         .selectOption({ label: month });
    //     await this.page
    //         .locator('[placeholder="2022-01-01"] + .picker >> select')
    //         .nth(2)
    //         .selectOption(year);
    //     await this.page
    //         .locator(`[placeholder="2022-01-01"] + .picker >> span >> text="${date}"`)
    //         .nth(0)
    //         .click();
    //     await this.page.locator('[placeholder="2:15"]').fill(hours);
    //     await this.page
    //         .locator('[placeholder="Working the work…"]')
    //         .fill(description);
    //     if (useEnter) {
    //         await this.page.keyboard.press("Enter");
    //     } else {
    //         await this.page.locator("button >> text=ADD").click();
    //     }
    // }

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