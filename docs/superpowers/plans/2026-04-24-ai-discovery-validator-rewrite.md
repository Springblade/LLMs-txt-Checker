# AI Discovery Validator — Spec-Based Rewrite

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `src/lib/ai-discovery-scanner.ts` to validate against official ai-visibility.org.uk specifications instead of against the old templates. Consolidate with `src/lib/validator.ts`, remove template-based rules, add spec-based rules for all 10 file types.

**Architecture:** Single validator file (`ai-discovery-scanner.ts`). `validator.ts` becomes a thin wrapper or is removed. Rules check spec compliance, not template structure. `FILE_CHECKLISTS` is updated per file type. Validation functions use INI section parsing where needed.

**Tech Stack:** TypeScript, Node.js, Zod for schema validation.

---

## Task 1: Audit and Update `llms.txt` Validation Rules

> **P1.** Add `## Contact` section rule. Remove template-based rules (e.g., broken link check from validation — that belongs in a consistency check, not a spec validation).

**Files:**
- Modify: `src/lib/ai-discovery-scanner.ts`

- [ ] **Step 1: Update `FILE_CHECKLISTS["llms.txt"]` — add Contact rule**

In `src/lib/ai-discovery-scanner.ts`, find `FILE_CHECKLISTS["llms.txt"]` (line 46) and add the Contact rule:

```typescript
  "llms.txt": [
    // Per llms.txt spec from ai-visibility.org.uk
    { id: "markdown_format",  label: "Valid Markdown format",                        severity: "error" },
    { id: "has_h1",         label: "H1 heading (brand/project name)",              severity: "error" },
    { id: "quote_block",     label: "Blockquote (one-sentence summary)",              severity: "error" },
    { id: "has_contact",     label: "## Contact section present",                    severity: "warning" },
    { id: "has_h2",          label: "H2 sections (groups of related links)",          severity: "warning" },
    { id: "has_links",       label: "Link lists (title + URL)",                      severity: "warning", showValue: true },
  ],
```

- [ ] **Step 2: Update `validateLlmsTxtContent()` — check for ## Contact**

Find `validateLlmsTxtContent()` at line 206. Add a check for `## Contact` H2 section. In the `for` loop that scans lines, after checking `h2Count`, add:

```typescript
  // Check for ## Contact section (required per ai-visibility.org.uk spec S4)
  const hasContact = /^##\s+Contact\b/im.test(content);
  if (!hasContact) {
    warnings.push({
      rule: "has_contact",
      message: "Missing ## Contact section — recommended per spec",
    });
  }
```

- [ ] **Step 3: Run tsc**

Run: `tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai-discovery-scanner.ts
git commit -m "fix: add ## Contact validation rule for llms.txt"
```

---

## Task 2: Update `ai.txt` Validator — Check INI Sections

> **P1.** Validator currently only checks for `has_identity_block` (template rule). Should check for INI `[permissions]` and `[restrictions]` sections.

**Files:**
- Modify: `src/lib/ai-discovery-scanner.ts`

- [ ] **Step 1: Update `FILE_CHECKLISTS["ai.txt"]`**

Replace `FILE_CHECKLISTS["ai.txt"]` (line 62) with:

```typescript
  "ai.txt": [
    // Per ai.txt spec from ai-visibility.org.uk (ADF-004)
    { id: "has_permissions", label: "[permissions] section present",   severity: "error" },
    { id: "has_restrictions", label: "[restrictions] section present", severity: "error" },
    { id: "has_h2",         label: "H2 sections present",           severity: "warning" },
    { id: "has_links",       label: "Links present",                severity: "warning" },
  ],
```

- [ ] **Step 2: Update `validateAiTxt()` function**

Replace `validateAiTxt()` (lines 299-317) with:

```typescript
function validateAiTxt(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Per ai.txt spec: [official-names], [permissions], [restrictions], [contact]
  // Use INI-style section parsing
  const permissionsSection = extractIniSection(content, "permissions");
  const restrictionsSection = extractIniSection(content, "restrictions");

  if (permissionsSection.trim() === "") {
    errors.push({ rule: "has_permissions", message: "Missing [permissions] section" });
  }
  if (restrictionsSection.trim() === "") {
    errors.push({ rule: "has_restrictions", message: "Missing [restrictions] section" });
  }

  const h2Count = (content.match(/^##\s+\S/im) ?? []).length;
  if (h2Count === 0) {
    warnings.push({ rule: "has_h2", message: "No H2 sections found" });
  }
  const linkCount = (content.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g) ?? []).length;
  if (linkCount === 0) {
    warnings.push({ rule: "has_links", message: "No links found" });
  }

  return { errors, warnings };
}
```

- [ ] **Step 3: Run tsc**

