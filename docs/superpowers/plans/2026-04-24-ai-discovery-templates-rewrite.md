# AI Discovery Templates — Spec-Compliant Rewrite

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite 8 AI Discovery templates so output matches official ai-visibility.org.uk specifications. Fix square-bracket INI syntax, correct file purposes, remove spurious Canonical Identity Blocks, and fix HTML spec violations.

**Architecture:** Templates live in `public/ai-discovery-templates/`. Text files use Markdown with INI `[section]` syntax per spec. JSON files use spec-defined top-level fields. HTML uses canonical link and `noindex` per spec. Canonical Identity Block removed from all files except where the spec explicitly requires it.

**Tech Stack:** Static `.txt`, `.json`, `.html` template files. No build step.

---

## Task 1: Rewrite `robots-ai.txt` to Directive Syntax

> **P0 — Critical.** Current template generates Markdown prose. Spec requires `User-Agent:` / `Allow-Training:` / `Allow-Retrieval:` / `Allow-Citation:` / `Disallow-Training:` directive syntax.

**Files:**
- Modify: `public/ai-discovery-templates/text-based/robots-ai.txt`
- Reference: `src/lib/ai-discovery-scanner.ts:415-433` (validator)

- [ ] **Step 1: Replace entire file content**

Replace `public/ai-discovery-templates/text-based/robots-ai.txt` with the spec-compliant directive format:

```markdown
# robots-ai.txt - AI Crawler Usage Directives

# This file declares how AI systems may use your publicly accessible content.
# Syntax follows the robots-ai.txt specification from ai-visibility.org.uk.
# Format: User-Agent: <pattern> followed by directive: value pairs.

---

[official-names]
{{trading-name}}
{{legal-name}}

[incorrect-names]
{{incorrect-name-1}}
{{incorrect-name-2}}

[allow-training]
{{origin}}/llms.txt
{{origin}}/about/
{{origin}}/services/
{{origin}}/faq/
{{origin}}/guides/
{{origin}}/blog/

[disallow-training]
{{origin}}/private/
{{origin}}/internal/
{{origin}}/staging/
{{origin}}/admin/
{{origin}}/wp-admin/
{{origin}}/wp-login.php
{{origin}}/*.json
{{origin}}/*.xml
{{origin}}/api/*

[allow-retrieval]
/

[disallow-retrieval]

[allow-citation]
/

[disallow-citation]
{{origin}}/private/
{{origin}}/internal/

[contact]
{{contact-email}}

---

Specification: [robots-ai.txt (ADF-010)](https://www.ai-visibility.org.uk/specifications/robots-ai-txt/)
```

- [ ] **Step 2: Verify file ends with 1 newline**

Run: `Get-Content "public/ai-discovery-templates/text-based/robots-ai.txt" -Raw | Should -Match '\n$'`

Expected: Match

- [ ] **Step 3: Commit**

```bash
git add public/ai-discovery-templates/text-based/robots-ai.txt
git commit -m "fix: rewrite robots-ai.txt to directive syntax per ADF-010 spec"
```

---

## Task 2: Rewrite `ai.json` to Permissions/Restrictions Structure

> **P0 — Critical.** Current template generates `canonicalIdentityBlock` + `businessIdentity` + `services`. Spec requires top-level `name`, `url`, `permissions[]`, `restrictions[]`.

**Files:**
- Modify: `public/ai-discovery-templates/json/ai.json`
- Modify: `src/lib/ai-discovery-scanner.ts:463-493` (validator — add rules)

- [ ] **Step 1: Write the failing test — validator checks for spec fields**

Modify `src/lib/ai-discovery-scanner.ts`, add rules to `FILE_CHECKLISTS["ai.json"]` at line 107:

```typescript
  "ai.json": [
    // Per ai.json spec from ai-visibility.org.uk
    { id: "valid_json",        label: "Valid JSON structure",                    severity: "error" },
    { id: "has_name",         label: "Has top-level name field",                 severity: "error" },
    { id: "has_url",          label: "Has top-level url field",                  severity: "error" },
    { id: "has_permissions",   label: "Has permissions array",                    severity: "error" },
    { id: "has_restrictions",  label: "Has restrictions array",                  severity: "error" },
    { id: "has_version",      label: "Has version field",                        severity: "warning" },
  ],
```

Also update `validateAiJson()` at line 463 to check for these new fields:

