import { NextRequest, NextResponse } from "next/server";
import { validateLlmsTxt, calculateHealthScore } from "@/lib/validator";
import { parseMarkdown } from "@/lib/markdown-parser";
import type { LinkResult, Suggestion } from "@/lib/types";

const FETCH_TIMEOUT_MS = 10_000;
const LINK_TIMEOUT_MS = 5_000;
const MAX_LINKS = 20;

function notFound(message: string, errorCode: string = "not_found", status = 200) {
  return NextResponse.json(
    { found: false, message, errorCode, errors: [], warnings: [] },
    { status }
  );
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function checkLink(url: string): Promise<LinkResult> {
  try {
    const res = await fetchWithTimeout(url, LINK_TIMEOUT_MS);
    return { url, status: res.status, ok: res.ok };
  } catch {
    return { url, status: 0, ok: false };
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return notFound("Invalid JSON body", "invalid_response");
  }

  if (typeof body !== "object" || body === null) {
    return notFound("Body must be an object", "invalid_response");
  }

  const raw = (body as Record<string, unknown>).url;
  if (typeof raw !== "string") {
    return notFound("Missing url field", "invalid_response");
  }

  const urlInput = raw.trim();
  if (!urlInput.startsWith("http://") && !urlInput.startsWith("https://")) {
    return notFound("URL must start with http:// or https://", "invalid_response", 400);
  }

  let origin: string;
  try {
    const parsed = new URL(urlInput);
    origin = parsed.origin;
  } catch {
    return notFound("Invalid URL", "invalid_response");
  }

  const llmsUrl = `${origin}/llms.txt`;

  let content: string;
  try {
    const res = await fetchWithTimeout(llmsUrl, FETCH_TIMEOUT_MS);
    if (res.status === 404) {
      return notFound("File not found", "not_found");
    }
    if (res.status === 401 || res.status === 403) {
      return notFound("Access denied — this URL requires authentication", "access_denied", 200);
    }
    if (res.status >= 500) {
      return notFound("Server error — please try again later", "server_error", 200);
    }
    if (!res.ok) {
      return notFound(`This website returned an error (HTTP ${res.status})`, "http_error", 200);
    }
    content = await res.text();
  } catch (e) {
    const errorCode = e instanceof Error && e.name === "AbortError" ? "timeout" : "connection_error";
    const msg = e instanceof Error && e.name === "AbortError" ? "Request timeout" : "Cannot access website";
    return notFound(msg, errorCode);
  }

  let parsedData;
  try {
    parsedData = parseMarkdown(content);
  } catch {
    return NextResponse.json({
      found: true,
      errors: [{ rule: "markdown_format", message: "Unable to parse file content" }],
      warnings: [],
      content,
    });
  }
  const linkResults: LinkResult[] = [];

  if (parsedData.links.length > 0) {
    const linksToCheck = parsedData.links.slice(0, MAX_LINKS).map((l) => l.url);
    const settled = await Promise.allSettled(linksToCheck.map((u) => checkLink(u)));
    for (const result of settled) {
      if (result.status === "fulfilled") {
        linkResults.push(result.value);
      } else {
        console.warn("[LinkCheck] Failed:", result.reason);
      }
    }
  }

  const validationResult = validateLlmsTxt(content, linkResults);

  const healthScore = calculateHealthScore(validationResult);

  const suggestions: Suggestion[] = [];
  for (const error of validationResult.errors) {
    suggestions.push({
      id: `suggestion-${suggestions.length + 1}`,
      title: `Fix error: ${error.rule}`,
      description: error.message,
      priority: "high",
    });
  }
  for (const warning of validationResult.warnings) {
    if (warning.rule === "link_validation" && warning.message.includes("HTTP ")) {
      suggestions.push({
        id: `suggestion-${suggestions.length + 1}`,
        title: `Fix link: ${warning.rule}`,
        description: warning.message,
        priority: "medium",
      });
    } else {
      suggestions.push({
        id: `suggestion-${suggestions.length + 1}`,
        title: `Improve: ${warning.rule}`,
        description: warning.message,
        priority: "low",
      });
    }
  }

  const finalResult = {
    ...validationResult,
    healthScore,
    suggestions,
  };

  return NextResponse.json(finalResult);
}
