import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  pageSnapshot,
} from "../helpers";

/** Helper to mount the validation results page by intercepting the validate API. */
async function mountValidationResults(page: import("@playwright/test").Page, body: object) {
  await page.route("/api/validate", (route: import("@playwright/test").Route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }),
  );
  await page.route("/api/validate-text", (route: import("@playwright/test").Route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }),
  );
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Switch to validate text tab and submit
  await page.getByRole("button", { name: /validate text/i }).click();
  await page.fill("#content-textarea", "# Example\n\nhttps://example.com\n");
  await page.getByRole("button", { name: /validate content/i }).click();
  await page.waitForURL("**/");
  await page.waitForLoadState("networkidle");
}

test.describe("Validation Results Page", () => {

  test("Result — found state, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: true,
      content: "# Example\n\nhttps://example.com\n",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "found");
  });

  test("Result — found state, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountValidationResults(page, {
      found: true,
      content: "# Example\n\nhttps://example.com\n",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "found");
  });

  test("Result — not_found error, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "llms.txt file not found at this URL",
      errorCode: "not_found",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "not-found");
  });

  test("Result — not_found error, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "llms.txt file not found at this URL",
      errorCode: "not_found",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "not-found");
  });

  test("Result — access_denied error, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "Access denied — this URL requires authentication",
      errorCode: "access_denied",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "access-denied");
  });

  test("Result — access_denied error, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "Access denied — this URL requires authentication",
      errorCode: "access_denied",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "access-denied");
  });

  test("Result — server_error, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "Server error — please try again later",
      errorCode: "server_error",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "server-error");
  });

  test("Result — server_error, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "Server error — please try again later",
      errorCode: "server_error",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "server-error");
  });

  test("Result — timeout error, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "Request timed out",
      errorCode: "timeout",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "timeout");
  });

  test("Result — timeout error, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "Request timed out",
      errorCode: "timeout",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "timeout");
  });

  test("Result — invalid_response error, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "Invalid response received",
      errorCode: "invalid_response",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "invalid-response");
  });

  test("Result — invalid_response error, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "Invalid response received",
      errorCode: "invalid_response",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "invalid-response");
  });

  test("Result — http_error, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "HTTP error 418",
      errorCode: "http_error",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "http-error");
  });

  test("Result — http_error, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "HTTP error 418",
      errorCode: "http_error",
      errors: [],
      warnings: [],
    });

    await pageSnapshot(page, "validator-results", "http-error");
  });

  // ── Tabs within found state ─────────────────────────────────────────────────

  test("Result — found, Details tab, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: true,
      content: "# Example\n\nhttps://example.com\n",
      errors: [],
      warnings: [],
    });

    const detailsTab = page.getByRole("button", { name: /details/i });
    await detailsTab.click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "validator-results", "details-tab");
  });

  test("Result — found, Preview tab, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: true,
      content: "# Example\n\nhttps://example.com\n",
      errors: [],
      warnings: [],
    });

    const previewTab = page.getByRole("button", { name: /preview/i });
    await previewTab.click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "validator-results", "preview-tab");
  });

  test("Result — found, Raw tab, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: true,
      content: "# Example\n\nhttps://example.com\n",
      errors: [],
      warnings: [],
    });

    const rawTab = page.getByRole("button", { name: /raw/i });
    await rawTab.click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "validator-results", "raw-tab");
  });

  test("Result — found, Preview tab (no content), light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "llms.txt was not loaded",
      errorCode: "not_found",
      errors: [],
      warnings: [],
    });

    const previewTab = page.getByRole("button", { name: /preview/i });
    await previewTab.click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "validator-results", "preview-empty");
  });

  test("Result — found, Raw tab (no content), light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: false,
      message: "llms.txt was not loaded",
      errorCode: "not_found",
      errors: [],
      warnings: [],
    });

    const rawTab = page.getByRole("button", { name: /raw/i });
    await rawTab.click();
    await page.waitForTimeout(200);

    await pageSnapshot(page, "validator-results", "raw-empty");
  });

  // ── Back button ─────────────────────────────────────────────────────────────

  test("Result — back button navigates home, light", async ({ page }) => {
    await setLightMode(page);
    await mountValidationResults(page, {
      found: true,
      content: "# Example\n\nhttps://example.com\n",
      errors: [],
      warnings: [],
    });

    await page.getByRole("button", { name: /back/i }).click();
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "home-generate", "after-back");
  });

  test("Result — back button navigates home, dark", async ({ page }) => {
    await setDarkMode(page);
    await mountValidationResults(page, {
      found: true,
      content: "# Example\n\nhttps://example.com\n",
      errors: [],
      warnings: [],
    });

    await page.getByRole("button", { name: /back/i }).click();
    await page.waitForLoadState("networkidle");

    await pageSnapshot(page, "home-generate", "after-back");
  });
});
