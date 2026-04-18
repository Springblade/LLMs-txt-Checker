# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages\generator-results.spec.ts >> Generator Results Page >> Back button — returns to home, light
- Location: e2e\pages\generator-results.spec.ts:162:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
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
          - generic [ref=e47]: Example Site
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
  74  |       },
  75  |     });
  76  | 
  77  |     await pageSnapshot(page, "generator-results", "validation-issues");
  78  |   });
  79  | 
  80  |   test("Success — validation issues, dark", async ({ page }) => {
  81  |     await setDarkMode(page);
  82  |     await mountGeneratorResults(page, {
  83  |       success: true,
  84  |       content: "# llms.txt\n\nhttps://example.com\n",
  85  |       pagesFound: 10,
  86  |       pagesCrawled: 8,
  87  |       fileName: "llms.txt",
  88  |       metadata: { siteName: "Example Site" },
  89  |       validation: {
  90  |         passed: false,
  91  |         errors: [
  92  |           { rule: "max-lines", message: "File exceeds 2,000 lines", line: 2001 },
  93  |         ],
  94  |       },
  95  |     });
  96  | 
  97  |     await pageSnapshot(page, "generator-results", "validation-issues");
  98  |   });
  99  | 
  100 |   test("Success — hover copy button, light", async ({ page }) => {
  101 |     await setLightMode(page);
  102 |     await mountGeneratorResults(page, {
  103 |       success: true,
  104 |       content: "# llms.txt\n\nhttps://example.com\n",
  105 |       pagesFound: 10,
  106 |       pagesCrawled: 8,
  107 |       fileName: "llms.txt",
  108 |       metadata: { siteName: "Example Site" },
  109 |       validation: { passed: true, errors: [] },
  110 |     });
  111 | 
  112 |     const copyBtn = page.getByRole("button", { name: /copy/i });
  113 |     await copyBtn.hover();
  114 | 
  115 |     await pageSnapshot(page, "generator-results", "hover-copy");
  116 |   });
  117 | 
  118 |   test("Success — hover download button, light", async ({ page }) => {
  119 |     await setLightMode(page);
  120 |     await mountGeneratorResults(page, {
  121 |       success: true,
  122 |       content: "# llms.txt\n\nhttps://example.com\n",
  123 |       pagesFound: 10,
  124 |       pagesCrawled: 8,
  125 |       fileName: "llms.txt",
  126 |       metadata: { siteName: "Example Site" },
  127 |       validation: { passed: true, errors: [] },
  128 |     });
  129 | 
  130 |     const downloadBtn = page.getByRole("button", { name: /download/i });
  131 |     await downloadBtn.hover();
  132 | 
  133 |     await pageSnapshot(page, "generator-results", "hover-download");
  134 |   });
  135 | 
  136 |   test("Success — copy button after click, light", async ({ page }) => {
  137 |     await setLightMode(page);
  138 |     await mountGeneratorResults(page, {
  139 |       success: true,
  140 |       content: "# llms.txt\n\nhttps://example.com\n",
  141 |       pagesFound: 10,
  142 |       pagesCrawled: 8,
  143 |       fileName: "llms.txt",
  144 |       metadata: { siteName: "Example Site" },
  145 |       validation: { passed: true, errors: [] },
  146 |     });
  147 | 
  148 |     // Mock clipboard
  149 |     await page.context().grantPermissions(["clipboard-write", "clipboard-read"]);
  150 |     await page.evaluate(() => {
  151 |       // @ts-expect-error – mock clipboard API
  152 |       navigator.clipboard = { writeText: async () => {} };
  153 |     });
  154 | 
  155 |     const copyBtn = page.getByRole("button", { name: /copy/i });
  156 |     await copyBtn.click();
  157 |     await page.waitForTimeout(300);
  158 | 
  159 |     await pageSnapshot(page, "generator-results", "copied");
  160 |   });
  161 | 
  162 |   test("Back button — returns to home, light", async ({ page }) => {
  163 |     await setLightMode(page);
  164 |     await mountGeneratorResults(page, {
  165 |       success: true,
  166 |       content: "# llms.txt\n\nhttps://example.com\n",
  167 |       pagesFound: 10,
  168 |       pagesCrawled: 8,
  169 |       fileName: "llms.txt",
  170 |       metadata: { siteName: "Example Site" },
  171 |       validation: { passed: true, errors: [] },
  172 |     });
  173 | 
> 174 |     await page.getByRole("button", { name: /new/i }).click();
      |                                                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  175 |     await page.waitForLoadState("networkidle");
  176 | 
  177 |     await pageSnapshot(page, "home-generate", "after-back");
  178 |   });
  179 | 
  180 |   test("Back button — returns to home, dark", async ({ page }) => {
  181 |     await setDarkMode(page);
  182 |     await mountGeneratorResults(page, {
  183 |       success: true,
  184 |       content: "# llms.txt\n\nhttps://example.com\n",
  185 |       pagesFound: 10,
  186 |       pagesCrawled: 8,
  187 |       fileName: "llms.txt",
  188 |       metadata: { siteName: "Example Site" },
  189 |       validation: { passed: true, errors: [] },
  190 |     });
  191 | 
  192 |     await page.getByRole("button", { name: /new/i }).click();
  193 |     await page.waitForLoadState("networkidle");
  194 | 
  195 |     await pageSnapshot(page, "home-generate", "after-back");
  196 |   });
  197 | 
  198 |   // ── Mobile ─────────────────────────────────────────────────────────────────
  199 | 
  200 |   test("Mobile — success state, light", async ({ page }) => {
  201 |     await setLightMode(page);
  202 |     await mountGeneratorResults(page, {
  203 |       success: true,
  204 |       content: "# llms.txt\n\nhttps://example.com\n",
  205 |       pagesFound: 10,
  206 |       pagesCrawled: 8,
  207 |       fileName: "llms.txt",
  208 |       metadata: { siteName: "Example Site" },
  209 |       validation: { passed: true, errors: [] },
  210 |     });
  211 | 
  212 |     await pageSnapshot(page, "generator-results", "success");
  213 |   });
  214 | 
  215 |   test("Mobile — success state, dark", async ({ page }) => {
  216 |     await setDarkMode(page);
  217 |     await mountGeneratorResults(page, {
  218 |       success: true,
  219 |       content: "# llms.txt\n\nhttps://example.com\n",
  220 |       pagesFound: 10,
  221 |       pagesCrawled: 8,
  222 |       fileName: "llms.txt",
  223 |       metadata: { siteName: "Example Site" },
  224 |       validation: { passed: true, errors: [] },
  225 |     });
  226 | 
  227 |     await pageSnapshot(page, "generator-results", "success");
  228 |   });
  229 | });
  230 | 
```