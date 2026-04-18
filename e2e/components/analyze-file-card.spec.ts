import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  elementSnapshot,
} from "../helpers";

/**
 * AnalyzeFileCard has 4 visual states: ok, errors, warnings, notFound.
 * We drive these through the /api/analyze endpoint.
 */

async function mountAnalysisWithCards(page: import("@playwright/test").Page, files: object[]) {
  await page.route("/api/analyze", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        origin: "https://example.com",
        files,
        consistency: { summary: { total: 0, errors: 0, warnings: 0 }, checks: [] },
      }),
    }),
  );
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /analyze/i }).click();
  await page.fill("#url-input", "https://example.com");
  await page.getByRole("button", { name: /analyze url/i }).click();
  await page.waitForURL("**/");
  await page.waitForLoadState("networkidle");
}

const makeFile = (overrides: object) => ({
  name: "llms.txt",
  found: true,
  statusCode: 200,
  contentType: "text/plain",
  content: "# Example\n\nhttps://example.com\n",
  errors: [],
  warnings: [],
  ...overrides,
});

test.describe("AnalyzeFileCard", () => {

  test("State: ok — light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisWithCards(page, [
      makeFile({ name: "llms.txt", found: true, errors: [], warnings: [] }),
    ]);

    const card = page.locator("[class*='card-interactive']").first();
    await elementSnapshot(card, "analyze-file-card", "ok");
  });

  test("State: ok — dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisWithCards(page, [
      makeFile({ name: "llms.txt", found: true, errors: [], warnings: [] }),
    ]);

    const card = page.locator("[class*='card-interactive']").first();
    await elementSnapshot(card, "analyze-file-card", "ok");
  });

  test("State: errors — light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisWithCards(page, [
      makeFile({ name: "llms.txt", found: true, errors: [{ rule: "syntax", message: "Invalid line", line: 3, severity: "error" }], warnings: [] }),
    ]);

    const card = page.locator("[class*='card-interactive']").first();
    await elementSnapshot(card, "analyze-file-card", "errors");
  });

  test("State: errors — dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisWithCards(page, [
      makeFile({ name: "llms.txt", found: true, errors: [{ rule: "syntax", message: "Invalid line", line: 3, severity: "error" }], warnings: [] }),
    ]);

    const card = page.locator("[class*='card-interactive']").first();
    await elementSnapshot(card, "analyze-file-card", "errors");
  });

  test("State: warnings — light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisWithCards(page, [
      makeFile({ name: "llms.txt", found: true, errors: [], warnings: [{ rule: "format", message: "Unrecognised format", line: null, severity: "warning" }] }),
    ]);

    const card = page.locator("[class*='card-interactive']").first();
    await elementSnapshot(card, "analyze-file-card", "warnings");
  });

  test("State: warnings — dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisWithCards(page, [
      makeFile({ name: "llms.txt", found: true, errors: [], warnings: [{ rule: "format", message: "Unrecognised format", line: null, severity: "warning" }] }),
    ]);

    const card = page.locator("[class*='card-interactive']").first();
    await elementSnapshot(card, "analyze-file-card", "warnings");
  });

  test("State: notFound — light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisWithCards(page, [
      makeFile({ name: "llms.txt", found: false, statusCode: 404, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] }),
    ]);

    const card = page.locator("[class*='card-interactive']").first();
    await elementSnapshot(card, "analyze-file-card", "not-found");
  });

  test("State: notFound — dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisWithCards(page, [
      makeFile({ name: "llms.txt", found: false, statusCode: 404, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] }),
    ]);

    const card = page.locator("[class*='card-interactive']").first();
    await elementSnapshot(card, "analyze-file-card", "not-found");
  });

  test("Download button visible for notFound, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisWithCards(page, [
      makeFile({ name: "llms.txt", found: false, statusCode: 404, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] }),
    ]);

    const downloadBtn = page.getByRole("button", { name: /download template/i });
    await downloadBtn.hover();
    await elementSnapshot(downloadBtn, "analyze-file-card", "hover-download");
  });

  // All 10 file type cards
  const FILE_TYPES = [
    "llms.txt", "llm.txt", "ai.txt", "faq-ai.txt", "brand.txt",
    "developer-ai.txt", "llms.html", "robots-ai.txt", "identity.json", "ai.json",
  ];

  for (const fileType of FILE_TYPES) {
    test(`${fileType} — found, light`, async ({ page }) => {
      await setLightMode(page);
      await mountAnalysisWithCards(page, [
        makeFile({ name: fileType, found: true, errors: [], warnings: [] }),
      ]);

      const card = page.locator("[class*='card-interactive']").first();
      await elementSnapshot(card, `analyze-file-card-${fileType}`, "found");
    });

    test(`${fileType} — not found, light`, async ({ page }) => {
      await setLightMode(page);
      await mountAnalysisWithCards(page, [
        makeFile({ name: fileType, found: false, statusCode: 404, content: null, contentType: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] }),
      ]);

      const card = page.locator("[class*='card-interactive']").first();
      await elementSnapshot(card, `analyze-file-card-${fileType}`, "not-found");
    });
  }
});
