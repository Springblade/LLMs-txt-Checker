import type { FileGenerateResult, FileType, CrawledData } from "./types";
import { crawlWebsite } from "@/lib/generator";
import { getOrCrawlSite, buildDescription } from "@/lib/generator/site-crawl-cache";
import { generateByType } from "@/lib/generator/ai-generators";
import { validateByType } from "@/lib/ai-discovery-scanner";
import { buildChecklist } from "@/lib/ai-discovery-scanner";
import type { ChecklistItem } from "@/lib/ai-discovery-scanner";
import { fetchTemplate } from "@/lib/discovery/template-fetcher";
import { generateTemplateContent } from "@/lib/generator/gemini-template-filler";
import { contentHashMap } from "@/lib/generator/content-hash";

type GenerationContext = {
  fileType: FileType;
  crawlData: CrawledData;
  checkContentHash: boolean;
};

async function generateSingleFile(ctx: GenerationContext): Promise<FileGenerateResult> {
  const { fileType, crawlData, checkContentHash } = ctx;

  if (checkContentHash) {
    const changedUrls: string[] = [];

    for (const page of crawlData.pages) {
      if (await contentHashMap.hasChanged(page.url, page.description ?? "")) {
        changedUrls.push(page.url);
      }
    }

    if (changedUrls.length === 0) {
      const cachedOutput = await contentHashMap.getOutput(fileType);
      if (cachedOutput) {
        return {
          type: fileType,
          success: true,
          content: cachedOutput,
          errors: [],
          warnings: [{ rule: "content_unchanged", message: "Source unchanged — returned cached output" }],
          checklist: buildChecklist(fileType, true, [], []) as ChecklistItem[],
        };
      }
    }
  }

  try {
    let content: string;
    if (fileType === "llms.txt") {
      const template = fetchTemplate("llms.txt");
      if (!template.success || !template.content) {
        throw new Error(template.error ?? "Template not found: llms.txt");
      }
      content = await generateTemplateContent("llms.txt", template.content, crawlData);
    } else {
      content = await generateByType(fileType, crawlData);
    }

    for (const page of crawlData.pages) {
      await contentHashMap.record(page.url, page.description ?? "");
    }
    await contentHashMap.saveOutput(fileType, content);

    const validation = validateByType(content, fileType);
    return {
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

export async function generateFile(
  fileType: FileType,
  origin: string
): Promise<FileGenerateResult> {
  const crawlResult = await getOrCrawlSite(origin, async () => {
    const crawl = await crawlWebsite(origin);
    const description = buildDescription(crawl.pages, crawl.origin, crawl.siteName);
    return { ...crawl, description };
  });
  const crawlData: CrawledData = {
    siteName: crawlResult.siteName,
    origin: crawlResult.origin,
    pages: crawlResult.pages,
    llmsTxtContent: crawlResult.llmsTxtContent,
  };
  return generateSingleFile({ fileType, crawlData, checkContentHash: true });
}

export async function generateAllMissing(
  fileTypes: FileType[],
  origin: string
): Promise<FileGenerateResult[]> {
  const crawlResult = await getOrCrawlSite(origin, async () => {
    const crawl = await crawlWebsite(origin);
    const description = buildDescription(crawl.pages, crawl.origin, crawl.siteName);
    return { ...crawl, description };
  });
  const crawlData: CrawledData = {
    siteName: crawlResult.siteName,
    origin: crawlResult.origin,
    pages: crawlResult.pages,
    llmsTxtContent: crawlResult.llmsTxtContent,
  };

  for (const page of crawlData.pages) {
    await contentHashMap.record(page.url, page.description ?? "");
  }

  const promises = fileTypes.map(
    (fileType) => generateSingleFile({ fileType, crawlData, checkContentHash: false })
  );

  const settled = await Promise.allSettled(promises);

  return settled.map((outcome, i): FileGenerateResult => {
    const fileType = fileTypes[i]!;
    if (outcome.status === "fulfilled") {
      const result = outcome.value;
      if (result.success && result.content) {
        contentHashMap.saveOutput(fileType, result.content);
      }
      return result;
    }
    const message = outcome.reason instanceof Error
      ? outcome.reason.message
      : String(outcome.reason);
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
  });
}
