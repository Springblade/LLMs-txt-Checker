# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages\results-shell.spec.ts >> Results Shell Route (/results/[id]) >> results shell — with back button and title, light
- Location: e2e\pages\results-shell.spec.ts:49:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /new/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /new/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e12]:
    - banner [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]:
          - button "Go back" [ref=e16] [cursor=pointer]:
            - img [ref=e17]
            - generic [ref=e19]: New
          - generic [ref=e20]: /
          - generic [ref=e21]: Generated
          - img "Aivify" [ref=e23]
          - generic [ref=e24]: /
          - generic [ref=e25]: LLMs.txt Generator
        - link "View on GitHub" [ref=e27] [cursor=pointer]:
          - /url: https://github.com/wayadv/llms-txt
          - img [ref=e28]
    - main [ref=e31]:
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]: "10"
          - generic [ref=e35]: Pages Found
        - generic [ref=e36]:
          - generic [ref=e37]: "8"
          - generic [ref=e38]: Pages Crawled
        - generic [ref=e39]:
          - generic [ref=e40]:
            - generic [ref=e41]: Passed
            - img [ref=e43]
          - generic [ref=e45]: Validation
        - generic [ref=e46]:
          - generic [ref=e47]: Example
          - generic [ref=e48]: Site Name
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]:
            - img [ref=e52]
            - generic [ref=e54]: llms.txt
          - generic [ref=e55]:
            - button "Copy" [ref=e56] [cursor=pointer]:
              - img [ref=e57]
              - text: Copy
            - button "Download" [ref=e59] [cursor=pointer]:
              - img [ref=e60]
              - text: Download
        - generic [ref=e62]: "# llms.txt https://example.com"
      - generic [ref=e63]:
        - heading "Next Steps" [level=3] [ref=e64]
        - list [ref=e65]:
          - listitem [ref=e66]:
            - text: Download the generated
            - code [ref=e67]: llms.txt
            - text: file
          - listitem [ref=e68]:
            - text: "Place it at the root of your website:"
            - code [ref=e69]: https://yoursite.com/llms.txt
          - listitem [ref=e70]: Validate your deployment using the Analyze tab above
    - contentinfo [ref=e71]:
      - generic [ref=e72]:
        - paragraph [ref=e73]: © 2026 Aivify
        - generic [ref=e74]:
          - link "Privacy Policy" [ref=e75] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=e76] [cursor=pointer]:
            - /url: /terms
