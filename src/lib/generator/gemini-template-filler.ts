import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CrawledData } from "@/lib/discovery/types";

// 4 models synced with ai-generator.ts
const GOOGLE_MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-2.5-pro",
] as const;

export type GeminiErrorType = "quota" | "auth" | "timeout" | "rate_limit" | "unknown";

export interface GeminiErrorDetails {
  type: GeminiErrorType;
  errorCode: "QUOTA_EXHAUSTED" | "AUTH_FAILED" | "TIMEOUT" | "RATE_LIMITED" | "UNKNOWN";
  message: string;
  suggestions: string[];
  keysAttempted: number;
  modelsAttempted: number;
}

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

function categorizeError(e: unknown): { type: GeminiErrorType; message: string } {
  const msg = e instanceof Error ? e.message.toLowerCase() : String(e).toLowerCase();

  if (msg.includes("429") || msg.includes("quota") || msg.includes("resource has been exhausted")) {
    return { type: "quota", message: "API quota exhausted for all available keys and models" };
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return { type: "rate_limit", message: "Rate limit exceeded - too many requests in short period" };
  }
  if (msg.includes("401") || msg.includes("403") || msg.includes("invalid") || msg.includes("api key")) {
    return { type: "auth", message: "Invalid or unauthorized API key" };
  }
  if (msg.includes("timeout") || msg.includes("deadline")) {
    return { type: "timeout", message: "Request timed out - model took too long to respond" };
  }
  return { type: "unknown", message: e instanceof Error ? e.message : "Unknown error occurred" };
}

function getQuotaSuggestions(keysCount: number): string[] {
  const suggestions: string[] = [
    "Wait a few minutes and try again",
    "Reduce the number of pages to crawl (lower maxUrls)",
  ];
  if (keysCount < 2) {
    suggestions.push("Add more API keys in .env.local (comma-separated)");
  }
  if (keysCount < 4) {
    suggestions.push("Consider adding 2-4 API keys for better quota distribution");
  }
  suggestions.push("Consider upgrading to a paid Gemini plan for higher quotas");
  return suggestions;
}

function buildGeminiError(
  type: GeminiErrorType,
  message: string,
  keysAttempted: number,
  modelsAttempted: number
): GeminiErrorDetails {
  const errorCodeMap: Record<GeminiErrorType, GeminiErrorDetails["errorCode"]> = {
    quota: "QUOTA_EXHAUSTED",
    auth: "AUTH_FAILED",
    timeout: "TIMEOUT",
    rate_limit: "RATE_LIMITED",
    unknown: "UNKNOWN",
  };

  return {
    type,
    errorCode: errorCodeMap[type],
    message,
    suggestions: type === "quota" || type === "rate_limit" ? getQuotaSuggestions(keysAttempted) : [],
    keysAttempted,
    modelsAttempted,
  };
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

  const llmsSection = data.llmsTxtContent
    ? `

================================================================================
IMPORTANT: This is how the business describes itself in their official llms.txt.
Use this as the PRIMARY source for business identity and services.
DO NOT infer or guess from domain names.
================================================================================
${data.llmsTxtContent}
================================================================================

`
    : "";

  const faqsContext = data.faqs && data.faqs.length > 0
    ? `

Crawled FAQs:
${data.faqs.map((f, i) => `Q${i + 1}: ${f.q}\nA${i + 1}: ${f.a}`).join("\n")}
`
    : "";

  return `Website: ${data.origin}
Site Name: ${data.siteName}
Brand Name: ${data.brandName ?? data.siteName}
Description: ${data.description ?? "N/A"}
Today's Date: ${today}${llmsSection}${faqsContext}
Crawled Pages (${data.pages.length} pages):
${pagesContext}

Additional Info:
${data.email ? `Contact Email: ${data.email}` : ""}
${data.techStack?.length ? `Tech Stack: ${data.techStack.join(", ")}` : ""}
`.trim();
}

