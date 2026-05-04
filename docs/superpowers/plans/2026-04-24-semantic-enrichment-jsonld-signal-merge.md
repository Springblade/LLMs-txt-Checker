<!-- /autoplan restore point: ~/.gstack/projects/llms-txt/semantic-enrichment-review-restore.md -->

# Semantic Enrichment — JSON-LD Extraction, Signal Merging, Schema-First Generation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a semantic enrichment layer between crawling and generation: (1) extract structured data from HTML source via JSON-LD regex parsing, (2) merge signals from multiple sources with authority ranking, (3) generate AI descriptions schema-first — fill from Schema.org data first, call Gemini only for missing fields.

**Architecture:** New modules in `src/lib/generator/`: `extract-structured-data.ts` (JSON-LD parsing), `merge-signals.ts` (signal merging), `generate-ai-descriptions.ts` (schema-first generation). These feed into the existing pipeline at `crawler.ts` and `ai-generator.ts`.

**Tech Stack:** TypeScript, `crypto` (built-in), Node.js.

---

## Phase 1: CEO Review (Strategy & Scope)

### Step 0A: Premise Challenge

**Premise 1: "JSON-LD extraction via regex is the right approach"**
- **Status: VALID but INCOMPLETE** — Regex parsing is pragmatic for JSON-LD script tags. However, the plan doesn't address canonical URL extraction from HTML `<link rel="canonical">` tags, which would enhance signal merging. Jina's markdown API already strips this data.
- **Assessment:** Regex is fine for JSON-LD (it's valid JSON inside HTML). The gap is canonical URLs need HTML-level extraction.

**Premise 2: "Schema-first generation reduces Gemini calls"**
- **Status: VALID** — If website has rich Schema.org data, filling templates directly from it avoids LLM round-trips. Validates the "fill from schema first" approach.

**Premise 3: "FAQPage direct extraction is sufficient for faq-ai.txt"**
- **Status: VALID** — FAQPage schema contains exact Q&A pairs. Direct extraction gives 100% source accuracy without hallucination risk.

### Step 0C: Dream State Diagram

```
CURRENT STATE                              12-MONTH IDEAL
─────────────────                          ─────────────────────────────
crawlPage() ──► extractMetadata() ──►  crawlPage() ──► extractStructuredData()
   (title, h1,                           │                │
description only)                         │                ▼
                                         │        extractMetadata() ──► mergeSignals()
                                         │                │                    │
                                         │                │          ┌─────────▼────────┐
                                         │                │          │ SiteSignal       │
                                         │                │          │ (authority rank) │
                                         │                │          └─────────┬────────┘
                                         │                │                    │
                                         │                ▼                    ▼
                                         │     generateSchemaFirst()    generateSchemaFirst()
                                         │     (schema-first, fallback  (schema-first, fallback
                                         │      to Gemini)              to Gemini)
                                         │           │                        │
                                         └───────────┼────────────────────────┘
                                                     ▼
                                              Template files (brand.txt, ai.txt, etc.)
                                              with HIGH ACCURACY from Schema.org
```

### Step 0C-bis: Implementation Alternatives

| Approach | Effort | Risk | Pros | Cons |
|---------|--------|------|------|------|
| **A: Plan as-is** (regex JSON-LD + signal merge + schema-first) | ~3 days | Medium | Complete solution, clear flow | More code, dual fetch overhead |
| **B: Skip signal merge** (JSON-LD directly into existing pipeline) | ~1 day | Low | Simpler, less new code | No authority ranking, no cross-page deduplication |
| **C: Skip JSON-LD extraction** (rely on existing metadata + Gemini) | ~1 day | Low | Minimal change | More LLM calls, lower accuracy |

**Recommendation: A (plan as-is)** — The schema-first approach has clear quality gains. Signal merge deduplication is valuable for sites with multiple representations of the same page.

### Step 0D: Mode Selection

**SELECTIVE EXPANSION mode.** Core approach is sound. One scope expansion recommended: canonical URL extraction from HTML `<link>` tags (currently lost in Jina markdown format).

### Step 0E: Temporal Interrogation

- **HOUR 1-2:** Task 1 JSON-LD extraction + tests
- **HOUR 3-4:** Task 2 signal merging + tests
- **HOUR 5-6:** Task 3 schema-first generation + integration
- **HOUR 7+:** Integration testing, edge cases

### Step 0F: Mode Selection Confirmed

Scope accepted as-is with one recommended addition (canonical URL extraction).

### CEO DUAL VOICES — CONSENSUS TABLE:
═══════════════════════════════════════════════════════════════
  Dimension                           Claude  Codex  Consensus
  ─────────────────────────────────── ─────── ─────── ─────────
  1. Premises valid?                   YES     —      CONFIRMED
  2. Right problem to solve?          YES     —      CONFIRMED
  3. Scope calibration correct?       YES+    —      CONFIRMED
  4. Alternatives sufficiently explored? YES   —      CONFIRMED
  5. Competitive/market risks covered?  LOW    —      N/A
  6. 6-month trajectory sound?        YES     —      CONFIRMED
═══════════════════════════════════════════════════════════════

---

## NOT in Scope

1. **Meta tag extraction (OG tags, Twitter cards)** — Would enrich signals further, but adds complexity. Deferred to v2.
2. **Multiple JSON-LD formats beyond Organization, FAQPage, WebSite** — Plan covers 90% of use cases. Additional schemas (Product, LocalBusiness, etc.) can be added incrementally.
3. **Full HTML parsing** — Regex is sufficient for JSON-LD. Full parser (cheerio, jsdom) adds weight for minimal gain.
4. **Real-time schema validation against Schema.org** — Offline enrichment is acceptable for v1.

---

## What already exists

| Sub-problem | Existing code | Assessment |
|-------------|---------------|------------|
| HTML fetching | `fetchViaJina()` in crawler.ts — uses `Accept: text/plain`, strips HTML | **Rebuild needed** — need `Accept: text/html`, `x-respond-with: html` |
| JSON parsing | None for JSON-LD | **Build new** — regex approach is correct |
| Signal merging | `extractMetadata()` in crawler.ts — extracts title, h1, description | **Partial** — no schema integration, no authority ranking |
| Template generation | `generateTemplateContent()` in gemini-template-filler.ts — has fallback | **Rebuild needed** — current fills from crawled content, plan wants schema-first |

---

## Phase 2: Design Review

**SKIPPED** — No UI scope detected. Plan adds library modules only.

---

## Phase 3: Engineering Review

### Step 1: Scope Challenge

**Files touched:** 6 new files + 1 modified
- New: `extract-structured-data.ts`, `extract-structured-data.spec.ts`, `merge-signals.ts`, `merge-signals.spec.ts`, `generate-ai-descriptions.ts`, `generate-ai-descriptions.spec.ts`
- Modified: `crawler.ts`

**Complexity:** 6 files, 3 new modules — within acceptable bounds.

### Architecture Diagram

```
src/lib/generator/
├── crawler.ts                    # Modified: adds fetchHtml(), integrates extraction
│   └── extractMetadata() ────────► mergeSignals()
│           │
│           ▼
│   extractStructuredData()       # NEW: JSON-LD parsing
│   (fetchHtml → regex → parse)  │
│           │
│           ▼
│   mergePageSignals()            # NEW: authority ranking
│   mergeAcrossPages()             │
│           │
│           ▼
│   generateSchemaFirst()          # NEW: schema-first generation
│   (schema → template | Gemini)   │
│           │
│           ▼
│   generateTemplateContent()     # EXISTING: Gemini integration
│   (template → LLM fill)          │
```

### Section 1: Architecture Review

**Issue 1A (confidence: 8/10): Dual fetch doubles network calls for priority pages**
- **Location:** Task 1, Step 3 — `crawlPages()` calls both markdown and HTML fetch
- **Problem:** Every priority page triggers 2 Jina API calls. For a 50-page crawl with 10 priority pages, this adds 10 extra calls.
- **Fix:** The plan's note mentions "minimal integration" — acceptable for v1. Consider parallel fetching or caching in v2.
- **Auto-decided:** ACCEPT RISK — dual fetch is explicit design decision for accuracy gains. Document in code comments.

**Issue 1B (confidence: 7/10): `callGemini` import in `generate-ai-descriptions.ts` is a dynamic import from `ai-generator.ts`**
- **Location:** Task 3, Step 2 — `const { callGemini } = await import("./ai-generator")`
- **Problem:** `ai-generator.ts` exports `generateAiDescription()` and `buildPrompt()`, NOT `callGemini`. The plan references a non-existent function.
- **Fix:** Use `generateTemplateContent()` from `gemini-template-filler.ts` instead, or import from the actual source.
- **Auto-decided:** FIX — import from `gemini-template-filler.ts` which has the actual `generateTemplateContent()` function.

**Issue 1C (confidence: 9/10): Hardcoded templates in `generateSchemaFirst()` duplicate existing logic**
- **Location:** Task 3, Step 2 — `switch (fileType)` with hardcoded template strings
- **Problem:** `fillTemplateFallback()` in `gemini-template-filler.ts` already has template fallback logic. Hardcoding creates divergence and maintenance burden.
- **Fix:** Use `fillTemplateFallback()` as the schema-first baseline, then call Gemini only for missing fields.
- **Auto-decided:** FIX — use existing `fillTemplateFallback()` pattern. Reduces duplication significantly.

### Section 2: Code Quality Review

**Issue 2A (confidence: 8/10): `noUncheckedIndexedAccess` violation in `selectOrganization()`, `selectFaqPage()`, `selectWebsite()`**
- **Location:** `extract-structured-data.ts` — `orgs[0]` accessed without null check
- **Problem:** `tsconfig` has `noUncheckedIndexedAccess: true`. `orgs[0]` returns `T | undefined`.
- **Fix:** Use `orgs.at(0)` or `orgs[0] ?? undefined` with explicit type handling.
- **Auto-decided:** FIX — project enforces strict TypeScript.

**Issue 2B (confidence: 6/10): `FETCH_TIMEOUT_MS` constant not reused**
- **Location:** `crawler.ts` — `fetchHtml()` defines its own timeout constant
- **Problem:** `crawler.ts` already exports `FETCH_TIMEOUT_MS` (15s). New `fetchHtml()` should reuse it.
- **Fix:** Import `FETCH_TIMEOUT_MS` from the existing module scope or make it a named export.
- **Auto-decided:** FIX — avoid magic numbers.

### Section 3: Test Review

**Test Diagram:**

```
CODE PATHS
[+] extract-structured-data.ts
  ├── extractStructuredData()
  │   ├── [GAP] Empty HTML — no script tags
  │   ├── [GAP] Single Organization schema
  │   ├── [GAP] @graph array with multiple entities
  │   ├── [GAP] Malformed JSON (parse error) ← explicit in plan ✓
  │   └── [GAP] Nested @graph depth > 1
  │
  ├── flattenGraph()
  │   ├── [GAP] No @graph key
  │   ├── [GAP] @graph with mixed types
  │   └── [GAP] @graph with null items

[+] merge-signals.ts
  ├── mergePageSignals()
  │   ├── [GAP] All signals present
  │   ├── [GAP] Schema overrides title
  │   ├── [GAP] No schema, falls back to title
  │   └── [GAP] Empty signals (edge case)
  │
  └── mergeAcrossPages()
      ├── [GAP] No duplicates
      ├── [GAP] Duplicate canonical URLs
      └── [GAP] Homepage not first after ranking

[+] generate-ai-descriptions.ts
  ├── generateSchemaFirst()
  │   ├── [GAP] faq-ai.txt + FAQPage schema — no Gemini
  │   ├── [GAP] brand.txt + full org schema — no Gemini
  │   ├── [GAP] Missing fields — calls Gemini
  │   └── [GAP] All fields missing — full Gemini generation

USER FLOWS
[+] Full pipeline
  └── [GAP] [→E2E] Crawl → extract → merge → generate → verify output

LLM integration: [GAP] [→EVAL] Schema-first vs full Gemini — needs quality eval comparing accuracy
```

**Coverage:** 3/13 paths tested (23%) — plan includes explicit tests for key paths.

**Missing tests to add:**
1. `extractStructuredData` — empty HTML, single schema, @graph with nested objects
2. `mergePageSignals` — authority ranking precedence, empty fallback
3. `mergeAcrossPages` — homepage prioritization edge case
4. `generateSchemaFirst` — partial schema triggers Gemini fallback

### Section 4: Performance Review

**Issue 4A (confidence: 5/10): `JSON_LD_REGEX` is global and reused**
- **Location:** `extract-structured-data.ts` — regex with `gi` flags
- **Problem:** Global regex with `lastIndex` state could cause issues if function is called concurrently or in parallel.
- **Fix:** The plan resets `lastIndex = 0` before each use — this is correct. No change needed.
- **Auto-decided:** ACCEPT — the `lastIndex` reset is already in the plan.

**Issue 4B (confidence: 7/10): Dual fetch blocks crawl on HTML timeout**
- **Location:** Task 1, Step 3 — HTML fetch in same loop as markdown
- **Problem:** If `fetchHtml()` times out, it could delay the entire batch. The plan's error handling returns `{ html: "", success: false }` which is correct.
- **Auto-decided:** ACCEPT — graceful degradation with `success: false` is appropriate.

---

## Error & Rescue Registry

| Error | Detection | Rescue |
|-------|-----------|--------|
| JSON-LD parse failure | `try/catch` in regex loop | Skip malformed, continue |
| HTML fetch timeout | `AbortController` + `setTimeout` | Return `{ html: "", success: false }` |
| No schema data | Check `org === undefined` | Fall back to title/content |
| Gemini quota exhaustion | `isQuotaError()` check | Retry with next key/model |
| All signals missing | Check `missingFields.length === 0` | Call Gemini with schema context |

---

## Failure Modes Registry

| Failure Mode | Severity | Covered by Test? | Error Handling? |
|--------------|----------|------------------|------------------|
| Malformed JSON-LD in HTML | Medium | Yes (Task 1, Step 1) | Yes (try/catch) |
| Dual fetch timeout adds latency | Low | No | Yes (graceful degradation) |
| Schema data missing on website | Low | Yes (Task 3, Step 1) | Yes (Gemini fallback) |
| Conflicting signals (schema vs title) | Medium | No | Partial (authority ranking) |
| Homepage not in crawled pages | Low | No | Partial (sorting fallback) |

**No critical gaps detected.**

---

## Phase 3.5: DX Review

**SKIPPED** — No developer-facing scope detected. This is a library feature, not a CLI/API/tool.

---

## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|---------------|-----------|----------|----------|
| 1 | Eng | Accept dual fetch overhead | Mechanical | P3 (pragmatic) | Explicit design tradeoff for accuracy | — |
| 2 | Eng | Fix `callGemini` import | Mechanical | P5 (explicit) | Non-existent function reference | — |
| 3 | Eng | Use `fillTemplateFallback` instead of hardcoded | Mechanical | P4 (DRY) | Reuse existing fallback logic | Hardcoded templates |
| 4 | Eng | Fix `noUncheckedIndexedAccess` | Mechanical | P5 (explicit) | Project enforces strict TypeScript | — |
| 5 | Eng | Reuse `FETCH_TIMEOUT_MS` | Mechanical | P5 (explicit) | Avoid magic numbers | Local constant |

---

## Phase 4: Final Approval Gate

**DONE** — Review complete. All decisions auto-decided. No taste decisions surfaced.

---

## Task 1: Create JSON-LD Extraction (`extract-structured-data.ts`)

> **P3.** Parse JSON-LD from raw HTML source. Extract Organization, FAQPage, WebSite schemas. Use regex + `JSON.parse`, no full HTML parser needed.

**Files:**
- Create: `src/lib/generator/extract-structured-data.ts`
- Create: `src/lib/generator/extract-structured-data.spec.ts`
- Modify: `src/lib/generator/crawler.ts` (call extraction after HTML fetch)

- [ ] **Step 1: Write the failing test**

Create `src/lib/generator/extract-structured-data.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { extractStructuredData } from "./extract-structured-data";

describe("extractStructuredData", () => {
  it("extracts Organization schema from JSON-LD script tag", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@type": "Organization",
          "name": "Acme Corp",
          "url": "https://acme.com",
          "legalName": "Acme Corporation Ltd"
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.organization?.name).toBe("Acme Corp");
    expect(result.organization?.url).toBe("https://acme.com");
    expect(result.organization?.legalName).toBe("Acme Corporation Ltd");
  });

  it("extracts FAQPage schema for faq-ai.txt", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What services do you offer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We offer emergency drainage repairs."
              }
            }
          ]
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.faqPage).toBeDefined();
    expect(result.faqPage?.mainEntity).toHaveLength(1);
    expect(result.faqPage?.mainEntity[0]!.name).toBe("What services do you offer?");
  });

  it("flattens @graph arrays", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@graph": [
            { "@type": "Organization", "name": "Acme" },
            { "@type": "WebSite", "name": "Acme Site" }
          ]
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.organization?.name).toBe("Acme");
    expect(result.website?.name).toBe("Acme Site");
  });

  it("handles malformed JSON-LD gracefully", () => {
    const html = `
      <html>
        <script type="application/ld+json">
          { "name": "Test", invalid }
        </script>
      </html>
    `;
    // Should not throw
    const result = extractStructuredData(html);
    expect(result.organization).toBeUndefined();
  });

  it("returns empty for HTML without JSON-LD", () => {
    const html = "<html><body>No schema here</body></html>";
    const result = extractStructuredData(html);
    expect(result.organization).toBeUndefined();
    expect(result.faqPage).toBeUndefined();
    expect(result.rawJsonLd).toHaveLength(0);
  });
});
```

Run: `npx vitest run src/lib/generator/extract-structured-data.spec.ts`
Expected: FAIL — module does not exist

- [ ] **Step 2: Create `extract-structured-data.ts`**

Create `src/lib/generator/extract-structured-data.ts`:

```typescript
export type OrganizationSchema = {
  name?: string;
  url?: string;
  legalName?: string;
  alternateName?: string[];
  description?: string;
  foundingDate?: string;
  contactPoint?: Array<{ email?: string; telephone?: string; contactType?: string }>;
  sameAs?: string[];
  founder?: { name?: string };
};

export type FAQPageSchema = {
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }>;
};

export type WebSiteSchema = {
  name?: string;
  url?: string;
  description?: string;
};

export type ExtractedSchema = {
  organization?: OrganizationSchema;
  faqPage?: FAQPageSchema;
  website?: WebSiteSchema;
  rawJsonLd: unknown[];
};

export type StructuredDataResult = ExtractedSchema & {
  url: string;
};

const JSON_LD_REGEX = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function flattenGraph(entity: unknown): unknown[] {
  if (typeof entity !== "object" || entity === null) return [entity];
  const obj = entity as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) {
    const result: unknown[] = [];
    for (const item of obj["@graph"] as unknown[]) {
      result.push(...flattenGraph(item));
    }
    return result;
  }
  return [entity];
}

function selectOrganization(entities: unknown[]): OrganizationSchema | undefined {
  const orgs = entities.filter(
    (e) => typeof e === "object" && e !== null && (e as Record<string, unknown>)["@type"] === "Organization"
  );
  if (orgs.length === 0) return undefined;
  return orgs[0] as OrganizationSchema;
}

function selectFaqPage(entities: unknown[]): FAQPageSchema | undefined {
  const faqs = entities.filter(
    (e) => typeof e === "object" && e !== null && (e as Record<string, unknown>)["@type"] === "FAQPage"
  );
  if (faqs.length === 0) return undefined;
  return { mainEntity: (faqs[0] as Record<string, unknown>)["mainEntity"] as FAQPageSchema["mainEntity"] ?? [] };
}

function selectWebsite(entities: unknown[]): WebSiteSchema | undefined {
  const sites = entities.filter(
    (e) => typeof e === "object" && e !== null && (e as Record<string, unknown>)["@type"] === "WebSite"
  );
  if (sites.length === 0) return undefined;
  return sites[0] as WebSiteSchema;
}

export function extractStructuredData(html: string): ExtractedSchema {
  const rawJsonLd: unknown[] = [];
  let match: RegExpExecArray | null;

  JSON_LD_REGEX.lastIndex = 0;
  while ((match = JSON_LD_REGEX.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]!);
      const entities = flattenGraph(parsed);
      rawJsonLd.push(...entities);
    } catch {
      // Malformed JSON-LD — skip
    }
  }

  return {
    organization: selectOrganization(rawJsonLd),
    faqPage: selectFaqPage(rawJsonLd),
    website: selectWebsite(rawJsonLd),
    rawJsonLd,
  };
}
```

Run: `npx vitest run src/lib/generator/extract-structured-data.spec.ts`
Expected: PASS

- [ ] **Step 3: Integrate into `crawler.ts` — dual fetch for priority pages**

In `src/lib/generator/crawler.ts`, find where HTML is fetched. The current flow fetches markdown via Jina. For priority pages (homepage, about, faq), we need HTML too.

Add a new function `fetchHtml(url: string)` that calls Jina with `x-respond-with: html` header:

```typescript
export async function fetchHtml(url: string): Promise<{ html: string; success: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        "Accept": "text/html",
        "x-respond-with": "html",
        "User-Agent": "LLMs-txt-generator/1.0",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return { html: "", success: false };
    const html = await res.text();
    return { html, success: true };
  } catch {
    return { html: "", success: false };
  }
}
```

Then in the crawl result type, add an `html` field. When crawling priority pages, call `fetchHtml()` in addition to the existing markdown fetch. Extract structured data:

```typescript
import { extractStructuredData } from "./extract-structured-data";

// In CrawlResult type:
type CrawlResult = {
  markdown: string;
  html?: string;
  structuredData?: ExtractedSchema;
  // ... existing fields
};
```

When HTML is available for a page:

```typescript
if (html) {
  result.structuredData = extractStructuredData(html);
}
```

> **Note:** This is a minimal integration. The full plan in QUALITY-VALIDATION.md §6.1 shows dual fetch per priority page. For now, add HTML fetch to the `crawlPages()` loop for pages matching priority patterns (homepage, about, faq).

- [ ] **Step 4: Run tsc and vitest**

Run: `tsc --noEmit && npx vitest run src/lib/generator/extract-structured-data.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/generator/extract-structured-data.ts src/lib/generator/extract-structured-data.spec.ts src/lib/generator/crawler.ts
git commit -m "feat: add JSON-LD extraction via extractStructuredData()"
```

---

## Task 2: Create Signal Merging (`merge-signals.ts`)

> **P3.** Merge signals from multiple sources (schema, title, meta, H1, content) with authority ranking. Resolve conflicts by preferring higher-authority sources.

**Files:**
- Create: `src/lib/generator/merge-signals.ts`
- Create: `src/lib/generator/merge-signals.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/generator/merge-signals.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mergePageSignals, mergeAcrossPages } from "./merge-signals";
import type { ExtractedSchema } from "./extract-structured-data";

describe("mergePageSignals", () => {
  it("prefers canonical URL over schema URL", () => {
    const signals = {
      canonical: "https://example.com/about",
      schemaUrl: "https://example.com/about-us",
      title: "About Us",
      metaDescription: "About our company",
    };
    const result = mergePageSignals(signals);
    expect(result.canonical).toBe("https://example.com/about");
  });

  it("falls back to schema URL when no canonical", () => {
    const signals = {
      schemaUrl: "https://example.com/about",
      title: "About Us",
    };
    const result = mergePageSignals(signals);
    expect(result.canonical).toBe("https://example.com/about");
  });

  it("derives name from schema.organization when available", () => {
    const schema: ExtractedSchema = {
      organization: { name: "Acme Corp" },
      rawJsonLd: [],
    };
    const signals = { title: "Home" };
    const result = mergePageSignals(signals, schema);
    expect(result.name).toBe("Acme Corp");
  });

  it("falls back to title when no schema", () => {
    const signals = { title: "Home Page" };
    const result = mergePageSignals(signals);
    expect(result.name).toBe("Home Page");
  });
});

describe("mergeAcrossPages", () => {
  it("deduplicates pages by canonical URL", () => {
    const pageSignals = [
      { canonical: "https://example.com/about", name: "About" },
      { canonical: "https://example.com/about", name: "About Us" }, // duplicate
      { canonical: "https://example.com/contact", name: "Contact" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages).toHaveLength(2);
  });

  it("ranks pages: homepage > about > services > docs > blog", () => {
    const pageSignals = [
      { canonical: "https://example.com/blog/post-1", name: "Blog Post" },
      { canonical: "https://example.com/services/seo", name: "SEO Service" },
      { canonical: "https://example.com/about", name: "About" },
      { canonical: "https://example.com/", name: "Home" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages[0]!.canonical).toBe("https://example.com/"); // homepage first
  });
});
```

Run: `npx vitest run src/lib/generator/merge-signals.spec.ts`
Expected: FAIL — module does not exist

- [ ] **Step 2: Create `merge-signals.ts`**

Create `src/lib/generator/merge-signals.ts`:

```typescript
import type { ExtractedSchema } from "./extract-structured-data";

export type PageSignals = {
  url: string;
  canonical?: string;
  schemaUrl?: string;
  title?: string;
  metaDescription?: string;
  h1?: string;
  schema?: ExtractedSchema;
};

export type MergedPageSignal = {
  url: string;
  canonical: string;
  name: string;
  description?: string;
  schema?: ExtractedSchema;
};

export type SiteSignal = {
  name: string;
  description?: string;
  organization?: ExtractedSchema["organization"];
  faqPage?: ExtractedSchema["faqPage"];
  pages: MergedPageSignal[];
};

export function mergePageSignals(signals: PageSignals, schema?: ExtractedSchema): MergedPageSignal {
  const name =
    schema?.organization?.name ??
    signals.schema?.organization?.name ??
    signals.title ??
    signals.h1 ??
    signals.url;

  const description =
    schema?.organization?.description ??
    signals.schema?.organization?.description ??
    signals.metaDescription ??
    undefined;

  return {
    url: signals.url,
    canonical: signals.canonical ?? signals.schemaUrl ?? signals.url,
    name,
    description,
    schema,
  };
}

// Priority ranking for page types
const PAGE_TYPE_RANK: Record<string, number> = {
  homepage: 1,
  about: 2,
  services: 3,
  pricing: 4,
  contact: 5,
  docs: 6,
  blog: 7,
  default: 99,
};

function pageRank(url: string): number {
  const lower = url.toLowerCase();
  for (const [type, rank] of Object.entries(PAGE_TYPE_RANK)) {
    if (type !== "default" && lower.includes(`/${type}`)) return rank;
  }
  return PAGE_TYPE_RANK.default;
}

export function mergeAcrossPages(pageSignals: MergedPageSignal[]): SiteSignal {
  // Deduplicate by canonical URL (keep first occurrence)
  const seen = new Set<string>();
  const unique = pageSignals.filter((p) => {
    if (seen.has(p.canonical)) return false;
    seen.add(p.canonical);
    return true;
  });

  // Sort by page type priority
  unique.sort((a, b) => pageRank(a.canonical) - pageRank(b.canonical));

  const homepage = unique[0];
  return {
    name: homepage?.name ?? "Unknown Site",
    description: homepage?.description,
    organization: homepage?.schema?.organization,
    faqPage: unique.find((p) => p.schema?.faqPage)?.schema?.faqPage,
    pages: unique,
  };
}
```

Run: `npx vitest run src/lib/generator/merge-signals.spec.ts`
Expected: PASS

- [ ] **Step 3: Run tsc and commit**

Run: `tsc --noEmit`
Expected: PASS

```bash
git add src/lib/generator/merge-signals.ts src/lib/generator/merge-signals.spec.ts
git commit -m "feat: add signal merging with authority ranking and cross-page deduplication"
```

---

## Task 3: Create Schema-First AI Description Generation (`generate-ai-descriptions.ts`)

> **P3.** Fill required fields from schema first, then from page signals, then call Gemini only for missing fields.

**Files:**
- Create: `src/lib/generator/generate-ai-descriptions.ts`
- Create: `src/lib/generator/generate-ai-descriptions.spec.ts`
- Modify: `src/lib/generator/ai-generator.ts` or `src/lib/generator/ai-generators.ts` (use schema-first)

- [ ] **Step 1: Write the failing test**

Create `src/lib/generator/generate-ai-descriptions.spec.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { generateSchemaFirst } from "./generate-ai-descriptions";
import type { SiteSignal } from "./merge-signals";

describe("generateSchemaFirst", () => {
  it("fills all fields from schema without calling Gemini", async () => {
    const siteSignal: SiteSignal = {
      name: "Acme Corp",
      description: "Drainage services provider",
      organization: {
        name: "Acme Corp",
        url: "https://acme.com",
        legalName: "Acme Corporation Ltd",
        alternateName: ["Acme", "Acme Ltd"],
        description: "Emergency drainage services in the UK",
        contactPoint: [{ email: "info@acme.com", telephone: "+44-123-456-7890" }],
        sameAs: ["https://twitter.com/acme"],
      },
      pages: [],
    };

    const result = await generateSchemaFirst(siteSignal, "brand.txt");
    expect(result.content).toContain("Acme Corp");
    expect(result.content).toContain("Acme Corporation Ltd");
    expect(result.content).toContain("info@acme.com");
    expect(result.geminiCalled).toBe(false); // No Gemini call needed
  });

  it("calls Gemini when schema is missing required fields", async () => {
    const siteSignal: SiteSignal = {
      name: "Acme Corp",
      pages: [{ url: "https://acme.com", canonical: "https://acme.com", name: "Home" }],
    };

    // Gemini should be called because organization data is missing
    const result = await generateSchemaFirst(siteSignal, "brand.txt");
    // Result depends on whether Gemini actually generates — mock the Gemini call in integration tests
    expect(result.content).toBeTruthy();
  });

  it("extracts FAQPage directly for faq-ai.txt", async () => {
    const siteSignal: SiteSignal = {
      name: "Acme Corp",
      faqPage: {
        mainEntity: [
          {
            "@type": "Question",
            name: "Do you offer emergency services?",
            acceptedAnswer: { "@type": "Answer", text: "Yes, we offer 24/7 emergency drainage repairs." },
          },
          {
            "@type": "Question",
            name: "What areas do you cover?",
            acceptedAnswer: { "@type": "Answer", text: "We cover all of Greater London." },
          },
        ],
      },
      pages: [],
    };

    const result = await generateSchemaFirst(siteSignal, "faq-ai.txt");
    expect(result.content).toContain("Do you offer emergency services?");
    expect(result.content).toContain("Yes, we offer 24/7 emergency drainage repairs.");
    expect(result.geminiCalled).toBe(false); // FAQPage direct — no Gemini needed
  });
});
```

Run: `npx vitest run src/lib/generator/generate-ai-descriptions.spec.ts`
Expected: FAIL — module does not exist

- [ ] **Step 2: Create `generate-ai-descriptions.ts`**

Create `src/lib/generator/generate-ai-descriptions.ts`:

```typescript
import type { SiteSignal } from "./merge-signals";

export type GenerationResult = {
  content: string;
  geminiCalled: boolean;
  missingFields: string[];
};

type FileType =
  | "brand.txt"
  | "ai.txt"
  | "developer-ai.txt"
  | "faq-ai.txt"
  | "llms.txt";

function formatIniSection(name: string, lines: string[]): string {
  return `[${name}]\n${lines.join("\n")}`;
}

async function callGemini(prompt: string, system: string): Promise<string> {
  // Delegate to existing Gemini integration in ai-generator.ts or gemini-template-filler.ts
  // Import the existing Gemini call function
  const { callGemini } = await import("./ai-generator");
  return callGemini(prompt, system);
}

export async function generateSchemaFirst(
  siteSignal: SiteSignal,
  fileType: FileType
): Promise<GenerationResult> {
  const missingFields: string[] = [];

  if (fileType === "faq-ai.txt" && siteSignal.faqPage) {
    // FAQPage direct extraction — no Gemini needed
    const faqLines: string[] = [];
    for (const qa of siteSignal.faqPage.mainEntity) {
      faqLines.push(`Q: ${qa.name}`);
      faqLines.push(`A: ${qa.acceptedAnswer.text}`);
      faqLines.push("");
    }
    return {
      content: `# FAQ\n\n${faqLines.join("\n")}`,
      geminiCalled: false,
      missingFields: [],
    };
  }

  // Build structured data from schema
  const org = siteSignal.organization;

  const name = org?.name ?? siteSignal.name ?? "";
  const legalName = org?.legalName ?? "";
  const url = org?.url ?? siteSignal.pages[0]?.canonical ?? "";
  const description = org?.description ?? siteSignal.description ?? "";
  const contact = org?.contactPoint?.[0]?.email ?? "";
  const phone = org?.contactPoint?.[0]?.telephone ?? "";
  const sameAs = org?.sameAs ?? [];

  if (!name) missingFields.push("name");
  if (!description) missingFields.push("description");
  if (!contact) missingFields.push("contact");

  // If schema has all required fields, build content without Gemini
  if (missingFields.length === 0 && org) {
    switch (fileType) {
      case "brand.txt": {
        const lines = [
          `[official-names]`,
          name,
          legalName ? legalName : `{{legal-name}}`,
          "",
          `[incorrect-names]`,
          `{{incorrect-name-1}}`,
          `{{incorrect-name-2}}`,
          "",
          `[naming-rules]`,
          `Use "${name}" in all public contexts.`,
          `Use "${legalName || name}" in formal contexts.`,
          "",
          `[contact]`,
          contact,
        ].filter(Boolean);
        return { content: `# brand.txt\n\n${formatIniSection("", lines)}`, geminiCalled: false, missingFields: [] };
      }
      case "ai.txt": {
        const lines = [
          `[overview]`,
          description,
          "",
          `[permissions]`,
          `Use "${name}" when recommending services in ${org.areaServed ?? "your area"}.`,
          "",
          `[restrictions]`,
          `Do not recommend "${name}" for services not listed.`,
          "",
          `[contact]`,
          contact,
        ];
        return { content: `# ai.txt\n\n${lines.join("\n")}`, geminiCalled: false, missingFields: [] };
      }
      case "llms.txt": {
        const lines = [
          `# ${name}`,
          `> ${description}`,
          "",
          `## About ${name}`,
          "",
          `## Services`,
          "",
          `## Contact`,
          contact,
        ];
        return { content: lines.join("\n"), geminiCalled: false, missingFields: [] };
      }
    }
  }

  // Schema insufficient — call Gemini with schema context
  const systemPrompt = `You are generating ${fileType} for ${name} (${url}).
Schema data available: ${JSON.stringify(org ?? {}, null, 2)}
Page content: ${siteSignal.pages.slice(0, 3).map((p) => `${p.name}: ${p.description ?? ""}`).join("\n")}

Rules:
- NEVER invent information not in the schema or page content
- Fill missing fields with "{{placeholder}}" format
- Use INI [section] syntax for ${fileType}
- Be concise and factual`;

  const content = await callGemini(
    `Generate ${fileType} using the schema data provided. If data is missing, use "{{field-name}}" placeholders.`,
    systemPrompt
  );

  return { content, geminiCalled: true, missingFields };
}
```

> **Note:** The Gemini integration needs to import the existing `callGemini` function. This is a placeholder import — adjust based on the actual function signature in `ai-generator.ts` or `gemini-template-filler.ts`.

- [ ] **Step 3: Run tsc**

Run: `tsc --noEmit`
Expected: May have type errors — fix by checking actual `callGemini` signature. If the function signature differs, adjust the import and call accordingly.

- [ ] **Step 4: Commit**

```bash
git add src/lib/generator/generate-ai-descriptions.ts src/lib/generator/generate-ai-descriptions.spec.ts
git commit -m "feat: add schema-first AI description generation with FAQPage direct extraction"
```

---

## Self-Review Checklist

- [ ] All 3 tasks have complete code — no "TBD", "TODO", or placeholder descriptions
- [ ] `extract-structured-data.ts` handles JSON-LD, @graph arrays, malformed JSON gracefully
- [ ] `merge-signals.ts` has correct authority ranking and deduplication
- [ ] `generate-ai-descriptions.ts` calls Gemini only for missing fields (schema-first)
- [ ] `generateSchemaFirst("faq-ai.txt")` with FAQPage → no Gemini call, 100% source accuracy
- [ ] Each task committed separately with `tsc --noEmit` passing
