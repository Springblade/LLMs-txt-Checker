import { GoogleGenerativeAI, GoogleGenerativeAIError } from "@google/generative-ai";
import type { CrawledPage } from "./types";

const GOOGLE_MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-2.5-pro",
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

export function isQuotaError(e: unknown): boolean {
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

export function buildPrompt(page: CrawledPage): string {
  const categoryLabel = page.category.replace("-", " ");
  return `You are an AI documentation expert. Generate a concise, informative description (max 200 chars) for the following ${categoryLabel} page.

URL: ${page.url}
Title: ${page.title ?? "N/A"}
H1: ${page.h1 ?? "N/A"}
Content preview: ${page.content?.slice(0, 300) ?? "N/A"}

Generate a single-sentence description that:
1. Clearly identifies what this page is about
2. Uses active voice and plain language
3. Is specific enough to be useful for AI agents
4. Max 200 characters

Respond with ONLY the description, no quotes or explanation.`;
}

export async function generateAiDescription(page: CrawledPage): Promise<string> {
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

      const prompt = buildPrompt(page);

      try {
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("AI generation timeout")), 30_000)
          ),
        ]);
        const response = await result.response;
        const text = response.text().trim();
        return text.slice(0, 200);
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));

        if (isQuotaError(e)) {
          console.warn(`[ai-generator] Quota error with key ${keyIdx + 1}/${maxKeys}, model ${modelIdx + 1}/${maxModels}. Retrying...`);
          continue;
        }
      }
    }
  }

  throw new Error(`AI description generation failed after ${maxKeys * maxModels} attempts: ${lastError?.message ?? "unknown error"}`);
}

export async function generateAiDescriptions(
  pages: CrawledPage[],
  onProgress?: (done: number, total: number) => void
): Promise<CrawledPage[]> {
  const needsAi = pages.filter((p) => p.needsAi && p.content);

  for (let i = 0; i < needsAi.length; i++) {
    const page = needsAi[i]!;
    try {
      const description = await generateAiDescription(page);
      page.description = description;
      page.needsAi = false;
    } catch (e) {
      console.warn(`[ai-generator] Failed to generate description for ${page.url}:`, e instanceof Error ? e.message : String(e));
    }
    onProgress?.(i + 1, needsAi.length);
  }

  return pages;
}
