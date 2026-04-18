# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\generator-form.spec.ts >> GeneratorForm >> loading — spinner visible, dark
- Location: e2e\components\generator-form.spec.ts:100:7

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
        - link "View on GitHub" [ref=e9]:
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
          - link "Privacy Policy" [ref=e61]:
            - /url: /privacy
          - link "Terms of Service" [ref=e62]:
            - /url: /terms
  - button "Open Next.js Dev Tools" [ref=e68] [cursor=pointer]:
    - img [ref=e69]
  - alert [ref=e74]
```

# Test source

```ts
  7   | 
  8   | test.describe("GeneratorForm", () => {
  9   | 
  10  |   test("empty — light", async ({ page }) => {
  11  |     await setLightMode(page);
  12  |     await page.goto("/");
  13  |     await page.waitForLoadState("networkidle");
  14  | 
  15  |     const form = page.locator("form").filter({ hasText: /generate llms\.txt/i });
  16  |     await elementSnapshot(form, "generator-form", "empty");
  17  |   });
  18  | 
  19  |   test("empty — dark", async ({ page }) => {
  20  |     await setDarkMode(page);
  21  |     await page.goto("/");
  22  |     await page.waitForLoadState("networkidle");
  23  | 
  24  |     const form = page.locator("form").filter({ hasText: /generate llms\.txt/i });
  25  |     await elementSnapshot(form, "generator-form", "empty");
  26  |   });
  27  | 
  28  |   test("filled — URL input, light", async ({ page }) => {
  29  |     await setLightMode(page);
  30  |     await page.goto("/");
  31  |     await page.waitForLoadState("networkidle");
  32  | 
  33  |     const form = page.locator("form").filter({ hasText: /generate llms\.txt/i });
  34  |     await page.fill("#gen-url", "https://example.com");
  35  |     await elementSnapshot(form, "generator-form", "filled");
  36  |   });
  37  | 
  38  |   test("filled — URL input, dark", async ({ page }) => {
  39  |     await setDarkMode(page);
  40  |     await page.goto("/");
  41  |     await page.waitForLoadState("networkidle");
  42  | 
  43  |     const form = page.locator("form").filter({ hasText: /generate llms\.txt/i });
  44  |     await page.fill("#gen-url", "https://example.com");
  45  |     await elementSnapshot(form, "generator-form", "filled");
  46  |   });
  47  | 
  48  |   test("focus — URL input, light", async ({ page }) => {
  49  |     await setLightMode(page);
  50  |     await page.goto("/");
  51  |     await page.waitForLoadState("networkidle");
  52  | 
  53  |     await page.focus("#gen-url");
  54  |     await elementSnapshot(page.locator("#gen-url"), "generator-form", "focus-url");
  55  |   });
  56  | 
  57  |   test("focus — URL input, dark", async ({ page }) => {
  58  |     await setDarkMode(page);
  59  |     await page.goto("/");
  60  |     await page.waitForLoadState("networkidle");
  61  | 
  62  |     await page.focus("#gen-url");
  63  |     await elementSnapshot(page.locator("#gen-url"), "generator-form", "focus-url");
  64  |   });
  65  | 
  66  |   test("hover submit button, light", async ({ page }) => {
  67  |     await setLightMode(page);
  68  |     await page.goto("/");
  69  |     await page.waitForLoadState("networkidle");
  70  | 
  71  |     const submit = page.getByRole("button", { name: /generate llms\.txt/i });
  72  |     await submit.hover();
  73  |     await elementSnapshot(submit, "generator-form", "hover-submit");
  74  |   });
  75  | 
  76  |   test("hover submit button, dark", async ({ page }) => {
  77  |     await setDarkMode(page);
  78  |     await page.goto("/");
  79  |     await page.waitForLoadState("networkidle");
  80  | 
  81  |     const submit = page.getByRole("button", { name: /generate llms\.txt/i });
  82  |     await submit.hover();
  83  |     await elementSnapshot(submit, "generator-form", "hover-submit");
  84  |   });
  85  | 
  86  |   test("loading — spinner visible, light", async ({ page }) => {
  87  |     await setLightMode(page);
  88  |     await page.goto("/");
  89  |     await page.waitForLoadState("networkidle");
  90  | 
  91  |     await page.route("/api/generate", (route) => route.abort());
  92  |     await page.fill("#gen-url", "https://example.com");
  93  |     await page.getByRole("button", { name: /generate/i }).click();
  94  |     await page.waitForTimeout(500);
  95  | 
  96  |     const form = page.locator("form").filter({ hasText: /generating/i });
  97  |     await elementSnapshot(form, "generator-form", "loading");
  98  |   });
  99  | 
  100 |   test("loading — spinner visible, dark", async ({ page }) => {
  101 |     await setDarkMode(page);
  102 |     await page.goto("/");
  103 |     await page.waitForLoadState("networkidle");
  104 | 
  105 |     await page.route("/api/generate", (route) => route.abort());
  106 |     await page.fill("#gen-url", "https://example.com");
> 107 |     await page.getByRole("button", { name: /generate/i }).click();
      |                                                           ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: /generate/i }) resolved to 2 elements:
  108 |     await page.waitForTimeout(500);
  109 | 
  110 |     const form = page.locator("form").filter({ hasText: /generating/i });
  111 |     await elementSnapshot(form, "generator-form", "loading");
  112 |   });
  113 | 
  114 |   test("error — API returns error, light", async ({ page }) => {
  115 |     await setLightMode(page);
  116 |     await page.goto("/");
  117 |     await page.waitForLoadState("networkidle");
  118 | 
  119 |     await page.route("/api/generate", (route) =>
  120 |       route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: "Server error" }) }),
  121 |     );
  122 |     await page.fill("#gen-url", "https://example.com");
  123 |     await page.getByRole("button", { name: /generate/i }).click();
  124 |     await page.waitForTimeout(500);
  125 | 
  126 |     const form = page.locator("form");
  127 |     await elementSnapshot(form, "generator-form", "error");
  128 |   });
  129 | 
  130 |   test("error — API returns error, dark", async ({ page }) => {
  131 |     await setDarkMode(page);
  132 |     await page.goto("/");
  133 |     await page.waitForLoadState("networkidle");
  134 | 
  135 |     await page.route("/api/generate", (route) =>
  136 |       route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: "Server error" }) }),
  137 |     );
  138 |     await page.fill("#gen-url", "https://example.com");
  139 |     await page.getByRole("button", { name: /generate/i }).click();
  140 |     await page.waitForTimeout(500);
  141 | 
  142 |     const form = page.locator("form");
  143 |     await elementSnapshot(form, "generator-form", "error");
  144 |   });
  145 | 
  146 |   test("disabled submit while loading, light", async ({ page }) => {
  147 |     await setLightMode(page);
  148 |     await page.goto("/");
  149 |     await page.waitForLoadState("networkidle");
  150 | 
  151 |     await page.route("/api/generate", (route) => route.abort());
  152 |     await page.fill("#gen-url", "https://example.com");
  153 |     await page.getByRole("button", { name: /generate/i }).click();
  154 |     await page.waitForTimeout(200);
  155 | 
  156 |     const submit = page.getByRole("button", { name: /generating/i });
  157 |     await elementSnapshot(submit, "generator-form", "disabled-submit");
  158 |   });
  159 | });
  160 | 
```