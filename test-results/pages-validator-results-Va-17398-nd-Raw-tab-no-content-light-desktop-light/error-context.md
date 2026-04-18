# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages\validator-results.spec.ts >> Validation Results Page >> Result — found, Raw tab (no content), light
- Location: e2e\pages\validator-results.spec.ts:276:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /raw/i })

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
      - generic [ref=e49]:
        - img [ref=e51]
        - generic [ref=e53]:
          - heading "Could not find llms.txt" [level=2] [ref=e54]
          - paragraph [ref=e55]: llms.txt was not loaded
        - paragraph [ref=e57]: llms.txt/llms.txt
        - generic [ref=e58]:
          - button "Check another URL" [ref=e59] [cursor=pointer]:
            - img [ref=e60]
            - text: Check another URL
          - link "Open expected file" [ref=e62] [cursor=pointer]:
            - /url: llms.txt/llms.txt
            - img [ref=e63]
            - text: Open expected file
    - contentinfo [ref=e65]:
      - generic [ref=e66]:
        - paragraph [ref=e67]: © 2026 Aivify
        - generic [ref=e68]:
          - link "Privacy Policy" [ref=e69] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=e70] [cursor=pointer]:
            - /url: /terms
```

# Test source

```ts
  187 |       message: "HTTP error 418",
  188 |       errorCode: "http_error",
  189 |       errors: [],
  190 |       warnings: [],
  191 |     });
  192 | 
  193 |     await pageSnapshot(page, "validator-results", "http-error");
  194 |   });
  195 | 
  196 |   test("Result — http_error, dark", async ({ page }) => {
  197 |     await setDarkMode(page);
  198 |     await mountValidationResults(page, {
  199 |       found: false,
  200 |       message: "HTTP error 418",
  201 |       errorCode: "http_error",
  202 |       errors: [],
  203 |       warnings: [],
  204 |     });
  205 | 
  206 |     await pageSnapshot(page, "validator-results", "http-error");
  207 |   });
  208 | 
  209 |   // ── Tabs within found state ─────────────────────────────────────────────────
  210 | 
  211 |   test("Result — found, Details tab, light", async ({ page }) => {
  212 |     await setLightMode(page);
  213 |     await mountValidationResults(page, {
  214 |       found: true,
  215 |       content: "# Example\n\nhttps://example.com\n",
  216 |       errors: [],
  217 |       warnings: [],
  218 |     });
  219 | 
  220 |     const detailsTab = page.getByRole("button", { name: /details/i });
  221 |     await detailsTab.click();
  222 |     await page.waitForTimeout(200);
  223 | 
  224 |     await pageSnapshot(page, "validator-results", "details-tab");
  225 |   });
  226 | 
  227 |   test("Result — found, Preview tab, light", async ({ page }) => {
  228 |     await setLightMode(page);
  229 |     await mountValidationResults(page, {
  230 |       found: true,
  231 |       content: "# Example\n\nhttps://example.com\n",
  232 |       errors: [],
  233 |       warnings: [],
  234 |     });
  235 | 
  236 |     const previewTab = page.getByRole("button", { name: /preview/i });
  237 |     await previewTab.click();
  238 |     await page.waitForTimeout(200);
  239 | 
  240 |     await pageSnapshot(page, "validator-results", "preview-tab");
  241 |   });
  242 | 
  243 |   test("Result — found, Raw tab, light", async ({ page }) => {
  244 |     await setLightMode(page);
  245 |     await mountValidationResults(page, {
  246 |       found: true,
  247 |       content: "# Example\n\nhttps://example.com\n",
  248 |       errors: [],
  249 |       warnings: [],
  250 |     });
  251 | 
  252 |     const rawTab = page.getByRole("button", { name: /raw/i });
  253 |     await rawTab.click();
  254 |     await page.waitForTimeout(200);
  255 | 
  256 |     await pageSnapshot(page, "validator-results", "raw-tab");
  257 |   });
  258 | 
  259 |   test("Result — found, Preview tab (no content), light", async ({ page }) => {
  260 |     await setLightMode(page);
  261 |     await mountValidationResults(page, {
  262 |       found: false,
  263 |       message: "llms.txt was not loaded",
  264 |       errorCode: "not_found",
  265 |       errors: [],
  266 |       warnings: [],
  267 |     });
  268 | 
  269 |     const previewTab = page.getByRole("button", { name: /preview/i });
  270 |     await previewTab.click();
  271 |     await page.waitForTimeout(200);
  272 | 
  273 |     await pageSnapshot(page, "validator-results", "preview-empty");
  274 |   });
  275 | 
  276 |   test("Result — found, Raw tab (no content), light", async ({ page }) => {
  277 |     await setLightMode(page);
  278 |     await mountValidationResults(page, {
  279 |       found: false,
  280 |       message: "llms.txt was not loaded",
  281 |       errorCode: "not_found",
  282 |       errors: [],
  283 |       warnings: [],
  284 |     });
  285 | 
  286 |     const rawTab = page.getByRole("button", { name: /raw/i });
> 287 |     await rawTab.click();
      |                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  288 |     await page.waitForTimeout(200);
  289 | 
  290 |     await pageSnapshot(page, "validator-results", "raw-empty");
  291 |   });
  292 | 
  293 |   // ── Back button ─────────────────────────────────────────────────────────────
  294 | 
  295 |   test("Result — back button navigates home, light", async ({ page }) => {
  296 |     await setLightMode(page);
  297 |     await mountValidationResults(page, {
  298 |       found: true,
  299 |       content: "# Example\n\nhttps://example.com\n",
  300 |       errors: [],
  301 |       warnings: [],
  302 |     });
  303 | 
  304 |     await page.getByRole("button", { name: /back/i }).click();
  305 |     await page.waitForLoadState("networkidle");
  306 | 
  307 |     await pageSnapshot(page, "home-generate", "after-back");
  308 |   });
  309 | 
  310 |   test("Result — back button navigates home, dark", async ({ page }) => {
  311 |     await setDarkMode(page);
  312 |     await mountValidationResults(page, {
  313 |       found: true,
  314 |       content: "# Example\n\nhttps://example.com\n",
  315 |       errors: [],
  316 |       warnings: [],
  317 |     });
  318 | 
  319 |     await page.getByRole("button", { name: /back/i }).click();
  320 |     await page.waitForLoadState("networkidle");
  321 | 
  322 |     await pageSnapshot(page, "home-generate", "after-back");
  323 |   });
  324 | });
  325 | 
```