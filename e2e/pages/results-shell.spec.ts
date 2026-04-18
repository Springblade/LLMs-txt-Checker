import { test, expect, type Route } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  pageSnapshot,
} from "../helpers";

/**
 * Tests for the /results/[id] route.
 * The route is dynamic — we test that ResultShell renders correctly
 * with all its prop combinations (title, breadcrumb, back button).
 */
test.describe("Results Shell Route (/results/[id])", () => {

  async function mockGenerateSuccess(page: import("@playwright/test").Page) {
    await page.route("/api/generate", (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          content: "# llms.txt\n\nhttps://example.com\n",
          pagesFound: 10,
          pagesCrawled: 8,
          fileName: "llms.txt",
          metadata: { siteName: "Example" },
          validation: { passed: true, errors: [] },
        }),
      }),
    );
  }

  async function mockValidateNotFound(page: import("@playwright/test").Page) {
    await page.route("/api/validate", (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          found: false,
          message: "llms.txt file not found at this URL",
          errorCode: "not_found",
          errors: [],
          warnings: [],
        }),
      }),
    );
  }

  test("results shell — with back button and title, light", async ({ page }) => {
    await setLightMode(page);
    await mockGenerateSuccess(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate llms\.txt/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    const backBtn = page.getByRole("button", { name: /new/i });
    await expect(backBtn).toBeVisible();

    await pageSnapshot(page, "results-shell", "default");
  });

  test("results shell — with back button and title, dark", async ({ page }) => {
    await setDarkMode(page);
    await mockGenerateSuccess(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate llms\.txt/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "results-shell", "default");
  });

  test("results shell — error panel with back button, light", async ({ page }) => {
    await setLightMode(page);
    await mockValidateNotFound(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# test\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "results-shell", "error-state");
  });

  test("results shell — error panel with back button, dark", async ({ page }) => {
    await setDarkMode(page);
    await mockValidateNotFound(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# test\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "results-shell", "error-state");
  });

  test("results shell — hover back button, light", async ({ page }) => {
    await setLightMode(page);
    await mockGenerateSuccess(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate llms\.txt/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    const backBtn = page.getByRole("button", { name: /new/i });
    await backBtn.hover();
    await pageSnapshot(page, "results-shell", "hover-back");
  });

  test("results shell — hover back button, dark", async ({ page }) => {
    await setDarkMode(page);
    await mockGenerateSuccess(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate llms\.txt/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    const backBtn = page.getByRole("button", { name: /new/i });
    await backBtn.hover();
    await pageSnapshot(page, "results-shell", "hover-back");
  });

  // ── Mobile ─────────────────────────────────────────────────────────────────

  test("Mobile — results shell, light", async ({ page }) => {
    await setLightMode(page);
    await mockGenerateSuccess(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate llms\.txt/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "results-shell", "default");
  });

  test("Mobile — results shell, dark", async ({ page }) => {
    await setDarkMode(page);
    await mockGenerateSuccess(page);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate llms\.txt/i }).click();
    await page.waitForURL("**/");
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "results-shell", "default");
  });
});