function buildPrompt(fileType: string, template: string, data: CrawledData): string {
  const context = buildCrawlContext(data);

  const instructions: Record<string, string> = {
    "faq-ai.txt": `This FAQ template requires:
- Generate 5 common customer questions based on crawled content
- Cover: what they do, services offered, contact info, pricing, and key differentiators
- Answers must be based ONLY on information from the crawled data
- Use professional, factual language
- If crawled data contains FAQs, use those as primary source
- Return ONLY the filled template, no explanation`,

    "brand.txt": `This brand guidelines template requires:
- Identify correct legal name, trading name, and brand name from crawled data
- Generate brand voice descriptions based on website tone and content
- Generate incorrect name variations (common misspellings to avoid)
- Generate misinterpretations (what people often get wrong about the brand)
- Generate terms to avoid
- Return ONLY the filled template, no explanation`,

    "llms.txt": `This business overview template requires:
- FIRST: Add a blockquote (>) line immediately after H1 with 1-3 sentence business summary describing who the business is and what it does. The blockquote MUST have a space after the > character: "> Your summary here"
- Extract business name, description, and services from crawled data
- Generate About section (2-3 paragraphs) based on crawled content
- List services with descriptions
- Generate key reference pages from crawled URLs
- Include geographic availability if inferable from content
- Return ONLY the filled template, no explanation`,

    "ai.txt": `This AI usage guidance template requires:
- Extract canonical identity info (legal name, brand, services, country)
- Generate "when to recommend" criteria based on business type and services
- Generate "when not to recommend" criteria based on exclusions or limitations
- Generate service scope clarifications
- Generate appropriate use cases
- Return ONLY the filled template, no explanation`,

    "developer-ai.txt": `This technical documentation template requires:
- Extract technical information from crawled data
- Use crawled page info to infer platform/API details
- Generate public pages reference list
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

  // Extract public paths from crawled pages for robots-ai.txt
  const publicPaths = data.pages
    .map((p) => {
      try {
        const u = new URL(p.url);
        return u.pathname;
      } catch {
        return p.url;
      }
    })
    .filter((p) => p !== "/")
    .filter((v, i, a) => a.indexOf(v) === i) // unique
    .slice(0, 10);

  const robotsDirectives = publicPaths.length > 0
    ? `User-agent: *\nAllow: /${publicPaths.join("\nAllow: /")}\nDisallow: /admin/\nDisallow: /api/\nDisallow: /*.json$\nDisallow: /*.xml$\nDisallow: /private/\n\nUser-agent: GPTBot\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nUser-agent: Claude-Web\nAllow: /\nDisallow: /admin/\nDisallow: /api/`
    : "User-agent: *\nAllow: /";

  const publicPagesList = data.pages
    .slice(0, 5)
    .map((p) => {
      const path = (() => {
        try {
          return new URL(p.url).pathname;
        } catch {
          return p.url;
        }
      })();
      const title = p.title || "Untitled";
      return `- [${title}](${data.origin}${path})`;
    })
    .join("\n");

  const platformInfo = data.techStack && data.techStack.length > 0
    ? `This website uses: ${data.techStack.join(", ")}.`
    : "Information about the technical platform is not publicly available.";

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

    // faq-ai.txt placeholders
    "{{faq-q-1}}": "N/A",
    "{{faq-q-2}}": "N/A",
    "{{faq-q-3}}": "N/A",
    "{{faq-q-4}}": "N/A",
    "{{faq-q-5}}": "N/A",
    "{{faq-a-1}}": "N/A",
    "{{faq-a-2}}": "N/A",
    "{{faq-a-3}}": "N/A",
    "{{faq-a-4}}": "N/A",
    "{{faq-a-5}}": "N/A",

    // brand.txt placeholders
    "{{incorrect-names-list}}": "N/A",
    "{{brand-voice-positive}}": "N/A",
    "{{brand-voice-negative}}": "N/A",

    // developer-ai.txt placeholders
    "{{technical-overview}}": data.description ?? `${data.siteName} is a web-based service.`,
    "{{platform-info}}": platformInfo,
    "{{public-pages-list}}": publicPagesList || "Public pages information not available.",
    "{{portal-info}}": "No client portal detected.",
    "{{api-info}}": "API documentation not publicly available.",
    "{{rate-limiting-info}}": "Rate limiting policies not specified.",
    "{{authentication-info}}": "Authentication details not publicly documented.",
    "{{cdn-info}}": "CDN information not available.",
    "{{structured-data-info}}": data.pages.some((p) => p.description) ? "Schema.org structured data may be present on some pages." : "Structured data presence unknown.",
    "{{ai-discovery-files-list}}": `${data.origin}/llms.txt\n${data.origin}/ai.txt\n${data.origin}/faq-ai.txt\n${data.origin}/brand.txt`,
    "{{technical-contact-email}}": data.email ?? "N/A",
    "{{security-email}}": data.email ?? "N/A",
    "{{change-notifications-info}}": "No change notification system detected.",

    // llms.txt placeholders
    "{{tagline}}": data.description
      ? " " + data.description.split(".")[0] + "."
      : " N/A",
    "{{services-list}}": data.description ? `- ${data.description}` : "Services information not available.",
    "{{excluded-services-list}}": "N/A",
    "{{contact-info}}": data.email ? `Email: ${data.email}` : "Contact information not available.",
    "{{key-pages-list}}": publicPagesList || "Key pages information not available.",
    "{{optional-links-list}}": "N/A",

    // ai.txt placeholders
    "{{recommend-when-list}}": "N/A",
    "{{not-recommend-when-list}}": "N/A",
    "{{services-offered-list}}": data.description ?? "N/A",
    "{{services-not-offered-list}}": "N/A",
    "{{regions-served}}": "N/A",
    "{{delivery-method}}": "N/A",
    "{{excluded-regions}}": "N/A",
    "{{appropriate-use-cases-list}}": "N/A",
    "{{not-appropriate-use-cases-list}}": "N/A",
    "{{terms-to-avoid-list}}": "N/A",

    // llms.html placeholders
    "{{what-we-do}}": data.description ?? "N/A",
    "{{what-we-dont-do}}": "Specific exclusions not documented.",

    // robots-ai.txt placeholders
    "{{crawler-directives}}": robotsDirectives,

    // brand.txt placeholders
    "{{logo-url}}": "N/A",
    "{{reason-1}}": "N/A",
    "{{reason-2}}": "N/A",
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
  let lastErrorType: ReturnType<typeof categorizeError> | null = null;

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
        lastErrorType = categorizeError(e);

        if (lastErrorType.type === "quota" || lastErrorType.type === "rate_limit") {
          console.warn(`[gemini-template-filler] ${lastErrorType.type} error with key ${keyIdx + 1}/${maxKeys}, model ${modelIdx + 1}/${maxModels}. Retrying...`);
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

  // Throw structured error with suggestions
  const errorType = lastErrorType?.type ?? "unknown";
  const errorMsg = lastErrorType?.message ?? lastError?.message ?? "unknown error";
  const structuredError = buildGeminiError(errorType, errorMsg, maxKeys, maxModels);
  
  const error = new Error(structuredError.message) as Error & { geminiError?: GeminiErrorDetails };
  error.geminiError = structuredError;
  throw error;
}
