import type { FetchedFile } from "@/lib/consistency-checker";
import { sniffContentType, detectWafResponse, detectNotFoundPage } from "@/lib/content-sniffer";
import { decodeWithCharset } from "@/lib/charset-decoder";
import type { LinkResult, ValidationError, ValidationWarning } from "@/lib/types";

export type SkipReasonType =
  | "http_error"
  | "content_type_blocked"
  | "waf_blocked"
  | "not_found_page"
  | "encoding_error"
  | "network_error";

const FETCH_TIMEOUT_MS = 10_000;
const LINK_TIMEOUT_MS = 5_000;
const MAX_LINKS = 20;

const AI_DISCOVERY_FILES = [
  "llms.txt",
  "llm.txt",
  "ai.txt",
  "faq-ai.txt",
  "brand.txt",
  "developer-ai.txt",
  "llms.html",
  "robots-ai.txt",
  "identity.json",
  "ai.json",
] as const;

type FileName = typeof AI_DISCOVERY_FILES[number];

// ---------------------------------------------------------------------------
// Checklist definitions — full validation rules per file type
// ---------------------------------------------------------------------------

interface ChecklistRule {
  id: string;
  label: string;
  severity: "error" | "warning";
  /** If true, this item shows a numeric value (e.g. "15 links") instead of just passed/failed */
  showValue?: boolean;
}

const FILE_CHECKLISTS: Record<FileName, ChecklistRule[]> = {
  "llms.txt": [
    // Technical validation
    { id: "content_type",   label: "Content type is text/plain or text/markdown",     severity: "error" },
    { id: "waf_block",      label: "Not blocked by WAF / security challenge page",     severity: "error" },
    { id: "encoding",       label: "Valid text encoding (UTF-8)",                     severity: "error" },
    // Content quality
    { id: "markdown_format", label: "Valid Markdown format",                           severity: "error" },
    { id: "has_h1",         label: "H1 title present",                               severity: "error" },
    { id: "has_description", label: "Brief project description present",               severity: "warning" },
    { id: "has_h2",         label: "H2 headings present for structure",                 severity: "warning" },
    { id: "has_paragraphs", label: "Has detailed paragraphs",                         severity: "warning", showValue: true },
    { id: "no_broken_links", label: "No broken links",                                 severity: "error",  showValue: true },
    { id: "has_links",       label: "Links to key pages present",                     severity: "warning", showValue: true },
  ],
  "llm.txt": [
    { id: "content_type",   label: "Content type is text/plain",                     severity: "error" },
    { id: "waf_block",     label: "Not blocked by WAF",                              severity: "error" },
    { id: "not_empty",     label: "File is not empty",                               severity: "error" },
    { id: "single_line",   label: "Single URL redirect line",                        severity: "warning" },
    { id: "valid_url",     label: "URL is valid",                                    severity: "error" },
    { id: "https_protocol", label: "URL uses HTTPS protocol",                        severity: "error" },
  ],
  "ai.txt": [
    { id: "content_type",     label: "Content type is text/plain",                   severity: "error" },
    { id: "waf_block",       label: "Not blocked by WAF",                            severity: "error" },
    { id: "has_identity",     label: "Has [identity] section",                       severity: "error" },
    { id: "has_name_field",   label: "[identity] includes name field",               severity: "error" },
    { id: "has_url_field",    label: "[identity] includes url field",                severity: "error" },
    { id: "has_permissions",  label: "Has [permissions] section",                    severity: "error" },
    { id: "has_restrictions", label: "Has [restrictions] section (recommended)",     severity: "warning" },
    { id: "permissions_filled", label: "[permissions] section has items",           severity: "warning" },
  ],
  "faq-ai.txt": [
    { id: "content_type", label: "Content type is text/plain",                       severity: "error" },
    { id: "waf_block",   label: "Not blocked by WAF",                               severity: "error" },
    { id: "has_qa_pairs",     label: "Q:/A: pairs present",                         severity: "error",   showValue: true },
    { id: "no_orphan_q",     label: "No orphan questions (all have answers)",          severity: "warning" },
    { id: "no_orphan_a",     label: "No orphan answers (all have questions)",          severity: "warning" },
  ],
  "brand.txt": [
    { id: "content_type",    label: "Content type is text/plain",                     severity: "error" },
    { id: "waf_block",     label: "Not blocked by WAF",                              severity: "error" },
    { id: "has_brand_name",  label: "Has brand-name: field",                         severity: "error" },
    { id: "has_do_not_use", label: "Has do-not-use: field (recommended)",            severity: "warning" },
    { id: "no_name_conflict", label: "do-not-use does not duplicate brand-name",      severity: "warning" },
  ],
  "developer-ai.txt": [
    { id: "content_type",       label: "Content type is text/plain",                 severity: "error" },
    { id: "waf_block",         label: "Not blocked by WAF",                          severity: "error" },
    { id: "has_overview",      label: "Has ## Overview section (recommended)",        severity: "warning" },
    { id: "no_marketing_talk", label: "No marketing language detected",               severity: "warning" },
  ],
  "llms.html": [
    { id: "content_type", label: "Content type is text/html",                         severity: "error" },
    { id: "waf_block",   label: "Not blocked by WAF",                                 severity: "error" },
    { id: "encoding",     label: "Valid text encoding",                               severity: "error" },
  ],
  "robots-ai.txt": [
    { id: "content_type",  label: "Content type is text/plain",                     severity: "error" },
    { id: "waf_block",    label: "Not blocked by WAF",                              severity: "error" },
    { id: "has_directive", label: "Contains Allow or Disallow rules",               severity: "error" },
  ],
  "identity.json": [
    { id: "content_type", label: "Content type is application/json or text/plain",    severity: "error" },
    { id: "waf_block",   label: "Not blocked by WAF",                              severity: "error" },
    { id: "valid_json",  label: "Valid JSON structure",                            severity: "error" },
    { id: "has_name",    label: "Has name field",                                   severity: "error" },
    { id: "has_url",     label: "Has url field",                                    severity: "error" },
  ],
  "ai.json": [
    { id: "content_type", label: "Content type is application/json or text/plain",    severity: "error" },
    { id: "waf_block",   label: "Not blocked by WAF",                              severity: "error" },
    { id: "valid_json",  label: "Valid JSON structure",                            severity: "error" },
  ],
};

