# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\results-error-panel.spec.ts >> access_denied — hover retry button, light
- Location: e2e\components\results-error-panel.spec.ts:80:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.hover: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /check another url/i })

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
            - generic [ref=e19]: Back
          - generic [ref=e20]: /
          - generic [ref=e22]:
            - img [ref=e23]
            - generic [ref=e25]: "Analyzed:"
            - link "llms.txt" [ref=e26] [cursor=pointer]:
              - /url: llms.txt
          - img "Aivify" [ref=e28]
          - generic [ref=e29]: /
          - generic [ref=e30]: LLMs.txt Checker
        - link "View on GitHub" [ref=e32] [cursor=pointer]:
          - /url: https://github.com/wayadv/llms-txt
          - img [ref=e33]
    - main [ref=e36]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - img [ref=e40]
          - text: Open Source
        - link "GitHub" [ref=e42] [cursor=pointer]:
          - /url: https://github.com
          - img [ref=e43]
      - generic [ref=e46]:
        - generic [ref=e47]:
          - button "Details" [ref=e48] [cursor=pointer]
          - button "Preview" [ref=e49] [cursor=pointer]
          - button "Raw" [ref=e50] [cursor=pointer]
        - generic [ref=e53]:
          - generic [ref=e54]:
            - heading "Validation Summary" [level=2] [ref=e55]
            - generic [ref=e56]:
              - generic [ref=e57]:
                - img [ref=e58]
                - generic [ref=e61]:
                  - paragraph [ref=e62]: 1. Markdown Format
                  - paragraph [ref=e63]: Valid Markdown format
              - generic [ref=e64]:
                - img [ref=e65]
                - generic [ref=e68]:
                  - paragraph [ref=e69]: 2. H1 Title
                  - paragraph [ref=e70]: H1 title is present
              - generic [ref=e71]:
                - img [ref=e72]
                - generic [ref=e74]:
                  - paragraph [ref=e75]: 3. Brief Description
                  - paragraph [ref=e76]: Should include a brief project description (blockquote)
              - generic [ref=e77]:
                - img [ref=e78]
                - generic [ref=e80]:
                  - paragraph [ref=e81]: 4. Description Paragraphs
                  - paragraph [ref=e82]: Should have at least 1 detailed paragraph after blockquote
              - generic [ref=e83]:
                - img [ref=e84]
                - generic [ref=e86]:
                  - paragraph [ref=e87]: 5. Project Details
                  - paragraph [ref=e88]: Should have at least 2 headings (H2+) or 3+ links for detailed project description
              - generic [ref=e89]:
                - img [ref=e90]
                - generic [ref=e93]:
                  - paragraph [ref=e94]: 6. File List Format
                  - paragraph [ref=e95]: 0 entries with invalid format
              - generic [ref=e96]:
                - img [ref=e97]
                - generic [ref=e100]:
                  - paragraph [ref=e101]: 7. Link Validation
                  - paragraph [ref=e102]: No links to validate
          - generic [ref=e103]:
            - heading "Validation Details" [level=2] [ref=e104]
            - generic [ref=e105]:
              - generic [ref=e106]:
                - img [ref=e107]
                - generic [ref=e110]: 1. Valid Markdown format
              - generic [ref=e111]:
                - img [ref=e112]
                - generic [ref=e115]: 2. H1 title is present
              - generic [ref=e116]:
                - img [ref=e117]
                - generic [ref=e119]: 3. Should include a brief project description (blockquote)
              - generic [ref=e120]:
                - img [ref=e121]
                - generic [ref=e123]: 4. Should have at least 1 detailed paragraph after blockquote
              - generic [ref=e124]:
                - img [ref=e125]
                - generic [ref=e127]: 5. Should have at least 2 headings (H2+) or 3+ links for detailed project description
              - generic [ref=e128]:
                - img [ref=e129]
                - generic [ref=e132]: 6. 0 entries with invalid format
              - generic [ref=e133]:
                - img [ref=e134]
                - generic [ref=e137]: 7. No links to validate
    - contentinfo [ref=e138]:
      - generic [ref=e139]:
        - paragraph [ref=e140]: © 2026 Aivify
        - generic [ref=e141]:
          - link "Privacy Policy" [ref=e142] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=e143] [cursor=pointer]:
            - /url: /terms