Run: `tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai-discovery-scanner.ts
git commit -m "fix: ai.txt validator checks INI [permissions]/[restrictions] per ADF-004 spec"
```

---

## Task 3: Update `brand.txt` Validator — Check INI Sections

> **P1.** Validator checks for `has_identity_block` (template rule). Should check for INI `[official-names]`, `[incorrect-names]`, `[naming-rules]`.

**Files:**
- Modify: `src/lib/ai-discovery-scanner.ts`

- [ ] **Step 1: Update `FILE_CHECKLISTS["brand.txt"]`**

Replace `FILE_CHECKLISTS["brand.txt"]` (line 75) with:

```typescript
  "brand.txt": [
    // Per brand.txt spec from ai-visibility.org.uk (ADF-007)
    { id: "has_official_names",  label: "[official-names] section present",  severity: "error" },
    { id: "has_incorrect_names", label: "[incorrect-names] section present", severity: "error" },
    { id: "has_naming_rules",   label: "[naming-rules] section present", severity: "error" },
    { id: "has_links",          label: "Links present",                   severity: "warning" },
  ],
```

- [ ] **Step 2: Update `validateBrandTxt()` function**

Replace `validateBrandTxt()` (lines 352-370) with:

```typescript
function validateBrandTxt(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Per brand.txt spec: [official-names], [incorrect-names], [naming-rules]
  const officialSection = extractIniSection(content, "official-names");
  const incorrectSection = extractIniSection(content, "incorrect-names");
  const namingRulesSection = extractIniSection(content, "naming-rules");

  if (officialSection.trim() === "") {
    errors.push({ rule: "has_official_names", message: "Missing [official-names] section" });
  }
  if (incorrectSection.trim() === "") {
    errors.push({ rule: "has_incorrect_names", message: "Missing [incorrect-names] section" });
  }
  if (namingRulesSection.trim() === "") {
    errors.push({ rule: "has_naming_rules", message: "Missing [naming-rules] section" });
  }

  const linkCount = (content.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g) ?? []).length;
  if (linkCount === 0) {
    warnings.push({ rule: "has_links", message: "No links found" });
  }

  return { errors, warnings };
}
```

- [ ] **Step 3: Run tsc**

Run: `tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai-discovery-scanner.ts
git commit -m "fix: brand.txt validator checks INI sections per ADF-007 spec"
```

---

## Task 4: Update `developer-ai.txt` Validator — Check INI Sections

> **P1.** Validator checks for `has_identity_block` (template rule). Should check for INI `[overview]`, `[public-api]`, `[public-areas]`.

**Files:**
- Modify: `src/lib/ai-discovery-scanner.ts`

- [ ] **Step 1: Update `FILE_CHECKLISTS["developer-ai.txt"]`**

Replace `FILE_CHECKLISTS["developer-ai.txt"]` (line 81) with:

```typescript
  "developer-ai.txt": [
    // Per developer-ai.txt spec from ai-visibility.org.uk (ADF-009)
    { id: "has_overview",     label: "[overview] section present",         severity: "error" },
    { id: "has_public_api",   label: "[public-api] section present",       severity: "error" },
    { id: "has_public_areas", label: "[public-areas] section present",     severity: "error" },
    { id: "has_links",        label: "Links present",                      severity: "warning" },
  ],
```

- [ ] **Step 2: Update `validateDeveloperAiTxt()` function**

Replace `validateDeveloperAiTxt()` (lines 372-390) with:

```typescript
function validateDeveloperAiTxt(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Per developer-ai.txt spec: [overview], [public-api], [public-areas]
  const overviewSection = extractIniSection(content, "overview");
  const publicApiSection = extractIniSection(content, "public-api");
  const publicAreasSection = extractIniSection(content, "public-areas");

  if (overviewSection.trim() === "") {
    errors.push({ rule: "has_overview", message: "Missing [overview] section" });
  }
  if (publicApiSection.trim() === "") {
    errors.push({ rule: "has_public_api", message: "Missing [public-api] section" });
  }
  if (publicAreasSection.trim() === "") {
    errors.push({ rule: "has_public_areas", message: "Missing [public-areas] section" });
  }

  const linkCount = (content.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g) ?? []).length;
  if (linkCount === 0) {
    warnings.push({ rule: "has_links", message: "No links found" });
  }

  return { errors, warnings };
}
```

- [ ] **Step 3: Run tsc**

Run: `tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai-discovery-scanner.ts
git commit -m "fix: developer-ai.txt validator checks INI sections per ADF-009 spec"
```

---

## Task 5: Update `robots-ai.txt` Validator — Check Directive Syntax

> **P1.** Validator currently checks for `has_identity_block` (template rule). After template rewrite (Plan 1, Task 1), the file will use directive syntax. Validator must check for `User-Agent:` lines.

