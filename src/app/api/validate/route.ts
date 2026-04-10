import { NextRequest, NextResponse } from "next/server";
import { validateLlmsTxt } from "@/lib/validator";
import { parseMarkdown } from "@/lib/markdown-parser";
import { sniffContentType, detectWafResponse } from "@/lib/content-sniffer";
import { mapNetworkError } from "@/lib/network-error-mapper";
import { decodeWithCharset } from "@/lib/charset-decoder";
import type { LinkResult } from "@/lib/types";

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

  let res: Response;
  let content: string;
  let ctHeader: string | null = null;
  try {
    res = await fetchWithTimeout(llmsUrl, FETCH_TIMEOUT_MS);
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
    ctHeader = res.headers.get("content-type");
    const arrayBuffer = await res.arrayBuffer();
    const decodeResult = decodeWithCharset(arrayBuffer, ctHeader);

    if (!decodeResult.success) {
      return notFound(
        decodeResult.message ?? "Unsupported encoding",
        "unsupported_encoding"
      );
    }
    content = decodeResult.text ?? "";
  } catch (e) {
    const { errorCode, displayMessage } = mapNetworkError(e);
    return notFound(displayMessage, errorCode);
  }

  const sample = content.trimStart().substring(0, 2048);
  const sniff = sniffContentType(ctHeader, sample);

  if (!sniff.allowed) {
    return notFound(
      sniff.message ??
        "This URL does not return a valid llms.txt file. The Content-Type or file content was not recognized.",
      "not_llms_txt"
    );
  }

  // WAF / Anti-bot detection: check for HTML structure even when MIME type is text/plain
  const waf = detectWafResponse(content);
  if (waf.blocked) {
    return notFound(waf.message, "not_llms_txt");
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

  return NextResponse.json(validationResult);
}
