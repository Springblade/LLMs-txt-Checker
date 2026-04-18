# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages\analysis-results.spec.ts >> Analysis Results Page >> Back button — returns to home, dark
- Location: e2e\pages\analysis-results.spec.ts:199:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /back/i })

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
            - generic [ref=e49]: 3/10
            - generic [ref=e50]: Files Found
          - generic [ref=e52]:
            - img [ref=e53]
            - generic [ref=e56]: "7"
            - generic [ref=e57]: Errors
          - generic [ref=e59]:
            - img [ref=e60]
            - generic [ref=e62]: "1"
            - generic [ref=e63]: Warnings
        - paragraph [ref=e64]: https://example.com
      - generic [ref=e65]:
        - heading "AI Discovery Files" [level=2] [ref=e66]
        - generic [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e70]:
              - paragraph [ref=e71]: llms.txt
              - paragraph [ref=e72]: For main AI discovery file
            - generic [ref=e74]:
              - generic [ref=e75]:
                - paragraph [ref=e76]: FILE
                - paragraph [ref=e77]: llms.txt
              - generic [ref=e78]:
                - paragraph [ref=e79]: STATUS
                - generic [ref=e80]: exists
              - generic [ref=e81]:
                - paragraph [ref=e82]: LENGTH
                - paragraph [ref=e83]: 31 B
              - generic [ref=e84]:
                - paragraph [ref=e85]: LAST-MODIFIED
                - paragraph [ref=e86]: N/A
              - generic [ref=e87]:
                - paragraph [ref=e88]: BUSINESS NAME
                - paragraph [ref=e89]: N/A
              - generic [ref=e90]:
                - paragraph [ref=e91]: BRAND NAME
                - paragraph [ref=e92]: N/A
          - generic [ref=e93]:
            - generic [ref=e95]:
              - paragraph [ref=e96]: llm.txt
              - paragraph [ref=e97]: For redirect compatibility
            - generic [ref=e98]:
              - generic [ref=e100]:
                - img [ref=e102]
                - generic [ref=e104]:
                  - paragraph [ref=e105]: This file was not found on the server.
                  - paragraph [ref=e106]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e108] [cursor=pointer]
              - generic [ref=e109]:
                - generic [ref=e110]:
                  - paragraph [ref=e111]: FILE
                  - paragraph [ref=e112]: llm.txt
                - generic [ref=e113]:
                  - paragraph [ref=e114]: STATUS
                  - generic [ref=e115]: not_found
                - generic [ref=e116]:
                  - paragraph [ref=e117]: LENGTH
                  - paragraph [ref=e118]: N/A
                - generic [ref=e119]:
                  - paragraph [ref=e120]: LAST-MODIFIED
                  - paragraph [ref=e121]: N/A
                - generic [ref=e122]:
                  - paragraph [ref=e123]: BUSINESS NAME
                  - paragraph [ref=e124]: N/A
                - generic [ref=e125]:
                  - paragraph [ref=e126]: BRAND NAME
                  - paragraph [ref=e127]: N/A
              - generic [ref=e129]: not_found
          - generic [ref=e130]:
            - generic [ref=e132]:
              - paragraph [ref=e133]: ai.txt
              - paragraph [ref=e134]: For AI policies and terms
            - generic [ref=e135]:
              - generic [ref=e137]:
                - img [ref=e139]
                - generic [ref=e141]:
                  - paragraph [ref=e142]: This file is missing recommended sections.
                  - paragraph [ref=e143]: Impacts SEO and AI model discovery of your content.
              - generic [ref=e144]:
                - generic [ref=e145]:
                  - paragraph [ref=e146]: FILE
                  - paragraph [ref=e147]: ai.txt
                - generic [ref=e148]:
                  - paragraph [ref=e149]: STATUS
                  - generic [ref=e150]: exists
                - generic [ref=e151]:
                  - paragraph [ref=e152]: LENGTH
                  - paragraph [ref=e153]: 21 B
                - generic [ref=e154]:
                  - paragraph [ref=e155]: LAST-MODIFIED
                  - paragraph [ref=e156]: N/A
                - generic [ref=e157]:
                  - paragraph [ref=e158]: BUSINESS NAME
                  - paragraph [ref=e159]: N/A
                - generic [ref=e160]:
                  - paragraph [ref=e161]: BRAND NAME
                  - paragraph [ref=e162]: N/A
          - generic [ref=e163]:
            - generic [ref=e165]:
              - paragraph [ref=e166]: faq-ai.txt
              - paragraph [ref=e167]: For AI-friendly FAQ responses
            - generic [ref=e168]:
              - generic [ref=e170]:
                - img [ref=e172]
                - generic [ref=e174]:
                  - paragraph [ref=e175]: This file was not found on the server.
                  - paragraph [ref=e176]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e178] [cursor=pointer]
              - generic [ref=e179]:
                - generic [ref=e180]:
                  - paragraph [ref=e181]: FILE
                  - paragraph [ref=e182]: faq-ai.txt
                - generic [ref=e183]:
                  - paragraph [ref=e184]: STATUS
                  - generic [ref=e185]: not_found
                - generic [ref=e186]:
                  - paragraph [ref=e187]: LENGTH
                  - paragraph [ref=e188]: N/A
                - generic [ref=e189]:
                  - paragraph [ref=e190]: LAST-MODIFIED
                  - paragraph [ref=e191]: N/A
                - generic [ref=e192]:
                  - paragraph [ref=e193]: BUSINESS NAME
                  - paragraph [ref=e194]: N/A
                - generic [ref=e195]:
                  - paragraph [ref=e196]: BRAND NAME
                  - paragraph [ref=e197]: N/A
              - generic [ref=e199]: not_found
          - generic [ref=e200]:
            - generic [ref=e202]:
              - paragraph [ref=e203]: brand.txt
              - paragraph [ref=e204]: For AI brand guidelines
            - generic [ref=e206]:
              - generic [ref=e207]:
                - paragraph [ref=e208]: FILE
                - paragraph [ref=e209]: brand.txt
              - generic [ref=e210]:
                - paragraph [ref=e211]: STATUS
                - generic [ref=e212]: exists
              - generic [ref=e213]:
                - paragraph [ref=e214]: LENGTH
                - paragraph [ref=e215]: 9 B
              - generic [ref=e216]:
                - paragraph [ref=e217]: LAST-MODIFIED
                - paragraph [ref=e218]: N/A
              - generic [ref=e219]:
                - paragraph [ref=e220]: BUSINESS NAME
                - paragraph [ref=e221]: N/A
              - generic [ref=e222]:
                - paragraph [ref=e223]: BRAND NAME
                - paragraph [ref=e224]: N/A
          - generic [ref=e225]:
            - generic [ref=e227]:
              - paragraph [ref=e228]: developer-ai.txt
              - paragraph [ref=e229]: For developer documentation
            - generic [ref=e230]:
              - generic [ref=e232]:
                - img [ref=e234]
                - generic [ref=e236]:
                  - paragraph [ref=e237]: This file was not found on the server.
                  - paragraph [ref=e238]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e240] [cursor=pointer]
              - generic [ref=e241]:
                - generic [ref=e242]:
                  - paragraph [ref=e243]: FILE
                  - paragraph [ref=e244]: developer-ai.txt
                - generic [ref=e245]:
                  - paragraph [ref=e246]: STATUS
                  - generic [ref=e247]: not_found
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
              - generic [ref=e261]: not_found
          - generic [ref=e262]:
            - generic [ref=e264]:
              - paragraph [ref=e265]: llms.html
              - paragraph [ref=e266]: For HTML-based AI discovery
            - generic [ref=e267]:
              - generic [ref=e269]:
                - img [ref=e271]
                - generic [ref=e273]:
                  - paragraph [ref=e274]: This file was not found on the server.
                  - paragraph [ref=e275]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e277] [cursor=pointer]
              - generic [ref=e278]:
                - generic [ref=e279]:
                  - paragraph [ref=e280]: FILE
                  - paragraph [ref=e281]: llms.html
                - generic [ref=e282]:
                  - paragraph [ref=e283]: STATUS
                  - generic [ref=e284]: not_found
                - generic [ref=e285]:
                  - paragraph [ref=e286]: LENGTH
                  - paragraph [ref=e287]: N/A
                - generic [ref=e288]:
                  - paragraph [ref=e289]: LAST-MODIFIED
                  - paragraph [ref=e290]: N/A
                - generic [ref=e291]:
                  - paragraph [ref=e292]: BUSINESS NAME
                  - paragraph [ref=e293]: N/A
                - generic [ref=e294]:
                  - paragraph [ref=e295]: BRAND NAME
                  - paragraph [ref=e296]: N/A
              - generic [ref=e298]: not_found
          - generic [ref=e299]:
            - generic [ref=e301]:
              - paragraph [ref=e302]: robots-ai.txt
              - paragraph [ref=e303]: For AI crawler access control
            - generic [ref=e304]:
              - generic [ref=e306]:
                - img [ref=e308]
                - generic [ref=e310]:
                  - paragraph [ref=e311]: This file was not found on the server.
                  - paragraph [ref=e312]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e314] [cursor=pointer]
              - generic [ref=e315]:
                - generic [ref=e316]:
                  - paragraph [ref=e317]: FILE
                  - paragraph [ref=e318]: robots-ai.txt
                - generic [ref=e319]:
                  - paragraph [ref=e320]: STATUS
                  - generic [ref=e321]: not_found
                - generic [ref=e322]:
                  - paragraph [ref=e323]: LENGTH
                  - paragraph [ref=e324]: N/A
                - generic [ref=e325]:
                  - paragraph [ref=e326]: LAST-MODIFIED
                  - paragraph [ref=e327]: N/A
                - generic [ref=e328]:
                  - paragraph [ref=e329]: BUSINESS NAME
                  - paragraph [ref=e330]: N/A
                - generic [ref=e331]:
                  - paragraph [ref=e332]: BRAND NAME
                  - paragraph [ref=e333]: N/A
              - generic [ref=e335]: not_found
          - generic [ref=e336]:
            - generic [ref=e338]:
              - paragraph [ref=e339]: identity.json
              - paragraph [ref=e340]: For machine-readable identity
            - generic [ref=e341]:
              - generic [ref=e343]:
                - img [ref=e345]
                - generic [ref=e347]:
                  - paragraph [ref=e348]: This file was not found on the server.
                  - paragraph [ref=e349]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e351] [cursor=pointer]
              - generic [ref=e352]:
                - generic [ref=e353]:
                  - paragraph [ref=e354]: FILE
                  - paragraph [ref=e355]: identity.json
                - generic [ref=e356]:
                  - paragraph [ref=e357]: STATUS
                  - generic [ref=e358]: not_found
                - generic [ref=e359]:
                  - paragraph [ref=e360]: LENGTH
                  - paragraph [ref=e361]: N/A
                - generic [ref=e362]:
                  - paragraph [ref=e363]: LAST-MODIFIED
                  - paragraph [ref=e364]: N/A
                - generic [ref=e365]:
                  - paragraph [ref=e366]: BUSINESS NAME
                  - paragraph [ref=e367]: N/A
                - generic [ref=e368]:
                  - paragraph [ref=e369]: BRAND NAME
                  - paragraph [ref=e370]: N/A
              - generic [ref=e372]: not_found
          - generic [ref=e373]:
            - generic [ref=e375]:
              - paragraph [ref=e376]: ai.json
              - paragraph [ref=e377]: For AI interaction guidelines
            - generic [ref=e378]:
              - generic [ref=e380]:
                - img [ref=e382]
                - generic [ref=e384]:
                  - paragraph [ref=e385]: This file was not found on the server.
                  - paragraph [ref=e386]: Impacts SEO and AI model discovery of your content.
              - button "DOWNLOAD TEMPLATE" [ref=e388] [cursor=pointer]
              - generic [ref=e389]:
                - generic [ref=e390]:
                  - paragraph [ref=e391]: FILE
                  - paragraph [ref=e392]: ai.json
                - generic [ref=e393]:
                  - paragraph [ref=e394]: STATUS
                  - generic [ref=e395]: not_found
                - generic [ref=e396]:
                  - paragraph [ref=e397]: LENGTH
                  - paragraph [ref=e398]: N/A
                - generic [ref=e399]:
                  - paragraph [ref=e400]: LAST-MODIFIED
                  - paragraph [ref=e401]: N/A
                - generic [ref=e402]:
                  - paragraph [ref=e403]: BUSINESS NAME
                  - paragraph [ref=e404]: N/A
                - generic [ref=e405]:
                  - paragraph [ref=e406]: BRAND NAME
                  - paragraph [ref=e407]: N/A
              - generic [ref=e409]: not_found
      - generic [ref=e410]:
        - heading "Field Consistency" [level=2] [ref=e411]
        - generic [ref=e412]:
          - generic [ref=e413]:
            - generic [ref=e414]:
              - generic [ref=e415]: Consistency Score
              - generic [ref=e416]: 75%
            - generic [ref=e419]:
              - generic [ref=e420]: 1 error
              - generic [ref=e422]: 2 warnings
          - generic [ref=e425]:
            - generic [ref=e426]:
              - img [ref=e427]
              - generic [ref=e430]: Site Name
            - table [ref=e432]:
              - rowgroup [ref=e433]:
                - row "File Value Status" [ref=e434]:
                  - columnheader "File" [ref=e435]
                  - columnheader "Value" [ref=e436]
                  - columnheader "Status" [ref=e437]
              - rowgroup [ref=e438]:
                - row "llms.txt Example Match" [ref=e439]:
                  - cell "llms.txt" [ref=e440]
                  - cell "Example" [ref=e441]
                  - cell "Match" [ref=e442]:
                    - generic [ref=e443]: Match
                - row "ai.txt not found Not found" [ref=e444]:
                  - cell "ai.txt" [ref=e445]
                  - cell "not found" [ref=e446]
                  - cell "Not found" [ref=e447]:
                    - generic [ref=e448]: Not found
    - contentinfo [ref=e449]:
      - generic [ref=e452]:
        - generic [ref=e453]:
          - generic [ref=e454]: © 2026 Aivify
          - generic [ref=e455]: Open source under MIT License
        - generic [ref=e456]:
          - link "Privacy Policy" [ref=e457] [cursor=pointer]:
            - /url: /privacy
          - link "Terms of Service" [ref=e458] [cursor=pointer]:
            - /url: /terms
  - button "Open Next.js Dev Tools" [ref=e464] [cursor=pointer]:
    - img [ref=e465]
  - alert [ref=e468]