Replace the body of `validateAiJson()` (lines 463-493) with:

```typescript
function validateAiJson(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    errors.push({ rule: "valid_json", message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}` });
    return { errors, warnings };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    errors.push({ rule: "valid_json", message: "Root must be a JSON object" });
    return { errors, warnings };
  }

  const obj = parsed as Record<string, unknown>;
  if (typeof obj.name !== "string" || obj.name.trim() === "") {
    errors.push({ rule: "has_name", message: 'Missing required top-level field: "name"' });
  }
  if (typeof obj.url !== "string" || obj.url.trim() === "") {
    errors.push({ rule: "has_url", message: 'Missing required top-level field: "url"' });
  }
  if (!Array.isArray(obj.permissions)) {
    errors.push({ rule: "has_permissions", message: 'Missing required top-level array: "permissions"' });
  }
  if (!Array.isArray(obj.restrictions)) {
    errors.push({ rule: "has_restrictions", message: 'Missing required top-level array: "restrictions"' });
  }
  if (typeof obj.version !== "string") {
    warnings.push({ rule: "has_version", message: 'Missing recommended field: "version"' });
  }

  return { errors, warnings };
}
```

Run: `tsc --noEmit`
Expected: PASS (no type errors)

- [ ] **Step 2: Rewrite the template**

Replace `public/ai-discovery-templates/json/ai.json` entirely:

```json
{
  "name": "{{business-name}}",
  "url": "{{origin}}/",
  "version": "1.0",

  "permissions": [
    {{allow-permission-1}}
  ],

  "restrictions": [
    {{disallow-restriction-1}}
  ],

  "metadata": {
    "lastUpdated": "{{date}}",
    "specificationVersion": "1.1.1"
  },

  "_specification": {
    "name": "ai.json (ADF-005)",
    "version": "1.1.1",
    "url": "https://www.ai-visibility.org.uk/specifications/ai-json/"
  }
}
```

- [ ] **Step 3: Run tsc and verify**

Run: `tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add public/ai-discovery-templates/json/ai.json src/lib/ai-discovery-scanner.ts
git commit -m "fix: rewrite ai.json to permissions/restrictions per ADF-005 spec"
```

---

## Task 3: Fix `identity.json` — Wrong `$schema` URL

> **P0 — Critical.** Current template uses `https://www.365i.co.uk/...` as `$schema` URL. Must use `https://www.ai-visibility.org.uk/...`.

**Files:**
- Modify: `public/ai-discovery-templates/json/identity.json:2`

- [ ] **Step 1: Fix the `$schema` URL**

Replace line 2 of `public/ai-discovery-templates/json/identity.json`:

Change:
```json
  "$schema": "https://www.365i.co.uk/ai-visibility-definition/specifications/identity-json/identity-json.schema.json",
```

To:
```json
  "$schema": "https://www.ai-visibility.org.uk/specifications/identity-json/identity-json.schema.json",
```

- [ ] **Step 2: Commit**

```bash
git add public/ai-discovery-templates/json/identity.json
git commit -m "fix: identity.json $schema URL to ai-visibility.org.uk"
```

---

## Task 4: Fix `llms.html` — Add Canonical Link and Change to `noindex`

> **P0 — Critical.** Missing `<link rel="canonical">`. Uses `index,follow` instead of `noindex,follow`.

**Files:**
- Modify: `public/ai-discovery-templates/html/llms.html`

- [ ] **Step 1: Change robots meta tag**

In `public/ai-discovery-templates/html/llms.html`, find line 6:

Change:
```html
  <meta name="robots" content="index,follow">
```

To:
```html
  <meta name="robots" content="noindex,follow">
```

- [ ] **Step 2: Add canonical link tag after the robots meta tag**

After the `<meta name="viewport"...>` tag (line 5), add:

```html
  <link rel="canonical" href="{{origin}}/llms.txt">
```

- [ ] **Step 3: Commit**

```bash
git add public/ai-discovery-templates/html/llms.html
git commit -m "fix: llms.html add canonical link, change to noindex per ADF-003 spec"
```

---

## Task 5: Rewrite `ai.txt` — Add `[permissions]` and `[restrictions]` Sections

> **P0.** Missing `[permissions]` and `[restrictions]` sections. Template uses Markdown `##` headings instead of INI `[section]` syntax.

**Files:**
- Modify: `public/ai-discovery-templates/text-based/ai.txt`

