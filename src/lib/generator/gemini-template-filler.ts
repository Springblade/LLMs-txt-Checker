import { GoogleGenerativeAI, GoogleGenerativeAIError } from "@google/generative-ai";
import type { CrawledData } from "@/lib/discovery/types";

const GOOGLE_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
] as const;

function getApiKeys(): string[] {
  const raw = process.env.GOOGLE_API_KEY ?? "";
  if (!raw.trim()) {
    throw new Error("GOOGLE_API_KEY environment variable is not set");
  }
  return raw.split(",").map((k) => k.trim()).filter(Boolean);
}

let _apiKeys: string[] | null = null;
let _currentKeyIndex = 0;

function getKeys(): string[] {
  if (!_apiKeys) {
    _apiKeys = getApiKeys();
  }
  return _apiKeys;
}

let _currentModelIndex = 0;

function getNextKey(): string {
  const keys = getKeys();
  const key = keys[_currentKeyIndex % keys.length] ?? "";
  _currentKeyIndex++;
  return key;
}

function getNextModel(): string {
  const model = GOOGLE_MODELS[_currentModelIndex % GOOGLE_MODELS.length]!;
  _currentModelIndex++;
  return model;
}

function isQuotaError(e: unknown): boolean {
  if (e instanceof GoogleGenerativeAIError) {
    const msg = e.message.toLowerCase();
    return (
      msg.includes("429") ||
      msg.includes("resource has been exhausted") ||
      msg.includes("quota") ||
      msg.includes("rate limit") ||
      msg.includes("too many requests")
    );
  }
  if (e instanceof Error) {
    const msg = e.message.toLowerCase();
    return (
      msg.includes("429") ||
      msg.includes("resource has been exhausted") ||
      msg.includes("quota") ||
      msg.includes("rate limit") ||
      msg.includes("too many requests")
    );
  }
  return false;
}

function buildCrawlContext(data: CrawledData): string {
  const today = new Date().toISOString().split("T")[0] ?? "";

  const pagesContext = data.pages
    .map((p, i) => `[Page ${i + 1}]
URL: ${p.url}
Title: ${p.title}
Description: ${p.description}
Category: ${p.category ?? "general"}
`)
    .join("\n");

  return `Website: ${data.origin}
Site Name: ${data.siteName}
Brand Name: ${data.brandName ?? data.siteName}
Description: ${data.description ?? "N/A"}
Today's Date: ${today}

Crawled Pages:
${pagesContext}

Additional Info:
${data.email ? `Contact Email: ${data.email}` : ""}
${data.techStack?.length ? `Tech Stack: ${data.techStack.join(", ")}` : ""}
${data.faqs?.length ? `FAQs Found:\n${data.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}` : ""}
`.trim();
}

function buildPrompt(fileType: string, template: string, data: CrawledData): string {
  const context = buildCrawlContext(data);

  const instructions: Record<string, string> = {
    "faq-ai.txt": `This FAQ template requires:
- Generate 5 common questions about this business based on the crawled content
- Questions should cover: what they do, where they're located, services, contact info, and key differentiators
- Answers must be based ONLY on information from the crawled data
- Use professional, factual language
- Return ONLY the filled template, no explanation`,

    "brand.txt": `This brand guidelines template requires:
- Identify correct legal name, trading name, and brand name from crawled data
- Generate brand voice descriptions (positive and negative) based on website tone
- Generate contact email (use crawled email if available)
- Return ONLY the filled template, no explanation`,

    "llms.txt": `This business overview template requires:
- Extract business name, description, and services from crawled data
- Generate contact information section
- List key reference pages from crawled URLs
- Return ONLY the filled template, no explanation`,

    "ai.txt": `This AI usage guidance template requires:
- Extract canonical identity info (legal name, brand, services, country)
- Generate appropriate "when to recommend" and "when not to recommend" criteria
- Generate service scope clarifications
- Return ONLY the filled template, no explanation`,

    "developer-ai.txt": `This technical documentation template requires:
- Extract any technical information from crawled data
- Use crawled page info to infer platform/API details
- Generate crawler directives based on common website patterns
- Return ONLY the filled template, no explanation`,

    "llm.txt": `This redirect template requires:
- Just update the {{origin}} and {{business-name}} placeholders
- The rest of the template is already correct
- Return ONLY the filled template, no explanation`,

    "identity.json": `This JSON identity template requires:
- Fill all {{...}} placeholders with values from crawled data
- Use "N/A" for fields not available in crawled content
- Keep JSON structure intact
- Return ONLY the filled JSON, no explanation`,

    "ai.json": `This JSON AI guidance template requires:
- Fill all {{...}} placeholders with values from crawled data
- Use "N/A" for fields not available in crawled content
- Keep JSON structure intact
- Return ONLY the filled JSON, no explanation`,

    "llms.html": `This HTML identity template requires:
- Fill all {{...}} placeholders with values from crawled data
- Use "N/A" for fields not available in crawled content
- Keep HTML structure intact
- Return ONLY the filled HTML, no explanation`,

    "robots-ai.txt": `This robots AI directives template requires:
- Generate appropriate crawler directives based on crawled URLs
- List public paths (found in crawled data) as allowed
- Mark common private paths (admin, portal, api) as disallowed
- Return ONLY the filled template, no explanation`,
  };

  const specificInstruction = instructions[fileType] ?? `Fill all {{...}} placeholders with appropriate content from the crawled data. Return ONLY the filled template, no explanation.`;

  return `You are filling an AI Discovery File template with content from a crawled website.

Template:
${template}

Crawled website data:
${context}

${specificInstruction}`;
}