```

# Test source

```ts
  103 |   });
  104 | 
  105 |   test("All files found, dark", async ({ page }) => {
  106 |     await setDarkMode(page);
  107 |     await mountAnalysisResults(page, {
  108 |       ...defaultAnalyzeResult,
  109 |       files: defaultAnalyzeResult.files.map((f) => ({ ...f, found: true, errors: [], warnings: [] })),
  110 |     });
  111 | 
  112 |     await pageSnapshot(page, "analysis-results", "all-found");
  113 |   });
  114 | 
  115 |   test("Consistency errors, light", async ({ page }) => {
  116 |     await setLightMode(page);
  117 |     await mountAnalysisResults(page, {
  118 |       ...defaultAnalyzeResult,
  119 |       consistency: {
  120 |         summary: { total: 4, errors: 2, warnings: 1 },
  121 |         checks: [
  122 |           {
  123 |             field: "name",
  124 |             label: "Site Name",
  125 |             severity: "error",
  126 |             sources: [
  127 |               { file: "llms.txt", value: "Example", match: false },
  128 |               { file: "ai.txt", value: "Different Site", match: false },
  129 |             ],
  130 |           },
  131 |           {
  132 |             field: "url",
  133 |             label: "Site URL",
  134 |             severity: "warning",
  135 |             sources: [
  136 |               { file: "llms.txt", value: "https://example.com", match: true },
  137 |               { file: "ai.txt", value: null, match: false },
  138 |             ],
  139 |           },
  140 |         ],
  141 |       },
  142 |     });
  143 | 
  144 |     await pageSnapshot(page, "analysis-results", "consistency-errors");
  145 |   });
  146 | 
  147 |   test("Consistency errors, dark", async ({ page }) => {
  148 |     await setDarkMode(page);
  149 |     await mountAnalysisResults(page, {
  150 |       ...defaultAnalyzeResult,
  151 |       consistency: {
  152 |         summary: { total: 4, errors: 2, warnings: 1 },
  153 |         checks: [
  154 |           {
  155 |             field: "name",
  156 |             label: "Site Name",
  157 |             severity: "error",
  158 |             sources: [
  159 |               { file: "llms.txt", value: "Example", match: false },
  160 |               { file: "ai.txt", value: "Different Site", match: false },
  161 |             ],
  162 |           },
  163 |           {
  164 |             field: "url",
  165 |             label: "Site URL",
  166 |             severity: "warning",
  167 |             sources: [
  168 |               { file: "llms.txt", value: "https://example.com", match: true },
  169 |               { file: "ai.txt", value: null, match: false },
  170 |             ],
  171 |           },
  172 |         ],
  173 |       },
  174 |     });
  175 | 
  176 |     await pageSnapshot(page, "analysis-results", "consistency-errors");
  177 |   });
  178 | 
  179 |   test("Consistency — need 2+ files for comparison (empty state), light", async ({ page }) => {
  180 |     await setLightMode(page);
  181 |     await mountAnalysisResults(page, {
  182 |       ...defaultAnalyzeResult,
  183 |       consistency: { summary: { total: 0, errors: 0, warnings: 0 }, checks: [] },
  184 |     });
  185 | 
  186 |     await pageSnapshot(page, "analysis-results", "consistency-empty");
  187 |   });
  188 | 
  189 |   test("Back button — returns to home, light", async ({ page }) => {
  190 |     await setLightMode(page);
  191 |     await mountAnalysisResults(page, defaultAnalyzeResult);
  192 | 
  193 |     await page.getByRole("button", { name: /back/i }).click();
  194 |     await page.waitForLoadState("networkidle");
  195 | 
  196 |     await pageSnapshot(page, "home-generate", "after-back");
  197 |   });
  198 | 
  199 |   test("Back button — returns to home, dark", async ({ page }) => {
  200 |     await setDarkMode(page);
  201 |     await mountAnalysisResults(page, defaultAnalyzeResult);
  202 | 
> 203 |     await page.getByRole("button", { name: /back/i }).click();
      |                                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  204 |     await page.waitForLoadState("networkidle");
  205 | 
  206 |     await pageSnapshot(page, "home-generate", "after-back");
  207 |   });
  208 | 
  209 |   // ── Mobile ─────────────────────────────────────────────────────────────────
  210 | 
  211 |   test("Mobile — mixed files, light", async ({ page }) => {
  212 |     await setLightMode(page);
  213 |     await mountAnalysisResults(page, defaultAnalyzeResult);
  214 | 
  215 |     await pageSnapshot(page, "analysis-results", "mixed");
  216 |   });
  217 | 
  218 |   test("Mobile — mixed files, dark", async ({ page }) => {
  219 |     await setDarkMode(page);
  220 |     await mountAnalysisResults(page, defaultAnalyzeResult);
  221 | 
  222 |     await pageSnapshot(page, "analysis-results", "mixed");
  223 |   });
  224 | });
  225 | 
```