import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  elementSnapshot,
} from "../helpers";

test.describe("ResultShell", () => {

  test("with back button and title — light", async ({ page }) => {
    await setLightMode(page);
    await page.route("/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: { siteName: "Example" }, validation: { passed: true, errors: [] } }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    const shell = page.locator("main");
    await elementSnapshot(shell, "result-shell", "with-back-title");
  });

  test("with back button and title — dark", async ({ page }) => {
    await setDarkMode(page);
    await page.route("/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: { siteName: "Example" }, validation: { passed: true, errors: [] } }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    const shell = page.locator("main");
    await elementSnapshot(shell, "result-shell", "with-back-title");
  });

  test("error panel — light", async ({ page }) => {
    await setLightMode(page);
    await page.route("/api/validate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ found: false, message: "llms.txt not found", errorCode: "not_found", errors: [], warnings: [] }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# x\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    const shell = page.locator("main");
    await elementSnapshot(shell, "result-shell", "error");
  });

  test("error panel — dark", async ({ page }) => {
    await setDarkMode(page);
    await page.route("/api/validate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ found: false, message: "llms.txt not found", errorCode: "not_found", errors: [], warnings: [] }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# x\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    const shell = page.locator("main");
    await elementSnapshot(shell, "result-shell", "error");
  });
});
