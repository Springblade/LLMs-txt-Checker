import { test, expect } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  mockCheckAndFix,
  checkAndFixSuccess,
  checkAndFixWithWarnings,
  checkAndFixWithErrors,
  pageSnapshot,
} from "../helpers";

/**
 * Mount the check-and-fix-result page by setting sessionStorage and navigating.
 */
async function mountResultPage(page: import("@playwright/test").Page, body: object) {
  await page.addInitScript(
    ({ body: b }: { body: object }) => {
      sessionStorage.setItem("check-and-fix-result", JSON.stringify(b));
    },
    { body },
  );
  await page.goto("/check-and-fix-result");
  await page.waitForLoadState("load");
  // Wait for React to hydrate and read from sessionStorage
  await page.waitForFunction(
    () => document.querySelector('[data-testid="result-shell"]') !== null ||
          document.querySelector('pre') !== null ||
          document.body.innerText.length > 50,
    { timeout: 5000 },
  );
}

test.describe("CheckAndFixResult page", () => {
  test.beforeEach(async ({ page }) => {
    // Grant clipboard permissions for copy tests
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  // ── Success states ───────────────────────────────────────────────────────

  test("validated mode — light", async ({ page }) => {
    await setLightMode(page);
    await mountResultPage(page, {
      success: true,
      mode: "validated",
      origin: "https://example.com",
      llmsUrl: "https://example.com/llms.txt",
      content: "# Example Site\n\nhttps://example.com\n",
      fileName: "example-com-llms.txt",
      validation: { passed: true, errors: [], warnings: [] },
      metadata: { pagesFound: 3, pagesCrawled: 3 },
    });

    // Look for badge text "Valid" (exact match to avoid "Validated" breadcrumb)
    const badge = page.locator("span").filter({ hasText: /^Valid$/ }).first();
    await expect(badge).toBeVisible({ timeout: 5000 });
    await pageSnapshot(page, "result", "validated-light", { fullPage: false });
  });

  test("validated mode — dark", async ({ page }) => {
    await setDarkMode(page);
    await mountResultPage(page, {
      success: true,
      mode: "validated",
      origin: "https://example.com",
      llmsUrl: "https://example.com/llms.txt",
      content: "# Example Site\n\nhttps://example.com\n",
      fileName: "example-com-llms.txt",
      validation: { passed: true, errors: [], warnings: [] },
      metadata: { pagesFound: 3, pagesCrawled: 3 },
    });

    const badge = page.locator("span").filter({ hasText: /^Valid$/ }).first();
    await expect(badge).toBeVisible({ timeout: 5000 });
    await pageSnapshot(page, "result", "validated-dark", { fullPage: false });
  });

  test("generated_and_validated — success, no issues", async ({ page }) => {
    await setLightMode(page);
    await mockCheckAndFix(page, checkAndFixSuccess());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    // Badge shows "Generated & Valid"
    const badge = page.locator("span").filter({ hasText: /Generated & Valid/ }).first();
    await expect(badge).toBeVisible({ timeout: 5000 });
    // Copy and Download buttons present
    await expect(page.getByRole("button", { name: /copy/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /download/i })).toBeVisible();
    // File content is displayed
    await expect(page.locator("pre")).toBeVisible();

    await pageSnapshot(page, "result", "success-light", { fullPage: false });
  });

  test("generated_and_validated — success, dark mode", async ({ page }) => {
    await setDarkMode(page);
    await mockCheckAndFix(page, checkAndFixSuccess());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    const badge = page.locator("span").filter({ hasText: /Generated & Valid/ }).first();
    await expect(badge).toBeVisible({ timeout: 5000 });
    await pageSnapshot(page, "result", "success-dark", { fullPage: false });
  });

  // ── Validation issue states ─────────────────────────────────────────────

  test("validation with warnings", async ({ page }) => {
    await setLightMode(page);
    await mockCheckAndFix(page, checkAndFixWithWarnings());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    // Badge shows "Generated with Issues"
    const badge = page.locator("span").filter({ hasText: /Generated with Issues/ }).first();
    await expect(badge).toBeVisible({ timeout: 5000 });
    // Validation report is expanded (has issues)
    await expect(page.getByText(/warnings/i)).toBeVisible();
    // Validation header
    await expect(page.getByText(/validation report/i)).toBeVisible();

    await pageSnapshot(page, "result", "warnings-light", { fullPage: false });
  });

  test("validation with errors", async ({ page }) => {
    await setLightMode(page);
    await mockCheckAndFix(page, checkAndFixWithErrors());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    const badge = page.locator("span").filter({ hasText: /Generated with Issues/ }).first();
    await expect(badge).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/validation report/i)).toBeVisible();
    // Error count shown
    await expect(page.getByText(/\d+ error/i)).toBeVisible();

    await pageSnapshot(page, "result", "errors-light", { fullPage: false });
  });

  // ── Button interactions ────────────────────────────────────────────────────

  test("Copy button click", async ({ page }) => {
    await setLightMode(page);
    await mockCheckAndFix(page, checkAndFixSuccess());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    const copyBtn = page.getByRole("button", { name: /copy/i });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Text changes to "Copied!"
    const copiedText = page.locator("span").filter({ hasText: /^Copied!$/ }).first();
    await expect(copiedText).toBeVisible({ timeout: 3000 });
    await pageSnapshot(page, "result", "copied-light", { fullPage: false });
  });

  test("Copy button hover", async ({ page }) => {
    await setLightMode(page);
    await mockCheckAndFix(page, checkAndFixSuccess());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    const copyBtn = page.getByRole("button", { name: /copy/i });
    await copyBtn.hover();

    await pageSnapshot(page, "result", "hover-copy-light", { fullPage: false });
  });

  test("Download button hover", async ({ page }) => {
    await setLightMode(page);
    await mockCheckAndFix(page, checkAndFixSuccess());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    const downloadBtn = page.getByRole("button", { name: /download/i });
    await downloadBtn.hover();

    await pageSnapshot(page, "result", "hover-download-light", { fullPage: false });
  });

  // ── Validation report expand/collapse ───────────────────────────────────

  test("validation report can be collapsed", async ({ page }) => {
    await setLightMode(page);
    await mockCheckAndFix(page, checkAndFixWithWarnings());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    // Click to collapse
    const reportHeader = page.getByRole("button", { name: /validation report/i });
    await reportHeader.click();

    // Warnings should no longer be visible
    await expect(page.getByText(/file exceeds/i)).not.toBeVisible();
  });

  // ── Back navigation ─────────────────────────────────────────────────────

  test("back button returns to home", async ({ page }) => {
    await setLightMode(page);
    await mockCheckAndFix(page, checkAndFixSuccess());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    // Click back button in header
    await page.getByRole("button", { name: /go back/i }).click();

    await page.waitForURL("/", { timeout: 3000 });
    await expect(page.locator('input[type="url"]')).toBeVisible();
  });

  // ── Next steps section ──────────────────────────────────────────────────

  test("next steps section is visible", async ({ page }) => {
    await setLightMode(page);
    await mockCheckAndFix(page, checkAndFixSuccess());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    await expect(page.getByText(/next steps/i)).toBeVisible();
    await expect(page.getByText(/download.*llms\.txt/i)).toBeVisible();
  });

  // ── File content display ────────────────────────────────────────────────

  test("file content in <pre> tag", async ({ page }) => {
    await setLightMode(page);
    await mockCheckAndFix(page, checkAndFixSuccess());

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator('input[type="url"]').fill("https://example.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/check-and-fix-result", { timeout: 5000 });

    const pre = page.locator("pre");
    await expect(pre).toBeVisible();
    const text = await pre.innerText();
    expect(text.length).toBeGreaterThan(0);
  });
});
