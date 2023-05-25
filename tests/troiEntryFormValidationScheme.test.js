import { expect, test } from "@playwright/test";
import { troiEntryFormValidationScheme } from "../src/lib/TroiEntryForm/troiEntryFormValidationScheme.js";

test.describe("troiEntryFormValidationScheme", async () => {

    // Description tests

    test("Validation fails on empty description", async () => {
        const testData = {
            hours: "2:00",
            description: ""
        }

        const result = await troiEntryFormValidationScheme.isValid(testData);
        expect(result).toBeFalsy();
    });

    test("Validation succeeds on non-empty description", async () => {
        const testData = {
            hours: "2:00",
            description: "Test Description"
        }

        const result = await troiEntryFormValidationScheme.isValid(testData);
        expect(result).toBeTruthy();
    });

    // Hours tests

    test("Validation fails on empty hours", async () => {
        const testData = {
            hours: "",
            description: "Test Description"
        }

        const result = await troiEntryFormValidationScheme.isValid(testData);
        expect(result).toBeFalsy();
    });

    test("Validation fails on malformed hours (hhh:mm)", async () => {
        const testData = {
            hours: "222:02",
            description: "Test Description"
        }

        const result = await troiEntryFormValidationScheme.isValid(testData);
        expect(result).toBeFalsy();
    });

    test("Validation fails on malformed hours (hh:mmm)", async () => {
        const testData = {
            hours: "22:022",
            description: "Test Description"
        }

        const result = await troiEntryFormValidationScheme.isValid(testData);
        expect(result).toBeFalsy();
    });

    test("Validation fails on malformed hours (:mm)", async () => {
        const testData = {
            hours: ":03",
            description: "Test Description"
        }

        const result = await troiEntryFormValidationScheme.isValid(testData);
        expect(result).toBeFalsy();
    });

    test("Validation succeeds on correct hours (hh:mm)", async () => {
        const testData = {
            hours: "22:02",
            description: "Test Description"
        }

        const result = await troiEntryFormValidationScheme.isValid(testData);
        expect(result).toBeTruthy();
    });

    test("Validation succeeds on correct hours (h:mm)", async () => {
        const testData = {
            hours: "1:02",
            description: "Test Description"
        }

        const result = await troiEntryFormValidationScheme.isValid(testData);
        expect(result).toBeTruthy();
    });

    test("Validation succeeds on correct hours (h)", async () => {
        const testData = {
            hours: "5",
            description: "Test Description"
        }

        const result = await troiEntryFormValidationScheme.isValid(testData);
        expect(result).toBeTruthy();
    });

    test("Validation succeeds on correct hours (h:m)", async () => {
        const testData = {
            hours: "1:2",
            description: "Test Description"
        }

        const result = await troiEntryFormValidationScheme.isValid(testData);
        expect(result).toBeTruthy();
    });
});
