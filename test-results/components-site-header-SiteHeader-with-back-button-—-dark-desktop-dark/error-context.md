# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\site-header.spec.ts >> SiteHeader >> with back button — dark
- Location: e2e\components\site-header.spec.ts:90:7

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
  4   |   setLightMode,
  5   |   elementSnapshot,
  6   | } from "../helpers";
  7   | 
  8   | test.describe("SiteHeader", () => {
  9   | 
  10  |   const SELECTORS = {
  11  |     header: "header",
  12  |     logo: 'img[alt="Aivify"]',
  13  |     githubLink: 'a[aria-label="View on GitHub"]',
  14  |     backButton: 'button[aria-label="Go back"]',
  15  |   };
  16  | 
  17  |   test("default — light", async ({ page }) => {
  18  |     await setLightMode(page);
  19  |     await page.goto("/");
  20  |     await page.waitForLoadState("networkidle");
  21  | 
  22  |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "default");
  23  |   });
  24  | 
  25  |   test("default — dark", async ({ page }) => {
  26  |     await setDarkMode(page);
  27  |     await page.goto("/");
  28  |     await page.waitForLoadState("networkidle");
  29  | 
  30  |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "default");
  31  |   });
  32  | 
  33  |   test("hover logo, light", async ({ page }) => {
  34  |     await setLightMode(page);
  35  |     await page.goto("/");
  36  |     await page.waitForLoadState("networkidle");
  37  | 
  38  |     await page.locator(SELECTORS.logo).hover();
  39  |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "hover-logo");
  40  |   });
  41  | 
  42  |   test("hover logo, dark", async ({ page }) => {
  43  |     await setDarkMode(page);
  44  |     await page.goto("/");
  45  |     await page.waitForLoadState("networkidle");
  46  | 
  47  |     await page.locator(SELECTORS.logo).hover();
  48  |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "hover-logo");
  49  |   });
  50  | 
  51  |   test("hover GitHub link, light", async ({ page }) => {
  52  |     await setLightMode(page);
  53  |     await page.goto("/");
  54  |     await page.waitForLoadState("networkidle");
  55  | 
  56  |     await page.locator(SELECTORS.githubLink).hover();
  57  |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "hover-github");
  58  |   });
  59  | 
  60  |   test("hover GitHub link, dark", async ({ page }) => {
  61  |     await setDarkMode(page);
  62  |     await page.goto("/");
  63  |     await page.waitForLoadState("networkidle");
  64  | 
  65  |     await page.locator(SELECTORS.githubLink).hover();
  66  |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "hover-github");
  67  |   });
  68  | 
  69  |   test("with back button — light", async ({ page }) => {
  70  |     await setLightMode(page);
  71  | 
  72  |     await page.route("/api/generate", (route) =>
  73  |       route.fulfill({
  74  |         status: 200,
  75  |         contentType: "application/json",
  76  |         body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: {}, validation: { passed: true, errors: [] } }),
  77  |       }),
  78  |     );
  79  | 
  80  |     await page.goto("/");
  81  |     await page.waitForLoadState("networkidle");
  82  |     await page.fill("#gen-url", "https://example.com");
  83  |     await page.getByRole("button", { name: /generate/i }).click();
  84  |     await page.waitForURL("**/");
  85  |     await page.waitForLoadState("networkidle");
  86  | 
  87  |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "with-back");
  88  |   });
  89  | 
  90  |   test("with back button — dark", async ({ page }) => {
  91  |     await setDarkMode(page);
  92  | 
  93  |     await page.route("/api/generate", (route) =>
  94  |       route.fulfill({
  95  |         status: 200,
  96  |         contentType: "application/json",
  97  |         body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: {}, validation: { passed: true, errors: [] } }),
  98  |       }),
  99  |     );
  100 | 
  101 |     await page.goto("/");
  102 |     await page.waitForLoadState("networkidle");
  103 |     await page.fill("#gen-url", "https://example.com");
> 104 |     await page.getByRole("button", { name: /generate/i }).click();
      |                                                           ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: /generate/i }) resolved to 2 elements:
  105 |     await page.waitForURL("**/");
  106 |     await page.waitForLoadState("networkidle");
  107 | 
  108 |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "with-back");
  109 |   });
  110 | 
  111 |   test("hover back button — light", async ({ page }) => {
  112 |     await setLightMode(page);
  113 | 
  114 |     await page.route("/api/generate", (route) =>
  115 |       route.fulfill({
  116 |         status: 200,
  117 |         contentType: "application/json",
  118 |         body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: {}, validation: { passed: true, errors: [] } }),
  119 |       }),
  120 |     );
  121 | 
  122 |     await page.goto("/");
  123 |     await page.waitForLoadState("networkidle");
  124 |     await page.fill("#gen-url", "https://example.com");
  125 |     await page.getByRole("button", { name: /generate/i }).click();
  126 |     await page.waitForURL("**/");
  127 |     await page.waitForLoadState("networkidle");
  128 | 
  129 |     await page.locator(SELECTORS.backButton).hover();
  130 |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "hover-back");
  131 |   });
  132 | 
  133 |   test("with breadcrumb — light", async ({ page }) => {
  134 |     await setLightMode(page);
  135 | 
  136 |     await page.route("/api/validate", (route) =>
  137 |       route.fulfill({
  138 |         status: 200,
  139 |         contentType: "application/json",
  140 |         body: JSON.stringify({ found: true, content: "# x\n", errors: [], warnings: [] }),
  141 |       }),
  142 |     );
  143 | 
  144 |     await page.goto("/");
  145 |     await page.waitForLoadState("networkidle");
  146 |     await page.getByRole("button", { name: /validate text/i }).click();
  147 |     await page.fill("#content-textarea", "# x\n");
  148 |     await page.getByRole("button", { name: /validate content/i }).click();
  149 |     await page.waitForURL("**/");
  150 |     await page.waitForLoadState("networkidle");
  151 | 
  152 |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "with-breadcrumb");
  153 |   });
  154 | 
  155 |   test("with title — light", async ({ page }) => {
  156 |     await setLightMode(page);
  157 | 
  158 |     await page.route("/api/generate", (route) =>
  159 |       route.fulfill({
  160 |         status: 200,
  161 |         contentType: "application/json",
  162 |         body: JSON.stringify({ success: true, content: "# x\n", pagesFound: 1, pagesCrawled: 1, fileName: "llms.txt", metadata: {}, validation: { passed: true, errors: [] } }),
  163 |       }),
  164 |     );
  165 | 
  166 |     await page.goto("/");
  167 |     await page.waitForLoadState("networkidle");
  168 |     await page.fill("#gen-url", "https://example.com");
  169 |     await page.getByRole("button", { name: /generate/i }).click();
  170 |     await page.waitForURL("**/");
  171 |     await page.waitForLoadState("networkidle");
  172 | 
  173 |     await elementSnapshot(page.locator(SELECTORS.header), "site-header", "with-title");
  174 |   });
  175 | });
  176 | 
```