```

# Test source

```ts
  5   |   elementSnapshot,
  6   | } from "../helpers";
  7   | 
  8   | /**
  9   |  * ResultsErrorPanel renders for every errorCode the app produces.
  10  |  * Since it's rendered inside ResultsPage, we drive it via the validate flow.
  11  |  */
  12  | const ERROR_CODES = [
  13  |   { code: "not_found", message: "llms.txt file not found at this URL" },
  14  |   { code: "access_denied", message: "Access denied — this URL requires authentication" },
  15  |   { code: "server_error", message: "Server error — please try again later" },
  16  |   { code: "timeout", message: "Request timed out" },
  17  |   { code: "invalid_response", message: "Invalid response received" },
  18  |   { code: "http_error", message: "HTTP error 418" },
  19  | ] as const;
  20  | 
  21  | for (const error of ERROR_CODES) {
  22  |   const stateName = error.code.replace(/_/g, "-");
  23  | 
  24  |   test(`${error.code} — light`, async ({ page }) => {
  25  |     await setLightMode(page);
  26  |     await page.route("/api/validate", (route) =>
  27  |       route.fulfill({
  28  |         status: 200,
  29  |         contentType: "application/json",
  30  |         body: JSON.stringify({
  31  |           found: false,
  32  |           message: error.message,
  33  |           errorCode: error.code,
  34  |           errors: [],
  35  |           warnings: [],
  36  |         }),
  37  |       }),
  38  |     );
  39  | 
  40  |     await page.goto("/");
  41  |     await page.waitForLoadState("networkidle");
  42  |     await page.getByRole("button", { name: /validate text/i }).click();
  43  |     await page.fill("#content-textarea", "# x\n");
  44  |     await page.getByRole("button", { name: /validate content/i }).click();
  45  |     await page.waitForURL("**/");
  46  |     await page.waitForLoadState("networkidle");
  47  | 
  48  |     const panel = page.locator("main").locator("[class*='error'], [class*='panel'], [class*='Error']").first();
  49  |     await elementSnapshot(panel, "results-error-panel", stateName);
  50  |   });
  51  | 
  52  |   test(`${error.code} — dark`, async ({ page }) => {
  53  |     await setDarkMode(page);
  54  |     await page.route("/api/validate", (route) =>
  55  |       route.fulfill({
  56  |         status: 200,
  57  |         contentType: "application/json",
  58  |         body: JSON.stringify({
  59  |           found: false,
  60  |           message: error.message,
  61  |           errorCode: error.code,
  62  |           errors: [],
  63  |           warnings: [],
  64  |         }),
  65  |       }),
  66  |     );
  67  | 
  68  |     await page.goto("/");
  69  |     await page.waitForLoadState("networkidle");
  70  |     await page.getByRole("button", { name: /validate text/i }).click();
  71  |     await page.fill("#content-textarea", "# x\n");
  72  |     await page.getByRole("button", { name: /validate content/i }).click();
  73  |     await page.waitForURL("**/");
  74  |     await page.waitForLoadState("networkidle");
  75  | 
  76  |     const panel = page.locator("main").locator("[class*='error'], [class*='panel'], [class*='Error']").first();
  77  |     await elementSnapshot(panel, "results-error-panel", stateName);
  78  |   });
  79  | 
  80  |   test(`${error.code} — hover retry button, light`, async ({ page }) => {
  81  |     await setLightMode(page);
  82  |     await page.route("/api/validate", (route) =>
  83  |       route.fulfill({
  84  |         status: 200,
  85  |         contentType: "application/json",
  86  |         body: JSON.stringify({
  87  |           found: false,
  88  |           message: error.message,
  89  |           errorCode: error.code,
  90  |           errors: [],
  91  |           warnings: [],
  92  |         }),
  93  |       }),
  94  |     );
  95  | 
  96  |     await page.goto("/");
  97  |     await page.waitForLoadState("networkidle");
  98  |     await page.getByRole("button", { name: /validate text/i }).click();
  99  |     await page.fill("#content-textarea", "# x\n");
  100 |     await page.getByRole("button", { name: /validate content/i }).click();
  101 |     await page.waitForURL("**/");
  102 |     await page.waitForLoadState("networkidle");
  103 | 
  104 |     const retryBtn = page.getByRole("button", { name: /check another url/i });
> 105 |     await retryBtn.hover();
      |                    ^ Error: locator.hover: Test timeout of 30000ms exceeded.
  106 |     await elementSnapshot(retryBtn, "results-error-panel", `hover-retry-${stateName}`);
  107 |   });
  108 | }
  109 | 
  110 | test("Open expected file link — light", async ({ page }) => {
  111 |   await setLightMode(page);
  112 |   await page.route("/api/validate", (route) =>
  113 |     route.fulfill({
  114 |       status: 200,
  115 |       contentType: "application/json",
  116 |       body: JSON.stringify({ found: false, message: "not found", errorCode: "not_found", errors: [], warnings: [] }),
  117 |     }),
  118 |   );
  119 | 
  120 |   await page.goto("/");
  121 |   await page.waitForLoadState("networkidle");
  122 |   await page.getByRole("button", { name: /validate text/i }).click();
  123 |   await page.fill("#content-textarea", "# x\n");
  124 |   await page.getByRole("button", { name: /validate content/i }).click();
  125 |   await page.waitForURL("**/");
  126 |   await page.waitForLoadState("networkidle");
  127 | 
  128 |   const link = page.getByRole("link", { name: /open expected file/i });
  129 |   await link.hover();
  130 |   await elementSnapshot(link, "results-error-panel", "hover-open-link");
  131 | });
  132 | 
```