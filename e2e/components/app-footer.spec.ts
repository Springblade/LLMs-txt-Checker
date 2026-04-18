import { test } from "@playwright/test";
import {
  setDarkMode,
  setLightMode,
  elementSnapshot,
} from "../helpers";

test.describe("AppFooter", () => {

  test("light mode", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const footer = page.locator("footer");
    await elementSnapshot(footer, "app-footer", "default");
  });

  test("dark mode", async ({ page }) => {
    await setDarkMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const footer = page.locator("footer");
    await elementSnapshot(footer, "app-footer", "default");
  });

  test("hover Privacy Policy link", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const link = page.getByRole("link", { name: /privacy policy/i });
    await link.hover();
    await elementSnapshot(link, "app-footer", "hover-privacy");
  });

  test("hover Terms link", async ({ page }) => {
    await setLightMode(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const link = page.getByRole("link", { name: /terms/i });
    await link.hover();
    await elementSnapshot(link, "app-footer", "hover-terms");
  });
});
