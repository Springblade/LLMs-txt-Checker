/**
 * AI Discovery File Analyzer.
 *
 * Analyzes a website for AI agent discoverability:
 * 1. Detects which AI discovery files exist at the root URL
 * 2. Scores content quality from an AI-reader's perspective
 * 3. Generates actionable recommendations for improvement
 *
 * This is the core of the "Analyzer > Generator" research priority.
 */

import { detectWafResponse } from "@/lib/content-sniffer";
import { decodeWithCharset } from "@/lib/charset-decoder";
import { assertUrlSafe } from "@/lib/generator/security";

const FETCH_TIMEOUT_MS = 10_000;

const AI_DISCOVERY_FILE_TYPES = [
  "llms.txt",
  "llm.txt",
  "ai.txt",
  "faq-ai.txt",
  "brand.txt",
  "developer-ai.txt",
  "llms.html",
  "robots-ai.txt",
  "identity.json",
  "ai.json",
] as const;

type FileType = typeof AI_DISCOVERY_FILE_TYPES[number];

export interface DiscoveredFile {
  type: FileType;
  url: string;
  status: "found" | "missing";
  content?: string;
  fetchError?: string;
}

export interface ContentQualitySignal {
  type: "positive" | "negative" | "neutral";
  label: string;
  detail: string;
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  action: string;
  reason: string;
  fileType?: FileType;
}

