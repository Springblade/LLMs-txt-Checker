import { NextRequest, NextResponse } from "next/server";
import { generateLlmsTxt } from "@/lib/generator";
import { validateLlmsTxt } from "@/lib/validator";
import { decodeWithCharset } from "@/lib/charset-decoder";
import { mapNetworkError } from "@/lib/network-error-mapper";
import { sniffContentType, detectWafResponse } from "@/lib/content-sniffer";
import type {
  CheckAndFixResult,
  CheckAndFixError,
  CheckAndFixErrorCode,
} from "@/lib/check-and-fix/types";

const FETCH_TIMEOUT_MS = 10_000;

function buildError(
  code: CheckAndFixErrorCode,
  message: string,
  origin?: string
): NextResponse {
  return NextResponse.json(
    { success: false, errorCode: code, message, origin } satisfies CheckAndFixError,
    { status: 200 }
  );
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function mapStatusToErrorCode(
  status: number,
  _fallback: CheckAndFixErrorCode
): CheckAndFixErrorCode {
  if (status === 401 || status === 403) return "ACCESS_DENIED";
  if (status >= 500) return "SERVER_ERROR";
  return "SITE_UNREACHABLE";
}

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return buildError("INVALID_URL", "Invalid JSON body");
  }

  if (typeof body !== "object" || body === null) {
    return buildError("INVALID_URL", "Body must be an object");
  }

  const raw = (body as Record<string, unknown>).url;
  if (typeof raw !== "string") {
    return buildError("INVALID_URL", "Missing url field");
  }

  const urlInput = raw.trim();
  if (
    !urlInput.startsWith("http://") &&
    !urlInput.startsWith("https://")
  ) {
    return buildError(
      "INVALID_URL",
      "URL must start with http:// or https://"
    );
  }

  let origin: string;
  try {
    const parsed = new URL(urlInput);
    origin = parsed.origin;
  } catch {
    return buildError("INVALID_URL", "Invalid URL");
  }

  const llmsUrl = `${origin}/llms.txt`;

  // STEP 1: Check if llms.txt already exists
  let existingContent: string | null = null;

  try {
    const res = await fetchWithTimeout(llmsUrl, FETCH_TIMEOUT_MS);

    if (res.ok) {
      const ctHeader = res.headers.get("content-type");
      const arrayBuffer = await res.arrayBuffer();
      const decodeResult = decodeWithCharset(arrayBuffer, ctHeader);
      if (!decodeResult.success) {
        return buildError(
          "SITE_UNREACHABLE",
          decodeResult.message ?? "Unsupported encoding",
          origin
        );
      }
      existingContent = decodeResult.text ?? "";
    }

    if (!res.ok && res.status !== 404) {
      return buildError(
        mapStatusToErrorCode(res.status, "SITE_UNREACHABLE"),
        res.status === 401 || res.status === 403
          ? "Access denied — this URL requires authentication"
          : res.status >= 500
            ? "Server error — please try again later"
            : `This website returned an error (HTTP ${res.status})`,
        origin
      );
    }
  } catch (e) {
    const { errorCode, displayMessage } = mapNetworkError(e);
    const codeMap: Record<string, CheckAndFixErrorCode> = {
      timeout: "TIMEOUT",
      connection_error: "SITE_UNREACHABLE",
      dns_error: "SITE_UNREACHABLE",
      ssl_error: "SITE_UNREACHABLE",
    };
    return buildError(
      codeMap[errorCode] ?? "SITE_UNREACHABLE",
      displayMessage,
      origin
    );
  }

  // STEP 2a: File exists → validate only
  if (existingContent !== null) {
    const sniff = sniffContentType(
      null,
      existingContent.trimStart().substring(0, 2048)
    );
    if (!sniff.allowed) {
      return buildError(
        "SITE_UNREACHABLE",
        sniff.message ?? "Not a valid llms.txt file",
        origin
      );
    }

    const waf = detectWafResponse(existingContent);
    if (waf.blocked) {
      return buildError("SITE_UNREACHABLE", waf.message, origin);
    }

    const validation = validateLlmsTxt(existingContent);
    const result: CheckAndFixResult = {
      success: true,
      mode: "validated",
      origin,
      llmsUrl,
      content: existingContent,
      fileName: new URL(llmsUrl).hostname.replace(/^www\./, "") + "-llms.txt",
      validation: {
        passed: validation.errors.length === 0,
        errors: validation.errors,
        warnings: validation.warnings,
      },
      metadata: {},
    };

    return NextResponse.json(result);
  }

  // STEP 2b: File not found → generate + validate
  let pagesFound: number | undefined;
  let pagesCrawled: number | undefined;
  let siteName: string | undefined;
  let generatedAt: string | undefined;
  let content: string;
  let fileName: string;

  try {
    const genResult = await generateLlmsTxt({ url: origin });
    const ok = genResult.success;

    if (!ok) {
      const errorCodeMap: Record<string, CheckAndFixErrorCode> = {
        INVALID_URL: "INVALID_URL",
        FETCH_ERROR: "SITE_UNREACHABLE",
        TIMEOUT: "TIMEOUT",
        RATE_LIMITED: "SITE_UNREACHABLE",
        ALL_FETCH_FAILED: "SITE_UNREACHABLE",
        NO_CONTENT: "GENERATION_FAILED",
        UNKNOWN: "GENERATION_FAILED",
      };
      const err = genResult as { errorCode: string; error: string };
      return buildError(
        errorCodeMap[err.errorCode] ?? "GENERATION_FAILED",
        err.error,
        origin
      );
    }

    content = genResult.content!;
    pagesFound = genResult.pagesFound;
    pagesCrawled = genResult.pagesCrawled;
    siteName = genResult.metadata.siteName;
    generatedAt = genResult.metadata.generatedAt;
    fileName = genResult.fileName ?? "llms.txt";
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return buildError("GENERATION_FAILED", message, origin);
  }

  // STEP 3: Validate generated content
  const validation = validateLlmsTxt(content);
  const result: CheckAndFixResult = {
    success: true,
    mode: "generated_and_validated",
    origin,
    llmsUrl,
    content,
    fileName,
    validation: {
      passed: validation.errors.length === 0,
      errors: validation.errors,
      warnings: validation.warnings,
    },
    metadata: {
      pagesFound,
      pagesCrawled,
      siteName,
      generatedAt,
    },
  };

  return NextResponse.json(result);
}