function fillTemplateFallback(template: string, data: CrawledData): string {
  const today = new Date().toISOString().split("T")[0] ?? "";

  const placeholders: Record<string, string> = {
    "{{business-name}}": data.siteName,
    "{{legal-name}}": data.siteName,
    "{{trading-name}}": data.brandName ?? data.siteName,
    "{{brand-name}}": data.brandName ?? data.siteName,
    "{{origin}}": data.origin,
    "{{date}}": today,
    "{{country}}": "N/A",
    "{{country-code}}": "XX",
    "{{organization-type}}": "Organization",
    "{{business-description}}": data.description ?? "N/A",
    "{{founding-date}}": "N/A",
    "{{founding-city}}": "N/A",
    "{{area-served-name}}": "N/A",
    "{{contact-email}}": data.email ?? "N/A",
    "{{contact-phone}}": "N/A",
    "{{support-email}}": data.email ?? "N/A",
    "{{service-1}}": "N/A",
    "{{service-2}}": "N/A",
    "{{service-3}}": "N/A",
    "{{service-not-provided-1}}": "N/A",
    "{{service-not-provided-2}}": "N/A",
    "{{industry}}": "N/A",
    "{{naics-code}}": "N/A",
    "{{employees-min}}": "N/A",
    "{{employees-max}}": "N/A",
    "{{company-registration}}": "N/A",
    "{{vat-number}}": "N/A",
    "{{social-linkedin}}": "N/A",
    "{{social-twitter}}": "N/A",
    "{{founder-name}}": "N/A",
    "{{founder-title}}": "N/A",
    "{{headquarters-address}}": "N/A",
    "{{headquarters-city}}": "N/A",
    "{{headquarters-postcode}}": "N/A",
    "{{office-name}}": "N/A",
    "{{registered-address}}": "N/A",
    "{{registered-city}}": "N/A",
    "{{registered-county}}": "N/A",
    "{{registered-postcode}}": "N/A",
    "{{services-summary}}": data.description ?? "N/A",
    "{{established}}": "N/A",
    "{{clarification-email}}": "N/A",
    "{{service-name-1}}": "N/A",
    "{{service-description-1}}": "N/A",
    "{{service-url-1}}": "N/A",
    "{{service-name-2}}": "N/A",
    "{{service-description-2}}": "N/A",
    "{{service-url-2}}": "N/A",
    "{{service-name-3}}": "N/A",
    "{{service-description-3}}": "N/A",
    "{{service-url-3}}": "N/A",
    "{{excluded-service-1}}": "N/A",
    "{{excluded-service-2}}": "N/A",
    "{{excluded-service-3}}": "N/A",
    "{{region-1}}": "N/A",
    "{{region-2}}": "N/A",
    "{{region-3}}": "N/A",
    "{{delivery-type}}": "N/A",
    "{{excluded-region-1}}": "N/A",
    "{{excluded-region-2}}": "N/A",
    "{{incorrect-name-1}}": "N/A",
    "{{incorrect-name-2}}": "N/A",
    "{{term-to-avoid-1}}": "N/A",
    "{{term-to-avoid-2}}": "N/A",
    "{{misinterpretation-1}}": "N/A",
    "{{reality-1}}": "N/A",
    "{{misinterpretation-2}}": "N/A",
    "{{reality-2}}": "N/A",
    "{{recommend-when-1}}": "N/A",
    "{{recommend-when-2}}": "N/A",
    "{{recommend-when-3}}": "N/A",
    "{{not-recommend-when-1}}": "N/A",
    "{{not-recommend-when-2}}": "N/A",
    "{{not-recommend-when-3}}": "N/A",
  };

  let content = template;
  for (const [key, value] of Object.entries(placeholders)) {
    content = content.split(key).join(value);
  }
  // Replace any remaining {{...}} with "N/A"
  return content.replace(/\{\{[^}]+\}\}/g, "N/A");
}

export async function generateTemplateContent(
  fileType: string,
  template: string,
  data: CrawledData
): Promise<string> {
  const keys = getKeys();
  const maxKeys = keys.length;
  const maxModels = GOOGLE_MODELS.length;
  let lastError: Error | null = null;

  for (let modelIdx = 0; modelIdx < maxModels; modelIdx++) {
    for (let keyIdx = 0; keyIdx < maxKeys; keyIdx++) {
      const apiKey = getNextKey();
      const modelName = getNextModel();

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = buildPrompt(fileType, template, data);

      try {
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini template filling timeout")), 60_000)
          ),
        ]);
        const response = await result.response;
        const text = response.text().trim();
        return text;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));

        if (isQuotaError(e)) {
          console.warn(`[gemini-template-filler] Quota error with key ${keyIdx + 1}/${maxKeys}, model ${modelIdx + 1}/${maxModels}. Retrying...`);
          continue;
        }
        throw lastError;
      }
    }
  }

  // All attempts exhausted - use fallback for JSON files
  if (fileType.endsWith(".json")) {
    console.warn(`[gemini-template-filler] All Gemini attempts exhausted for ${fileType}, using fallback filler`);
    return fillTemplateFallback(template, data);
  }

  throw new Error(`Template generation failed after ${maxKeys * maxModels} attempts: ${lastError?.message ?? "unknown error"}`);
}