export type ChecklistItem = {
  id: string;
  label: string;
  status: "passed" | "failed" | "warning" | "skipped";
  message?: string;
  /** Numeric value for showValue items (e.g. link count, paragraph count) */
  value?: number;
};

const SKIP_REASON_MESSAGES: Record<SkipReasonType, (name: string) => string> = {
  http_error: (_name) => `File not found (HTTP error)`,
  content_type_blocked: (name) => `Server returned HTML instead of ${name} file`,
  waf_blocked: (_name) => `Blocked by website firewall or anti-bot system`,
  not_found_page: (name) => `Server returned 404 page — ${name} does not exist`,
  encoding_error: (_name) => `Could not decode file content (unsupported encoding)`,
  network_error: (_name) => `Network error — server unreachable or timed out`,
};

export function buildChecklist(
  name: FileName,
  found: boolean,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  contentMetrics: ContentMetrics = {},
  skipReasonType?: SkipReasonType,
): ChecklistItem[] {
  const rules = FILE_CHECKLISTS[name];
  if (!rules) return [];
  return rules.map((rule) => {
    const err = errors.find((e) => e.rule === rule.id);
    const warn = warnings.find((w) => w.rule === rule.id);
    const metricValue = contentMetrics[rule.id];

    if (err) return { id: rule.id, label: rule.label, status: "failed" as const, message: err.message };
    if (warn) return { id: rule.id, label: rule.label, status: "warning" as const, message: warn.message };
    if (!found) {
      const message = skipReasonType
        ? SKIP_REASON_MESSAGES[skipReasonType](name)
        : "File not found (404 or unreachable)";
      return {
        id: rule.id,
        label: rule.label,
        status: "failed" as const,
        message,
      };
    }
    return { id: rule.id, label: rule.label, status: "passed" as const, value: metricValue };
  });
}

