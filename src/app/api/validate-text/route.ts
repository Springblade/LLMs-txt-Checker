import { NextRequest, NextResponse } from "next/server";
import { validateLlmsTxt } from "@/lib/validator";
import type { FileType } from "@/lib/types";

const VALID_FILE_TYPES: FileType[] = [
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
];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { found: false, message: "Invalid JSON body", errors: [], warnings: [] },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { found: false, message: "Body must be an object", errors: [], warnings: [] },
      { status: 400 }
    );
  }

  const raw = (body as Record<string, unknown>);

  const content = raw.content;
  const fileType = raw.fileType;

  if (typeof content !== "string") {
    return NextResponse.json(
      { found: false, message: "Missing content field", errors: [], warnings: [] },
      { status: 400 }
    );
  }

  if (typeof fileType !== "string") {
    return NextResponse.json(
      { found: false, message: "Missing fileType field", errors: [], warnings: [] },
      { status: 400 }
    );
  }

  if (!VALID_FILE_TYPES.includes(fileType as FileType)) {
    return NextResponse.json(
      {
        found: false,
        message: `Invalid fileType "${fileType}". Supported: ${VALID_FILE_TYPES.join(", ")}`,
        errors: [],
        warnings: [],
      },
      { status: 400 }
    );
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return NextResponse.json(
      {
        found: false,
        message: "Content is empty",
        errors: [{ rule: "empty_content", message: "File content is empty" }],
        warnings: [],
      },
      { status: 200 }
    );
  }

  return NextResponse.json(validateByFileType(trimmed, fileType as FileType));
}

function validateByFileType(content: string, fileType: FileType) {
  switch (fileType) {
    case "llms.txt":
      return validateLlmsTxt(content);

    case "llm.txt":
      return validateLlmTxt(content);

    case "ai.txt":
      return validateAiTxt(content);

    case "faq-ai.txt":
      return validateFaqAiTxt(content);

    case "brand.txt":
      return validateBrandTxt(content);

    case "developer-ai.txt":
      return validateDeveloperAiTxt(content);

    case "llms.html":
      return validateLlmsHtml(content);

    case "robots-ai.txt":
      return validateRobotsAiTxt(content);

    case "identity.json":
      return validateIdentityJson(content);

    case "ai.json":
      return validateAiJson(content);

    default:
      return {
        found: false,
        message: `Unsupported file type: ${fileType}`,
        errors: [],
        warnings: [],
      };
  }
}

// --- Individual validators ---

function validateLlmTxt(content: string) {
  const lines = content.split("\n").filter((l) => l.trim() !== "");
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  if (lines.length === 0) {
    errors.push({ rule: "empty", message: "llm.txt is empty" });
  } else if (lines.length > 1) {
    warnings.push({
      rule: "extra_lines",
      message: "llm.txt should contain only a single URL redirect line",
    });
  }

  if (lines[0]) {
    const url = lines[0].trim();
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        errors.push({
          rule: "invalid_protocol",
          message: `URL must use http or https, got "${parsed.protocol}"`,
        });
      }
    } catch {
      errors.push({
        rule: "invalid_url",
        message: `"${url}" is not a valid URL`,
      });
    }
  }

  return { found: true, errors, warnings, content };
}

function validateAiTxt(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  const identityMatch = content.match(/^\[identity\]\s*$/im);
  const permissionsMatch = content.match(/^\[permissions\]\s*$/im);
  const restrictionsMatch = content.match(/^\[restrictions\]\s*$/im);

  if (!identityMatch) {
    errors.push({
      rule: "missing_identity_section",
      message: "Missing [identity] section",
    });
  }
  if (!permissionsMatch) {
    errors.push({
      rule: "missing_permissions_section",
      message: "Missing [permissions] section",
    });
  }
  if (!restrictionsMatch) {
    warnings.push({
      rule: "missing_restrictions_section",
      message: "Missing [restrictions] section — recommended for completeness",
    });
  }

  // Extract identity section content
  const identitySection = extractIniSection(content, "identity");
  const hasName = /name\s*=/i.test(identitySection);
  const hasUrl = /url\s*=/i.test(identitySection);
  if (!hasName) {
    errors.push({
      rule: "identity_name",
      message: "[identity] section must include a name field (e.g., name=My Company)",
    });
  }
  if (!hasUrl) {
    errors.push({
      rule: "identity_url",
      message: "[identity] section must include a url field",
    });
  }

  // Check permissions items
  const permissionsSection = extractIniSection(content, "permissions");
  const permLines = permissionsSection
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"));
  if (permLines.length === 0) {
    warnings.push({
      rule: "empty_permissions",
      message: "[permissions] section has no items — add at least one permission",
    });
  }

  return { found: true, errors, warnings, content };
}

