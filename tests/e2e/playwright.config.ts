import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load both .env and test.env
dotenv.config();
dotenv.config({ path: "../test.env" });

export default defineConfig({
  timeout: 10000,
  testDir: ".",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    [
      "html",
      {
        outputFolder: "./playwright-report",
      },
    ],
  ],
  use: {
    trace: "on",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "MOCK_EXTERNAL_APIS=true npm run dev -- --port 5172",
    port: 5172,
  },
});
