# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\analyze-file-card.spec.ts >> AnalyzeFileCard >> Download button visible for notFound, light
- Location: e2e\components\analyze-file-card.spec.ts:127:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.hover: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /download template/i })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [active]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - navigation [ref=e7]:
            - button "previous" [disabled] [ref=e8]:
              - img "previous" [ref=e9]
            - generic [ref=e11]:
              - generic [ref=e12]: 1/
              - text: "1"
            - button "next" [disabled] [ref=e13]:
              - img "next" [ref=e14]
          - img
        - generic [ref=e16]:
          - link "Next.js 15.5.15 (outdated) Webpack" [ref=e17] [cursor=pointer]:
            - /url: https://nextjs.org/docs/messages/version-staleness
            - img [ref=e18]
            - generic "An outdated version detected (latest is 16.2.4), upgrade is highly recommended!" [ref=e20]: Next.js 15.5.15 (outdated)
            - generic [ref=e21]: Webpack
          - img
      - dialog "Runtime TypeError" [ref=e23]:
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e30]: Runtime TypeError
              - generic [ref=e31]:
                - button "Copy Error Info" [ref=e32] [cursor=pointer]:
                  - img [ref=e33]
                - button "No related documentation found" [disabled] [ref=e35]:
                  - img [ref=e36]
                - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools" [ref=e38] [cursor=pointer]:
                  - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
                  - img [ref=e39]
            - paragraph [ref=e48]: Cannot read properties of undefined (reading 'name')
          - generic [ref=e49]:
            - generic [ref=e50]:
              - paragraph [ref=e52]:
                - img [ref=e54]
                - generic [ref=e57]: src\components\analyze-result-tabs.tsx (258:40) @ eval
                - button "Open in editor" [ref=e58] [cursor=pointer]:
                  - img [ref=e60]
              - generic [ref=e63]:
                - generic [ref=e64]: 256 | <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                - generic [ref=e65]: "257 | {orderedFiles.map((file) => ("
                - generic [ref=e66]: "> 258 | <AnalyzeFileCard key={file.name} file={file} />"
                - generic [ref=e67]: "| ^"
                - generic [ref=e68]: "259 | ))}"
                - generic [ref=e69]: 260 | </div>
                - generic [ref=e70]: 261 | </section>
            - generic [ref=e71]:
              - generic [ref=e72]:
                - paragraph [ref=e73]:
                  - text: Call Stack
                  - generic [ref=e74]: "16"
                - button "Show 12 ignore-listed frame(s)" [ref=e75] [cursor=pointer]:
                  - text: Show 12 ignore-listed frame(s)
                  - img [ref=e76]
              - generic [ref=e78]:
                - generic [ref=e79]:
                  - text: eval
                  - button "Open eval in editor" [ref=e80] [cursor=pointer]:
                    - img [ref=e81]
                - text: src\components\analyze-result-tabs.tsx (258:40)
              - generic [ref=e83]:
                - generic [ref=e84]: Array.map
                - text: <anonymous>
              - generic [ref=e85]:
                - generic [ref=e86]:
                  - text: AnalyzeResultDetails
                  - button "Open AnalyzeResultDetails in editor" [ref=e87] [cursor=pointer]:
                    - img [ref=e88]
                - text: src\components\analyze-result-tabs.tsx (257:25)
              - generic [ref=e90]:
                - generic [ref=e91]:
                  - text: HomePage
                  - button "Open HomePage in editor" [ref=e92] [cursor=pointer]:
                    - img [ref=e93]
                - text: src\app\page.tsx (218:11)
        - generic [ref=e95]:
          - generic [ref=e96]: "1"
          - generic [ref=e97]: "2"
    - generic [ref=e102] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e103]:
        - img [ref=e104]
      - generic [ref=e107]:
        - button "Open issues overlay" [ref=e108]:
          - generic [ref=e109]:
            - generic [ref=e110]: "0"
            - generic [ref=e111]: "1"
          - generic [ref=e112]: Issue
        - button "Collapse issues badge" [ref=e113]:
          - img [ref=e114]
  - 'heading "Application error: a client-side exception has occurred while loading localhost (see the browser console for more information)." [level=2] [ref=e118]'
