import { expect, test } from "@playwright/test";
import { entryFormValidationScheme } from "../src/lib/components/EntryForm/timeEntryFormValidator.js";

test.describe("entryFormValidationScheme", async () => {
  // Description tests

  test("Validation fails on empty description", async () => {
    const testData = {
      hours: "2:00",
      description: "",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeFalsy();
  });

  test("Validation fails on description only containing whitespace", async () => {
    const testData = {
      hours: "2:00",
      description: " ",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeFalsy();
  });

  test("Validation fails on description only containing line break", async () => {
    const testData = {
      hours: "2:00",
      description: "\n",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeFalsy();
  });

  test("Validation succeeds on non-empty description", async () => {
    const testData = {
      hours: "2:00",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeTruthy();
  });

  // Hours tests

  test("Validation fails on empty hours", async () => {
    const testData = {
      hours: "",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeFalsy();
  });

  test("Validation fails forbidden string", async () => {
    const testData = {
      hours: "23:43b",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeFalsy();
  });

  test("Validation fails on malformed hours (hhh:mm)", async () => {
    const testData = {
      hours: "222:02",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeFalsy();
  });

  test("Validation fails on malformed hours (hh:mmm)", async () => {
    const testData = {
      hours: "22:022",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeFalsy();
  });

  test("Validation fails on malformed hours (:mm)", async () => {
    const testData = {
      hours: ":03",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeFalsy();
  });

  test("Validation succeeds on correct hours (hh:mm)", async () => {
    const testData = {
      hours: "22:02",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeTruthy();
  });

  test("Validation succeeds on correct hours (h:mm)", async () => {
    const testData = {
      hours: "1:02",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeTruthy();
  });

  test("Validation succeeds on correct hours (h)", async () => {
    const testData = {
      hours: "5",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeTruthy();
  });

  test("Validation succeeds on correct hours (h:m)", async () => {
    const testData = {
      hours: "1:2",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeTruthy();
  });

  test("Validation succeeds on float hours 1,4", async () => {
    const testData = {
      hours: "1,4",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeTruthy();
  });

  test("Validation succeeds on float hours 1.4", async () => {
    const testData = {
      hours: "1.4",
      description: "Test Description",
    };

    const result = await entryFormValidationScheme.isValid(testData);
    expect(result).toBeTruthy();
  });
});
