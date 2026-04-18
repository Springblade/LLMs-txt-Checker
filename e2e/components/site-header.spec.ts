import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  elementSnapshot,
} from "../helpers";

test.describe("SiteHeader", () => {

  const SELECTORS = {
    header: "header",
    logo: 'img[alt="Aivify"]',
    githubLink: 'a[aria-label="View on GitHub"]',
    backButton: 'button[aria-label="Go back"]',
  };

  test("default — light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "default");
  });

  test("default — dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "default");
  });

  test("hover logo, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(SELECTORS.logo).hover();
    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "hover-logo");
  });

  test("hover logo, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(SELECTORS.logo).hover();
    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "hover-logo");
  });

  test("hover GitHub link, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(SELECTORS.githubLink).hover();
    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "hover-github");
  });

  test("hover GitHub link, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator(SELECTORS.githubLink).hover();
    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "hover-github");
  });

  test("with back button — light", async ({ page }) => {
    await setLightMode(page);

    await page.route("/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: {}, validation: { passed: true, errors: [] } }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "with-back");
  });

  test("with back button — dark", async ({ page }) => {
    await setDarkMode(page);

    await page.route("/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: {}, validation: { passed: true, errors: [] } }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "with-back");
  });

  test("hover back button — light", async ({ page }) => {
    await setLightMode(page);

    await page.route("/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: {}, validation: { passed: true, errors: [] } }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    await page.locator(SELECTORS.backButton).hover();
    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "hover-back");
  });

  test("with breadcrumb — light", async ({ page }) => {
    await setLightMode(page);

    await page.route("/api/validate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ found: true, content: "# x\n", errors: [], warnings: [] }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# x\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "with-breadcrumb");
  });

  test("with title — light", async ({ page }) => {
    await setLightMode(page);

    await page.route("/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: {}, validation: { passed: true, errors: [] } }),
      }),
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    await elementSnapshot(page.locator(SELECTORS.header), "site-header", "with-title");
  });
});
