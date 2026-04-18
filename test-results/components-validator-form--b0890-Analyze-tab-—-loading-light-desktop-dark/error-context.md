# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\validator-form.spec.ts >> ValidatorForm >> Analyze tab — loading, light
- Location: e2e\components\validator-form.spec.ts:52:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.screenshot: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('form').filter({ hasText: /analyzing/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - img "Aivify" [ref=e7]
        - link "View on GitHub" [ref=e9] [cursor=pointer]:
          - /url: https://github.com/wayadv/llms-txt
          - img [ref=e10]
    - generic [ref=e14]:
      - heading "Validate AI Discovery Files" [level=1] [ref=e15]
      - paragraph [ref=e16]: Scan all 10 AI Discovery File formats, validate syntax, check consistency across files, and get actionable insights in seconds.
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
        - button "Analyze" [ref=e39] [cursor=pointer]:
          - generic [ref=e40]:
            - img [ref=e41]
            - text: Analyze
        - button "Validate Text" [ref=e43] [cursor=pointer]:
          - generic [ref=e44]:
            - img [ref=e45]
            - text: Validate Text
      - generic [ref=e47]:
        - generic [ref=e48]: Website URL
        - generic [ref=e49]:
          - generic [ref=e50]:
            - textbox "Website URL" [ref=e51]:
              - /placeholder: https://example.com
              - text: https://example.com
            - paragraph [ref=e52]: Connection error. Please try again.
          - button "Analyze URL" [ref=e53]:
            - img [ref=e54]
            - text: Analyze URL
        - paragraph [ref=e56]: Scans all 10 AI Discovery Files, validates each one, and checks consistency across files.
    - contentinfo [ref=e57]:
      - generic [ref=e60]:
        - generic [ref=e61]:
          - generic [ref=e62]: © 2026 Aivify
          - generic [ref=e63]: Open source under MIT License
        - generic [ref=e64]:
          - link "Privacy Policy" [ref=e65] [cursor=pointer]:
            - /url: /privacy
          - link "Terms of Service" [ref=e66] [cursor=pointer]:
            - /url: /terms
  - button "Open Next.js Dev Tools" [ref=e72] [cursor=pointer]:
    - img [ref=e73]
  - alert [ref=e76]
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