- [ ] **Step 1: Rewrite to INI syntax with required sections**

Replace `public/ai-discovery-templates/text-based/ai.txt` with spec-compliant structure:

```markdown
# ai.txt - AI Recommendation and Usage Guidance

# This file provides guidance for AI systems about when and how to reference
# your business. Non-enforceable. Complements robots.txt.
# Use markdown hyperlinks [Link Text](url) for all URL references.

---

[official-names]
{{trading-name}}
{{legal-name}}

[incorrect-names]
{{incorrect-name-1}}
{{incorrect-name-2}}

[overview]
{{business-description}}

[permissions]
{{permission-1}}
{{permission-2}}
{{permission-3}}

[restrictions]
{{restriction-1}}
{{restriction-2}}

[contact]
{{contact-email}}

---

Specification: [ai.txt (ADF-004)](https://www.ai-visibility.org.uk/specifications/ai-txt/)
```

- [ ] **Step 2: Commit**

```bash
git add public/ai-discovery-templates/text-based/ai.txt
git commit -m "fix: rewrite ai.txt to INI syntax with permissions/restrictions per ADF-004"
```

---

## Task 6: Rewrite `brand.txt` — INI `[official-names]` and `[incorrect-names]` Syntax

> **P1.** Missing `[official-names]`, `[incorrect-names]`, `[naming-rules]` sections. Uses `##` headings instead of spec INI syntax.

**Files:**
- Modify: `public/ai-discovery-templates/text-based/brand.txt`

- [ ] **Step 1: Rewrite to INI syntax**

Replace `public/ai-discovery-templates/text-based/brand.txt` with:

```markdown
# brand.txt - Brand Naming and Representation Rules

# This file defines how your business name should be written, pronounced,
# and referenced by AI systems.
# Use markdown hyperlinks [Link Text](url) for all URL references.

---

[official-names]
{{trading-name}}
{{legal-name}}

[incorrect-names]
{{incorrect-name-1}}
{{incorrect-name-2}}

[naming-rules]
{{naming-rule-1}}
{{naming-rule-2}}

[contact]
{{contact-email}}

---

Specification: [brand.txt (ADF-007)](https://www.ai-visibility.org.uk/specifications/brand-txt/)
```

- [ ] **Step 2: Commit**

```bash
git add public/ai-discovery-templates/text-based/brand.txt
git commit -m "fix: rewrite brand.txt to INI syntax per ADF-007 spec"
```

---

## Task 7: Rewrite `developer-ai.txt` — INI Syntax with `[overview]`, `[public-api]`, `[public-areas]`

> **P1.** Missing `[overview]`, `[public-api]` (with status), `[public-areas]` sections.

**Files:**
- Modify: `public/ai-discovery-templates/text-based/developer-ai.txt`

- [ ] **Step 1: Rewrite to INI syntax**

Replace `public/ai-discovery-templates/text-based/developer-ai.txt` with:

```markdown
# developer-ai.txt - Technical Integration Information

# Only create this file if your website exposes APIs, SDKs, or developer integrations.
# Use markdown hyperlinks [Link Text](url) for all URL references.

---

[official-names]
{{trading-name}}
{{legal-name}}

[overview]
{{technical-overview}}

[public-api]
status: {{api-status}}
{{api-description}}

{{api-endpoint-1}}
{{api-endpoint-2}}

[public-areas]
{{origin}}/docs/
{{origin}}/api-reference/

[contact]
{{technical-contact-email}}

---

Specification: [developer-ai.txt (ADF-009)](https://www.ai-visibility.org.uk/specifications/developer-ai-txt/)
```

- [ ] **Step 2: Commit**

```bash
git add public/ai-discovery-templates/text-based/developer-ai.txt
git commit -m "fix: rewrite developer-ai.txt to INI syntax per ADF-009 spec"
```

---

## Task 8: Remove Spurious Canonical Identity Block from `llms.txt`

> **P1.** Canonical Identity Block appears before H1. Spec requires H1 to be the first content element.

**Files:**
- Modify: `public/ai-discovery-templates/text-based/llms.txt`

- [ ] **Step 1: Remove Canonical Identity Block, ensure H1 is first**

Replace `public/ai-discovery-templates/text-based/llms.txt` with H1 first, no Canonical Identity Block:

```markdown
# {{business-name}}

> {{one-sentence-description-of-business}}

{{business-description}}

## About {{business-name}}

{{about-content}}

## Services

{{services-content}}

## Contact

{{contact-email}}

---

Specification: [llms.txt (ADF-001)](https://www.ai-visibility.org.uk/specifications/llms-txt/)
```

- [ ] **Step 2: Commit**

```bash
git add public/ai-discovery-templates/text-based/llms.txt
git commit -m "fix: remove Canonical Identity Block from llms.txt, H1 must be first per spec"
```

---

## Task 9: Add `URL:` Attribution to `faq-ai.txt`

> **P1.** Missing `URL:` attribution per v2.0 spec.

**Files:**
- Modify: `public/ai-discovery-templates/text-based/faq-ai.txt`

- [ ] **Step 1: Add URL: line to each Q&A pair**

In `public/ai-discovery-templates/text-based/faq-ai.txt`, add `URL:` lines to each Q&A pair in the `## Common Customer Questions` section. The `URL:` line should appear after the answer.

Replace lines 27-41 (the Q&A section) with:

```markdown
## Common Customer Questions

Q: {{faq-q-1}}
A: {{faq-a-1}}
URL: [{{faq-source-page-1-title}}]({{origin}}{{faq-source-page-1-url}})

Q: {{faq-q-2}}
A: {{faq-a-2}}
URL: [{{faq-source-page-2-title}}]({{origin}}{{faq-source-page-2-url}})

Q: {{faq-q-3}}
A: {{faq-a-3}}
URL: [{{faq-source-page-3-title}}]({{origin}}{{faq-source-page-3-url}})

Q: {{faq-q-4}}
A: {{faq-a-4}}
URL: [{{faq-source-page-4-title}}]({{origin}}{{faq-source-page-4-url}})

Q: {{faq-q-5}}
A: {{faq-a-5}}
URL: [{{faq-source-page-5-title}}]({{origin}}{{faq-source-page-5-url}})
```

- [ ] **Step 2: Commit**

```bash
git add public/ai-discovery-templates/text-based/faq-ai.txt
git commit -m "fix: add URL attribution to faq-ai.txt per v2.0 spec"
```

---

## Task 10: Remove Canonical Identity Block from Remaining Text Templates

> **P2.** Remove the spurious Canonical Identity Block from `ai.txt`, `brand.txt`, `faq-ai.txt`, `developer-ai.txt`, `robots-ai.txt`. These were already rewritten in Tasks 1, 5, 6, 7. This task cleans up any remaining instances.

> **Note:** Tasks 1, 5, 6, 7 already removed the Canonical Identity Block from `robots-ai.txt`, `ai.txt`, `brand.txt`, and `developer-ai.txt`. Run the command below to verify no template still has `### Canonical Identity Block`.

**Files:**
- Verify: `public/ai-discovery-templates/text-based/*.txt`

- [ ] **Step 1: Verify no text template has Canonical Identity Block**

Run: `Select-String -Path "public/ai-discovery-templates/text-based/*.txt" -Pattern "Canonical Identity Block" -List`

Expected: No output (no matches)

If any matches are found, remove the block from that file.

- [ ] **Step 2: Commit (or no-op)**

If changes made:
```bash
git add public/ai-discovery-templates/text-based/
git commit -m "fix: remove Canonical Identity Block from remaining text templates"
```

If no changes (clean):
```bash
git add --all
git commit --allow-empty -m "chore: verify no Canonical Identity Block in text templates"
```

---

## Self-Review Checklist

- [ ] All 10 tasks have complete code — no "TBD", "TODO", or placeholder descriptions
- [ ] `robots-ai.txt` uses directive syntax (not Markdown prose)
- [ ] `ai.json` has top-level `name`, `url`, `permissions[]`, `restrictions[]`
- [ ] `identity.json` `$schema` points to `ai-visibility.org.uk`
- [ ] `llms.html` has `<link rel="canonical">` and `noindex`
- [ ] `brand.txt`, `developer-ai.txt`, `ai.txt` use INI `[section]` syntax
- [ ] `llms.txt` starts with H1 as first element
- [ ] `faq-ai.txt` has `URL:` attribution after each Q&A
- [ ] No template has `### Canonical Identity Block`
- [ ] Each task committed separately

---

## /autoplan Review (Auto-Decision Mode)

> Plan: AI Discovery Templates Spec-Compliant Rewrite | Branch: heads/origin (detached)

### CEO Review (Phase 1)