type ContentMetrics = Partial<Record<string, number>>;

function computeLlmsTxtMetrics(content: string): ContentMetrics {
  const lines = content.split("\n");
  let inCodeBlock = false;
  let h1Count = 0;
  let h2Count = 0;
  let paragraphCount = 0;
  let linkCount = 0;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (trimmed.startsWith("# ")) h1Count++;
    if (trimmed.startsWith("## ")) h2Count++;

    const linkMatches = trimmed.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g);
    if (linkMatches) linkCount += linkMatches.length;

    if (trimmed.length > 80) paragraphCount++;
  }

  return {
    has_h1: h1Count,
    has_h2: h2Count,
    has_paragraphs: paragraphCount,
    has_links: linkCount,
  };
}

// ---------------------------------------------------------------------------
// Validation functions (copied/referenced from validate-text/route.ts)
// ---------------------------------------------------------------------------

function validateLlmsTxtContent(content: string, linkResults: LinkResult[] = []) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const lines = content.split("\n");
  const headingRegex = /^#{1,6}\s+/;
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let linkCount = 0;
  let h2Count = 0;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;

    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    if (headingRegex.test(line)) {
      if (line.startsWith("##")) h2Count++;
    }

    let match;
    while ((match = linkRegex.exec(line)) !== null) {
      linkCount++;
      const url = match[2]!;
      const linkResult = linkResults.find((r) => r.url === url);
      if (!linkResult) continue;
      if (!linkResult.ok) {
        errors.push({
          rule: "broken_link",
          message: `Broken link: ${url} (HTTP ${linkResult.status})`,
          line: i + 1,
        });
      }
    }
    linkRegex.lastIndex = 0;
  }

  if (h2Count === 0) {
    warnings.push({
      rule: "has_h2",
      message: "File should contain at least one H2 heading (##) for structure",
    });
  }

  if (linkCount === 0) {
    warnings.push({
      rule: "has_links",
      message: "File contains no links — consider adding links to key pages",
    });
  }

  return { errors, warnings };
}

function validateLlmTxt(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const lines = content.split("\n").filter((l) => l.trim() !== "");

  if (lines.length === 0) {
    errors.push({ rule: "not_empty", message: "llm.txt is empty" });
  } else if (lines.length > 1) {
    warnings.push({
      rule: "single_line",
      message: "llm.txt should contain only a single URL redirect line",
    });
  }

  if (lines[0]) {
    const url = lines[0]!.trim();
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        errors.push({ rule: "https_protocol", message: `URL must use https, got "${parsed.protocol}"` });
      }
    } catch {
      errors.push({ rule: "valid_url", message: `"${url}" is not a valid URL` });
    }
  }

  return { errors, warnings };
}

function extractMarkdownSection(content: string, sectionName: string): string {
  const regex = new RegExp(`(?:###\\s+)?${sectionName}[\\s\\S]*?(?=(?:###|\\n##)|$)`, "i");
  const match = content.match(regex);
  return (match && match[0]) ? match[0] : "";
}

