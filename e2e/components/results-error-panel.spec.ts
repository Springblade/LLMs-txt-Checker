import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  elementSnapshot,
} from "../helpers";

/**
 * ResultsErrorPanel renders for every errorCode the app produces.
 * Since it's rendered inside ResultsPage, we drive it via the validate flow.
 */
const ERROR_CODES = [
  { code: "not_found", message: "llms.txt file not found at this URL" },
  { code: "access_denied", message: "Access denied — this URL requires authentication" },
  { code: "server_error", message: "Server error — please try again later" },
  { code: "timeout", message: "Request timed out" },
  { code: "invalid_response", message: "Invalid response received" },
  { code: "http_error", message: "HTTP error 418" },
] as const;

for (const error of ERROR_CODES) {
  const stateName = error.code.replace(/_/g, "-");

  test(`${error.code} — light`, async ({ page }) => {
    await setLightMode(page);
    await page.route("/api/validate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          found: false,
          message: error.message,
          errorCode: error.code,
          errors: [],
          warnings: [],
        }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# x\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    const panel = page.locator("main").locator("[class*='error'], [class*='panel'], [class*='Error']").first();
    await elementSnapshot(panel, "results-error-panel", stateName);
  });

  test(`${error.code} — dark`, async ({ page }) => {
    await setDarkMode(page);
    await page.route("/api/validate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          found: false,
          message: error.message,
          errorCode: error.code,
          errors: [],
          warnings: [],
        }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# x\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    const panel = page.locator("main").locator("[class*='error'], [class*='panel'], [class*='Error']").first();
    await elementSnapshot(panel, "results-error-panel", stateName);
  });

  test(`${error.code} — hover retry button, light`, async ({ page }) => {
    await setLightMode(page);
    await page.route("/api/validate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          found: false,
          message: error.message,
          errorCode: error.code,
          errors: [],
          warnings: [],
        }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# x\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    const retryBtn = page.getByRole("button", { name: /check another url/i });
    await retryBtn.hover();
    await elementSnapshot(retryBtn, "results-error-panel", `hover-retry-${stateName}`);
  });
}

test("Open expected file link — light", async ({ page }) => {
  await setLightMode(page);
  await page.route("/api/validate", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ found: false, message: "not found", errorCode: "not_found", errors: [], warnings: [] }),
    }),
  );

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /validate text/i }).click();
  await page.fill("#content-textarea", "# x\n");
  await page.getByRole("button", { name: /validate content/i }).click();
  await page.waitForURL("**/");
  await page.waitForLoadState("networkidle");

  const link = page.getByRole("link", { name: /open expected file/i });
  await link.hover();
  await elementSnapshot(link, "results-error-panel", "hover-open-link");
});
