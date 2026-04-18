import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "e2e/reports" }]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    // ── Desktop Light ──────────────────────────────────────────────────────
    {
      name: "desktop-light",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        colorScheme: "light",
      },
    },

    // ── Desktop Dark ───────────────────────────────────────────────────────
    {
      name: "desktop-dark",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        colorScheme: "dark",
      },
    },

    // ── Mobile Light (iPhone 12) ────────────────────────────────────────────
    {
      name: "mobile-light",
      use: {
        ...devices["iPhone 12"],
        colorScheme: "light",
      },
    },

    // ── Mobile Dark (iPhone 12) ─────────────────────────────────────────────
    {
      name: "mobile-dark",
      use: {
        ...devices["iPhone 12"],
        colorScheme: "dark",
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