function extractIniSection(content: string, section: string): string {
  const regex = new RegExp(
    `^\\[${section}\\]\\s*$\\n([\\s\\S]*?)(?=^\\[|\\z)`,
    "im"
  );
  const match = content.match(regex);
  return match && match[1] ? match[1] : "";
}

function validateFaqAiTxt(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  const qaPairs: { q: string; a: string }[] = [];
  const lines = content.split("\n");
  let currentQ = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Q:") || trimmed.startsWith("Q ")) {
      if (currentQ) {
        // Previous Q had no A
        warnings.push({
          rule: "orphan_question",
          message: `Question "${currentQ ?? ""}" has no answer`,
        });
      }
      currentQ = trimmed.replace(/^Q:?\s*/, "").replace(/^Q\s*/, "");
    } else if (trimmed.startsWith("A:") || trimmed.startsWith("A ")) {
      if (!currentQ) {
        warnings.push({
          rule: "orphan_answer",
          message: `Answer "${trimmed}" has no matching question`,
        });
      } else {
        const a = trimmed.replace(/^A:?\s*/, "").replace(/^A\s*/, "");
        qaPairs.push({ q: currentQ, a });
        currentQ = "";
      }
    }
  }

  if (currentQ) {
    warnings.push({
      rule: "orphan_question",
      message: `Question "${currentQ}" has no answer`,
    });
  }

  if (qaPairs.length === 0) {
    errors.push({
      rule: "no_qa_pairs",
      message: "faq-ai.txt must contain at least one Q:/A: pair",
    });
  }

  return { found: true, errors, warnings, content };
}

function validateBrandTxt(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  const hasBrandName = /^brand-name\s*:/im.test(content);
  const hasDoNotUse = /^do-not-use\s*:/im.test(content);

  if (!hasBrandName) {
    errors.push({
      rule: "missing_brand_name",
      message: "Missing brand-name: field",
    });
  }
  if (!hasDoNotUse) {
    warnings.push({
      rule: "missing_do_not_use",
      message: "Missing do-not-use: field — recommended to specify incorrect name variations",
    });
  }

  // Check for conflicting names (brand-name and do-not-use overlap)
  const brandNameMatch = content.match(/^brand-name\s*:\s*(.+)/im);
  const doNotUseMatch = content.match(/^do-not-use\s*:\s*(.+)/im);
  if (brandNameMatch && doNotUseMatch) {
    const bn = (brandNameMatch[1] ?? "").trim().toLowerCase();
    const dnu = (doNotUseMatch[1] ?? "").trim().toLowerCase();
    if (dnu.includes(bn) || bn.includes(dnu)) {
      warnings.push({
        rule: "name_conflict",
        message: "do-not-use appears to duplicate brand-name — they should be distinct",
      });
    }
  }

  return { found: true, errors, warnings, content };
}

function validateDeveloperAiTxt(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  const hasOverview = /^##\s*Overview/im.test(content);
  if (!hasOverview) {
    warnings.push({
      rule: "missing_overview",
      message: "Missing ## Overview section — recommended for AI to understand the project",
    });
  }

  // Check for excessive marketing language
  const marketingPhrases = [
    /\bworld'?s best\b/i,
    /\brevolutionary\b/i,
    /\bgame-?changer\b/i,
    /\bcutting-?edge\b/i,
    /\binnovative\b/i,
    /\bnext-?gen(eration)?\b/i,
  ];
  const lines = content.split("\n");
  for (const line of lines) {
    for (const phrase of marketingPhrases) {
      if (phrase.test(line)) {
        warnings.push({
          rule: "marketing_language",
          message: `Avoid marketing language ("${line.trim().substring(0, 30)}...") — use factual, neutral descriptions`,
        });
        break;
      }
    }
  }

  return { found: true, errors, warnings, content };
}

