# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components\analyze-result-details.spec.ts >> AnalyzeResultDetails >> No files found, light
- Location: e2e\components\analyze-result-details.spec.ts:107:7

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
        - link "View on GitHub" [ref=e9] [cursor=pointer]:
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
            - generic [ref=e49]: 0/10
            - generic [ref=e50]: Files Found
          - generic [ref=e52]:
            - img [ref=e53]
            - generic [ref=e56]: "10"
            - generic [ref=e57]: Errors
        - paragraph [ref=e58]: https://example.com
      - generic [ref=e59]:
        - heading "AI Discovery Files" [level=2] [ref=e60]
        - generic [ref=e61]:
          - generic [ref=e62]:
            - generic [ref=e64]:
              - paragraph [ref=e65]: llms.txt
              - paragraph [ref=e66]: For main AI discovery file
            - generic [ref=e67]:
              - generic [ref=e69]:
                - img [ref=e71]
                - generic [ref=e73]:
                  - paragraph [ref=e74]: This file was not found on the server.
                  - paragraph [ref=e75]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e77] [cursor=pointer]
              - generic [ref=e78]:
                - generic [ref=e79]:
                  - paragraph [ref=e80]: FILE
                  - paragraph [ref=e81]: llms.txt
                - generic [ref=e82]:
                  - paragraph [ref=e83]: STATUS
                  - generic [ref=e84]: not_found
                - generic [ref=e85]:
                  - paragraph [ref=e86]: LENGTH
                  - paragraph [ref=e87]: N/A
                - generic [ref=e88]:
                  - paragraph [ref=e89]: LAST-MODIFIED
                  - paragraph [ref=e90]: N/A
                - generic [ref=e91]:
                  - paragraph [ref=e92]: BUSINESS NAME
                  - paragraph [ref=e93]: N/A
                - generic [ref=e94]:
                  - paragraph [ref=e95]: BRAND NAME
                  - paragraph [ref=e96]: N/A
              - generic [ref=e98]: not_found
          - generic [ref=e99]:
            - generic [ref=e101]:
              - paragraph [ref=e102]: llm.txt
              - paragraph [ref=e103]: For redirect compatibility
            - generic [ref=e104]:
              - generic [ref=e106]:
                - img [ref=e108]
                - generic [ref=e110]:
                  - paragraph [ref=e111]: This file was not found on the server.
                  - paragraph [ref=e112]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e114] [cursor=pointer]
              - generic [ref=e115]:
                - generic [ref=e116]:
                  - paragraph [ref=e117]: FILE
                  - paragraph [ref=e118]: llm.txt
                - generic [ref=e119]:
                  - paragraph [ref=e120]: STATUS
                  - generic [ref=e121]: not_found
                - generic [ref=e122]:
                  - paragraph [ref=e123]: LENGTH
                  - paragraph [ref=e124]: N/A
                - generic [ref=e125]:
                  - paragraph [ref=e126]: LAST-MODIFIED
                  - paragraph [ref=e127]: N/A
                - generic [ref=e128]:
                  - paragraph [ref=e129]: BUSINESS NAME
                  - paragraph [ref=e130]: N/A
                - generic [ref=e131]:
                  - paragraph [ref=e132]: BRAND NAME
                  - paragraph [ref=e133]: N/A
              - generic [ref=e135]: not_found
          - generic [ref=e136]:
            - generic [ref=e138]:
              - paragraph [ref=e139]: ai.txt
              - paragraph [ref=e140]: For AI policies and terms
            - generic [ref=e141]:
              - generic [ref=e143]:
                - img [ref=e145]
                - generic [ref=e147]:
                  - paragraph [ref=e148]: This file was not found on the server.
                  - paragraph [ref=e149]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e151] [cursor=pointer]
              - generic [ref=e152]:
                - generic [ref=e153]:
                  - paragraph [ref=e154]: FILE
                  - paragraph [ref=e155]: ai.txt
                - generic [ref=e156]:
                  - paragraph [ref=e157]: STATUS
                  - generic [ref=e158]: not_found
                - generic [ref=e159]:
                  - paragraph [ref=e160]: LENGTH
                  - paragraph [ref=e161]: N/A
                - generic [ref=e162]:
                  - paragraph [ref=e163]: LAST-MODIFIED
                  - paragraph [ref=e164]: N/A
                - generic [ref=e165]:
                  - paragraph [ref=e166]: BUSINESS NAME
                  - paragraph [ref=e167]: N/A
                - generic [ref=e168]:
                  - paragraph [ref=e169]: BRAND NAME
                  - paragraph [ref=e170]: N/A
              - generic [ref=e172]: not_found
          - generic [ref=e173]:
            - generic [ref=e175]:
              - paragraph [ref=e176]: faq-ai.txt
              - paragraph [ref=e177]: For AI-friendly FAQ responses
            - generic [ref=e178]:
              - generic [ref=e180]:
                - img [ref=e182]
                - generic [ref=e184]:
                  - paragraph [ref=e185]: This file was not found on the server.
                  - paragraph [ref=e186]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e188] [cursor=pointer]
              - generic [ref=e189]:
                - generic [ref=e190]:
                  - paragraph [ref=e191]: FILE
                  - paragraph [ref=e192]: faq-ai.txt
                - generic [ref=e193]:
                  - paragraph [ref=e194]: STATUS
                  - generic [ref=e195]: not_found
                - generic [ref=e196]:
                  - paragraph [ref=e197]: LENGTH
                  - paragraph [ref=e198]: N/A
                - generic [ref=e199]:
                  - paragraph [ref=e200]: LAST-MODIFIED
                  - paragraph [ref=e201]: N/A
                - generic [ref=e202]:
                  - paragraph [ref=e203]: BUSINESS NAME
                  - paragraph [ref=e204]: N/A
                - generic [ref=e205]:
                  - paragraph [ref=e206]: BRAND NAME
                  - paragraph [ref=e207]: N/A
              - generic [ref=e209]: not_found
          - generic [ref=e210]:
            - generic [ref=e212]:
              - paragraph [ref=e213]: brand.txt
              - paragraph [ref=e214]: For AI brand guidelines
            - generic [ref=e215]:
              - generic [ref=e217]:
                - img [ref=e219]
                - generic [ref=e221]:
                  - paragraph [ref=e222]: This file was not found on the server.
                  - paragraph [ref=e223]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e225] [cursor=pointer]
              - generic [ref=e226]:
                - generic [ref=e227]:
                  - paragraph [ref=e228]: FILE
                  - paragraph [ref=e229]: brand.txt
                - generic [ref=e230]:
                  - paragraph [ref=e231]: STATUS
                  - generic [ref=e232]: not_found
                - generic [ref=e233]:
                  - paragraph [ref=e234]: LENGTH
                  - paragraph [ref=e235]: N/A
                - generic [ref=e236]:
                  - paragraph [ref=e237]: LAST-MODIFIED
                  - paragraph [ref=e238]: N/A
                - generic [ref=e239]:
                  - paragraph [ref=e240]: BUSINESS NAME
                  - paragraph [ref=e241]: N/A
                - generic [ref=e242]:
                  - paragraph [ref=e243]: BRAND NAME
                  - paragraph [ref=e244]: N/A
              - generic [ref=e246]: not_found
          - generic [ref=e247]:
            - generic [ref=e249]:
              - paragraph [ref=e250]: developer-ai.txt
              - paragraph [ref=e251]: For developer documentation
            - generic [ref=e252]:
              - generic [ref=e254]:
                - img [ref=e256]
                - generic [ref=e258]:
                  - paragraph [ref=e259]: This file was not found on the server.
                  - paragraph [ref=e260]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e262] [cursor=pointer]
              - generic [ref=e263]:
                - generic [ref=e264]:
                  - paragraph [ref=e265]: FILE
                  - paragraph [ref=e266]: developer-ai.txt
                - generic [ref=e267]:
                  - paragraph [ref=e268]: STATUS
                  - generic [ref=e269]: not_found
                - generic [ref=e270]:
                  - paragraph [ref=e271]: LENGTH
                  - paragraph [ref=e272]: N/A
                - generic [ref=e273]:
                  - paragraph [ref=e274]: LAST-MODIFIED
                  - paragraph [ref=e275]: N/A
                - generic [ref=e276]:
                  - paragraph [ref=e277]: BUSINESS NAME
                  - paragraph [ref=e278]: N/A
                - generic [ref=e279]:
                  - paragraph [ref=e280]: BRAND NAME
                  - paragraph [ref=e281]: N/A
              - generic [ref=e283]: not_found
          - generic [ref=e284]:
            - generic [ref=e286]:
              - paragraph [ref=e287]: llms.html
              - paragraph [ref=e288]: For HTML-based AI discovery
            - generic [ref=e289]:
              - generic [ref=e291]:
                - img [ref=e293]
                - generic [ref=e295]:
                  - paragraph [ref=e296]: This file was not found on the server.
                  - paragraph [ref=e297]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e299] [cursor=pointer]
              - generic [ref=e300]:
                - generic [ref=e301]:
                  - paragraph [ref=e302]: FILE
                  - paragraph [ref=e303]: llms.html
                - generic [ref=e304]:
                  - paragraph [ref=e305]: STATUS
                  - generic [ref=e306]: not_found
                - generic [ref=e307]:
                  - paragraph [ref=e308]: LENGTH
                  - paragraph [ref=e309]: N/A
                - generic [ref=e310]:
                  - paragraph [ref=e311]: LAST-MODIFIED
                  - paragraph [ref=e312]: N/A
                - generic [ref=e313]:
                  - paragraph [ref=e314]: BUSINESS NAME
                  - paragraph [ref=e315]: N/A
                - generic [ref=e316]:
                  - paragraph [ref=e317]: BRAND NAME
                  - paragraph [ref=e318]: N/A
              - generic [ref=e320]: not_found
          - generic [ref=e321]:
            - generic [ref=e323]:
              - paragraph [ref=e324]: robots-ai.txt
              - paragraph [ref=e325]: For AI crawler access control
            - generic [ref=e326]:
              - generic [ref=e328]:
                - img [ref=e330]
                - generic [ref=e332]:
                  - paragraph [ref=e333]: This file was not found on the server.
                  - paragraph [ref=e334]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e336] [cursor=pointer]
              - generic [ref=e337]:
                - generic [ref=e338]:
                  - paragraph [ref=e339]: FILE
                  - paragraph [ref=e340]: robots-ai.txt
                - generic [ref=e341]:
                  - paragraph [ref=e342]: STATUS
                  - generic [ref=e343]: not_found
                - generic [ref=e344]:
                  - paragraph [ref=e345]: LENGTH
                  - paragraph [ref=e346]: N/A
                - generic [ref=e347]:
                  - paragraph [ref=e348]: LAST-MODIFIED
                  - paragraph [ref=e349]: N/A
                - generic [ref=e350]:
                  - paragraph [ref=e351]: BUSINESS NAME
                  - paragraph [ref=e352]: N/A
                - generic [ref=e353]:
                  - paragraph [ref=e354]: BRAND NAME
                  - paragraph [ref=e355]: N/A
              - generic [ref=e357]: not_found
          - generic [ref=e358]:
            - generic [ref=e360]:
              - paragraph [ref=e361]: identity.json
              - paragraph [ref=e362]: For machine-readable identity
            - generic [ref=e363]:
              - generic [ref=e365]:
                - img [ref=e367]
                - generic [ref=e369]:
                  - paragraph [ref=e370]: This file was not found on the server.
                  - paragraph [ref=e371]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e373] [cursor=pointer]
              - generic [ref=e374]:
                - generic [ref=e375]:
                  - paragraph [ref=e376]: FILE
                  - paragraph [ref=e377]: identity.json
                - generic [ref=e378]:
                  - paragraph [ref=e379]: STATUS
                  - generic [ref=e380]: not_found
                - generic [ref=e381]:
                  - paragraph [ref=e382]: LENGTH
                  - paragraph [ref=e383]: N/A
                - generic [ref=e384]:
                  - paragraph [ref=e385]: LAST-MODIFIED
                  - paragraph [ref=e386]: N/A
                - generic [ref=e387]:
                  - paragraph [ref=e388]: BUSINESS NAME
                  - paragraph [ref=e389]: N/A
                - generic [ref=e390]:
                  - paragraph [ref=e391]: BRAND NAME
                  - paragraph [ref=e392]: N/A
              - generic [ref=e394]: not_found
          - generic [ref=e395]:
            - generic [ref=e397]:
              - paragraph [ref=e398]: ai.json
              - paragraph [ref=e399]: For AI interaction guidelines
            - generic [ref=e400]:
              - generic [ref=e402]:
                - img [ref=e404]
                - generic [ref=e406]:
                  - paragraph [ref=e407]: This file was not found on the server.
                  - paragraph [ref=e408]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e410] [cursor=pointer]
              - generic [ref=e411]:
                - generic [ref=e412]:
                  - paragraph [ref=e413]: FILE
                  - paragraph [ref=e414]: ai.json
                - generic [ref=e415]:
                  - paragraph [ref=e416]: STATUS
                  - generic [ref=e417]: not_found
                - generic [ref=e418]:
                  - paragraph [ref=e419]: LENGTH
                  - paragraph [ref=e420]: N/A
                - generic [ref=e421]:
                  - paragraph [ref=e422]: LAST-MODIFIED
                  - paragraph [ref=e423]: N/A
                - generic [ref=e424]:
                  - paragraph [ref=e425]: BUSINESS NAME
                  - paragraph [ref=e426]: N/A
                - generic [ref=e427]:
                  - paragraph [ref=e428]: BRAND NAME
                  - paragraph [ref=e429]: N/A
              - generic [ref=e431]: not_found
      - generic [ref=e432]:
        - heading "Field Consistency" [level=2] [ref=e433]
        - generic [ref=e434]:
          - generic [ref=e435]:
            - generic [ref=e436]:
              - generic [ref=e437]: Consistency Score
              - generic [ref=e438]: 75%
            - generic [ref=e441]:
              - generic [ref=e442]: 1 error
              - generic [ref=e444]: 2 warnings
          - generic [ref=e447]:
            - generic [ref=e448]:
              - img [ref=e449]
              - generic [ref=e452]: Site Name
            - table [ref=e454]:
              - rowgroup [ref=e455]:
                - row "File Value Status" [ref=e456]:
                  - columnheader "File" [ref=e457]
                  - columnheader "Value" [ref=e458]
                  - columnheader "Status" [ref=e459]
              - rowgroup [ref=e460]:
                - row "llms.txt Example Match" [ref=e461]:
                  - cell "llms.txt" [ref=e462]
                  - cell "Example" [ref=e463]
                  - cell "Match" [ref=e464]:
                    - generic [ref=e465]: Match
                - row "ai.txt not found Not found" [ref=e466]:
                  - cell "ai.txt" [ref=e467]
                  - cell "not found" [ref=e468]
                  - cell "Not found" [ref=e469]:
                    - generic [ref=e470]: Not found
    - contentinfo [ref=e471]:
      - generic [ref=e474]:
        - generic [ref=e475]:
          - generic [ref=e476]: © 2026 Aivify
          - generic [ref=e477]: Open source under MIT License
        - generic [ref=e478]:
          - link "Privacy Policy" [ref=e479] [cursor=pointer]:
            - /url: /privacy
          - link "Terms of Service" [ref=e480] [cursor=pointer]:
            - /url: /terms
  - button "Open Next.js Dev Tools" [ref=e486] [cursor=pointer]:
    - img [ref=e487]
  - alert [ref=e490]
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