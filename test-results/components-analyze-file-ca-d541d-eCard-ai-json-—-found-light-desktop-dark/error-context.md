# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\analyze-file-card.spec.ts >> AnalyzeFileCard >> ai.json — found, light
- Location: e2e\components\analyze-file-card.spec.ts:145:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.screenshot: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[class*=\'card-interactive\']').first()

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