function validateLlmsHtml(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  const hasHtmlTag = /<html/i.test(content);
  const hasHeadTag = /<head/i.test(content);
  const hasBodyTag = /<body/i.test(content);
  const hasJsonLd = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/i.test(
    content
  );

  if (!hasHtmlTag) {
    errors.push({
      rule: "missing_html_tag",
      message: "Document should have <html> tag",
    });
  }
  if (!hasHeadTag) {
    errors.push({
      rule: "missing_head_tag",
      message: "Document should have <head> tag",
    });
  }
  if (!hasBodyTag) {
    errors.push({
      rule: "missing_body_tag",
      message: "Document should have <body> tag",
    });
  }
  if (!hasJsonLd) {
    warnings.push({
      rule: "missing_json_ld",
      message: "Missing JSON-LD Schema.org structured data — recommended for AI readability",
    });
  }

  // Check for Open Graph meta tags
  const hasOgTitle = /<meta[^>]+property\s*=\s*["']og:title["'][^>]*>/i.test(
    content
  );
  if (!hasOgTitle) {
    warnings.push({
      rule: "missing_og_tags",
      message: "Missing Open Graph meta tags — recommended for social sharing",
    });
  }

  return { found: true, errors, warnings, content };
}

function validateRobotsAiTxt(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  const lines = content.split("\n");
  let hasUserAgent = false;
  let hasDirectives = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (/^user-agent\s*:/i.test(trimmed)) {
      hasUserAgent = true;
    }
    if (/^(allow|disallow|ai-admin|ai-block)\s*:/i.test(trimmed)) {
      hasDirectives = true;
    }
  }

  if (!hasUserAgent) {
    warnings.push({
      rule: "missing_user_agent",
      message: "No User-agent directive found — add at least one User-agent line",
    });
  }
  if (!hasDirectives) {
    warnings.push({
      rule: "missing_directives",
      message: "No Allow/Disallow directives found — this file has no effect without them",
    });
  }

  // Warn about AI-specific directives
  const hasAiDirectives = /^(ai-admin|ai-block)\s*:/im.test(content);
  if (!hasAiDirectives) {
    warnings.push({
      rule: "missing_ai_directives",
      message: "No ai-admin or ai-block directives — use these for AI-specific access control",
    });
  }

  return { found: true, errors, warnings, content };
}

function validateIdentityJson(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    errors.push({
      rule: "invalid_json",
      message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
    });
    return { found: true, errors, warnings, content };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    errors.push({ rule: "invalid_structure", message: "Root must be a JSON object" });
    return { found: true, errors, warnings, content };
  }

  const obj = parsed as Record<string, unknown>;
  const required = ["name", "url"];
  for (const field of required) {
    if (!obj[field]) {
      errors.push({
        rule: "missing_field",
        message: `Missing required field: "${field}"`,
      });
    }
  }

  if (obj.url && typeof obj.url === "string") {
    try {
      new URL(obj.url);
    } catch {
      errors.push({ rule: "invalid_url", message: `"url" is not a valid URL` });
    }
  }

  return { found: true, errors, warnings, content };
}

function validateAiJson(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    errors.push({
      rule: "invalid_json",
      message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
    });
    return { found: true, errors, warnings, content };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    errors.push({ rule: "invalid_structure", message: "Root must be a JSON object" });
    return { found: true, errors, warnings, content };
  }

  const obj = parsed as Record<string, unknown>;
  if (!obj.interactions && !obj.guidelines) {
    warnings.push({
      rule: "missing_interactions",
      message: "Missing interactions or guidelines section — file may be incomplete",
    });
  }

  return { found: true, errors, warnings, content };
}