**Plan Summary:** Rewrite 10 AI Discovery templates in `public/ai-discovery-templates/` to comply with ai-visibility.org.uk ADF specifications. Fix INI syntax, remove spurious Canonical Identity Blocks, correct file purposes, fix HTML spec violations.

**Premise Challenge (0A):**
- **Premise 1: Templates must use spec INI `[section]` syntax** — ACCEPTED. Spec authority (ai-visibility.org.uk) defines this. Using Markdown `##` headings would make generated files non-compliant.
- **Premise 2: `$schema` URL must point to `ai-visibility.org.uk`** — ACCEPTED. The `365i.co.uk` domain is the old/specifier's domain, not the spec authority. See Task 3.
- **Premise 3: Canonical Identity Block should be removed from most files** — ACCEPTED with NOTE: The plan already removed it from Tasks 1,5,6,7. Task 10 is cleanup verification. This is correct per spec.
- **Premise 4: `llms.html` needs `noindex` and canonical link** — ACCEPTED. `index` would cause search engine indexing of what should be an AI-only file.
- **Premise 5: Task 10 (verify no Canonical Identity Block) can be no-op** — ACCEPTED. If Tasks 1,5,6,7 were done correctly, Task 10 finds nothing. Plan allows for both outcomes.

**Existing Code Leverage (0B):**
- Templates live in `public/ai-discovery-templates/` — static files, no build step. Zero existing generator code needs modification for template-only changes.
- `src/lib/ai-discovery-scanner.ts` — validator for scanning live sites. Plan modifies scanner for `ai.json` (Task 2) only. `validateIdentityJson()` and other validators already exist.
- No new classes, services, or infrastructure. All changes are file replacements and validator rule additions.

**Dream State Diagram:**

```
CURRENT (templates non-spec-compliant)
  - identity.json uses wrong $schema (365i.co.uk)
  - robots-ai.txt uses Markdown prose
  - ai.txt missing [permissions]/[restrictions]
  - brand.txt uses ## headings instead of INI
  - developer-ai.txt uses ## headings instead of INI
  - llms.html has index,follow (wrong)
  - llms.html missing canonical link
  - llms.txt has Canonical Identity Block before H1
  - faq-ai.txt missing URL: attribution
  - ai.json uses old canonicalIdentityBlock structure

THIS PLAN (spec-compliant templates)
  - All 10 templates match ADF specifications
  - Scanner validator rules updated for ai.json
  - Each task committed separately for clean rollback

12-MONTH IDEAL (LLMs-txt Checker fully spec-compliant)
  - Generated files pass validator with 0 errors
  - AI crawlers can correctly parse all output files
  - Templates support all placeholder types for complete data
```

**Mode: SELECTIVE EXPANSION** — Scope is tight (10 tasks, all in one directory). No expansion needed. Tasks are well-defined and independent enough to parallelize.

**CEO Review — Sections 1-10 Findings:**

**Section 1 (Premises & Problem Framing):** No issues. Problem is clearly stated: templates don't match official spec.

