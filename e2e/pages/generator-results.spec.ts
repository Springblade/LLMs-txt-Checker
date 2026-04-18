import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  pageSnapshot,
} from "../helpers";

/** Helper: mount the generator results page via mocked /api/generate */
async function mountGeneratorResults(
  page: import("@playwright/test").Page,
  body: object,
) {
  await page.route("/api/generate", (route: import("@playwright/test").Route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    }),
  );
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.fill("#gen-url", "https://example.com");
  await page.getByRole("button", { name: /generate llms\.txt/i }).click();
  await page.waitForURL("**/");
  await page.waitForLoadState("networkidle");
}

test.describe("Generator Results Page", () => {

  test("Success — validation passed, light", async ({ page }) => {
    await setLightMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: { passed: true, errors: [] },
    });

    await pageSnapshot(page, "generator-results", "success");
  });

  test("Success — validation passed, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: { passed: true, errors: [] },
    });

    await pageSnapshot(page, "generator-results", "success");
  });

  test("Success — validation issues, light", async ({ page }) => {
    await setLightMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: {
        passed: false,
        errors: [
          { rule: "max-lines", message: "File exceeds 2,000 lines", line: 2001 },
        ],
      },
    });

    await pageSnapshot(page, "generator-results", "validation-issues");
  });

  test("Success — validation issues, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: {
        passed: false,
        errors: [
          { rule: "max-lines", message: "File exceeds 2,000 lines", line: 2001 },
        ],
      },
    });

    await pageSnapshot(page, "generator-results", "validation-issues");
  });

  test("Success — hover copy button, light", async ({ page }) => {
    await setLightMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: { passed: true, errors: [] },
    });

    const copyBtn = page.getByRole("button", { name: /copy/i });
    await copyBtn.hover();

    await pageSnapshot(page, "generator-results", "hover-copy");
  });

  test("Success — hover download button, light", async ({ page }) => {
    await setLightMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: { passed: true, errors: [] },
    });

    const downloadBtn = page.getByRole("button", { name: /download/i });
    await downloadBtn.hover();

    await pageSnapshot(page, "generator-results", "hover-download");
  });

  test("Success — copy button after click, light", async ({ page }) => {
    await setLightMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: { passed: true, errors: [] },
    });

    // Mock clipboard
    await page.context().grantPermissions(["clipboard-write", "clipboard-read"]);
    await page.evaluate(() => {
      // @ts-expect-error – mock clipboard API
      navigator.clipboard = { writeText: async () => {} };
    });

    const copyBtn = page.getByRole("button", { name: /copy/i });
    await copyBtn.click();
    await page.waitForTimeout(300);

    await pageSnapshot(page, "generator-results", "copied");
  });

  test("Back button — returns to home, light", async ({ page }) => {
    await setLightMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: { passed: true, errors: [] },
    });

    await page.getByRole("button", { name: /new/i }).click();
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "home-generate", "after-back");
  });

  test("Back button — returns to home, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: { passed: true, errors: [] },
    });

    await page.getByRole("button", { name: /new/i }).click();
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "home-generate", "after-back");
  });

  // ── Mobile ─────────────────────────────────────────────────────────────────

  test("Mobile — success state, light", async ({ page }) => {
    await setLightMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: { passed: true, errors: [] },
    });

    await pageSnapshot(page, "generator-results", "success");
  });

  test("Mobile — success state, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountGeneratorResults(page, {
      success: true,
      content: "# llms.txt\n\nhttps://example.com\n",
      pagesFound: 10,
      pagesCrawled: 8,
      fileName: "llms.txt",
      metadata: { siteName: "Example Site" },
      validation: { passed: true, errors: [] },
    });

    await pageSnapshot(page, "generator-results", "success");
  });
});
