# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\result-shell.spec.ts >> ResultShell >> with back button and title — light
- Location: e2e\components\result-shell.spec.ts:10:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: /generate/i }) resolved to 2 elements:
    1) <button type="button" class="px-5 py-3 text-sm transition-all duration-150 tab-underline active">…</button> aka getByRole('button', { name: 'Generate', exact: true })
    2) <button type="submit" class="btn-dark px-6 py-3 text-sm flex items-center gap-2 self-start btn-primary">…</button> aka getByRole('button', { name: 'Generate llms.txt' })

Call log:
  - waiting for getByRole('button', { name: /generate/i })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - img "Aivify" [ref=e7]
        - link "View on GitHub" [ref=e9] [cursor=pointer]:
          - /url: https://github.com/wayadv/llms-txt
          - img [ref=e10]
    - generic [ref=e14]:
      - heading "Generate llms.txt" [level=1] [ref=e15]
      - paragraph [ref=e16]: Crawl your website, discover pages, and generate an llms.txt file ready for AI models.
    - generic [ref=e20]:
      - button "Generate" [ref=e21] [cursor=pointer]:
        - generic [ref=e22]:
          - img [ref=e23]
          - text: Generate
      - button "Analyze" [ref=e25] [cursor=pointer]:
        - generic [ref=e26]:
          - img [ref=e27]
          - text: Analyze
      - button "Validate Text" [ref=e29] [cursor=pointer]:
        - generic [ref=e30]:
          - img [ref=e31]
          - text: Validate Text
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]: Website URL
        - textbox "Website URL" [active] [ref=e40]:
          - /placeholder: https://example.com
          - text: https://example.com
      - generic [ref=e41]:
        - generic [ref=e42]: Max URLs to crawl
        - spinbutton "Max URLs to crawl" [ref=e43]: "50"
      - generic [ref=e44]:
        - generic [ref=e45]: Include paths (comma-separated)
        - textbox "Include paths (comma-separated)" [ref=e46]:
          - /placeholder: /docs,/blog,/guides
      - generic [ref=e47]:
        - generic [ref=e48]: Exclude paths (comma-separated)
        - textbox "Exclude paths (comma-separated)" [ref=e49]:
          - /placeholder: /login,/admin,/tmp
      - button "Generate llms.txt" [ref=e50]:
        - img [ref=e51]
        - text: Generate llms.txt
    - contentinfo [ref=e53]:
      - generic [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]: © 2026 Aivify
          - generic [ref=e59]: Open source under MIT License
        - generic [ref=e60]:
          - link "Privacy Policy" [ref=e61] [cursor=pointer]:
            - /url: /privacy
          - link "Terms of Service" [ref=e62] [cursor=pointer]:
            - /url: /terms
  - button "Open Next.js Dev Tools" [ref=e68] [cursor=pointer]:
    - img [ref=e69]
  - alert [ref=e72]
```

# Test source

```ts
  1  | import { test } from "@playwright/test";
  2  | import {
  3  |   setDarkMode,
  4  |   setLightMode,
  5  |   elementSnapshot,
  6  | } from "../helpers";
  7  | 
  8  | test.describe("ResultShell", () => {
  9  | 
  10 |   test("with back button and title — light", async ({ page }) => {
  11 |     await setLightMode(page);
  12 |     await page.route("/api/generate", (route) =>
  13 |       route.fulfill({
  14 |         status: 200,
  15 |         contentType: "application/json",
  16 |         body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: { siteName: "Example" }, validation: { passed: true, errors: [] } }),
  17 |       }),
  18 |     );
  19 | 
  20 |     await page.goto("/");
  21 |     await page.waitForLoadState("networkidle");
  22 |     await page.fill("#gen-url", "https://example.com");
> 23 |     await page.getByRole("button", { name: /generate/i }).click();
     |                                                           ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: /generate/i }) resolved to 2 elements:
  24 |     await page.waitForURL("**/");
  25 |     await page.waitForLoadState("networkidle");
  26 | 
  27 |     const shell = page.locator("main");
  28 |     await elementSnapshot(shell, "result-shell", "with-back-title");
  29 |   });
  30 | 
  31 |   test("with back button and title — dark", async ({ page }) => {
  32 |     await setDarkMode(page);
  33 |     await page.route("/api/generate", (route) =>
  34 |       route.fulfill({
  35 |         status: 200,
  36 |         contentType: "application/json",
  37 |         body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: { siteName: "Example" }, validation: { passed: true, errors: [] } }),
  38 |       }),
  39 |     );
  40 | 
  41 |     await page.goto("/");
  42 |     await page.waitForLoadState("networkidle");
  43 |     await page.fill("#gen-url", "https://example.com");
  44 |     await page.getByRole("button", { name: /generate/i }).click();
  45 |     await page.waitForURL("**/");
  46 |     await page.waitForLoadState("networkidle");
  47 | 
  48 |     const shell = page.locator("main");
  49 |     await elementSnapshot(shell, "result-shell", "with-back-title");
  50 |   });
  51 | 
  52 |   test("error panel — light", async ({ page }) => {
  53 |     await setLightMode(page);
  54 |     await page.route("/api/validate", (route) =>
  55 |       route.fulfill({
  56 |         status: 200,
  57 |         contentType: "application/json",
  58 |         body: JSON.stringify({ found: false, message: "llms.txt not found", errorCode: "not_found", errors: [], warnings: [] }),
  59 |       }),
  60 |     );
  61 | 
  62 |     await page.goto("/");
  63 |     await page.waitForLoadState("networkidle");
  64 |     await page.getByRole("button", { name: /validate text/i }).click();
  65 |     await page.fill("#content-textarea", "# x\n");
  66 |     await page.getByRole("button", { name: /validate content/i }).click();
  67 |     await page.waitForURL("**/");
  68 |     await page.waitForLoadState("networkidle");
  69 | 
  70 |     const shell = page.locator("main");
  71 |     await elementSnapshot(shell, "result-shell", "error");
  72 |   });
  73 | 
  74 |   test("error panel — dark", async ({ page }) => {
  75 |     await setDarkMode(page);
  76 |     await page.route("/api/validate", (route) =>
  77 |       route.fulfill({
  78 |         status: 200,
  79 |         contentType: "application/json",
  80 |         body: JSON.stringify({ found: false, message: "llms.txt not found", errorCode: "not_found", errors: [], warnings: [] }),
  81 |       }),
  82 |     );
  83 | 
  84 |     await page.goto("/");
  85 |     await page.waitForLoadState("networkidle");
  86 |     await page.getByRole("button", { name: /validate text/i }).click();
  87 |     await page.fill("#content-textarea", "# x\n");
  88 |     await page.getByRole("button", { name: /validate content/i }).click();
  89 |     await page.waitForURL("**/");
  90 |     await page.waitForLoadState("networkidle");
  91 | 
  92 |     const shell = page.locator("main");
  93 |     await elementSnapshot(shell, "result-shell", "error");
  94 |   });
  95 | });
  96 | 
```