import { expect, test } from "@playwright/test";
import {
  convertFloatTimeToHHMM,
  convertTimeStringToFloat,
} from "$lib/utils/timeConverter.js";

test.describe("convertFloatTimeToHHMM", async () => {
  test("1 returns 1:00", () => {
    expect(convertFloatTimeToHHMM("1")).toBe("1:00");
  });

  test("5 returns 5:00", () => {
    expect(convertFloatTimeToHHMM("5")).toBe("5:00");
  });

  test("1.5 returns 1:30", () => {
    expect(convertFloatTimeToHHMM("1.5")).toBe("1:30");
  });

  test("0.2 returns 0:20", () => {
    expect(convertFloatTimeToHHMM("0.2")).toBe("0:12");
  });

  test("0.33333 returns 0:20", () => {
    expect(convertFloatTimeToHHMM("0.33333")).toBe("0:20");
  });

  test("2.05 returns 2:03", () => {
    expect(convertFloatTimeToHHMM("2.05")).toBe("2:03");
  });

  test("0.0166 returns 0:01", () => {
    expect(convertFloatTimeToHHMM("0.0166")).toBe("0:01");
  });
});

test.describe("convertTimeStringToFloat", async () => {
  test("1:00 returns 1", () => {
    expect(convertTimeStringToFloat("1:00")).toBe(1);
  });

  test("5:00 returns 5", () => {
    expect(convertTimeStringToFloat("5:00")).toBe(5);
  });

  test("1:30 returns 1.5", () => {
    expect(convertTimeStringToFloat("1:30")).toBe(1.5);
  });

  test("0:20 returns 0.2", () => {
    expect(convertTimeStringToFloat("0:12")).toBe(0.2);
  });

  test("0:20 returns 0.33333", () => {
    expect(convertTimeStringToFloat("0:20")).toBe(1 / 3);
  });

  test("2:03 returns 2.05", () => {
    expect(convertTimeStringToFloat("2:03")).toBe(2.05);
  });

  test("0:01 returns 0.0166", () => {
    expect(convertTimeStringToFloat("0:01")).toBe(1 / 60);
  });

  test("1:3 returns 1.5", () => {
    expect(convertTimeStringToFloat("1:3")).toBe(1.5);
  });

  test("0,5 returns 0.5", () => {
    expect(convertTimeStringToFloat("0,5")).toBe(0.5);
  });

  test("1,34563 returns 1.34563", () => {
    expect(convertTimeStringToFloat("1,34563")).toBe(1.34563);
  });

  test("21,34563 returns 21.34563", () => {
    expect(convertTimeStringToFloat("21,34563")).toBe(21.34563);
  });

  test("1.34563 returns 1.34563", () => {
    expect(convertTimeStringToFloat("1.34563")).toBe(1.34563);
  });

  test("21.34563 returns 21.34563", () => {
    expect(convertTimeStringToFloat("21.34563")).toBe(21.34563);
  });
});
