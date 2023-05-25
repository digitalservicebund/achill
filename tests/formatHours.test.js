import { expect, test } from "@playwright/test";
import { formatHours } from "../src/lib/formatHours.js";

test.describe("formatHours", async () => {
  test("1 returns 1:00", () => {
    expect(formatHours("1")).toBe("1:00");
  });

  test("5 returns 5:00", () => {
    expect(formatHours("5")).toBe("5:00");
  });

  test("1.5 returns 1:30", () => {
    expect(formatHours("1.5")).toBe("1:30");
  });

  test("0.2 returns 0:20", () => {
    expect(formatHours("0.2")).toBe("0:12");
  });

  test("0.33333 returns 0:20", () => {
    expect(formatHours("0.33333")).toBe("0:20");
  });

  test("2.05 returns 2:03", () => {
    expect(formatHours("2.05")).toBe("2:03");
  });

  test("0.0166 returns 0:01", () => {
    expect(formatHours("0.0166")).toBe("0:01");
  });
});