**Files:**
- Modify: `src/lib/ai-discovery-scanner.ts`

- [ ] **Step 1: Update `FILE_CHECKLISTS["robots-ai.txt"]`**

Replace `FILE_CHECKLISTS["robots-ai.txt"]` (line 94) with:

```typescript
  "robots-ai.txt": [
    // Per robots-ai.txt spec from ai-visibility.org.uk (ADF-010)
    { id: "has_user_agent",  label: "User-Agent directive present",         severity: "error" },
    { id: "has_directives",   label: "AI directive lines present",          severity: "error" },
    { id: "has_contact",      label: "[contact] section present",            severity: "warning" },
  ],
```

- [ ] **Step 2: Update `validateRobotsAiTxt()` function**

Replace `validateRobotsAiTxt()` (lines 415-433) with:

```typescript
function validateRobotsAiTxt(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Per robots-ai.txt spec: User-Agent: and directive lines (Allow-Training, Disallow-Training, etc.)
  const userAgentPattern = /^User-Agent:\s*\S+/im;
  const directivePatterns = [
    /^Allow-Training:\s*/im,
    /^Disallow-Training:\s*/im,
    /^Allow-Retrieval:\s*/im,
    /^Disallow-Retrieval:\s*/im,
    /^Allow-Citation:\s*/im,
    /^Disallow-Citation:\s*/im,
  ];

  if (!userAgentPattern.test(content)) {
    errors.push({ rule: "has_user_agent", message: "Missing User-Agent: directive" });
  }

  const hasAnyDirective = directivePatterns.some((p) => p.test(content));
  if (!hasAnyDirective) {
    errors.push({ rule: "has_directives", message: "Missing AI directive lines (Allow-Training, Disallow-Training, etc.)" });
  }

  const contactSection = extractIniSection(content, "contact");
  if (contactSection.trim() === "") {
    warnings.push({ rule: "has_contact", message: "Missing [contact] section" });
  }

  return { errors, warnings };
}
```

- [ ] **Step 3: Run tsc**

Run: `tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai-discovery-scanner.ts
git commit -m "fix: robots-ai.txt validator checks directive syntax per ADF-010 spec"
```

---

## Task 6: Update `llms.html` Validator — Check Canonical Link and Noindex

> **P1.** Validator currently only checks for `<html>`, `<h1>`, `<section>`, links. Must add checks for `<link rel="canonical">` and `<meta name="robots" content="noindex,...">`.

**Files:**
- Modify: `src/lib/ai-discovery-scanner.ts`

- [ ] **Step 1: Update `FILE_CHECKLISTS["llms.html"]`**

Replace `FILE_CHECKLISTS["llms.html"]` (line 87) with:

```typescript
  "llms.html": [
    // Per llms.html spec from ai-visibility.org.uk (ADF-003)
    { id: "has_html_tag",    label: "<html> tag present",                          severity: "error" },
    { id: "has_canonical",   label: "<link rel=\"canonical\"> present",             severity: "error" },
    { id: "has_noindex",     label: "noindex meta robots directive present",        severity: "error" },
    { id: "has_h1",          label: "<h1> heading present",                        severity: "error" },
    { id: "has_sections",    label: "<section> elements present",                  severity: "warning" },
    { id: "has_links",       label: "Links present",                               severity: "warning" },
  ],
```

- [ ] **Step 2: Update `validateLlmsHtml()` function**

Replace `validateLlmsHtml()` (lines 392-413) with:

```typescript
function validateLlmsHtml(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Per llms.html spec: <html>, <link rel="canonical">, noindex, <h1>, sections, links
  if (!/<html/i.test(content)) {
    errors.push({ rule: "has_html_tag", message: "Missing <html> tag" });
  }
  if (!/<link[^>]+rel\s*=\s*["']canonical["'][^>]*>/i.test(content)) {
    errors.push({ rule: "has_canonical", message: "Missing <link rel=\"canonical\"> to llms.txt" });
  }
  if (!/<meta[^>]+name\s*=\s*["']robots["'][^>]+content\s*=\s*["'][^"']*noindex[^"']*["'][^>]*>/i.test(content)) {
    errors.push({ rule: "has_noindex", message: "Missing noindex in <meta name=\"robots\"> directive" });
  }
  if (!/<h1/i.test(content)) {
    errors.push({ rule: "has_h1", message: "Missing <h1> heading" });
  }
  const sectionCount = (content.match(/<section[^>]*>/gi) ?? []).length;
  if (sectionCount === 0) {
    warnings.push({ rule: "has_sections", message: "No <section> elements found" });
  }
  const linkCount = (content.match(/<a[^>]+href\s*=\s*["'][^"']+["'][^>]*>/gi) ?? []).length;
  if (linkCount === 0) {
    warnings.push({ rule: "has_links", message: "No links found" });
  }

  return { errors, warnings };
}
```

