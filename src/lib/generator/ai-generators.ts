import type { CrawledData, FileType } from "@/lib/discovery/types";
import { fetchTemplate } from "@/lib/discovery/template-fetcher";
import { generateTemplateContent } from "./gemini-template-filler";

// ─── Generator implementations using Gemini-powered template filling ─────────────────────────────────

async function generateBrandTxt(data: CrawledData): Promise<string> {
  const template = fetchTemplate("brand.txt");
  if (!template.success || !template.content) {
    throw new Error(template.error ?? "Template not found: brand.txt");
  }
  return generateTemplateContent("brand.txt", template.content, data);
}

async function generateFaqAiTxt(data: CrawledData): Promise<string> {
  const template = fetchTemplate("faq-ai.txt");
  if (!template.success || !template.content) {
    throw new Error(template.error ?? "Template not found: faq-ai.txt");
  }
  return generateTemplateContent("faq-ai.txt", template.content, data);
}

async function generateLlmTxt(data: CrawledData): Promise<string> {
  const template = fetchTemplate("llm.txt");
  if (!template.success || !template.content) {
    throw new Error(template.error ?? "Template not found: llm.txt");
  }
  return generateTemplateContent("llm.txt", template.content, data);
}

async function generateAiTxt(data: CrawledData): Promise<string> {
  const template = fetchTemplate("ai.txt");
  if (!template.success || !template.content) {
    throw new Error(template.error ?? "Template not found: ai.txt");
  }
  return generateTemplateContent("ai.txt", template.content, data);
}

async function generateDeveloperAiTxt(data: CrawledData): Promise<string> {
  const template = fetchTemplate("developer-ai.txt");
  if (!template.success || !template.content) {
    throw new Error(template.error ?? "Template not found: developer-ai.txt");
  }
  return generateTemplateContent("developer-ai.txt", template.content, data);
}

async function generateRobotsAiTxt(data: CrawledData): Promise<string> {
  const template = fetchTemplate("robots-ai.txt");
  if (!template.success || !template.content) {
    throw new Error(template.error ?? "Template not found: robots-ai.txt");
  }
  return generateTemplateContent("robots-ai.txt", template.content, data);
}

async function generateIdentityJson(data: CrawledData): Promise<string> {
  const template = fetchTemplate("identity.json");
  if (!template.success || !template.content) {
    throw new Error(template.error ?? "Template not found: identity.json");
  }
  return generateTemplateContent("identity.json", template.content, data);
}

async function generateAiJson(data: CrawledData): Promise<string> {
  const template = fetchTemplate("ai.json");
  if (!template.success || !template.content) {
    throw new Error(template.error ?? "Template not found: ai.json");
  }
  return generateTemplateContent("ai.json", template.content, data);
}

async function generateLlmsHtml(data: CrawledData): Promise<string> {
  const template = fetchTemplate("llms.html");
  if (!template.success || !template.content) {
    throw new Error(template.error ?? "Template not found: llms.html");
  }
  return generateTemplateContent("llms.html", template.content, data);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function generateByType(
  fileType: FileType,
  data: CrawledData
): Promise<string> {
  switch (fileType) {
    case "llms.txt":
      throw new Error("llms.txt generation is handled separately via generateLlmsTxt");

    case "brand.txt":
      return generateBrandTxt(data);
    case "faq-ai.txt":
      return generateFaqAiTxt(data);
    case "llm.txt":
      return generateLlmTxt(data);
    case "ai.txt":
      return generateAiTxt(data);
    case "developer-ai.txt":
      return generateDeveloperAiTxt(data);
    case "robots-ai.txt":
      return generateRobotsAiTxt(data);
    case "identity.json":
      return generateIdentityJson(data);
    case "ai.json":
      return generateAiJson(data);
    case "llms.html":
      return generateLlmsHtml(data);

    default:
      throw new Error(`Unknown file type: ${fileType}`);
  }
}
