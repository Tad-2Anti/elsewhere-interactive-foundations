import { defineConfig, devices } from "@playwright/test";

const localPort = process.env.PLAYWRIGHT_PORT ?? "3000";
const localBaseUrl = `http://127.0.0.1:${localPort}`;

/**
 * Playwright E2E configuration for ELSEWHERE Interactive.
 *
 * Runs against a locally started Next.js dev server.
 * In CI the server is already running via the workflow's `npm run dev &` step.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? localBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: `npm run dev -- --hostname 127.0.0.1 --port ${localPort}`,
        url: localBaseUrl,
        // A port collision must fail visibly instead of testing an unrelated application.
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
