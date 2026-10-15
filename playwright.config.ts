import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 10000 },
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3101", actionTimeout: 10000, navigationTimeout: 15000, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "webkit", use: { ...devices["iPhone 13"], browserName: "webkit" } },
  ],
  webServer: { command: "npm run start -- --port 3101", url: "http://localhost:3101", reuseExistingServer: true, timeout: 30000 },
});
