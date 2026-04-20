import type { DiscoverResult, FileType, Suggestion, FileScanResult } from "./types";
import { ALL_FILE_TYPES } from "./types";
import { scanFile } from "@/lib/ai-discovery-scanner";
import { generateAllMissing } from "./file-generators";

function buildSuggestions(missing: FileType[]): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (missing.includes("llms.txt")) {
    suggestions.push({
      fileType: "llms.txt",
      action: "Create llms.txt at the site root",
      reason:
        "llms.txt is the most important — AI agents use it to discover your site structure.",
      priority: "high",
    });
  }
  if (missing.includes("llm.txt")) {
    suggestions.push({
      fileType: "llm.txt",
      action: "Create llm.txt redirect",
      reason: "llm.txt is a one-line redirect file. Takes 10 seconds to create.",
      priority: "medium",
    });
  }
  if (missing.includes("ai.txt")) {
    suggestions.push({
      fileType: "ai.txt",
      action: "Create ai.txt with permissions",
      reason: "ai.txt defines what AI agents can and cannot do with your content.",
      priority: "medium",
    });
  }
  if (missing.includes("brand.txt")) {
    suggestions.push({
      fileType: "brand.txt",
      action: "Create brand.txt for brand consistency",
      reason: "brand.txt helps AI agents use your brand name correctly.",
      priority: "low",
    });
  }
  if (missing.includes("faq-ai.txt")) {
    suggestions.push({
      fileType: "faq-ai.txt",
      action: "Create faq-ai.txt for common questions",
      reason:
        "faq-ai.txt lets AI agents answer common user questions without crawling full pages.",
      priority: "low",
    });
  }

  return suggestions;
}

export async function discover(url: string): Promise<DiscoverResult> {
  const scanResults = await Promise.all(
    ALL_FILE_TYPES.map((type) => scanFile(url, type))
  );

  const files: FileScanResult[] = scanResults.map((r) => ({
    type: r.name,
    found: r.found,
    url: r.url,
    content: r.content,
    errors: r.errors,
    warnings: r.warnings,
    checklist: r.checklist,
    skipReason: r.skipReason,
  }));

  const missingFiles = files.filter((f) => !f.found).map((f) => f.type);

  return {
    origin: url,
    files,
    missingFiles,
    suggestions: buildSuggestions(missingFiles),
  };
}

export async function generateMissing(
  missingFiles: FileType[],
  origin: string
) {
  return generateAllMissing(missingFiles, origin);
}
