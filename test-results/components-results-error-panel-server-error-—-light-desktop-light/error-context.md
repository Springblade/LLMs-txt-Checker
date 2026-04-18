# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\results-error-panel.spec.ts >> server_error — light
- Location: e2e\components\results-error-panel.spec.ts:24:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.screenshot: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('main').locator('[class*=\'error\'], [class*=\'panel\'], [class*=\'Error\']').first()

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
  53  |   | "error-state"
  54  |   | "toggled-dark"
  55  |   | "toggled-back"
  56  |   | "hover-dark"
  57  |   | "hover-logo"
  58  |   | "hover-github"
  59  |   | "analyze-empty"
  60  |   | "analyze-filled"
  61  |   | "analyze-loading"
  62  |   | "analyze-error"
  63  |   | "text-empty"
  64  |   | "text-filled"
  65  |   | "text-selector"
  66  |   | "text-loading"
  67  |   | "text-error";
  68  | 
  69  | /**
  70  |  * Build a snapshot filename from its constituent parts.
  71  |  * Pattern: {page-or-component}-{viewport}-{state}-{mode}.png
  72  |  */
  73  | export function snapshotName(
  74  |   pageOrComponent: string,
  75  |   viewport: Viewport,
  76  |   state: InteractionState | string,
  77  |   mode: ColorMode,
  78  | ): string {
  79  |   return `${pageOrComponent}-${viewport}-${state}-${mode}.png`;
  80  | }
  81  | 
  82  | // ── Storage path ─────────────────────────────────────────────────────────────
  83  | 
  84  | const SNAPSHOT_DIR = path.resolve(__dirname, "..", "snapshots");
  85  | 
  86  | /**
  87  |  * Returns the absolute path where a snapshot file should be saved.
  88  |  * Creates the directory if it does not exist.
  89  |  */
  90  | export async function snapshotPath(name: string): Promise<string> {
  91  |   await mkdir(SNAPSHOT_DIR, { recursive: true });
  92  |   return path.join(SNAPSHOT_DIR, name);
  93  | }
  94  | 
  95  | // ── Screenshot helpers ────────────────────────────────────────────────────────
  96  | 
  97  | export type ViewportTag = "desktop" | "mobile";
  98  | 
  99  | /**
  100 |  * Derive the viewport tag from a Playwright project name.
  101 |  * e.g. "desktop-dark" → "desktop", "mobile-light" → "mobile"
  102 |  */
  103 | export function viewportFromProject(projectName: string): ViewportTag {
  104 |   if (projectName.startsWith("desktop")) return "desktop";
  105 |   return "mobile";
  106 | }
  107 | 
  108 | /**
  109 |  * Derive the color mode tag from a Playwright project name.
  110 |  * e.g. "desktop-dark" → "dark", "mobile-light" → "light"
  111 |  */
  112 | export function colorModeFromProject(projectName: string): ColorMode {
  113 |   if (projectName.includes("dark")) return "dark";
  114 |   return "light";
  115 | }
  116 | 
  117 | /**
  118 |  * Capture a full-page screenshot with a standardised name.
  119 |  *
  120 |  * @param page        - Playwright page
  121 |  * @param base        - Page/component identifier  (e.g. "home-generate")
  122 |  * @param state       - Interaction/data state    (e.g. "default", "loading")
  123 |  * @param options     - Extra screenshot options
  124 |  */
  125 | export async function pageSnapshot(
  126 |   page: Page,
  127 |   base: string,
  128 |   state: InteractionState | string,
  129 |   options?: Parameters<typeof page.screenshot>[0],
  130 | ): Promise<void> {
  131 |   const name = buildSnapshotName(page, base, state);
  132 |   const filePath = await snapshotPath(name);
  133 |   await page.screenshot({ path: filePath, fullPage: true, ...options });
  134 | }
  135 | 
  136 | /**
  137 |  * Capture a screenshot of a specific element with a standardised name.
  138 |  *
  139 |  * @param locator     - Element to screenshot
  140 |  * @param base        - Page/component identifier
  141 |  * @param state       - Interaction/data state
  142 |  * @param options     - Extra screenshot options
  143 |  */
  144 | export async function elementSnapshot(
  145 |   locator: Locator,
  146 |   base: string,
  147 |   state: InteractionState | string,
  148 |   options?: Parameters<typeof locator.screenshot>[0],
  149 | ): Promise<void> {
  150 |   const page = locator.page();
  151 |   const name = buildSnapshotName(page, base, state);
  152 |   const filePath = await snapshotPath(name);
> 153 |   await locator.screenshot({ path: filePath, ...options });
      |                 ^ Error: locator.screenshot: Test timeout of 30000ms exceeded.
  154 | }
  155 | 
  156 | // ── Internal helpers ─────────────────────────────────────────────────────────
  157 | 
  158 | function buildSnapshotName(
  159 |   page: Page,
  160 |   base: string,
  161 |   state: InteractionState | string,
  162 | ): string {
  163 |   // Attempt to derive project name from browser context metadata.
  164 |   // For CI / recorded runs this is set by Playwright's reporter.
  165 |   const browserCtx = page.context() as unknown as {
  166 |     _options?: { projectName?: string };
  167 |     browser?: { _channel?: string };
  168 |   };
  169 |   const projectName =
  170 |     browserCtx._options?.projectName ??
  171 |     process.env.PLAYWRIGHT_PROJECT_NAME ??
  172 |     inferFromViewport(page);
  173 | 
  174 |   const vp = viewportFromProject(projectName);
  175 |   const mode = colorModeFromProject(projectName);
  176 |   return snapshotName(base, vp, state, mode);
  177 | }
  178 | 
  179 | function inferFromViewport(page: Page): string {
  180 |   // Fallback: derive viewport + color scheme from the live page context
  181 |   const vp = page.viewportSize();
  182 |   const isDesktop = vp !== null && vp.width >= 768;
  183 |   // Color scheme is not directly readable from page, default to light
  184 |   return isDesktop ? "desktop-light" : "mobile-light";
  185 | }
  186 | 
```