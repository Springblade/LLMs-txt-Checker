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

  // Per ai.txt ADF-004: INI [section] syntax
  if (!/^\[official-names\]\s*$/im.test(content)) {
    errors.push({ rule: "has_official_names", message: "Missing [official-names] section" });
  }
  if (!/^\[incorrect-names\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_incorrect_names", message: "Missing [incorrect-names] section" });
  }
  if (!/^\[overview\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_overview", message: "Missing [overview] section" });
  }
  if (!/^\[permissions\]\s*$/im.test(content)) {
    errors.push({ rule: "has_permissions", message: "Missing [permissions] section" });
  }
  if (!/^\[restrictions\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_restrictions", message: "Missing [restrictions] section" });
  }
  if (!/^\[contact\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_contact", message: "Missing [contact] section" });
  }

  return { found: true, errors, warnings, content };
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

  // Check for URL: attribution (per ADF-008 v2.0 spec)
  const urlAttribCount = (content.match(/^URL:\s*\[/im) ?? []).length;
  if (urlAttribCount === 0 && qaPairs.length > 0) {
    errors.push({
      rule: "has_url_attrib",
      message: "Missing URL: attribution after Q:/A: pairs",
    });
  }

  return { found: true, errors, warnings, content };
}

function validateBrandTxt(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  // Per brand.txt ADF-007: INI [section] syntax
  if (!/^\[official-names\]\s*$/im.test(content)) {
    errors.push({ rule: "has_official_names", message: "Missing [official-names] section" });
  }
  if (!/^\[incorrect-names\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_incorrect_names", message: "Missing [incorrect-names] section" });
  }
  if (!/^\[naming-rules\]\s*$/im.test(content)) {
    errors.push({ rule: "has_naming_rules", message: "Missing [naming-rules] section" });
  }
  if (!/^\[contact\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_contact", message: "Missing [contact] section" });
  }

  return { found: true, errors, warnings, content };
}

function validateDeveloperAiTxt(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  // Per developer-ai.txt ADF-009: INI [section] syntax
  if (!/^\[official-names\]\s*$/im.test(content)) {
    errors.push({ rule: "has_official_names", message: "Missing [official-names] section" });
  }
  if (!/^\[overview\]\s*$/im.test(content)) {
    errors.push({ rule: "has_overview", message: "Missing [overview] section" });
  }
  if (!/^\[public-api\]\s*$/im.test(content)) {
    errors.push({ rule: "has_public_api", message: "Missing [public-api] section" });
  }
  if (!/^\[public-areas\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_public_areas", message: "Missing [public-areas] section" });
  }
  if (!/^\[contact\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_contact", message: "Missing [contact] section" });
  }

  return { found: true, errors, warnings, content };
}

function validateLlmsHtml(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  // Per llms.html ADF-003: noindex + canonical link
  if (!/<html/i.test(content)) {
    errors.push({ rule: "has_html_tag", message: "Missing <html> tag" });
  }
  if (!/<h1/i.test(content)) {
    errors.push({ rule: "has_h1", message: "Missing <h1> heading" });
  }
  if (!/<meta[^>]+name\s*=\s*["']robots["'][^>]+content\s*=\s*["'][^"]*noindex/im.test(content)) {
    errors.push({ rule: "has_noindex", message: 'Robots meta must use "noindex"' });
  }
  if (!/<link[^>]+rel\s*=\s*["']canonical["'][^>]*>/i.test(content)) {
    errors.push({ rule: "has_canonical", message: 'Missing <link rel="canonical">' });
  }

  return { found: true, errors, warnings, content };
}

function validateRobotsAiTxt(content: string) {
  const errors: { rule: string; message: string }[] = [];
  const warnings: { rule: string; message: string }[] = [];

  // Per robots-ai.txt ADF-010: INI directive syntax
  if (!/^\[official-names\]\s*$/im.test(content)) {
    errors.push({ rule: "has_official_names", message: "Missing [official-names] section" });
  }
  if (!/^\[allow-training\]\s*$/im.test(content)) {
    errors.push({ rule: "has_allow_training", message: "Missing [allow-training] section" });
  }
  if (!/^\[disallow-training\]\s*$/im.test(content)) {
    errors.push({ rule: "has_disallow_training", message: "Missing [disallow-training] section" });
  }
  if (!/^\[allow-retrieval\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_allow_retrieval", message: "Missing [allow-retrieval] section" });
  }
  if (!/^\[disallow-retrieval\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_disallow_retrieval", message: "Missing [disallow-retrieval] section" });
  }
  if (!/^\[allow-citation\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_allow_citation", message: "Missing [allow-citation] section" });
  }
  if (!/^\[disallow-citation\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_disallow_citation", message: "Missing [disallow-citation] section" });
  }
  if (!/^\[contact\]\s*$/im.test(content)) {
    warnings.push({ rule: "has_contact", message: "Missing [contact] section" });
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

  // Check $schema points to correct domain (ai-visibility.org.uk, not 365i.co.uk)
  const schema = obj["$schema"];
  if (typeof schema === "string" && !schema.includes("ai-visibility.org.uk")) {
    errors.push({
      rule: "has_schema_ai_visibility",
      message: '$schema must point to ai-visibility.org.uk, not 365i.co.uk or other domain',
    });
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

  return { found: true, errors, warnings, content };
}