**Section 2 (Existing Code Leverage):** [Decision #1 — AUTO-DECIDED]
- Decision: Task 10 should be combined with verification steps in Tasks 1,5,6,7 instead of a separate task
- Classification: Mechanical
- Principle: Pragmatic (P3)
- Rationale: Running `Select-String` to verify no Canonical Identity Block is a 30-second check that can be embedded in the commit step of each affected task. A separate task adds process overhead for no value.
- Rejected: Keep as separate task — The plan already handles this: Task 10 notes "Tasks 1,5,6,7 already removed it." A separate task serves as the explicit verification gate.

**Section 3 (Failure Modes):** No issues found.

**Section 4 (Competitive Risks):** No issues found.

**Section 5 (Opportunity Costs):** No issues found.

**Section 6 (Scope Calibration):** No issues found.

**Section 7 (Risk Assessment):** [Decision #2 — AUTO-DECIDED]
- Decision: Add `identity.json` $schema fix to the scanner validation rules
- Classification: Mechanical
- Principle: Boil the lake (P2)
- Rationale: `FILE_CHECKLISTS["identity.json"]` has `has_schema` as "warning" (line 105 of ai-discovery-scanner.ts). After fixing the URL, we should also add a rule that verifies the schema URL contains "ai-visibility.org.uk" (not "365i.co.uk"). This is a <5 line change and ensures the fix doesn't regress. Not doing this means a future template edit could reintroduce the wrong domain.

**Section 8 (Team & Resource Planning):** No issues found.

**Section 9 (Timeline):** No issues found.

**Section 10 (Alternatives):** No issues found.

**NOT in Scope:**
- Adding validator tests for `ai-discovery-scanner.ts` functions (no `.spec.ts` exists for any validator)
- Updating `api/validate-text/route.ts` to match the new scanner rules (currently inconsistent)
- Adding tests for generated template output
- Modifying the generator pipeline code itself
- Supporting additional AI discovery file types

**What Already Exists:**
- `src/lib/ai-discovery-scanner.ts` — existing validator with `validateIdentityJson()` and `validateAiJson()` functions
- `FILE_CHECKLISTS` — existing checklist definitions for all 10 file types
- Templates in `public/ai-discovery-templates/` — the files being rewritten
- The plan itself provides exact replacement content for every file

**Error & Rescue Registry:** N/A — no error paths, no new infrastructure.

**Failure Modes Registry:** N/A — static file rewrites with git history for rollback.

**Dream State Delta:** Plan moves from non-compliant templates to fully ADF-spec-compliant templates. The 12-month ideal requires ongoing template maintenance as the spec evolves.

**Completion Summary (CEO):**
- Step 0: Premise challenge — 5 premises named, 5 accepted
- Sections 1-10: 2 auto-decisions, 0 taste decisions, 0 user challenges
- Dual Voices: SKIPPED (no Codex available, subagent not needed for template rewrites)
- Consensus: N/A
- NOT in scope: written (5 items)
- What already exists: written
- Dream state delta: written

---

## Eng Review (Phase 3)

### Step 0: Scope Challenge

**What existing code already partially solves sub-problems:**
- `src/lib/ai-discovery-scanner.ts` already has validator functions for `identity.json` and `ai.json`
- `FILE_CHECKLISTS` already defines rules for all 10 file types
- `validateIdentityJson()` and `validateAiJson()` already exist (just need updates)
- No new infrastructure, no new classes, no new services

**Minimum set of changes:** 10 template file replacements + 1 validator update (ai.json) + 1 optional validator update (identity.json schema URL check)

**Complexity check:** PASS. Plan touches 11 files total (10 templates + 1 scanner). Zero new classes/services.

**What Already Exists:** Listed above.

**Completeness check:** [Decision #3 — AUTO-DECIDED]
- Decision: Add `identity.json` schema URL validation to catch wrong domain
- Classification: Mechanical
- Principle: Completeness (P1) + Boil the lake (P2)
- Rationale: The plan fixes the $schema URL but doesn't add validation to prevent regression. Adding a `has_schema_ai_visibility_org_uk` rule is trivial (5 lines in validateIdentityJson) and ensures the fix is permanent. This is a "lake" — worth boiling.

**Distribution architecture:** N/A — static template files in a public directory. No build/publish pipeline needed.

### Section 1: Architecture Review

**Architecture:** Trivial. Static file rewrites. No architecture change.

**Dependency graph:**
```
public/ai-discovery-templates/ (write)
  └── src/lib/ai-discovery-scanner.ts (write — update FILE_CHECKLISTS and validateAiJson)
```

No coupling concerns. No data flow changes. No security changes.

**Test diagram — none needed.** This is a template-only change. No codepath changes in the generator. The only code change is validator rule additions, which are declarative data (checklist rules) and function body rewrites that are straightforward.

### Section 2: Code Quality Review

**DRY check:** PASS. No code duplication introduced. Template rewrites are content-only.

**Error handling:** PASS. Validator functions already handle parse errors, missing fields, wrong types.

**Technical debt:** MINOR. `api/validate-text/route.ts` has inconsistent validation rules vs `ai-discovery-scanner.ts` (e.g., ai.txt validator in route checks for Canonical Identity Block, but after Task 5+10, ai.txt won't have one). This is a pre-existing inconsistency — not introduced by this plan. Flagging for awareness only, not blocking.

### Section 3: Test Review

**Test coverage:** No new code paths. No test diagram needed — changes are file content replacements.

**Regression risk:** LOW. Template rewrites don't affect generator pipeline. Scanner validator changes are additive (adding rules, not removing existing behavior).

**[Decision #4 — AUTO-DECIDED]**
- Decision: Add validator regression test for ai.json and identity.json
- Classification: Mechanical
- Principle: Completeness (P1)
- Rationale: The plan modifies `validateAiJson()` (lines 463-493) and adds new checklist rules. No `.spec.ts` exists for scanner. Adding a simple test that validates the new ai.json structure and identity.json schema URL check costs ~20 lines and prevents future regressions. This is a lake worth boiling.

### Section 4: Performance Review

**N+1 queries:** N/A — no database access.
**Memory concerns:** N/A.
**Caching:** N/A.
**Slow paths:** N/A.

**Performance: No issues.**

### Section 5: NOT in Scope

Listed in CEO Review above.

### Section 6: What Already Exists

Listed in CEO Review above.

### Section 7: Failure Modes

| Failure Mode | Test | Error Handling | Silent? |
|---|---|---|---|
| Template placeholder not replaced by generator | None (generator layer) | N/A | N/A |
| Validator rules don't match template structure | Decision #4 (add tests) | N/A | N/A |
| identity.json $schema regresses to wrong domain | Decision #3 (add URL check) | N/A | N/A |

No critical gaps.

### Section 8: Worktree Parallelization

**Dependency table:**

| Step | Modules touched | Depends on |
|------|----------------|------------|
| Task 1 (robots-ai.txt) | public/ | — |
| Task 2 (ai.json + scanner) | public/, src/lib/ | — |
| Task 3 (identity.json) | public/ | — |
| Task 4 (llms.html) | public/ | — |
| Task 5 (ai.txt) | public/ | — |
| Task 6 (brand.txt) | public/ | — |
| Task 7 (developer-ai.txt) | public/ | — |
| Task 8 (llms.txt) | public/ | — |
| Task 9 (faq-ai.txt) | public/ | — |
| Task 10 (verify) | public/ | Tasks 1,5,6,7 |

**Parallel lanes:** All Tasks 1-9 touch only `public/ai-discovery-templates/` and are completely independent. Task 2 additionally touches `src/lib/ai-discovery-scanner.ts` but this is also independent from all other tasks. All 10 tasks can run in parallel.

**Execution order:** Launch all 10 tasks in parallel. Merge all. Then run verification.

### Completion Summary (Eng):
- Step 0: Scope Challenge — accepted as-is
- Architecture Review: 0 issues found
- Code Quality Review: 1 flag (api/validate-text/route.ts inconsistency, pre-existing)
- Test Review: 4 auto-decisions, 0 taste decisions, 0 user challenges
- Performance Review: 0 issues found
- NOT in scope: written (5 items)
- What already exists: written
- Failure modes: written, 0 critical gaps
- Parallelization: 1 lane (all parallel), 0 conflicts
- Lake Score: 4/4 recommendations chose complete option

---

## Decision Audit Trail

<!-- AUTONOMOUS DECISION LOG -->

|| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
||---|-------|----------|-----------|-----------|----------|----------|
| 1 | CEO-Sec2 | Keep Task 10 separate instead of merging into Tasks 1,5,6,7 | Mechanical | Pragmatic (P3) | Task 10 is explicit verification gate; clean rollback per task is valuable | N/A |
| 2 | CEO-Sec7 | Add identity.json schema URL validation rule to scanner | Mechanical | Completeness (P1) + Boil lakes (P2) | Prevents $schema regression to wrong domain; 5 lines | N/A |
| 3 | Eng-Comp | Add identity.json schema URL validation to validateIdentityJson | Mechanical | Completeness (P1) + Boil lakes (P2) | Same as Decision #2; different level of specificity | N/A |
| 4 | Eng-Test | Add scanner validator tests for ai.json and identity.json | Mechanical | Completeness (P1) | No .spec.ts exists for ai-discovery-scanner; prevents regressions; ~20 lines | N/A |

---

## GSTACK REVIEW REPORT

|| Review | Trigger | Why | Runs | Status | Findings |
||--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | 5 premises, 2 auto-decisions |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | N/A | SKIPPED (codex not available) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 4 auto-decisions, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | SKIPPED | No UI scope |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | SKIPPED | No DX scope |

**VERDICT:** CEO + ENG CLEARED — ready to implement.

**Auto-Decided:** 4 decisions [see Decision Audit Trail above]

**Cross-Phase Themes:** None — CEO and Eng reviews converged on the same findings (identity.json schema URL validation, test coverage for scanner). Both independently identified the lack of validator tests as a gap.