- [ ] **Step 3: Run tsc**

Run: `tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai-discovery-scanner.ts
git commit -m "fix: llms.html validator checks canonical link and noindex per ADF-003 spec"
```

---

## Task 7: Update `identity.json` Validator — Check `type` and `description`

> **P1.** Validator currently only checks `name`, `url`, `$schema`. Must add checks for `type` and `description`.

**Files:**
- Modify: `src/lib/ai-discovery-scanner.ts`

- [ ] **Step 1: Update `FILE_CHECKLISTS["identity.json"]`**

Replace `FILE_CHECKLISTS["identity.json"]` (line 100) with:

```typescript
  "identity.json": [
    // Per identity.json spec from ai-visibility.org.uk (ADF-006)
    { id: "valid_json", label: "Valid JSON structure",   severity: "error" },
    { id: "has_name",   label: "Has name field",         severity: "error" },
    { id: "has_url",    label: "Has url field",          severity: "error" },
    { id: "has_type",   label: "Has type field",        severity: "error" },
    { id: "has_desc",   label: "Has description field", severity: "error" },
    { id: "has_schema", label: "Has $schema reference",  severity: "warning" },
  ],
```

- [ ] **Step 2: Update `validateIdentityJson()` function**

Replace `validateIdentityJson()` (lines 435-461) with:

```typescript
function validateIdentityJson(content: string) {
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
  if (!obj.name) errors.push({ rule: "has_name", message: 'Missing required field: "name"' });
  if (!obj.url) errors.push({ rule: "has_url", message: 'Missing required field: "url"' });
  if (!obj.type) errors.push({ rule: "has_type", message: 'Missing required field: "type"' });
  if (!obj.description) errors.push({ rule: "has_desc", message: 'Missing required field: "description"' });
  if (!obj.$schema) {
    warnings.push({ rule: "has_schema", message: "Missing $schema reference — recommended" });
  }

  return { errors, warnings };
}
```

- [ ] **Step 3: Run tsc**

Run: `tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai-discovery-scanner.ts
git commit -m "fix: identity.json validator checks type and description fields per ADF-006 spec"
```

---

## Task 8: Consolidate `validator.ts` into `ai-discovery-scanner.ts`

> **P2.** `validator.ts` (legacy) validates `llms.txt` using `parseMarkdown()`. `ai-discovery-scanner.ts` also validates `llms.txt`. Consolidate: make `validator.ts` re-export from `ai-discovery-scanner.ts` or remove it.

**Files:**
- Modify: `src/lib/validator.ts`
- Modify: `src/lib/markdown-parser.ts` (check if still needed)

- [ ] **Step 1: Check if `validator.ts` is imported anywhere**

Run: `Select-String -Path "src/**/*.ts" -Pattern "from.*validator" -List`

Expected: Only imports of `validateLlmsTxt` from `validator.ts` — find all callers.

Common usage is in API routes or tests. If found, update them to import from `ai-discovery-scanner.ts` instead.

- [ ] **Step 2: Replace `validator.ts` with a re-export**

Replace the entire content of `src/lib/validator.ts` with:

```typescript
// DEPRECATED: This file re-exports from ai-discovery-scanner.ts for backward compatibility.
// All validation logic has been consolidated into src/lib/ai-discovery-scanner.ts.
// Update imports to use ai-discovery-scanner.ts directly.

export { validateLlmsTxtContent as validateLlmsTxt } from "./ai-discovery-scanner";
```

Or, if `validateLlmsTxt` in `validator.ts` uses `parseMarkdown()` and has different behavior than `validateLlmsTxtContent`, keep both implementations and note the difference in a comment.

- [ ] **Step 3: Run tsc**

Run: `tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/validator.ts
git commit -m "refactor: consolidate validator.ts into ai-discovery-scanner.ts"
```

---

## Self-Review Checklist

- [ ] All 7 validator update tasks have complete code — no "TBD" or placeholder
- [ ] `validateAiTxt` uses `extractIniSection` for `[permissions]` and `[restrictions]`
- [ ] `validateBrandTxt` uses `extractIniSection` for `[official-names]`, `[incorrect-names]`, `[naming-rules]`
- [ ] `validateDeveloperAiTxt` uses `extractIniSection` for `[overview]`, `[public-api]`, `[public-areas]`
- [ ] `validateRobotsAiTxt` checks for `User-Agent:` and directive patterns
- [ ] `validateLlmsHtml` checks for `<link rel="canonical">` and `noindex`
- [ ] `validateIdentityJson` checks for `type` and `description`
- [ ] `validateLlmsTxtContent` checks for `## Contact`
- [ ] Each task committed separately
- [ ] `validator.ts` consolidated or deprecated
