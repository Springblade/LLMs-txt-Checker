import { discoverUrls, deduplicateUrls, filterUrls } from "./url-discover";
import { scoreUrls, applyControls } from "./url-prioritize";
import { crawlPages } from "./crawler";
import { generateAiDescriptions } from "./ai-generator";
import { buildLlmsTxt, buildFileName } from "./builder";
import type { GeneratorInput, GeneratorResult, GeneratorError } from "./types";
import { validateLlmsTxt } from "@/lib/validator";

function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function generateLlmsTxt(
  input: GeneratorInput,
  onProgress?: (step: number, message: string) => void
): Promise<GeneratorResult | GeneratorError> {
  if (!validateUrl(input.url)) {
    return { success: false, error: "Invalid URL", errorCode: "INVALID_URL" };
  }

  try {
    onProgress?.(1, "Discovering URLs from homepage, robots.txt, and sitemap...");
    const discovered = await discoverUrls(input.url);

    onProgress?.(2, "Deduplicating and filtering URLs...");
    const deduplicated = deduplicateUrls(discovered);
    const filtered = filterUrls(deduplicated, input.excludePaths ?? []);

    onProgress?.(3, "Scoring and prioritizing URLs...");
    const scored = scoreUrls(filtered, input.includePaths ?? []);
    const prioritized = applyControls(scored, input.maxUrls ?? 50, input.excludePaths ?? []);

    onProgress?.(4, `Crawling ${prioritized.length} pages...`);
    const crawled = await crawlPages(prioritized, 5);

    const successful = crawled.filter((p) => p.content !== undefined);
    const errors = crawled
      .filter((p) => p.error !== undefined)
      .map((p) => `${p.url}: ${p.error}`);

    onProgress?.(5, "Generating AI descriptions for pages without descriptions...");
    const withAi = await generateAiDescriptions(successful);

    const siteName = new URL(input.url).hostname.replace(/^www\./, "");

    onProgress?.(6, "Building llms.txt content...");
    const content = buildLlmsTxt(withAi, { siteName });

    onProgress?.(7, "Validating generated content...");
    const validation = validateLlmsTxt(content);

    const result: GeneratorResult = {
      success: true,
      content,
      fileName: buildFileName(input.url),
      pagesFound: discovered.length,
      pagesCrawled: successful.length,
      errors,
      validation: {
        passed: validation.errors.length === 0,
        errors: validation.errors.map((e) => ({
          rule: e.rule ?? "unknown",
          message: e.message,
          line: e.line,
        })),
        warnings: validation.warnings.map((w) => ({
          rule: w.rule ?? "unknown",
          message: w.message,
          line: w.line,
        })),
      },
      metadata: {
        siteName,
        generatedAt: new Date().toISOString(),
        generatorVersion: "1.0.0",
      },
    };

    onProgress?.(8, "Done!");
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("FETCH_ERROR")) {
      return { success: false, error: message, errorCode: "FETCH_ERROR", details: message };
    }
    return { success: false, error: message, errorCode: "UNKNOWN", details: message };
  }
}

export * from "./types";
export * from "./url-discover";
export * from "./url-prioritize";
export * from "./crawler";
export * from "./builder";
export * from "./security";
export { generateAiDescriptions, generateAiDescription, buildPrompt } from "./ai-generator";
export { classifyPage, getCategoryLabel } from "./category-classifier";
