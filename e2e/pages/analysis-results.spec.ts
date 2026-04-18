import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  pageSnapshot,
} from "../helpers";

/** Helper: mount the analysis results page via mocked /api/analyze */
async function mountAnalysisResults(
  page: import("@playwright/test").Page,
  body: object,
) {
  await page.route("/api/analyze", (route: import("@playwright/test").Route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
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

const defaultAnalyzeResult = {
  origin: "https://example.com",
  files: [
    { name: "llms.txt", found: true, statusCode: 200, contentType: "text/plain", content: "# Example\n\nhttps://example.com\n", errors: [], warnings: [] },
    { name: "llm.txt", found: false, statusCode: 404, contentType: null, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] },
    { name: "ai.txt", found: true, statusCode: 200, contentType: "text/plain", content: "# AI\n\nAllow: /public\n", errors: [], warnings: [{ rule: "format", message: "Unrecognised format", line: null, severity: "warning" }] },
    { name: "faq-ai.txt", found: false, statusCode: 404, contentType: null, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] },
    { name: "brand.txt", found: true, statusCode: 200, contentType: "text/plain", content: "# Brand\n\n", errors: [], warnings: [] },
    { name: "developer-ai.txt", found: false, statusCode: 404, contentType: null, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] },
    { name: "llms.html", found: false, statusCode: 404, contentType: null, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] },
    { name: "robots-ai.txt", found: false, statusCode: 404, contentType: null, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] },
    { name: "identity.json", found: false, statusCode: 404, contentType: null, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] },
    { name: "ai.json", found: false, statusCode: 404, contentType: null, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] },
  ],
  consistency: {
    summary: { total: 4, errors: 1, warnings: 2 },
    checks: [
      {
        field: "name",
        label: "Site Name",
        severity: "error",
        sources: [
          { file: "llms.txt", value: "Example", match: true },
          { file: "ai.txt", value: null, match: false },
        ],
      },
    ],
  },
};

test.describe("Analysis Results Page", () => {

  test("Mixed files found, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisResults(page, defaultAnalyzeResult);

    await pageSnapshot(page, "analysis-results", "mixed");
  });

  test("Mixed files found, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisResults(page, defaultAnalyzeResult);

    await pageSnapshot(page, "analysis-results", "mixed");
  });

  test("No files found, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisResults(page, {
      ...defaultAnalyzeResult,
      files: defaultAnalyzeResult.files.map((f) => ({ ...f, found: false, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [], content: null })),
    });

    await pageSnapshot(page, "analysis-results", "not-found");
  });

  test("No files found, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisResults(page, {
      ...defaultAnalyzeResult,
      files: defaultAnalyzeResult.files.map((f) => ({ ...f, found: false, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [], content: null })),
    });

    await pageSnapshot(page, "analysis-results", "not-found");
  });

  test("All files found, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisResults(page, {
      ...defaultAnalyzeResult,
      files: defaultAnalyzeResult.files.map((f) => ({ ...f, found: true, errors: [], warnings: [] })),
    });

    await pageSnapshot(page, "analysis-results", "all-found");
  });

  test("All files found, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisResults(page, {
      ...defaultAnalyzeResult,
      files: defaultAnalyzeResult.files.map((f) => ({ ...f, found: true, errors: [], warnings: [] })),
    });

    await pageSnapshot(page, "analysis-results", "all-found");
  });

  test("Consistency errors, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisResults(page, {
      ...defaultAnalyzeResult,
      consistency: {
        summary: { total: 4, errors: 2, warnings: 1 },
        checks: [
          {
            field: "name",
            label: "Site Name",
            severity: "error",
            sources: [
              { file: "llms.txt", value: "Example", match: false },
              { file: "ai.txt", value: "Different Site", match: false },
            ],
          },
          {
            field: "url",
            label: "Site URL",
            severity: "warning",
            sources: [
              { file: "llms.txt", value: "https://example.com", match: true },
              { file: "ai.txt", value: null, match: false },
            ],
          },
        ],
      },
    });

    await pageSnapshot(page, "analysis-results", "consistency-errors");
  });

  test("Consistency errors, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisResults(page, {
      ...defaultAnalyzeResult,
      consistency: {
        summary: { total: 4, errors: 2, warnings: 1 },
        checks: [
          {
            field: "name",
            label: "Site Name",
            severity: "error",
            sources: [
              { file: "llms.txt", value: "Example", match: false },
              { file: "ai.txt", value: "Different Site", match: false },
            ],
          },
          {
            field: "url",
            label: "Site URL",
            severity: "warning",
            sources: [
              { file: "llms.txt", value: "https://example.com", match: true },
              { file: "ai.txt", value: null, match: false },
            ],
          },
        ],
      },
    });

    await pageSnapshot(page, "analysis-results", "consistency-errors");
  });

  test("Consistency — need 2+ files for comparison (empty state), light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisResults(page, {
      ...defaultAnalyzeResult,
      consistency: { summary: { total: 0, errors: 0, warnings: 0 }, checks: [] },
    });

    await pageSnapshot(page, "analysis-results", "consistency-empty");
  });

  test("Back button — returns to home, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisResults(page, defaultAnalyzeResult);

    await page.getByRole("button", { name: /back/i }).click();
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "home-generate", "after-back");
  });

  test("Back button — returns to home, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisResults(page, defaultAnalyzeResult);

    await page.getByRole("button", { name: /back/i }).click();
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "home-generate", "after-back");
  });

  // ── Mobile ─────────────────────────────────────────────────────────────────

  test("Mobile — mixed files, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisResults(page, defaultAnalyzeResult);

    await pageSnapshot(page, "analysis-results", "mixed");
  });

  test("Mobile — mixed files, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisResults(page, defaultAnalyzeResult);

    await pageSnapshot(page, "analysis-results", "mixed");
  });
});
