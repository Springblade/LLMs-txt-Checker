import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  elementSnapshot,
} from "../helpers";

test.describe("ValidatorForm", () => {

  test("Analyze tab — empty, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /analyze/i }).click();
    await page.waitForTimeout(200);

    const form = page.locator("form").filter({ hasText: /analyze url/i });
    await elementSnapshot(form, "validator-form", "analyze-empty");
  });

  test("Analyze tab — empty, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /analyze/i }).click();
    await page.waitForTimeout(200);

    const form = page.locator("form").filter({ hasText: /analyze url/i });
    await elementSnapshot(form, "validator-form", "analyze-empty");
  });

  test("Analyze tab — URL filled, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /analyze/i }).click();
    await page.fill("#url-input", "https://example.com");

    await elementSnapshot(page.locator("#url-input"), "validator-form", "analyze-filled");
  });

  test("Analyze tab — URL filled, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /analyze/i }).click();
    await page.fill("#url-input", "https://example.com");

    await elementSnapshot(page.locator("#url-input"), "validator-form", "analyze-filled");
  });

  test("Analyze tab — loading, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /analyze/i }).click();
    await page.route("/api/analyze", (route) => route.abort());
    await page.fill("#url-input", "https://example.com");
    await page.getByRole("button", { name: /analyze url/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form").filter({ hasText: /analyzing/i });
    await elementSnapshot(form, "validator-form", "analyze-loading");
  });

  test("Analyze tab — loading, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /analyze/i }).click();
    await page.route("/api/analyze", (route) => route.abort());
    await page.fill("#url-input", "https://example.com");
    await page.getByRole("button", { name: /analyze url/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form").filter({ hasText: /analyzing/i });
    await elementSnapshot(form, "validator-form", "analyze-loading");
  });

  test("Analyze tab — error state, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /analyze/i }).click();
    await page.route("/api/analyze", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error" }) }),
    );
    await page.fill("#url-input", "https://example.com");
    await page.getByRole("button", { name: /analyze url/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form");
    await elementSnapshot(form, "validator-form", "analyze-error");
  });

  test("Analyze tab — error state, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /analyze/i }).click();
    await page.route("/api/analyze", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error" }) }),
    );
    await page.fill("#url-input", "https://example.com");
    await page.getByRole("button", { name: /analyze url/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form");
    await elementSnapshot(form, "validator-form", "analyze-error");
  });

  // ── Validate Text tab ──────────────────────────────────────────────────────

  test("Validate Text tab — empty, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.waitForTimeout(200);

    const form = page.locator("form").filter({ hasText: /validate content/i });
    await elementSnapshot(form, "validator-form", "text-empty");
  });

  test("Validate Text tab — empty, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.waitForTimeout(200);

    const form = page.locator("form").filter({ hasText: /validate content/i });
    await elementSnapshot(form, "validator-form", "text-empty");
  });

  test("Validate Text tab — textarea filled, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# Example\n\nhttps://example.com\n");

    await elementSnapshot(page.locator("#content-textarea"), "validator-form", "text-filled");
  });

  test("Validate Text tab — textarea filled, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# Example\n\nhttps://example.com\n");

    await elementSnapshot(page.locator("#content-textarea"), "validator-form", "text-filled");
  });

  test("Validate Text tab — file type selector open, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.locator("#file-type-select").focus();

    await elementSnapshot(page.locator("#file-type-select"), "validator-form", "text-selector");
  });

  test("Validate Text tab — loading, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.route("/api/validate-text", (route) => route.abort());
    await page.fill("#content-textarea", "# x\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form").filter({ hasText: /validating/i });
    await elementSnapshot(form, "validator-form", "text-loading");
  });

  test("Validate Text tab — loading, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.route("/api/validate-text", (route) => route.abort());
    await page.fill("#content-textarea", "# x\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form").filter({ hasText: /validating/i });
    await elementSnapshot(form, "validator-form", "text-loading");
  });

  test("Validate Text tab — error state, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.route("/api/validate-text", (route) =>
      route.fulfill({ status: 400, body: JSON.stringify({ found: false, message: "Invalid content", errorCode: "not_llms_txt", errors: [], warnings: [] }) }),
    );
    await page.fill("#content-textarea", "not valid llms.txt");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form");
    await elementSnapshot(form, "validator-form", "text-error");
  });

  test("Validate Text tab — error state, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /validate text/i }).click();
    await page.route("/api/validate-text", (route) =>
      route.fulfill({ status: 400, body: JSON.stringify({ found: false, message: "Invalid content", errorCode: "not_llms_txt", errors: [], warnings: [] }) }),
    );
    await page.fill("#content-textarea", "not valid llms.txt");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form");
    await elementSnapshot(form, "validator-form", "text-error");
  });
});