```

# Test source

```ts
  34  | const makeFile = (overrides: object) => ({
  35  |   name: "llms.txt",
  36  |   found: true,
  37  |   statusCode: 200,
  38  |   contentType: "text/plain",
  39  |   content: "# Example\n\nhttps://example.com\n",
  40  |   errors: [],
  41  |   warnings: [],
  42  |   ...overrides,
  43  | });
  44  | 
  45  | test.describe("AnalyzeFileCard", () => {
  46  | 
  47  |   test("State: ok — light", async ({ page }) => {
  48  |     await setLightMode(page);
  49  |     await mountAnalysisWithCards(page, [
  50  |       makeFile({ name: "llms.txt", found: true, errors: [], warnings: [] }),
  51  |     ]);
  52  | 
  53  |     const card = page.locator("[class*='card-interactive']").first();
  54  |     await elementSnapshot(card, "analyze-file-card", "ok");
  55  |   });
  56  | 
  57  |   test("State: ok — dark", async ({ page }) => {
  58  |     await setDarkMode(page);
  59  |     await mountAnalysisWithCards(page, [
  60  |       makeFile({ name: "llms.txt", found: true, errors: [], warnings: [] }),
  61  |     ]);
  62  | 
  63  |     const card = page.locator("[class*='card-interactive']").first();
  64  |     await elementSnapshot(card, "analyze-file-card", "ok");
  65  |   });
  66  | 
  67  |   test("State: errors — light", async ({ page }) => {
  68  |     await setLightMode(page);
  69  |     await mountAnalysisWithCards(page, [
  70  |       makeFile({ name: "llms.txt", found: true, errors: [{ rule: "syntax", message: "Invalid line", line: 3, severity: "error" }], warnings: [] }),
  71  |     ]);
  72  | 
  73  |     const card = page.locator("[class*='card-interactive']").first();
  74  |     await elementSnapshot(card, "analyze-file-card", "errors");
  75  |   });
  76  | 
  77  |   test("State: errors — dark", async ({ page }) => {
  78  |     await setDarkMode(page);
  79  |     await mountAnalysisWithCards(page, [
  80  |       makeFile({ name: "llms.txt", found: true, errors: [{ rule: "syntax", message: "Invalid line", line: 3, severity: "error" }], warnings: [] }),
  81  |     ]);
  82  | 
  83  |     const card = page.locator("[class*='card-interactive']").first();
  84  |     await elementSnapshot(card, "analyze-file-card", "errors");
  85  |   });
  86  | 
  87  |   test("State: warnings — light", async ({ page }) => {
  88  |     await setLightMode(page);
  89  |     await mountAnalysisWithCards(page, [
  90  |       makeFile({ name: "llms.txt", found: true, errors: [], warnings: [{ rule: "format", message: "Unrecognised format", line: null, severity: "warning" }] }),
  91  |     ]);
  92  | 
  93  |     const card = page.locator("[class*='card-interactive']").first();
  94  |     await elementSnapshot(card, "analyze-file-card", "warnings");
  95  |   });
  96  | 
  97  |   test("State: warnings — dark", async ({ page }) => {
  98  |     await setDarkMode(page);
  99  |     await mountAnalysisWithCards(page, [
  100 |       makeFile({ name: "llms.txt", found: true, errors: [], warnings: [{ rule: "format", message: "Unrecognised format", line: null, severity: "warning" }] }),
  101 |     ]);
  102 | 
  103 |     const card = page.locator("[class*='card-interactive']").first();
  104 |     await elementSnapshot(card, "analyze-file-card", "warnings");
  105 |   });
  106 | 
  107 |   test("State: notFound — light", async ({ page }) => {
  108 |     await setLightMode(page);
  109 |     await mountAnalysisWithCards(page, [
  110 |       makeFile({ name: "llms.txt", found: false, statusCode: 404, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] }),
  111 |     ]);
  112 | 
  113 |     const card = page.locator("[class*='card-interactive']").first();
  114 |     await elementSnapshot(card, "analyze-file-card", "not-found");
  115 |   });
  116 | 
  117 |   test("State: notFound — dark", async ({ page }) => {
  118 |     await setDarkMode(page);
  119 |     await mountAnalysisWithCards(page, [
  120 |       makeFile({ name: "llms.txt", found: false, statusCode: 404, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] }),
  121 |     ]);
  122 | 
  123 |     const card = page.locator("[class*='card-interactive']").first();
  124 |     await elementSnapshot(card, "analyze-file-card", "not-found");
  125 |   });
  126 | 
  127 |   test("Download button visible for notFound, light", async ({ page }) => {
  128 |     await setLightMode(page);
  129 |     await mountAnalysisWithCards(page, [
  130 |       makeFile({ name: "llms.txt", found: false, statusCode: 404, content: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] }),
  131 |     ]);
  132 | 
  133 |     const downloadBtn = page.getByRole("button", { name: /download template/i });
> 134 |     await downloadBtn.hover();
      |                       ^ Error: locator.hover: Test timeout of 30000ms exceeded.
  135 |     await elementSnapshot(downloadBtn, "analyze-file-card", "hover-download");
  136 |   });
  137 | 
  138 |   // All 10 file type cards
  139 |   const FILE_TYPES = [
  140 |     "llms.txt", "llm.txt", "ai.txt", "faq-ai.txt", "brand.txt",
  141 |     "developer-ai.txt", "llms.html", "robots-ai.txt", "identity.json", "ai.json",
  142 |   ];
  143 | 
  144 |   for (const fileType of FILE_TYPES) {
  145 |     test(`${fileType} — found, light`, async ({ page }) => {
  146 |       await setLightMode(page);
  147 |       await mountAnalysisWithCards(page, [
  148 |         makeFile({ name: fileType, found: true, errors: [], warnings: [] }),
  149 |       ]);
  150 | 
  151 |       const card = page.locator("[class*='card-interactive']").first();
  152 |       await elementSnapshot(card, `analyze-file-card-${fileType}`, "found");
  153 |     });
  154 | 
  155 |     test(`${fileType} — not found, light`, async ({ page }) => {
  156 |       await setLightMode(page);
  157 |       await mountAnalysisWithCards(page, [
  158 |         makeFile({ name: fileType, found: false, statusCode: 404, content: null, contentType: null, errors: [{ rule: "file-found", message: "File not found", line: null, severity: "error" }], warnings: [] }),
  159 |       ]);
  160 | 
  161 |       const card = page.locator("[class*='card-interactive']").first();
  162 |       await elementSnapshot(card, `analyze-file-card-${fileType}`, "not-found");
  163 |     });
  164 |   }
  165 | });
  166 | 
```