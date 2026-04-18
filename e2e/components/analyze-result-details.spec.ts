import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  elementSnapshot,
} from "../helpers";

const DEFAULT_ANALYZE_RESULT: {
  origin: string;
  files: Array<{
    name: string;
    found: boolean;
    statusCode: number | null;
    contentType: string | null;
    content: string | null;
    errors: Array<{ rule: string; message: string; line: number | null; severity: "error" | "warning" }>;
    warnings: Array<{ rule: string; message: string; line: number | null; severity: "error" | "warning" }>;
  }>;
  consistency: {
    summary: { total: number; errors: number; warnings: number };
    checks: Array<{
      field: string;
      label: string;
      severity: "error" | "warning";
      sources: Array<{ file: string; value: string | null; match: boolean | null }>;
    }>;
  };
} = {
  origin: "https://example.com",
  files: [
    { name: "llms.txt", found: true, statusCode: 200, contentType: "text/plain", content: "# Example\n\nhttps://example.com\n", errors: [], warnings: [] },
    { name: "llm.txt", found: false, statusCode: 404, contentType: null, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] },
    { name: "ai.txt", found: true, statusCode: 200, contentType: "text/plain", content: "# AI\n\n", errors: [], warnings: [{ rule: "format", message: "Unrecognised format", line: null, severity: "warning" }] },
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

async function mountAnalysisDetails(page: import("@playwright/test").Page, body = DEFAULT_ANALYZE_RESULT) {
  await page.route("/api/analyze", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }),
  );
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /analyze/i }).click();
  await page.fill("#url-input", "https://example.com");
  await page.getByRole("button", { name: /analyze url/i }).click();
  await page.waitForURL("**/");
  await page.waitForLoadState("networkidle");
}

test.describe("AnalyzeResultDetails", () => {

  test("Mixed files found, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisDetails(page);

    await elementSnapshot(page.locator("main"), "analyze-result-details", "mixed");
  });

  test("Mixed files found, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisDetails(page);

    await elementSnapshot(page.locator("main"), "analyze-result-details", "mixed");
  });

  test("All files found, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisDetails(page, {
      ...DEFAULT_ANALYZE_RESULT,
      files: DEFAULT_ANALYZE_RESULT.files.map((f) => ({ ...f, found: true, errors: [], warnings: [] })),
    });

    await elementSnapshot(page.locator("main"), "analyze-result-details", "all-found");
  });

  test("All files found, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisDetails(page, {
      ...DEFAULT_ANALYZE_RESULT,
      files: DEFAULT_ANALYZE_RESULT.files.map((f) => ({ ...f, found: true, errors: [], warnings: [] })),
    });

    await elementSnapshot(page.locator("main"), "analyze-result-details", "all-found");
  });

  test("No files found, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisDetails(page, {
      ...DEFAULT_ANALYZE_RESULT,
      files: DEFAULT_ANALYZE_RESULT.files.map((f) => ({
        ...f,
        found: false as const,
        statusCode: (null as unknown) as number | null,
        contentType: (null as unknown) as string | null,
        content: (null as unknown) as string | null,
        errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" as const }],
        warnings: [] as const,
      })),
    });

    await elementSnapshot(page.locator("main"), "analyze-result-details", "not-found");
  });

  test("No files found, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisDetails(page, {
      ...DEFAULT_ANALYZE_RESULT,
      files: DEFAULT_ANALYZE_RESULT.files.map((f) => ({
        ...f,
        found: false as const,
        statusCode: (null as unknown) as number | null,
        contentType: (null as unknown) as string | null,
        content: (null as unknown) as string | null,
        errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" as const }],
        warnings: [] as const,
      })),
    });

    await elementSnapshot(page.locator("main"), "analyze-result-details", "not-found");
  });

  test("Consistency errors, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisDetails(page, {
      ...DEFAULT_ANALYZE_RESULT,
      consistency: {
        summary: { total: 4, errors: 2, warnings: 1 },
        checks: [
          {
            field: "name",
            label: "Site Name",
            severity: "error",
            sources: [
              { file: "llms.txt", value: "Example", match: false },
              { file: "ai.txt", value: "Diff Site", match: false },
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

    await elementSnapshot(page.locator("main"), "analyze-result-details", "consistency-errors");
  });

  test("Consistency errors, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisDetails(page, {
      ...DEFAULT_ANALYZE_RESULT,
      consistency: {
        summary: { total: 4, errors: 2, warnings: 1 },
        checks: [
          {
            field: "name",
            label: "Site Name",
            severity: "error",
            sources: [
              { file: "llms.txt", value: "Example", match: false },
              { file: "ai.txt", value: "Diff Site", match: false },
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

    await elementSnapshot(page.locator("main"), "analyze-result-details", "consistency-errors");
  });

  test("Consistency empty — need 2+ files, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisDetails(page, {
      ...DEFAULT_ANALYZE_RESULT,
      consistency: { summary: { total: 0, errors: 0, warnings: 0 }, checks: [] },
    });

    await elementSnapshot(page.locator("main"), "analyze-result-details", "consistency-empty");
  });

  test("Mobile — mixed files, light", async ({ page }) => {
    await setLightMode(page);
    await mountAnalysisDetails(page);

    await elementSnapshot(page.locator("main"), "analyze-result-details", "mixed");
  });

  test("Mobile — mixed files, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountAnalysisDetails(page);

    await elementSnapshot(page.locator("main"), "analyze-result-details", "mixed");
  });
});
