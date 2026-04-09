import type { ValidationResult, ValidationError, ValidationWarning, LinkResult, HealthScore } from "./types";
import { parseMarkdown } from "./markdown-parser";

export function calculateHealthScore(result: ValidationResult): HealthScore {
  const totalLinks = result.linkResults?.length ?? 0;
  const errorCount = result.errors?.length ?? 0;
  const warningCount = result.warnings?.length ?? 0;
  const brokenLinks = result.linkResults?.filter((l) => !l.ok).length ?? 0;

  const score = Math.max(
    0,
    100 - errorCount * 20 - warningCount * 5 - brokenLinks * 10
  );

  return {
    score,
    status: score >= 70 ? "pass" : "fail",
    totalLinks,
    errorCount,
    warningCount,
  };
}

export function validateLlmsTxt(content: string, linkResults?: LinkResult[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Rule 1: markdown_format (Required)
  if (!content || content.trim().length === 0) {
    errors.push({
      rule: "markdown_format",
      message: "File is empty or has no content",
    });
    return {
      found: true,
      errors,
      warnings,
      content,
    };
  }

  const hasReadableChars = /[a-zA-Z0-9]/.test(content);
  if (!hasReadableChars) {
    errors.push({
      rule: "markdown_format",
      message: "Content has no readable characters",
    });
    return {
      found: true,
      errors,
      warnings,
      content,
    };
  }

  const parsedData = parseMarkdown(content);

  // Rule 2: h1_title (Required)
  if (!parsedData.title) {
    errors.push({
      rule: "h1_title",
      message: "Missing H1 title (# Title)",
    });
  }

  // Rule 3: quote_block (Optional)
  if (!parsedData.hasQuoteBlock) {
    warnings.push({
      rule: "quote_block",
      message: "Should include a brief project description (blockquote)",
    });
  }

  // Rule 4: description_paragraphs (Optional)
  if (parsedData.descriptions.length === 0) {
    warnings.push({
      rule: "description_paragraphs",
      message: "Should have at least 1 detailed paragraph after blockquote",
    });
  }

  // Rule 5: project_details (Optional)
  const hasProjectDetails = parsedData.headingCount >= 2 || parsedData.links.length >= 3;
  if (!hasProjectDetails) {
    warnings.push({
      rule: "project_details",
      message: "Should have at least 2 headings (H2+) or 3+ links for detailed project description",
    });
  }

  // Rule 6: file_list_format (Optional)
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') continue;

    if (/^\-/.test(trimmed) && !trimmed.startsWith('- [')) {
      warnings.push({
        rule: "file_list_format",
        message: `Invalid format: "${trimmed}". Expected: "- [Title](url)" or "- [Title](url): description"`,
      });
    }
  }

  // Rule 7: link_validation (Optional)
  if (linkResults && linkResults.length > 0) {
    const failedLinks = linkResults.filter((r) => !r.ok);
    for (const failed of failedLinks) {
      warnings.push({
        rule: "link_validation",
        message: `Broken link: ${failed.url} (HTTP ${failed.status})`,
      });
    }
  } else if (parsedData.links.length > 0 && !linkResults) {
    warnings.push({
      rule: "link_validation",
      message: "No link check results provided — skipping validation",
    });
  }

  return {
    found: true,
    errors,
    warnings,
    content,
    parsedData,
    linkResults,
  };
}