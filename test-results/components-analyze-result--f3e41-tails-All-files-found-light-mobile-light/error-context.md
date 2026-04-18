# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\analyze-result-details.spec.ts >> AnalyzeResultDetails >> All files found, light
- Location: e2e\components\analyze-result-details.spec.ts:87:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.screenshot: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('main')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - img "Aivify" [ref=e7]
        - link "View on GitHub" [ref=e9]:
          - /url: https://github.com/wayadv/llms-txt
          - img [ref=e10]
    - generic [ref=e15]:
      - generic [ref=e16]:
        - img [ref=e17]
        - generic [ref=e19]: "Analyzed:"
        - generic [ref=e20]: example.com
      - generic [ref=e22]:
        - generic [ref=e23]:
          - button "Analyze" [ref=e24] [cursor=pointer]:
            - generic [ref=e25]:
              - img [ref=e26]
              - text: Analyze
          - button "Validate Text" [ref=e28] [cursor=pointer]:
            - generic [ref=e29]:
              - img [ref=e30]
              - text: Validate Text
        - generic [ref=e32]:
          - generic [ref=e33]: Website URL
          - generic [ref=e34]:
            - textbox "Website URL" [ref=e36]:
              - /placeholder: https://example.com
              - text: https://example.com
            - button "Analyze URL" [ref=e37]:
              - img [ref=e38]
              - text: Analyze URL
          - paragraph [ref=e40]: Scans all 10 AI Discovery Files, validates each one, and checks consistency across files.
    - generic [ref=e42]:
      - generic [ref=e44]:
        - generic [ref=e45]:
          - generic [ref=e46]:
            - img [ref=e47]
            - generic [ref=e49]: 10/10
            - generic [ref=e50]: Files Found
          - generic [ref=e52]:
            - img [ref=e53]
            - generic [ref=e55]: No Errors
        - paragraph [ref=e56]: https://example.com
      - generic [ref=e57]:
        - heading "AI Discovery Files" [level=2] [ref=e58]
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e62]:
              - paragraph [ref=e63]: llms.txt
              - paragraph [ref=e64]: For main AI discovery file
            - generic [ref=e66]:
              - generic [ref=e67]:
                - paragraph [ref=e68]: FILE
                - paragraph [ref=e69]: llms.txt
              - generic [ref=e70]:
                - paragraph [ref=e71]: STATUS
                - generic [ref=e72]: exists
              - generic [ref=e73]:
                - paragraph [ref=e74]: LENGTH
                - paragraph [ref=e75]: 31 B
              - generic [ref=e76]:
                - paragraph [ref=e77]: LAST-MODIFIED
                - paragraph [ref=e78]: N/A
              - generic [ref=e79]:
                - paragraph [ref=e80]: BUSINESS NAME
                - paragraph [ref=e81]: N/A
              - generic [ref=e82]:
                - paragraph [ref=e83]: BRAND NAME
                - paragraph [ref=e84]: N/A
          - generic [ref=e85]:
            - generic [ref=e87]:
              - paragraph [ref=e88]: llm.txt
              - paragraph [ref=e89]: For redirect compatibility
            - generic [ref=e91]:
              - generic [ref=e92]:
                - paragraph [ref=e93]: FILE
                - paragraph [ref=e94]: llm.txt
              - generic [ref=e95]:
                - paragraph [ref=e96]: STATUS
                - generic [ref=e97]: exists
              - generic [ref=e98]:
                - paragraph [ref=e99]: LENGTH
                - paragraph [ref=e100]: N/A
              - generic [ref=e101]:
                - paragraph [ref=e102]: LAST-MODIFIED
                - paragraph [ref=e103]: N/A
              - generic [ref=e104]:
                - paragraph [ref=e105]: BUSINESS NAME
                - paragraph [ref=e106]: N/A
              - generic [ref=e107]:
                - paragraph [ref=e108]: BRAND NAME
                - paragraph [ref=e109]: N/A
          - generic [ref=e110]:
            - generic [ref=e112]:
              - paragraph [ref=e113]: ai.txt
              - paragraph [ref=e114]: For AI policies and terms
            - generic [ref=e116]:
              - generic [ref=e117]:
                - paragraph [ref=e118]: FILE
                - paragraph [ref=e119]: ai.txt
              - generic [ref=e120]:
                - paragraph [ref=e121]: STATUS
                - generic [ref=e122]: exists
              - generic [ref=e123]:
                - paragraph [ref=e124]: LENGTH
                - paragraph [ref=e125]: 6 B
              - generic [ref=e126]:
                - paragraph [ref=e127]: LAST-MODIFIED
                - paragraph [ref=e128]: N/A
              - generic [ref=e129]:
                - paragraph [ref=e130]: BUSINESS NAME
                - paragraph [ref=e131]: N/A
              - generic [ref=e132]:
                - paragraph [ref=e133]: BRAND NAME
                - paragraph [ref=e134]: N/A
          - generic [ref=e135]:
            - generic [ref=e137]:
              - paragraph [ref=e138]: faq-ai.txt
              - paragraph [ref=e139]: For AI-friendly FAQ responses
            - generic [ref=e141]:
              - generic [ref=e142]:
                - paragraph [ref=e143]: FILE
                - paragraph [ref=e144]: faq-ai.txt
              - generic [ref=e145]:
                - paragraph [ref=e146]: STATUS
                - generic [ref=e147]: exists
              - generic [ref=e148]:
                - paragraph [ref=e149]: LENGTH
                - paragraph [ref=e150]: N/A
              - generic [ref=e151]:
                - paragraph [ref=e152]: LAST-MODIFIED
                - paragraph [ref=e153]: N/A
              - generic [ref=e154]:
                - paragraph [ref=e155]: BUSINESS NAME
                - paragraph [ref=e156]: N/A
              - generic [ref=e157]:
                - paragraph [ref=e158]: BRAND NAME
                - paragraph [ref=e159]: N/A
          - generic [ref=e160]:
            - generic [ref=e162]:
              - paragraph [ref=e163]: brand.txt
              - paragraph [ref=e164]: For AI brand guidelines
            - generic [ref=e166]:
              - generic [ref=e167]:
                - paragraph [ref=e168]: FILE
                - paragraph [ref=e169]: brand.txt
              - generic [ref=e170]:
                - paragraph [ref=e171]: STATUS
                - generic [ref=e172]: exists
              - generic [ref=e173]:
                - paragraph [ref=e174]: LENGTH
                - paragraph [ref=e175]: 9 B
              - generic [ref=e176]:
                - paragraph [ref=e177]: LAST-MODIFIED
                - paragraph [ref=e178]: N/A
              - generic [ref=e179]:
                - paragraph [ref=e180]: BUSINESS NAME
                - paragraph [ref=e181]: N/A
              - generic [ref=e182]:
                - paragraph [ref=e183]: BRAND NAME
                - paragraph [ref=e184]: N/A
          - generic [ref=e185]:
            - generic [ref=e187]:
              - paragraph [ref=e188]: developer-ai.txt
              - paragraph [ref=e189]: For developer documentation
            - generic [ref=e191]:
              - generic [ref=e192]:
                - paragraph [ref=e193]: FILE
                - paragraph [ref=e194]: developer-ai.txt
              - generic [ref=e195]:
                - paragraph [ref=e196]: STATUS
                - generic [ref=e197]: exists
              - generic [ref=e198]:
                - paragraph [ref=e199]: LENGTH
                - paragraph [ref=e200]: N/A
              - generic [ref=e201]:
                - paragraph [ref=e202]: LAST-MODIFIED
                - paragraph [ref=e203]: N/A
              - generic [ref=e204]:
                - paragraph [ref=e205]: BUSINESS NAME
                - paragraph [ref=e206]: N/A
              - generic [ref=e207]:
                - paragraph [ref=e208]: BRAND NAME
                - paragraph [ref=e209]: N/A
          - generic [ref=e210]:
            - generic [ref=e212]:
              - paragraph [ref=e213]: llms.html
              - paragraph [ref=e214]: For HTML-based AI discovery
            - generic [ref=e216]:
              - generic [ref=e217]:
                - paragraph [ref=e218]: FILE
                - paragraph [ref=e219]: llms.html
              - generic [ref=e220]:
                - paragraph [ref=e221]: STATUS
                - generic [ref=e222]: exists
              - generic [ref=e223]:
                - paragraph [ref=e224]: LENGTH
                - paragraph [ref=e225]: N/A
              - generic [ref=e226]:
                - paragraph [ref=e227]: LAST-MODIFIED
                - paragraph [ref=e228]: N/A
              - generic [ref=e229]:
                - paragraph [ref=e230]: BUSINESS NAME
                - paragraph [ref=e231]: N/A
              - generic [ref=e232]:
                - paragraph [ref=e233]: BRAND NAME
                - paragraph [ref=e234]: N/A
          - generic [ref=e235]:
            - generic [ref=e237]:
              - paragraph [ref=e238]: robots-ai.txt
              - paragraph [ref=e239]: For AI crawler access control
            - generic [ref=e241]:
              - generic [ref=e242]:
                - paragraph [ref=e243]: FILE
                - paragraph [ref=e244]: robots-ai.txt
              - generic [ref=e245]:
                - paragraph [ref=e246]: STATUS
                - generic [ref=e247]: exists
              - generic [ref=e248]:
                - paragraph [ref=e249]: LENGTH
                - paragraph [ref=e250]: N/A
              - generic [ref=e251]:
                - paragraph [ref=e252]: LAST-MODIFIED
                - paragraph [ref=e253]: N/A
              - generic [ref=e254]:
                - paragraph [ref=e255]: BUSINESS NAME
                - paragraph [ref=e256]: N/A
              - generic [ref=e257]:
                - paragraph [ref=e258]: BRAND NAME
                - paragraph [ref=e259]: N/A
          - generic [ref=e260]:
            - generic [ref=e262]:
              - paragraph [ref=e263]: identity.json
              - paragraph [ref=e264]: For machine-readable identity
            - generic [ref=e266]:
              - generic [ref=e267]:
                - paragraph [ref=e268]: FILE
                - paragraph [ref=e269]: identity.json
              - generic [ref=e270]:
                - paragraph [ref=e271]: STATUS
                - generic [ref=e272]: exists
              - generic [ref=e273]:
                - paragraph [ref=e274]: LENGTH
                - paragraph [ref=e275]: N/A
              - generic [ref=e276]:
                - paragraph [ref=e277]: LAST-MODIFIED
                - paragraph [ref=e278]: N/A
              - generic [ref=e279]:
                - paragraph [ref=e280]: BUSINESS NAME
                - paragraph [ref=e281]: N/A
              - generic [ref=e282]:
                - paragraph [ref=e283]: BRAND NAME
                - paragraph [ref=e284]: N/A
          - generic [ref=e285]:
            - generic [ref=e287]:
              - paragraph [ref=e288]: ai.json
              - paragraph [ref=e289]: For AI interaction guidelines
            - generic [ref=e291]:
              - generic [ref=e292]:
                - paragraph [ref=e293]: FILE
                - paragraph [ref=e294]: ai.json
              - generic [ref=e295]:
                - paragraph [ref=e296]: STATUS
                - generic [ref=e297]: exists
              - generic [ref=e298]:
                - paragraph [ref=e299]: LENGTH
                - paragraph [ref=e300]: N/A
              - generic [ref=e301]:
                - paragraph [ref=e302]: LAST-MODIFIED
                - paragraph [ref=e303]: N/A
              - generic [ref=e304]:
                - paragraph [ref=e305]: BUSINESS NAME
                - paragraph [ref=e306]: N/A
              - generic [ref=e307]:
                - paragraph [ref=e308]: BRAND NAME
                - paragraph [ref=e309]: N/A
      - generic [ref=e310]:
        - heading "Field Consistency" [level=2] [ref=e311]
        - generic [ref=e312]:
          - generic [ref=e313]:
            - generic [ref=e314]:
              - generic [ref=e315]: Consistency Score
              - generic [ref=e316]: 75%
            - generic [ref=e319]:
              - generic [ref=e320]: 1 error
              - generic [ref=e322]: 2 warnings
          - generic [ref=e325]:
            - generic [ref=e326]:
              - img [ref=e327]
              - generic [ref=e330]: Site Name
            - table [ref=e332]:
              - rowgroup [ref=e333]:
                - row "File Value Status" [ref=e334]:
                  - columnheader "File" [ref=e335]
                  - columnheader "Value" [ref=e336]
                  - columnheader "Status" [ref=e337]
              - rowgroup [ref=e338]:
                - row "llms.txt Example Match" [ref=e339]:
                  - cell "llms.txt" [ref=e340]
                  - cell "Example" [ref=e341]
                  - cell "Match" [ref=e342]:
                    - generic [ref=e343]: Match
                - row "ai.txt not found Not found" [ref=e344]:
                  - cell "ai.txt" [ref=e345]
                  - cell "not found" [ref=e346]
                  - cell "Not found" [ref=e347]:
                    - generic [ref=e348]: Not found
    - contentinfo [ref=e349]:
      - generic [ref=e352]:
        - generic [ref=e353]:
          - generic [ref=e354]: © 2026 Aivify
          - generic [ref=e355]: Open source under MIT License
        - generic [ref=e356]:
          - link "Privacy Policy" [ref=e357]:
            - /url: /privacy
          - link "Terms of Service" [ref=e358]:
            - /url: /terms
  - button "Open Next.js Dev Tools" [ref=e364] [cursor=pointer]:
    - img [ref=e365]
  - alert [ref=e370]
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