```

# Test source

```ts
  1   | import { test, expect, type Route } from "@playwright/test";
  2   | import {
  3   |   setDarkMode,
  4   |   setLightMode,
  5   |   pageSnapshot,
  6   | } from "../helpers";
  7   | 
  8   | /**
  9   |  * Tests for the /results/[id] route.
  10  |  * The route is dynamic — we test that ResultShell renders correctly
  11  |  * with all its prop combinations (title, breadcrumb, back button).
  12  |  */
  13  | test.describe("Results Shell Route (/results/[id])", () => {
  14  | 
  15  |   async function mockGenerateSuccess(page: import("@playwright/test").Page) {
  16  |     await page.route("/api/generate", (route: Route) =>
  17  |       route.fulfill({
  18  |         status: 200,
  19  |         contentType: "application/json",
  20  |         body: JSON.stringify({
  21  |           success: true,
  22  |           content: "# llms.txt\n\nhttps://example.com\n",
  23  |           pagesFound: 10,
  24  |           pagesCrawled: 8,
  25  |           fileName: "llms.txt",
  26  |           metadata: { siteName: "Example" },
  27  |           validation: { passed: true, errors: [] },
  28  |         }),
  29  |       }),
  30  |     );
  31  |   }
  32  | 
  33  |   async function mockValidateNotFound(page: import("@playwright/test").Page) {
  34  |     await page.route("/api/validate", (route: Route) =>
  35  |       route.fulfill({
  36  |         status: 200,
  37  |         contentType: "application/json",
  38  |         body: JSON.stringify({
  39  |           found: false,
  40  |           message: "llms.txt file not found at this URL",
  41  |           errorCode: "not_found",
  42  |           errors: [],
  43  |           warnings: [],
  44  |         }),
  45  |       }),
  46  |     );
  47  |   }
  48  | 
  49  |   test("results shell — with back button and title, light", async ({ page }) => {
  50  |     await setLightMode(page);
  51  |     await mockGenerateSuccess(page);
  52  | 
  53  |     await page.goto("/");
  54  |     await page.waitForLoadState("networkidle");
  55  |     await page.fill("#gen-url", "https://example.com");
  56  |     await page.getByRole("button", { name: /generate llms\.txt/i }).click();
  57  |     await page.waitForURL("**/");
  58  |     await page.waitForLoadState("networkidle");
  59  | 
  60  |     const backBtn = page.getByRole("button", { name: /new/i });
> 61  |     await expect(backBtn).toBeVisible();
      |                           ^ Error: expect(locator).toBeVisible() failed
  62  | 
  63  |     await pageSnapshot(page, "results-shell", "default");
  64  |   });
  65  | 
  66  |   test("results shell — with back button and title, dark", async ({ page }) => {
  67  |     await setDarkMode(page);
  68  |     await mockGenerateSuccess(page);
  69  | 
  70  |     await page.goto("/");
  71  |     await page.waitForLoadState("networkidle");
  72  |     await page.fill("#gen-url", "https://example.com");
  73  |     await page.getByRole("button", { name: /generate llms\.txt/i }).click();
  74  |     await page.waitForURL("**/");
  75  |     await page.waitForLoadState("networkidle");
  76  | 
  77  |     await pageSnapshot(page, "results-shell", "default");
  78  |   });
  79  | 
  80  |   test("results shell — error panel with back button, light", async ({ page }) => {
  81  |     await setLightMode(page);
  82  |     await mockValidateNotFound(page);
  83  | 
  84  |     await page.goto("/");
  85  |     await page.waitForLoadState("networkidle");
  86  |     await page.getByRole("button", { name: /validate text/i }).click();
  87  |     await page.fill("#content-textarea", "# test\n");
  88  |     await page.getByRole("button", { name: /validate content/i }).click();
  89  |     await page.waitForURL("**/");
  90  |     await page.waitForLoadState("networkidle");
  91  | 
  92  |     await pageSnapshot(page, "results-shell", "error-state");
  93  |   });
  94  | 
  95  |   test("results shell — error panel with back button, dark", async ({ page }) => {
  96  |     await setDarkMode(page);
  97  |     await mockValidateNotFound(page);
  98  | 
  99  |     await page.goto("/");
  100 |     await page.waitForLoadState("networkidle");
  101 |     await page.getByRole("button", { name: /validate text/i }).click();
  102 |     await page.fill("#content-textarea", "# test\n");
  103 |     await page.getByRole("button", { name: /validate content/i }).click();
  104 |     await page.waitForURL("**/");
  105 |     await page.waitForLoadState("networkidle");
  106 | 
  107 |     await pageSnapshot(page, "results-shell", "error-state");
  108 |   });
  109 | 
  110 |   test("results shell — hover back button, light", async ({ page }) => {
  111 |     await setLightMode(page);
  112 |     await mockGenerateSuccess(page);
  113 | 
  114 |     await page.goto("/");
  115 |     await page.waitForLoadState("networkidle");
  116 |     await page.fill("#gen-url", "https://example.com");
  117 |     await page.getByRole("button", { name: /generate llms\.txt/i }).click();
  118 |     await page.waitForURL("**/");
  119 |     await page.waitForLoadState("networkidle");
  120 | 
  121 |     const backBtn = page.getByRole("button", { name: /new/i });
  122 |     await backBtn.hover();
  123 |     await pageSnapshot(page, "results-shell", "hover-back");
  124 |   });
  125 | 
  126 |   test("results shell — hover back button, dark", async ({ page }) => {
  127 |     await setDarkMode(page);
  128 |     await mockGenerateSuccess(page);
  129 | 
  130 |     await page.goto("/");
  131 |     await page.waitForLoadState("networkidle");
  132 |     await page.fill("#gen-url", "https://example.com");
  133 |     await page.getByRole("button", { name: /generate llms\.txt/i }).click();
  134 |     await page.waitForURL("**/");
  135 |     await page.waitForLoadState("networkidle");
  136 | 
  137 |     const backBtn = page.getByRole("button", { name: /new/i });
  138 |     await backBtn.hover();
  139 |     await pageSnapshot(page, "results-shell", "hover-back");
  140 |   });
  141 | 
  142 |   // ── Mobile ─────────────────────────────────────────────────────────────────
  143 | 
  144 |   test("Mobile — results shell, light", async ({ page }) => {
  145 |     await setLightMode(page);
  146 |     await mockGenerateSuccess(page);
  147 | 
  148 |     await page.goto("/");
  149 |     await page.waitForLoadState("networkidle");
  150 |     await page.fill("#gen-url", "https://example.com");
  151 |     await page.getByRole("button", { name: /generate llms\.txt/i }).click();
  152 |     await page.waitForURL("**/");
  153 |     await page.waitForLoadState("networkidle");
  154 | 
  155 |     await pageSnapshot(page, "results-shell", "default");
  156 |   });
  157 | 
  158 |   test("Mobile — results shell, dark", async ({ page }) => {
  159 |     await setDarkMode(page);
  160 |     await mockGenerateSuccess(page);
  161 | 
```