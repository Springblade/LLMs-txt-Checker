import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  elementSnapshot,
} from "../helpers";

test.describe("GeneratorForm", () => {

  test("empty — light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const form = page.locator("form").filter({ hasText: /generate llms\.txt/i });
    await elementSnapshot(form, "generator-form", "empty");
  });

  test("empty — dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const form = page.locator("form").filter({ hasText: /generate llms\.txt/i });
    await elementSnapshot(form, "generator-form", "empty");
  });

  test("filled — URL input, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const form = page.locator("form").filter({ hasText: /generate llms\.txt/i });
    await page.fill("#gen-url", "https://example.com");
    await elementSnapshot(form, "generator-form", "filled");
  });

  test("filled — URL input, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const form = page.locator("form").filter({ hasText: /generate llms\.txt/i });
    await page.fill("#gen-url", "https://example.com");
    await elementSnapshot(form, "generator-form", "filled");
  });

  test("focus — URL input, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.focus("#gen-url");
    await elementSnapshot(page.locator("#gen-url"), "generator-form", "focus-url");
  });

  test("focus — URL input, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.focus("#gen-url");
    await elementSnapshot(page.locator("#gen-url"), "generator-form", "focus-url");
  });

  test("hover submit button, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const submit = page.getByRole("button", { name: /generate llms\.txt/i });
    await submit.hover();
    await elementSnapshot(submit, "generator-form", "hover-submit");
  });

  test("hover submit button, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const submit = page.getByRole("button", { name: /generate llms\.txt/i });
    await submit.hover();
    await elementSnapshot(submit, "generator-form", "hover-submit");
  });

  test("loading — spinner visible, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.route("/api/generate", (route) => route.abort());
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form").filter({ hasText: /generating/i });
    await elementSnapshot(form, "generator-form", "loading");
  });

  test("loading — spinner visible, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.route("/api/generate", (route) => route.abort());
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form").filter({ hasText: /generating/i });
    await elementSnapshot(form, "generator-form", "loading");
  });

  test("error — API returns error, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.route("/api/generate", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: "Server error" }) }),
    );
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form");
    await elementSnapshot(form, "generator-form", "error");
  });

  test("error — API returns error, dark", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.route("/api/generate", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: "Server error" }) }),
    );
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForTimeout(500);

    const form = page.locator("form");
    await elementSnapshot(form, "generator-form", "error");
  });

  test("disabled submit while loading, light", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.route("/api/generate", (route) => route.abort());
    await page.fill("#gen-url", "https://example.com");
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForTimeout(200);

    const submit = page.getByRole("button", { name: /generating/i });
    await elementSnapshot(submit, "generator-form", "disabled-submit");
  });
});