export interface AnalyzerResult {
  url: string;
  discoveredFiles: DiscoveredFile[];
  qualitySignals: ContentQualitySignal[];
  recommendations: Recommendation[];
  qualityScore: number; // 0-100
  summary: {
    filesFound: number;
    filesTotal: number;
    criticalIssues: number;
    warnings: number;
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function analyzeUrl(targetUrl: string): Promise<AnalyzerResult> {
  assertUrlSafe(targetUrl);

  const origin = stripPath(targetUrl);

  // Step 1: Detect which files exist
  const discoveredFiles = await detectDiscoveryFiles(origin);

  // Step 2: Extract quality signals
  const qualitySignals = extractQualitySignals(discoveredFiles);

  // Step 3: Generate recommendations
  const recommendations = generateRecommendations(discoveredFiles, qualitySignals);

  // Step 4: Compute score
  const qualityScore = computeQualityScore(discoveredFiles, qualitySignals, recommendations);

  const found = discoveredFiles.filter((f) => f.status === "found").length;

  return {
    url: targetUrl,
    discoveredFiles,
    qualitySignals,
    recommendations,
    qualityScore,
    summary: {
      filesFound: found,
      filesTotal: discoveredFiles.length,
      criticalIssues: recommendations.filter((r) => r.priority === "high").length,
      warnings: recommendations.filter((r) => r.priority === "medium").length,
    },
  };
}

// ─── File Detection ───────────────────────────────────────────────────────────

async function detectDiscoveryFiles(origin: string): Promise<DiscoveredFile[]> {
  const results = await Promise.allSettled(
    AI_DISCOVERY_FILE_TYPES.map((type) => fetchDiscoveryFile(origin, type))
  );

  return AI_DISCOVERY_FILE_TYPES.map((type, i) => {
    const result = results[i]!;
    if (result.status === "fulfilled") return result.value;
    return { type, url: `${origin}/${type}`, status: "missing" as const };
  });
}

async function fetchDiscoveryFile(origin: string, type: FileType): Promise<DiscoveredFile> {
  const url = `${origin}/${type}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/plain, text/markdown, application/json, text/html, */*" },
    });
    clearTimeout(timer);

    if (!res.ok) {
      if (res.status === 404) return { type, url, status: "missing" };
      return { type, url, status: "missing", fetchError: `HTTP ${res.status}` };
    }

    const contentType = res.headers.get("Content-Type") ?? "";
    const bodyText = await res.text();
    const bodyBytes = new TextEncoder().encode(bodyText);

    // Detect WAF blocks — detectWafResponse expects a string
    if (detectWafResponse(bodyText).blocked) {
      return { type, url, status: "found", content: "[WAF_BLOCKED]", fetchError: "Site returned WAF challenge page" };
    }

    // Decode content — use the bytes for charset decoding
    const decoded = decodeWithCharset(bodyBytes.buffer, contentType);
    const text = decoded.success ? decoded.text : "[DECODE_ERROR]";

    return { type, url, status: "found", content: text };
  } catch (e) {
    clearTimeout(timer);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("abort")) {
      return { type, url, status: "missing", fetchError: "Fetch timeout" };
    }
    return { type, url, status: "missing", fetchError: msg };
  }
}

// ─── Quality Signals ───────────────────────────────────────────────────────────

export function extractQualitySignals(files: DiscoveredFile[]): ContentQualitySignal[] {
  const signals: ContentQualitySignal[] = [];
  const found = files.filter((f) => f.status === "found");

  if (found.some((f) => f.type === "llms.txt")) {
    const llms = found.find((f) => f.type === "llms.txt")!;
    const content = llms.content ?? "";

    // Positive signals
    if (content.includes("#")) {
      signals.push({ type: "positive", label: "Has H1 title", detail: "llms.txt has a proper heading structure" });
    }
    if (/\[.+\]\(https?:\/\/.+\)/.test(content)) {
      signals.push({ type: "positive", label: "Has links", detail: "llms.txt contains Markdown links to key pages" });
    }
    if (/> .+/.test(content)) {
      signals.push({ type: "positive", label: "Has description", detail: "llms.txt includes a project description blockquote" });
    }

    // Negative signals
    if (content.length > 50_000) {
      signals.push({ type: "negative", label: "File too large", detail: `llms.txt is ${(content.length / 1024).toFixed(0)}KB — over the recommended 10KB limit` });
    }
    if (/^\[.+\]\(https?:\/\/[^)]+\):\s*$/m.test(content) || /^-\s+\[.+\]\(https?:\/\/[^)]+\):\s*$/m.test(content)) {
      signals.push({ type: "negative", label: "Empty link descriptions", detail: "Some links lack descriptions — AI agents benefit from context" });
    }
  }

  if (found.some((f) => f.type === "llm.txt")) {
    signals.push({ type: "positive", label: "Has llm.txt redirect", detail: "Site provides a redirect target for LLM-based tools" });
  }

  if (found.some((f) => f.type === "ai.txt")) {
    signals.push({ type: "positive", label: "Has ai.txt identity", detail: "Site defines AI agent permissions and identity" });
  }

  if (found.some((f) => f.type === "brand.txt")) {
    signals.push({ type: "positive", label: "Has brand.txt", detail: "Site provides brand guidelines for AI agents" });
  }

  if (found.some((f) => f.type === "faq-ai.txt")) {
    signals.push({ type: "positive", label: "Has FAQ for AI", detail: "Site provides structured Q&A for AI agents" });
  }

  // Negative: found files with errors
  for (const f of found) {
    if (f.fetchError) {
      signals.push({ type: "negative", label: `${f.type} fetch error`, detail: f.fetchError });
    }
    if (f.content === "[WAF_BLOCKED]") {
      signals.push({ type: "negative", label: `${f.type} blocked by WAF`, detail: "WAF challenge page returned — AI tools may be misidentified as bots" });
    }
  }

  // Negative: missing critical files
  if (!found.some((f) => f.type === "llms.txt")) {
    signals.push({ type: "negative", label: "Missing llms.txt", detail: "No llms.txt found — AI agents will have no auto-discovery file" });
  }

  return signals;
}

// ─── Recommendations ───────────────────────────────────────────────────────────

export function generateRecommendations(files: DiscoveredFile[], _signals: ContentQualitySignal[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const found = files.filter((f) => f.status === "found");

  // High priority: missing llms.txt
  if (!found.some((f) => f.type === "llms.txt")) {
    recs.push({
      priority: "high",
      action: "Create /llms.txt at the site root",
      reason: "llms.txt is the most widely adopted AI discovery format. Without it, AI agents must scrape your entire site to understand its structure.",
      fileType: "llms.txt",
    });
  }

  // High priority: llms.txt too large
  const llms = found.find((f) => f.type === "llms.txt");
  if (llms?.content && llms.content.length > 50_000) {
    recs.push({
      priority: "high",
      action: "Reduce /llms.txt to under 10KB",
      reason: `Current size: ${(llms.content.length / 1024).toFixed(0)}KB. Large files increase token costs and slow AI processing. Prioritize the most important pages.`,
      fileType: "llms.txt",
    });
  }

  // High priority: WAF blocking
  if (found.some((f) => f.content === "[WAF_BLOCKED]")) {
    recs.push({
      priority: "high",
      action: "Allow AI agents through WAF",
      reason: "Your WAF is blocking AI discovery tools. Add an exception for Jina AI Reader (r.jina.ai) and similar crawlers.",
    });
  }

  // Medium priority: missing llm.txt
  if (!found.some((f) => f.type === "llm.txt")) {
    recs.push({
      priority: "medium",
      action: "Consider creating /llm.txt",
      reason: "llm.txt provides a redirect target for LLM-based tools. Simple to set up — one line with your main content URL.",
      fileType: "llm.txt",
    });
  }

  // Medium priority: missing ai.txt
  if (!found.some((f) => f.type === "ai.txt")) {
    recs.push({
      priority: "medium",
      action: "Consider creating /ai.txt",
      reason: "ai.txt defines what AI agents can and cannot do with your content. Important if you have usage policies or specific permissions.",
      fileType: "ai.txt",
    });
  }

  // Medium priority: empty link descriptions
  if (llms?.content && (/^\[.+\]\(https?:\/\/[^)]+\):\s*$/m.test(llms.content) || /^-\s+\[.+\]\(https?:\/\/[^)]+\):\s*$/m.test(llms.content))) {
    recs.push({
      priority: "medium",
      action: "Add descriptions to all links in llms.txt",
      reason: "Link descriptions help AI agents understand what each page contains. Format: '- [Title](url): description'",
      fileType: "llms.txt",
    });
  }

  // Low priority: additional discovery files
  const hasFaq = found.some((f) => f.type === "faq-ai.txt");
  const hasBrand = found.some((f) => f.type === "brand.txt");
  if (!hasFaq) {
    recs.push({
      priority: "low",
      action: "Consider faq-ai.txt for common questions",
      reason: "faq-ai.txt lets AI agents answer common user questions without crawling full pages.",
      fileType: "faq-ai.txt",
    });
  }
  if (!hasBrand) {
    recs.push({
      priority: "low",
      action: "Consider brand.txt for brand voice guidelines",
      reason: "brand.txt helps AI agents maintain consistent brand voice and avoid inappropriate content.",
      fileType: "brand.txt",
    });
  }

  return recs;
}

// ─── Score Calculation ─────────────────────────────────────────────────────────

export function computeQualityScore(
  files: DiscoveredFile[],
  signals: ContentQualitySignal[],
  recommendations: Recommendation[]
): number {
  let score = 50; // baseline

  const found = files.filter((f) => f.status === "found");
  const foundCount = found.length;

  // +5 per found file (max +50 for all 10)
  score += Math.min(foundCount * 5, 50);

  // +5 for llms.txt specifically (most important)
  if (found.some((f) => f.type === "llms.txt")) score += 5;

  // -10 for WAF blocks
  if (found.some((f) => f.content === "[WAF_BLOCKED]")) score -= 10;

  // -5 per critical recommendation
  const criticalCount = recommendations.filter((r) => r.priority === "high").length;
  score -= criticalCount * 5;

  // -2 per negative signal
  const negCount = signals.filter((s) => s.type === "negative").length;
  score -= negCount * 2;

  // +2 per positive signal
  const posCount = signals.filter((s) => s.type === "positive").length;
  score += posCount * 2;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function stripPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url;
  }
}
