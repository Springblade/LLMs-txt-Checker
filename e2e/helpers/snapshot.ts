import type { Page, Locator } from "@playwright/test";
import { mkdir } from "fs/promises";
import path from "path";

// ── Snapshot naming ───────────────────────────────────────────────────────────

export type Viewport = "desktop" | "mobile";
export type ColorMode = "light" | "dark";
// All interaction/data state strings used across the test suite
export type InteractionState =
  | "default"
  | `hover-${string}`
  | `focus-${string}`
  | `active-${string}`
  | `disabled-${string}`
  | "empty"
  | "loading"
  | "error"
  | "success"
  | "not-found"
  | "found"
  | "mixed"
  | "filled"
  | "ok"
  | "warnings"
  | "errors"
  | "with-back"
  | "with-back-title"
  | "with-breadcrumb"
  | "with-title"
  | "details-tab"
  | "preview-tab"
  | "preview-found"
  | "preview-empty"
  | "raw-tab"
  | "raw-found"
  | "raw-empty"
  | "after-back"
  | "all-found"
  | "not-found"
  | "access-denied"
  | "server-error"
  | "timeout"
  | "invalid-response"
  | "http-error"
  | "validation-issues"
  | "hover-copy"
  | "hover-download"
  | "copied"
  | "consistency-errors"
  | "consistency-empty"
  | "hover-back"
  | "error-state"
  | "toggled-dark"
  | "toggled-back"
  | "hover-dark"
  | "hover-logo"
  | "hover-github"
  | "analyze-empty"
  | "analyze-filled"
  | "analyze-loading"
  | "analyze-error"
  | "text-empty"
  | "text-filled"
  | "text-selector"
  | "text-loading"
  | "text-error";

/**
 * Build a snapshot filename from its constituent parts.
 * Pattern: {page-or-component}-{viewport}-{state}-{mode}.png
 */
export function snapshotName(
  pageOrComponent: string,
  viewport: Viewport,
  state: InteractionState | string,
  mode: ColorMode,
): string {
  return `${pageOrComponent}-${viewport}-${state}-${mode}.png`;
}

// ── Storage path ─────────────────────────────────────────────────────────────

const SNAPSHOT_DIR = path.resolve(__dirname, "..", "snapshots");

/**
 * Returns the absolute path where a snapshot file should be saved.
 * Creates the directory if it does not exist.
 */
export async function snapshotPath(name: string): Promise<string> {
  await mkdir(SNAPSHOT_DIR, { recursive: true });
  return path.join(SNAPSHOT_DIR, name);
}

// ── Screenshot helpers ────────────────────────────────────────────────────────

export type ViewportTag = "desktop" | "mobile";

/**
 * Derive the viewport tag from a Playwright project name.
 * e.g. "desktop-dark" → "desktop", "mobile-light" → "mobile"
 */
export function viewportFromProject(projectName: string): ViewportTag {
  if (projectName.startsWith("desktop")) return "desktop";
  return "mobile";
}

/**
 * Derive the color mode tag from a Playwright project name.
 * e.g. "desktop-dark" → "dark", "mobile-light" → "light"
 */
export function colorModeFromProject(projectName: string): ColorMode {
  if (projectName.includes("dark")) return "dark";
  return "light";
}

/**
 * Capture a full-page screenshot with a standardised name.
 *
 * @param page        - Playwright page
 * @param base        - Page/component identifier  (e.g. "home-generate")
 * @param state       - Interaction/data state    (e.g. "default", "loading")
 * @param options     - Extra screenshot options
 */
export async function pageSnapshot(
  page: Page,
  base: string,
  state: InteractionState | string,
  options?: Parameters<typeof page.screenshot>[0],
): Promise<void> {
  const name = buildSnapshotName(page, base, state);
  const filePath = await snapshotPath(name);
  await page.screenshot({ path: filePath, fullPage: true, ...options });
}

/**
 * Capture a screenshot of a specific element with a standardised name.
 *
 * @param locator     - Element to screenshot
 * @param base        - Page/component identifier
 * @param state       - Interaction/data state
 * @param options     - Extra screenshot options
 */
export async function elementSnapshot(
  locator: Locator,
  base: string,
  state: InteractionState | string,
  options?: Parameters<typeof locator.screenshot>[0],
): Promise<void> {
  const page = locator.page();
  const name = buildSnapshotName(page, base, state);
  const filePath = await snapshotPath(name);
  await locator.screenshot({ path: filePath, ...options });
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function buildSnapshotName(
  page: Page,
  base: string,
  state: InteractionState | string,
): string {
  // Attempt to derive project name from browser context metadata.
  // For CI / recorded runs this is set by Playwright's reporter.
  const browserCtx = page.context() as unknown as {
    _options?: { projectName?: string };
    browser?: { _channel?: string };
  };
  const projectName =
    browserCtx._options?.projectName ??
    process.env.PLAYWRIGHT_PROJECT_NAME ??
    inferFromViewport(page);

  const vp = viewportFromProject(projectName);
  const mode = colorModeFromProject(projectName);
  return snapshotName(base, vp, state, mode);
}

function inferFromViewport(page: Page): string {
  // Fallback: derive viewport + color scheme from the live page context
  const vp = page.viewportSize();
  const isDesktop = vp !== null && vp.width >= 768;
  // Color scheme is not directly readable from page, default to light
  return isDesktop ? "desktop-light" : "mobile-light";
}
