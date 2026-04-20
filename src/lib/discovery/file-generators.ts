import type { FileGenerateResult, FileType } from "./types";
import type { GeneratorResult, GeneratorError } from "@/lib/generator";
import { crawlWebsite } from "@/lib/generator";
import { generateByType } from "@/lib/generator/ai-generators";
import { validateByType } from "@/lib/ai-discovery-scanner";
import { buildChecklist } from "@/lib/ai-discovery-scanner";
import type { ChecklistItem } from "@/lib/ai-discovery-scanner";
import { generateLlmsTxt } from "@/lib/generator";

function isGeneratorError(result: GeneratorResult | GeneratorError): result is GeneratorError {
  return !result.success;
}

export async function generateFile(
  fileType: FileType,
  origin: string
): Promise<FileGenerateResult> {
  let content: string;

  try {
    if (fileType === "llms.txt") {
      const result = await generateLlmsTxt({ url: origin });
      if (isGeneratorError(result)) {
        throw new Error(result.error ?? "Generation failed");
      }
      content = result.content ?? "";
    } else {
      // Crawl website once, then use AI to generate content
      const crawlData = await crawlWebsite(origin);
      content = await generateByType(fileType, crawlData);
    }

    const validation = validateByType(content, fileType);
    const checklist = buildChecklist(
      fileType,
      true,
      validation.errors,
      validation.warnings
    ) as ChecklistItem[];

    return {
      type: fileType,
      success: true,
      content,
      errors: validation.errors,
      warnings: validation.warnings,
      checklist,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return {
      type: fileType,
      success: false,
      content: "",
      errors: [{ rule: "generation_failed", message }],
      warnings: [],
      checklist: buildChecklist(
        fileType,
        false,
        [{ rule: "generation_failed", message }],
        []
      ) as ChecklistItem[],
    };
  }
}

export async function generateAllMissing(
  fileTypes: FileType[],
  origin: string
): Promise<FileGenerateResult[]> {
  // Crawl website once and reuse for all file types
  const crawlData = await crawlWebsite(origin);

  const results: FileGenerateResult[] = [];
  for (const fileType of fileTypes) {
    try {
      if (fileType === "llms.txt") {
        const result = await generateLlmsTxt({ url: origin });
        if (isGeneratorError(result)) {
          throw new Error(result.error ?? "Generation failed");
        }
        const content = result.content ?? "";
        const validation = validateByType(content, fileType);
        results.push({
          type: fileType,
          success: true,
          content,
          errors: validation.errors,
          warnings: validation.warnings,
          checklist: buildChecklist(
            fileType,
            true,
            validation.errors,
            validation.warnings
          ) as ChecklistItem[],
        });
      } else {
        const content = await generateByType(fileType, crawlData);
        const validation = validateByType(content, fileType);
        results.push({
          type: fileType,
          success: true,
          content,
          errors: validation.errors,
          warnings: validation.warnings,
          checklist: buildChecklist(
            fileType,
            true,
            validation.errors,
            validation.warnings
          ) as ChecklistItem[],
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      results.push({
        type: fileType,
        success: false,
        content: "",
        errors: [{ rule: "generation_failed", message }],
        warnings: [],
        checklist: buildChecklist(
          fileType,
          false,
          [{ rule: "generation_failed", message }],
          []
        ) as ChecklistItem[],
      });
    }
  }
  return results;
}
