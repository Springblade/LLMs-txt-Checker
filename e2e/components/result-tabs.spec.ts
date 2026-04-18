import { test, type Route } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  elementSnapshot,
} from "../helpers";

/** Helper: navigate to the validation results page with a found result */
async function mountResultTabs(
  page: import("@playwright/test").Page,
  found: boolean,
) {
  await page.route("/api/validate", (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        found
          ? { found: true, content: "# Example\n\nhttps://example.com\n", errors: [], warnings: [] }
          : { found: false, message: "llms.txt not found", errorCode: "not_found", errors: [], warnings: [] },
      ),
    }),
  );
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /validate text/i }).click();
  await page.fill("#content-textarea", "# x\n");
  await page.getByRole("button", { name: /validate content/i }).click();
  await page.waitForURL("**/");
  await page.waitForLoadState("networkidle");
}

test.describe("ResultTabs", () => {

  test("Details tab — light", async ({ page }) => {
    await setLightMode(page);
    await mountResultTabs(page, true);

    await elementSnapshot(page.locator('[class*="result-tabs"], .card-interactive, [class*="result"]').first(), "result-tabs", "details-tab");
  });

  test("Preview tab — found, light", async ({ page }) => {
    await setLightMode(page);
    await mountResultTabs(page, true);

    await page.getByRole("button", { name: /preview/i }).click();
    await page.waitForTimeout(200);

    await elementSnapshot(page.locator("body"), "result-tabs", "preview-found");
  });

  test("Preview tab — empty, light", async ({ page }) => {
    await setLightMode(page);
    await mountResultTabs(page, false);

    await page.getByRole("button", { name: /preview/i }).click();
    await page.waitForTimeout(200);

    await elementSnapshot(page.locator("body"), "result-tabs", "preview-empty");
  });

  test("Raw tab — found, light", async ({ page }) => {
    await setLightMode(page);
    await mountResultTabs(page, true);

    await page.getByRole("button", { name: /raw/i }).click();
    await page.waitForTimeout(200);

    await elementSnapshot(page.locator("body"), "result-tabs", "raw-found");
  });

  test("Raw tab — empty, light", async ({ page }) => {
    await setLightMode(page);
    await mountResultTabs(page, false);

    await page.getByRole("button", { name: /raw/i }).click();
    await page.waitForTimeout(200);

    await elementSnapshot(page.locator("body"), "result-tabs", "raw-empty");
  });

  test("hover Details tab button, light", async ({ page }) => {
    await setLightMode(page);
    await mountResultTabs(page, true);

    const detailsTab = page.getByRole("button", { name: /details/i });
    await detailsTab.hover();
    await elementSnapshot(detailsTab, "result-tabs", "hover-details-tab");
  });

  test("hover Preview tab button, light", async ({ page }) => {
    await setLightMode(page);
    await mountResultTabs(page, true);

    const previewTab = page.getByRole("button", { name: /preview/i });
    await previewTab.hover();
    await elementSnapshot(previewTab, "result-tabs", "hover-preview-tab");
  });

  test("dark mode — Details tab", async ({ page }) => {
    await setDarkMode(page);
    await mountResultTabs(page, true);

    await elementSnapshot(page.locator("body"), "result-tabs", "details-tab");
  });

  test("dark mode — Preview tab, found", async ({ page }) => {
    await setDarkMode(page);
    await mountResultTabs(page, true);

    await page.getByRole("button", { name: /preview/i }).click();
    await page.waitForTimeout(200);

    await elementSnapshot(page.locator("body"), "result-tabs", "preview-found");
  });
});
