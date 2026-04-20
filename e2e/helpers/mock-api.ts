import type { Page, Route } from "@playwright/test";

// ── Inline type definitions (avoids @/ path alias in e2e context) ─────────────

interface AnalyzeFile {
  name: string;
  found: boolean;
  statusCode: number | null;
  contentType: string | null;
  content: string | null;
  errors: AnalyzeError[];
  warnings: AnalyzeError[];
}

interface AnalyzeError {
  rule: string;
  message: string;
  line: number | null;
  severity: "error" | "warning";
}

interface ConsistencyCheck {
  field: string;
  label: string;
  severity: "error" | "warning";
  sources: { file: string; value: string | null; match: boolean | null }[];
}

interface AnalyzeResult {
  origin: string;
  files: AnalyzeFile[];
  consistency: {
    summary: { total: number; errors: number; warnings: number };
    checks: ConsistencyCheck[];
  };
}

interface ValidationError {
  rule: string;
  message: string;
  line?: number;
  severity: "error" | "warning";
}

interface ValidationResult {
  found: boolean;
  content?: string;
  message?: string;
  errorCode?: string;
  errors: ValidationError[];
  warnings: ValidationError[];
}

interface GeneratorMetadata {
  siteName?: string;
}

interface GeneratorResult {
  success?: boolean;
  content: string;
  pagesFound: number;
  pagesCrawled: number;
  fileName: string;
  metadata: GeneratorMetadata;
  validation: { passed: boolean; errors: ValidationError[] };
}

// ── Mock data factories ──────────────────────────────────────────────────────

export function makeAnalyzeResult(overrides?: Partial<AnalyzeResult>): AnalyzeResult {
  return {
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
    ...overrides,
  };
}

export function makeValidationResult(overrides?: Partial<ValidationResult>): ValidationResult {
  return {
    found: true,
    content: "# Example\n\nhttps://example.com\n",
    errors: [],
    warnings: [],
    ...overrides,
  };
}

export function makeGeneratorResult(overrides?: Partial<GeneratorResult>): GeneratorResult {
  return {
    content: "# llms.txt\n\nhttps://example.com\n",
    pagesFound: 10,
    pagesCrawled: 8,
    fileName: "llms.txt",
    metadata: { siteName: "Example Site" },
    validation: { passed: true, errors: [] },
    ...overrides,
  };
}

// ── Route interceptors ───────────────────────────────────────────────────────

type RouteHandler = (route: Route) => void;

function jsonResponse(body: object, status = 200): RouteHandler {
  return (route) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

/**
 * Intercept the /api/analyze endpoint with a custom handler.
 */
export async function mockAnalyze(
  page: Page,
  handler: RouteHandler = jsonResponse(makeAnalyzeResult()),
): Promise<void> {
  await page.route("/api/analyze", handler);
}

/**
 * Intercept the /api/validate endpoint with a custom handler.
 */
export async function mockValidate(
  page: Page,
  handler: RouteHandler = jsonResponse(makeValidationResult()),
): Promise<void> {
  await page.route("/api/validate", handler);
}

/**
 * Intercept the /api/validate-text endpoint with a custom handler.
 */
export async function mockValidateText(
  page: Page,
  handler: RouteHandler = jsonResponse(makeValidationResult()),
): Promise<void> {
  await page.route("/api/validate-text", handler);
}

/**
 * Intercept the /api/generate endpoint with a custom handler.
 */
export async function mockGenerate(
  page: Page,
  handler: RouteHandler = jsonResponse(makeGeneratorResult()),
): Promise<void> {
  await page.route("/api/generate", handler);
}

// ── Pre-built scenario handlers ─────────────────────────────────────────────

const ALL_FILE_NAMES = [
  "llms.txt", "llm.txt", "ai.txt", "faq-ai.txt", "brand.txt",
  "developer-ai.txt", "llms.html", "robots-ai.txt", "identity.json", "ai.json",
] as const;

/** Returns a successful analyze result with all 10 file types */
export function analyzeSuccess() {
  return jsonResponse(makeAnalyzeResult());
}

/** Returns analyze result with zero files found */
export function analyzeNotFound() {
  return jsonResponse(makeAnalyzeResult({
    files: ALL_FILE_NAMES.map((name) => ({
      name,
      found: false,
      statusCode: 404,
      contentType: null,
      content: null,
      errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" as const }],
      warnings: [],
    })),
  }));
}

/** Returns analyze result with consistency errors */
export function analyzeConsistencyError() {
  return jsonResponse(makeAnalyzeResult({
    consistency: { summary: { total: 2, errors: 2, warnings: 0 }, checks: [] },
  }));
}

/** Returns a validation result where llms.txt is found */
export function validateSuccess() {
  return jsonResponse(makeValidationResult());
}

/** Returns a validation error with the given error code */
export function validateError(errorCode: string, message: string) {
  return jsonResponse({ found: false, message, errorCode, errors: [], warnings: [] });
}

/** Returns a generator result with validation issues */
export function generateWithIssues() {
  return jsonResponse(makeGeneratorResult({
    validation: {
      passed: false,
      errors: [{ rule: "max-lines", message: "File exceeds 2,000 lines", line: 2001, severity: "error" }],
    },
  }));
}

/** Causes the API route to time out */
export function apiTimeout(page: Page, path: string) {
  return page.route(path, () => new Promise(() => {}));
}

// ── Check and Fix mocks ────────────────────────────────────────────────────────

interface CheckAndFixResult {
  success: boolean;
  origin: string;
  content: string;
  fileName: string;
  llmsUrl: string;
  mode: "generated_and_validated" | "validated";
  metadata: { pagesFound?: number; pagesCrawled?: number };
  validation: {
    passed: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
  };
}

export function makeCheckAndFixResult(overrides?: Partial<CheckAndFixResult>): CheckAndFixResult {
  return {
    success: true,
    origin: "https://example.com",
    content: "# llms.txt\n\nhttps://example.com\n",
    fileName: "llms.txt",
    llmsUrl: "https://example.com/llms.txt",
    mode: "generated_and_validated",
    metadata: { pagesFound: 10, pagesCrawled: 8 },
    validation: { passed: true, errors: [], warnings: [] },
    ...overrides,
  };
}

export function checkAndFixSuccess() {
  return jsonResponse(makeCheckAndFixResult());
}

export function checkAndFixWithWarnings() {
  return jsonResponse(makeCheckAndFixResult({
    validation: {
      passed: false,
      errors: [],
      warnings: [
        { rule: "max-lines", message: "File exceeds recommended 500 lines", severity: "warning" },
      ],
    },
  }));
}

export function checkAndFixWithErrors() {
  return jsonResponse(makeCheckAndFixResult({
    validation: {
      passed: false,
      errors: [
        { rule: "no-description", message: "Description line missing after title", severity: "error" },
      ],
      warnings: [],
    },
  }));
}

export function checkAndFixValidated() {
  return jsonResponse(makeCheckAndFixResult({
    mode: "validated",
    metadata: {},
  }));
}

export async function mockCheckAndFix(
  page: Page,
  handler: RouteHandler = checkAndFixSuccess(),
): Promise<void> {
  await page.route("/api/check-and-fix", handler);
}
