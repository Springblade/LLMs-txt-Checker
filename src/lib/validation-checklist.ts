import type { ValidationResult } from "./types";

export type ValidationCheckStatus = "success" | "error" | "warning" | "info";

export interface ValidationCheck {
  id: string;
  order: number;
  title: string;
  status: ValidationCheckStatus;
  message: string;
}

function label(key: string): string {
  const map: Record<string, string> = {
    markdown_format: "Markdown Format",
    h1_title: "H1 Title",
    quote_block: "Brief Description",
    description_paragraphs: "Description Paragraphs",
    project_details: "Project Details",
    file_list_format: "File List Format",
    link_validation: "Link Validation",
    ssl_error: "SSL Certificate",
    redirect_loop: "Redirect Loop",
    dns_error: "DNS Resolution",
    geo_blocked: "Geo-Blocked",
    unsupported_encoding: "Character Encoding",
  };
  return map[key] ?? key;
}

function firstError(result: ValidationResult, rule: string): string | null {
  const arr = result.errors;
  if (!arr) return null;
  const item = arr.find((e) => e.rule === rule);
  return item ? item.message : null;
}

function firstWarn(result: ValidationResult, rule: string): string | null {
  const arr = result.warnings;
  if (!arr) return null;
  const item = arr.find((w) => w.rule === rule);
  return item ? item.message : null;
}

function warnCount(result: ValidationResult, rule: string): number {
  const arr = result.warnings;
  if (!arr) return 0;
  return arr.filter((w) => w.rule === rule).length;
}

export function buildValidationChecks(result: ValidationResult): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  let order = 1;

  // 1: markdown_format
  const mdErr = firstError(result, "markdown_format");
  checks.push({
    id: "markdown_format",
    order: order++,
    title: label("markdown_format"),
    status: mdErr ? "error" : "success",
    message: mdErr ?? "Valid Markdown format",
  });

  // 2: h1_title
  const h1Err = firstError(result, "h1_title");
  checks.push({
    id: "h1_title",
    order: order++,
    title: label("h1_title"),
    status: h1Err ? "error" : "success",
    message: h1Err ?? "H1 title is present",
  });

  // 3: quote_block
  const qbErr = firstError(result, "quote_block");
  const qbWarn = firstWarn(result, "quote_block");
  checks.push({
    id: "quote_block",
    order: order++,
    title: label("quote_block"),
    status: qbErr ? "error" : qbWarn ? "warning" : "success",
    message: qbErr ?? qbWarn ?? "Brief project description present",
  });

  // 4: description_paragraphs
  const dpErr = firstError(result, "description_paragraphs");
  const dpWarn = firstWarn(result, "description_paragraphs");
  checks.push({
    id: "description_paragraphs",
    order: order++,
    title: label("description_paragraphs"),
    status: dpErr ? "error" : dpWarn ? "warning" : "success",
    message: dpErr ?? dpWarn ?? "Has detailed paragraphs",
  });

  // 5: project_details
  const pdErr = firstError(result, "project_details");
  const pdWarn = firstWarn(result, "project_details");
  checks.push({
    id: "project_details",
    order: order++,
    title: label("project_details"),
    status: pdErr ? "error" : pdWarn ? "warning" : "success",
    message: pdErr ?? pdWarn ?? "Project details section complete",
  });

  // 6: file_list_format — collapse warnings
  const flErr = firstError(result, "file_list_format");
  const flN = warnCount(result, "file_list_format");
  checks.push({
    id: "file_list_format",
    order: order++,
    title: label("file_list_format"),
    status: flErr ? "error" : flN > 0 ? "warning" : "success",
    message: flErr ?? (flN === 1 ? firstWarn(result, "file_list_format") ?? "" : `${flN} entries with invalid format`),
  });

  // 7: link_validation
  const lvErr = firstError(result, "link_validation");
  const lvN = warnCount(result, "link_validation");
  const linkCount = result.parsedData?.links?.length ?? 0;
  checks.push({
    id: "link_validation",
    order: order++,
    title: label("link_validation"),
    status: lvErr ? "error" : lvN > 0 ? "warning" : "info",
    message: lvErr ?? (
      lvN > 0
        ? lvN === 1
          ? firstWarn(result, "link_validation") ?? ""
          : `${lvN} broken links found`
        : linkCount > 0
          ? `${linkCount} link${linkCount === 1 ? "" : "s"} validated`
          : "No links to validate"
    ),
  });

  return checks;
}
