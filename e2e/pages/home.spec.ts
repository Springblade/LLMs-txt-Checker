import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  pageSnapshot,
} from "../helpers";

test.describe("Home / Generator Page", () => {

  // ── Generate tab ────────────────────────────────────────────────────────────

  test("Generate tab — default state, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "home-generate", "default");
  });

  test("Generate tab — default state, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "home-generate", "default");
  });

  test("Generate tab — URL input filled, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill("#gen-url", "https://example.com");
    await pageSnapshot(page, "home-generate", "filled");
  });

  test("Generate tab — URL input filled, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.fill("#gen-url", "https://example.com");
    await pageSnapshot(page, "home-generate", "filled");
  });

  test("Generate tab — hover on submit button, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const submit = page.getByRole("button", { name: /generate llms\.txt/i });
    await submit.hover();
    await pageSnapshot(page, "home-generate", "hover-submit");
  });

  test("Generate tab — hover on submit button, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const submit = page.getByRole("button", { name: /generate llms\.txt/i });
    await submit.hover();
    await pageSnapshot(page, "home-generate", "hover-submit");
  });

  test("Generate tab — loading state, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Hold the API response pending to capture the loading spinner
    await page.route("/api/generate", (route) => route.abort());
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate llms\.txt/i }).click();
    await page.waitForTimeout(500); // let spinner render

    await pageSnapshot(page, "home-generate", "loading");
  });

  test("Generate tab — loading state, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.route("/api/generate", (route) => route.abort());
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate llms\.txt/i }).click();
    await page.waitForTimeout(500);

    await pageSnapshot(page, "home-generate", "loading");
  });

  test("Generate tab — error state (network failure), light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.route("/api/generate", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: "Server error" }) }),
    );
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate llms\.txt/i }).click();
    await page.waitForTimeout(500);

    await pageSnapshot(page, "home-generate", "error");
  });

  test("Generate tab — error state (network failure), dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.route("/api/generate", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: "Server error" }) }),
    );
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate llms\.txt/i }).click();
    await page.waitForTimeout(500);

    await pageSnapshot(page, "home-generate", "error");
  });

  // ── Analyze tab ─────────────────────────────────────────────────────────────

  test("Analyze tab — default, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /analyze/i }).click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "home-analyze", "default");
  });

  test("Analyze tab — default, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /analyze/i }).click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "home-analyze", "default");
  });

  test("Analyze tab — URL filled, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /analyze/i }).click();
    await page.fill("#url-input", "https://example.com");

    await pageSnapshot(page, "home-analyze", "filled");
  });

  test("Analyze tab — URL filled, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /analyze/i }).click();
    await page.fill("#url-input", "https://example.com");

    await pageSnapshot(page, "home-analyze", "filled");
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

    await pageSnapshot(page, "home-analyze", "loading");
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

    await pageSnapshot(page, "home-analyze", "loading");
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

    await pageSnapshot(page, "home-analyze", "error");
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

    await pageSnapshot(page, "home-analyze", "error");
  });

  // ── Validate Text tab ──────────────────────────────────────────────────────

  test("Validate Text tab — default, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /validate text/i }).click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "home-validate-text", "default");
  });

  test("Validate Text tab — default, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /validate text/i }).click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "home-validate-text", "default");
  });

  test("Validate Text tab — textarea filled, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# Example\n\nhttps://example.com\n");

    await pageSnapshot(page, "home-validate-text", "filled");
  });

  test("Validate Text tab — textarea filled, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /validate text/i }).click();
    await page.fill("#content-textarea", "# Example\n\nhttps://example.com\n");

    await pageSnapshot(page, "home-validate-text", "filled");
  });

  test("Validate Text tab — loading, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /validate text/i }).click();
    await page.route("/api/validate-text", (route) => route.abort());
    await page.fill("#content-textarea", "# Example\n\nhttps://example.com\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForTimeout(500);

    await pageSnapshot(page, "home-validate-text", "loading");
  });

  test("Validate Text tab — loading, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /validate text/i }).click();
    await page.route("/api/validate-text", (route) => route.abort());
    await page.fill("#content-textarea", "# Example\n\nhttps://example.com\n");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForTimeout(500);

    await pageSnapshot(page, "home-validate-text", "loading");
  });

  test("Validate Text tab — error state, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /validate text/i }).click();
    await page.route("/api/validate-text", (route) =>
      route.fulfill({ status: 400, body: JSON.stringify({ found: false, message: "Invalid content", errorCode: "not_llms_txt", errors: [], warnings: [] }) }),
    );
    await page.fill("#content-textarea", "not valid llms.txt content");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForTimeout(500);

    await pageSnapshot(page, "home-validate-text", "error");
  });

  test("Validate Text tab — error state, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /validate text/i }).click();
    await page.route("/api/validate-text", (route) =>
      route.fulfill({ status: 400, body: JSON.stringify({ found: false, message: "Invalid content", errorCode: "not_llms_txt", errors: [], warnings: [] }) }),
    );
    await page.fill("#content-textarea", "not valid llms.txt content");
    await page.getByRole("button", { name: /validate content/i }).click();
    await page.waitForTimeout(500);

    await pageSnapshot(page, "home-validate-text", "error");
  });

  // ── Responsive — Mobile ────────────────────────────────────────────────────

  test("Mobile — Generate tab default, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "home-generate", "default");
  });

  test("Mobile — Generate tab default, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "home-generate", "default");
  });

  test("Mobile — Analyze tab default, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /analyze/i }).click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "home-analyze", "default");
  });

  test("Mobile — Analyze tab default, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /analyze/i }).click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "home-analyze", "default");
  });
});
