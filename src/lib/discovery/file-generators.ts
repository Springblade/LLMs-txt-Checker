import type { FileGenerateResult, FileType } from "./types";
import { crawlWebsite } from "@/lib/generator";
import { generateByType } from "@/lib/generator/ai-generators";
import { validateByType } from "@/lib/ai-discovery-scanner";
import { buildChecklist } from "@/lib/ai-discovery-scanner";
import type { ChecklistItem } from "@/lib/ai-discovery-scanner";
import { fetchTemplate } from "@/lib/discovery/template-fetcher";
import { generateTemplateContent } from "@/lib/generator/gemini-template-filler";

export async function generateFile(
  fileType: FileType,
  origin: string
): Promise<FileGenerateResult> {
  let content: string;

  try {
    // Crawl website once, then use AI to generate content
    const crawlData = await crawlWebsite(origin);

    if (fileType === "llms.txt") {
      // Use template-based generation for llms.txt too
      const template = fetchTemplate("llms.txt");
      if (!template.success || !template.content) {
        throw new Error(template.error ?? "Template not found: llms.txt");
      }
      content = await generateTemplateContent("llms.txt", template.content, crawlData);
    } else {
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
      let content: string;
      if (fileType === "llms.txt") {
        // Use template-based generation for llms.txt
        const template = fetchTemplate("llms.txt");
        if (!template.success || !template.content) {
          throw new Error(template.error ?? "Template not found: llms.txt");
        }
        content = await generateTemplateContent("llms.txt", template.content, crawlData);
      } else {
        content = await generateByType(fileType, crawlData);
      }
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