function validateAiTxt(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Accept both Markdown (### Canonical Identity Block) and INI ([identity]) formats
  const hasIdentity =
    /^(?:###\s+)?Canonical\s+Identity\s+Block/im.test(content) ||
    /^\[identity\]\s*$/im.test(content);
  const hasPermissions =
    /^(?:###\s+)?AI\s+Recommendation\s+Intent/im.test(content) ||
    /^\[permissions\]\s*$/im.test(content);
  const hasRestrictions =
    /^(?:###\s+)?(?:Service\s+Scope\s+Clarifications|When\s+NOT\s+Recommend)/im.test(content) ||
    /^\[restrictions\]\s*$/im.test(content);

  if (!hasIdentity) errors.push({ rule: "has_identity", message: "Missing identity section" });
  if (!hasPermissions) errors.push({ rule: "has_permissions", message: "Missing AI recommendation intent section" });
  if (!hasRestrictions) warnings.push({ rule: "has_restrictions", message: "Missing restrictions section — recommended" });

  // Extract identity section - try INI first, then Markdown
  const iniSection = extractIniSection(content, "identity");
  const mdSection = extractMarkdownSection(content, "Canonical Identity Block");
  const identitySection = iniSection || mdSection;

  // Check for name field - accept both "name=value" and "Business name: value"
  const hasNameField =
    /\n\s*(?:Business\s+name|name)\s*:/im.test(identitySection) ||
    /^\s*name\s*=/im.test(identitySection);
  if (!hasNameField && identitySection.length > 0) {
    errors.push({ rule: "has_name_field", message: "Identity section must include name field" });
  }

  // Check for URL field - accept both "url=value" and "Website: value"
  const hasUrlField =
    /\n\s*(?:Website|url)\s*:/im.test(identitySection) ||
    /^\s*url\s*=/im.test(identitySection);
  if (!hasUrlField && identitySection.length > 0) {
    errors.push({ rule: "has_url_field", message: "Identity section must include url field" });
  }

  // Check if permissions section has items - try both formats
  const iniPermSection = extractIniSection(content, "permissions");
  const mdPermSection = extractMarkdownSection(content, "AI Recommendation Intent");
  const permSection = iniPermSection || mdPermSection;
  const permLines = permSection
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#") && !/^(?:AI\s+systems\s+should|When\s+to\s+)/i.test(l.trim()));
  if (permLines.length === 0) {
    warnings.push({ rule: "permissions_filled", message: "Permissions section has no items" });
  }

  return { errors, warnings };
}

function validateFaqAiTxt(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const qaPairs: { q: string; a: string }[] = [];
  const lines = content.split("\n");
  let currentQ = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Q:") || trimmed.startsWith("Q ")) {
      if (currentQ) warnings.push({ rule: "no_orphan_q", message: `Question "${currentQ}" has no answer` });
      currentQ = trimmed.replace(/^Q:?\s*/, "").replace(/^Q\s*/, "");
    } else if (trimmed.startsWith("A:") || trimmed.startsWith("A ")) {
      if (!currentQ) {
        warnings.push({ rule: "no_orphan_a", message: `Answer without matching question` });
      } else {
        qaPairs.push({ q: currentQ, a: trimmed.replace(/^A:?\s*/, "").replace(/^A\s*/, "") });
        currentQ = "";
      }
    }
  }
  if (currentQ) warnings.push({ rule: "no_orphan_q", message: `Question "${currentQ}" has no answer` });
  if (qaPairs.length === 0) errors.push({ rule: "has_qa_pairs", message: "faq-ai.txt must contain at least one Q:/A: pair" });

  return { errors, warnings };
}

function validateBrandTxt(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!/^brand-name\s*:/im.test(content)) errors.push({ rule: "missing_brand_name", message: "Missing brand-name: field" });
  if (!/^do-not-use\s*:/im.test(content)) warnings.push({ rule: "missing_do_not_use", message: "Missing do-not-use: field — recommended" });

  const brandMatch = content.match(/^brand-name\s*:\s*(.+)/im);
  const dnuMatch = content.match(/^do-not-use\s*:\s*(.+)/im);
  if (brandMatch && dnuMatch) {
    const bn = (brandMatch[1] ?? "").trim().toLowerCase();
    const dnu = (dnuMatch[1] ?? "").trim().toLowerCase();
    if (dnu.includes(bn) || bn.includes(dnu)) {
      warnings.push({ rule: "name_conflict", message: "do-not-use appears to duplicate brand-name" });
    }
  }

  return { errors, warnings };
}

function validateDeveloperAiTxt(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!/^##\s*Overview/im.test(content)) warnings.push({ rule: "has_overview", message: "Missing ## Overview section — recommended" });

  const marketingPhrases = [/\bworld'?s best\b/i, /\brevolutionary\b/i, /\bgame-?changer\b/i, /\bcutting-?edge\b/i, /\binnovative\b/i, /\bnext-?gen(eration)?\b/i];
  for (const line of content.split("\n")) {
    for (const phrase of marketingPhrases) {
      if (phrase.test(line)) {
        warnings.push({ rule: "no_marketing_talk", message: `Avoid marketing language ("${line.trim().substring(0, 30)}...")` });
        break;
      }
    }
  }

  return { errors, warnings };
}

function validateLlmsHtml(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!/<html/i.test(content)) errors.push({ rule: "missing_html_tag", message: "Document should have <html> tag" });
  if (!/<head/i.test(content)) errors.push({ rule: "missing_head_tag", message: "Document should have <head> tag" });
  if (!/<body/i.test(content)) errors.push({ rule: "missing_body_tag", message: "Document should have <body> tag" });
  if (!/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/i.test(content)) {
    warnings.push({ rule: "missing_json_ld", message: "Missing JSON-LD Schema.org structured data — recommended" });
  }
  if (!/<meta[^>]+property\s*=\s*["']og:title["'][^>]*>/i.test(content)) {
    warnings.push({ rule: "missing_og_tags", message: "Missing Open Graph meta tags — recommended" });
  }

  return { errors, warnings };
}

function validateRobotsAiTxt(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let hasUserAgent = false;
  let hasDirectives = false;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (/^user-agent\s*:/i.test(trimmed)) hasUserAgent = true;
    if (/^(allow|disallow|ai-admin|ai-block)\s*:/i.test(trimmed)) hasDirectives = true;
  }

  if (!hasUserAgent) warnings.push({ rule: "missing_user_agent", message: "No User-agent directive found" });
  if (!hasDirectives) warnings.push({ rule: "missing_directives", message: "No Allow/Disallow directives found" });
  if (!/^(ai-admin|ai-block)\s*:/im.test(content)) warnings.push({ rule: "missing_ai_directives", message: "No ai-admin or ai-block directives — use these for AI-specific access control" });

  return { errors, warnings };
}

function validateIdentityJson(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    errors.push({ rule: "invalid_json", message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}` });
    return { errors, warnings };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    errors.push({ rule: "invalid_structure", message: "Root must be a JSON object" });
    return { errors, warnings };
  }

  const obj = parsed as Record<string, unknown>;
  if (!obj.name) errors.push({ rule: "missing_field", message: `Missing required field: "name"` });
  if (!obj.url) errors.push({ rule: "missing_field", message: `Missing required field: "url"` });
  if (obj.url && typeof obj.url === "string") {
    try { new URL(obj.url); } catch { errors.push({ rule: "invalid_url", message: `"url" is not a valid URL` }); }
  }

  return { errors, warnings };
}

function validateAiJson(content: string) {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    errors.push({ rule: "invalid_json", message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}` });
    return { errors, warnings };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    errors.push({ rule: "invalid_structure", message: "Root must be a JSON object" });
    return { errors, warnings };
  }

  const obj = parsed as Record<string, unknown>;
  if (!obj.interactions && !obj.guidelines) {
    warnings.push({ rule: "missing_interactions", message: "Missing interactions or guidelines section — file may be incomplete" });
  }

  return { errors, warnings };
}

