import type { CrawledData } from "@/lib/discovery/types";
import type { SiteSignal } from "./merge-signals";
import { generateTemplateContent } from "./gemini-template-filler";

export type GenerationResult = {
  content: string;
  geminiCalled: boolean;
  source: "schema" | "llm" | "fallback";
};

type FileType = "brand.txt" | "ai.txt" | "developer-ai.txt" | "faq-ai.txt" | "llms.txt";

function buildCrawledDataFromSiteSignal(signal: SiteSignal): CrawledData {
  return {
    siteName: signal.name,
    origin: signal.pages.at(0)?.canonical.replace(/\/$/, "") ?? signal.organization?.url ?? "",
    description: signal.description,
    pages: signal.pages.map((p) => ({
      url: p.canonical,
      title: p.name,
      description: p.description ?? "",
      category: undefined,
    })),
    brandName: signal.organization?.alternateName?.at(0),
    email: signal.organization?.contactPoint?.at(0)?.email,
  };
}

function extractFaqContent(signal: SiteSignal): string {
  if (!signal.faqPage) return "";

  const lines: string[] = [];
  for (const qa of signal.faqPage.mainEntity) {
    lines.push(`Q: ${qa.name}`);
    lines.push(`A: ${qa.acceptedAnswer.text}`);
    lines.push("");
  }
  return lines.join("\n");
}

export async function generateSchemaFirst(
  signal: SiteSignal,
  fileType: FileType
): Promise<GenerationResult> {
  // FAQPage direct extraction — no Gemini needed
  if (fileType === "faq-ai.txt") {
    if (signal.faqPage) {
      const faqContent = extractFaqContent(signal);
      return {
        content: `# FAQ\n\n${faqContent}`,
        geminiCalled: false,
        source: "schema",
      };
    }
    // No FAQPage schema — fall through to LLM generation
  }

  // Build CrawledData from SiteSignal with schema enrichment
  const data = buildCrawledDataFromSiteSignal(signal);

  // Fetch template and generate
  // Note: We use the existing generateTemplateContent which handles Gemini + fallback
  // The schema data is already embedded in data, so the LLM gets enriched context
  const template = await import("@/lib/discovery/template-fetcher").then(
    (m) => m.fetchTemplate(fileType)
  );

  if (!template.success || !template.content) {
    // No template available — return schema-only content for supported types
    if (fileType === "brand.txt" && signal.organization) {
      const org = signal.organization;
      return {
        content: `# Brand Guidelines\n\n## Official Names\n${org.name ?? "N/A"}\n${org.legalName ?? ""}\n\n## Contact\n${org.contactPoint?.at(0)?.email ?? "N/A"}\n${org.contactPoint?.at(0)?.telephone ?? ""}`,
        geminiCalled: false,
        source: "schema",
      };
    }
    return {
      content: "",
      geminiCalled: false,
      source: "fallback",
    };
  }

  try {
    const content = await generateTemplateContent(fileType, template.content, data);
    return {
      content,
      geminiCalled: true,
      source: "llm",
    };
  } catch {
    // Gemini failed — try schema-only content
    if (signal.organization) {
      const org = signal.organization;
      return {
        content: `# ${signal.name}\n\n${signal.description ?? org.description ?? ""}\n\nContact: ${org.contactPoint?.at(0)?.email ?? "N/A"}`,
        geminiCalled: false,
        source: "fallback",
      };
    }
    return {
      content: "",
      geminiCalled: false,
      source: "fallback",
    };
  }
}
