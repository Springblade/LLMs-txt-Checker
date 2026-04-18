import type { Page } from "@playwright/test";

/**
 * Force the 'dark' class on <html>.
 * App is dark-only, but e2e tests may still call this for compatibility.
 */
export async function setDarkMode(page: Page): Promise<void> {
  await page.evaluate(() => document.documentElement.classList.add("dark"));
}

/**
 * Remove the 'dark' class from <html>.
 * No-op in dark-only app, but kept for test compatibility.
 */
export async function setLightMode(page: Page): Promise<void> {
  await page.evaluate(() => document.documentElement.classList.remove("dark"));
}

/**
 * Toggle the dark class.
 * Returns "dark" since the app is dark-only.
 */
export async function toggleDarkMode(page: Page): Promise<"dark"> {
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  return "dark";
}

/**
 * Assert that the document has the dark-mode class.
 */
export async function expectDarkMode(
  page: Page,
  expectDark: boolean,
): Promise<void> {
  const isDark = await page.evaluate(
    () => document.documentElement.classList.contains("dark"),
  );
  // @ts-expect-error – expect is a jest-like global available in test context
  expect(isDark).toBe(expectDark);
}