function extractIniSection(content: string, section: string): string {
  const regex = new RegExp(`^\\[${section}\\]\\s*$\\n([\\s\\S]*?)(?=^\\[|\\z)`, "im");
  const match = content.match(regex);
  return (match && match[1]) ? match[1] : "";
}

export function validateByType(content: string, fileName: FileName): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  switch (fileName) {
    case "llms.txt": return validateLlmsTxtContent(content);
    case "llm.txt": return validateLlmTxt(content);
    case "ai.txt": return validateAiTxt(content);
    case "faq-ai.txt": return validateFaqAiTxt(content);
    case "brand.txt": return validateBrandTxt(content);
    case "developer-ai.txt": return validateDeveloperAiTxt(content);
    case "llms.html": return validateLlmsHtml(content);
    case "robots-ai.txt": return validateRobotsAiTxt(content);
    case "identity.json": return validateIdentityJson(content);
    case "ai.json": return validateAiJson(content);
  }
}

// ---------------------------------------------------------------------------
// Identity extraction for consistency
// ---------------------------------------------------------------------------

function extractIdentityFromContent(content: string, fileName: FileName): Record<string, string | null> {
  switch (fileName) {
    case "identity.json": {
      try {
        const obj = JSON.parse(content) as Record<string, unknown>;
        return {
          name: typeof obj.name === "string" ? obj.name : null,
          url: typeof obj.url === "string" ? obj.url : null,
          email: typeof obj.email === "string" ? obj.email : null,
        };
      } catch { return { name: null, url: null, email: null }; }
    }
    case "ai.txt": {
      const section = extractIniSection(content, "identity");
      const name = section.match(/^\s*name\s*=\s*(.+)/im)?.[1]?.trim() ?? null;
      const url = section.match(/^\s*url\s*=\s*(.+)/im)?.[1]?.trim() ?? null;
      const email = section.match(/^\s*email\s*=\s*(.+)/im)?.[1]?.trim() ?? null;
      return { name, url, email };
    }
    case "llms.txt": {
      const name = content.match(/^#\s+(.+)/m)?.[1]?.trim() ?? null;
      const url = content.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/)?.[2]?.trim() ?? null;
      const emailMatch = content.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
      const email = emailMatch?.[0] ?? null;
      return { name, url, email };
    }
    case "brand.txt": {
      const name = content.match(/^brand-name\s*:\s*(.+)/im)?.[1]?.trim() ?? null;
      return { name, url: null, email: null };
    }
    case "developer-ai.txt": {
      const name = content.match(/^#\s+(.+)/m)?.[1]?.trim() ?? null;
      return { name, url: null, email: null };
    }
    case "llms.html": {
      const ogTitle = content.match(/<meta[^>]+property\s*=\s*["']og:title["'][^>]+content\s*=\s*["']([^"']+)["'][^>]*>/i)?.[1]?.trim()
        ?? content.match(/<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]+property\s*=\s*["']og:title["'][^>]*>/i)?.[1]?.trim()
        ?? null;
      const ogUrl = content.match(/<meta[^>]+property\s*=\s*["']og:url["'][^>]+content\s*=\s*["']([^"']+)["'][^>]*>/i)?.[1]?.trim()
        ?? content.match(/<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]+property\s*=\s*["']og:url["'][^>]*>/i)?.[1]?.trim()
        ?? null;
      const titleTag = content.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null;
      return { name: ogTitle ?? titleTag, url: ogUrl, email: null };
    }
    default:
      return { name: null, url: null, email: null };
  }
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AI-Discovery-Checker/1.0)",
      },
    });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function checkLink(url: string): Promise<LinkResult> {
  try {
    const res = await fetchWithTimeout(url, LINK_TIMEOUT_MS);
    return { url, status: res.status, ok: res.ok };
  } catch {
    return { url, status: 0, ok: false };
  }
}

// ---------------------------------------------------------------------------
// Per-file fetch + validate
// ---------------------------------------------------------------------------

interface FileResult {
  name: FileName;
  found: boolean;
  url: string;
  content: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  identity: Record<string, string | null>;
  checklist: ChecklistItem[];
  skipReason?: string;
  skipReasonType?: SkipReasonType;
}

export async function scanFile(origin: string, name: FileName): Promise<FileResult> {
  const url = `${origin}/${name}`;

  let res: Response;
  let content: string;
  let ctHeader: string | null = null;
  let skipReason: string | undefined;

  try {
    res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    if (!res.ok) {
      console.debug(`[scanFile] ${name}: HTTP ${res.status} (not 2xx)`);
      return { name, found: false, url, content: "", errors: [], warnings: [], identity: { name: null, url: null, email: null }, checklist: buildChecklist(name, false, [], [], {}, "http_error"), skipReason: `HTTP ${res.status}`, skipReasonType: "http_error" };
    }
    ctHeader = res.headers.get("content-type");
    const ab = await res.arrayBuffer();
    const decoded = decodeWithCharset(ab, ctHeader);
    if (!decoded.success) {
      skipReason = `Decoding failed: ${decoded.message ?? "unknown"}`;
      console.debug(`[scanFile] ${name}: ${skipReason}`);
      return {
        name, found: false, url, content: "",
        errors: [{ rule: "encoding", message: decoded.message ?? "Unsupported encoding" }],
        warnings: [],
        identity: { name: null, url: null, email: null },
        checklist: buildChecklist(name, false, [{ rule: "encoding", message: decoded.message ?? "Unsupported encoding" }], [], {}, "encoding_error"),
        skipReason,
        skipReasonType: "encoding_error",
      };
    }
    content = decoded.text ?? "";
    if (content.trim() === "") {
      console.debug(`[scanFile] ${name}: decoded text is empty (HTTP ${res.status}, ct=${ctHeader ?? "null"})`);
      return {
        name, found: false, url, content: "",
        errors: [],
        warnings: [],
        identity: { name: null, url: null, email: null },
        checklist: buildChecklist(name, false, [], [], {}, "http_error"),
        skipReason: `Empty response (HTTP ${res.status})`,
        skipReasonType: "http_error",
      };
    }
    console.debug(`[scanFile] ${name}: OK — ${content.length} chars, ct=${ctHeader ?? "null"}`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    skipReason = `Network error: ${message}`;
    console.debug(`[scanFile] ${name}: ${skipReason}`);
    return { name, found: false, url, content: "", errors: [], warnings: [], identity: { name: null, url: null, email: null }, checklist: buildChecklist(name, false, [], [], {}, "network_error"), skipReason, skipReasonType: "network_error" };
  }

  // Check content type + WAF for all file types
  const sample = content.trimStart().substring(0, 2048);
  const sniff = sniffContentType(ctHeader, sample, name);
  if (!sniff.allowed) {
    // Check if this HTML response is actually a 404 page
    const notFound = detectNotFoundPage(content, name);
    const reasonType: SkipReasonType = notFound.is404Page ? "not_found_page" : "content_type_blocked";
    skipReason = notFound.is404Page
      ? `Content-Type blocked: ${notFound.message}`
      : `Content-Type blocked: ${sniff.message ?? "unrecognized"}`;
    console.debug(`[scanFile] ${name}: ${skipReason}`);
    return {
      name, found: false, url, content: "",
      errors: [{ rule: "content_type", message: notFound.is404Page ? notFound.message : (sniff.message ?? `Unrecognized content type for ${name}`) }],
      warnings: [],
      identity: { name: null, url: null, email: null },
      checklist: buildChecklist(name, false, [{ rule: "content_type", message: notFound.is404Page ? notFound.message : (sniff.message ?? `Unrecognized content type for ${name}`) }], [], {}, reasonType),
      skipReason,
      skipReasonType: reasonType,
    };
  }
  const waf = detectWafResponse(content, name);
  if (waf.blocked) {
    skipReason = `WAF detected: ${waf.message}`;
    console.debug(`[scanFile] ${name}: ${skipReason}`);
    return {
      name, found: false, url, content: "",
      errors: [{ rule: "waf_block", message: waf.message }],
      warnings: [],
      identity: { name: null, url: null, email: null },
      checklist: buildChecklist(name, false, [{ rule: "waf_block", message: waf.message }], [], {}, "waf_blocked"),
      skipReason,
      skipReasonType: "waf_blocked",
    };
  }

  // Validate
  const validation = validateByType(content, name);
  const linkResults: LinkResult[] = [];

  if (name === "llms.txt" && validation.warnings.length === 0) {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    const urls: string[] = [];
    let m;
    while ((m = linkRegex.exec(content)) !== null) urls.push(m[2]!);
    if (urls.length > 0) {
      const settled = await Promise.allSettled(urls.slice(0, MAX_LINKS).map((u) => checkLink(u)));
      for (const r of settled) { if (r.status === "fulfilled") linkResults.push(r.value); }
      // Add broken link errors
      for (const lr of linkResults) {
        if (!lr.ok) validation.errors.push({ rule: "no_broken_links", message: `Broken link: ${lr.url} (HTTP ${lr.status})` });
      }
    }
  }

  const identity = extractIdentityFromContent(content, name);

  const contentMetrics: ContentMetrics = name === "llms.txt" ? computeLlmsTxtMetrics(content) : {};
  const brokenCount = linkResults.filter((r) => !r.ok).length;
  if (name === "llms.txt") contentMetrics.no_broken_links = brokenCount;

  return {
    name,
    found: true,
    url,
    content,
    errors: validation.errors,
    warnings: validation.warnings,
    identity,
    checklist: buildChecklist(name, true, validation.errors, validation.warnings, contentMetrics),
  };
}

// ---------------------------------------------------------------------------
// Main scanner
// ---------------------------------------------------------------------------

export interface AnalyzeResult {
  origin: string;
  files: FileResult[];
  consistency: {
    checks: Array<{
      field: string;
      label: string;
      sources: Array<{ file: string; value: string | null; match: boolean }>;
      severity: "error" | "warning";
    }>;
    summary: { total: number; errors: number; warnings: number };
  };
}

export async function analyzeUrl(url: string): Promise<AnalyzeResult> {
  let origin: string;
  try {
    const parsed = new URL(url);
    origin = parsed.origin;
  } catch {
    throw new Error("Invalid URL");
  }

  // Fetch all files in parallel
  const fileResults = await Promise.all(
    AI_DISCOVERY_FILES.map((name) => scanFile(origin, name))
  );

  // Run consistency check on found files with identity data
  const foundFiles: FetchedFile[] = fileResults
    .filter((f) => f.found)
    .map((f) => ({
      name: f.name,
      content: "",
    }));

  // Build identity map for consistency
  const identityMap: Record<string, Record<string, string | null>> = {};
  for (const f of fileResults) {
    if (f.found) identityMap[f.name] = f.identity;
  }

  const consistency = runConsistency(identityMap, foundFiles.map((f) => f.name));

  return { origin, files: fileResults, consistency };
}

// Lightweight consistency that uses pre-extracted identity data
function runConsistency(
  identityMap: Record<string, Record<string, string | null>>,
  foundFileNames: string[]
) {
  const checks: AnalyzeResult["consistency"]["checks"] = [];
  const found = foundFileNames.filter((n) => Object.keys(identityMap[n] ?? {}).length > 0);

  function normalize(s: string | null): string | null {
    if (s === null) return null;
    return s.toLowerCase().trim().replace(/\s+/g, " ");
  }

  function valuesMatch(a: string | null, b: string | null): boolean {
    if (a === null || b === null) return false;
    return normalize(a) === normalize(b);
  }

  for (const field of ["name", "url", "email"] as const) {
    const sources = found
      .map((n) => ({ file: n, value: identityMap[n]?.[field] ?? null }))
      .filter((s) => s.value !== null);

    if (sources.length < 2) continue;

    const ref = sources[0]!.value ?? "";
    const matched = sources.map((s) => ({ ...s, match: valuesMatch(s.value, ref) }));
    const hasMismatch = matched.some((s) => !s.match);
    const severity = field === "name" ? "warning" : "error";

    checks.push({
      field,
      label: field === "name" ? "Company / Project Name" : field === "url" ? "Canonical URL" : "Contact Email",
      sources: matched,
      severity: hasMismatch ? severity : "warning",
    });
  }

  return {
    checks,
    summary: {
      total: checks.length,
      errors: checks.filter((c) => c.severity === "error").length,
      warnings: checks.filter((c) => c.severity === "warning").length,
    },
  };
}
