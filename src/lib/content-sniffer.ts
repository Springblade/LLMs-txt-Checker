const ALLOWED_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/octet-stream", // fallback for servers that don't declare MIME
]);

const BLOCKED_MIME_MESSAGES: Record<string, string> = {
  "text/html": "Site returned an HTML webpage instead of an llms.txt file",
  "application/pdf":
    "Site returned a PDF document instead of an llms.txt file",
  "application/json":
    "Site returned a JSON response instead of an llms.txt file",
  "image/": "Site returned an image instead of an llms.txt file",
  "video/": "Site returned a video instead of an llms.txt file",
  "audio/": "Site returned an audio file instead of an llms.txt file",
};

export interface ContentSniffResult {
  allowed: boolean;
  mimeType: string | null;
  message?: string;
}

export function sniffContentType(
  contentType: string | null,
  rawSample: string
): ContentSniffResult {
  // Step 1: Check MIME whitelist
  if (contentType) {
    const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
    if (ALLOWED_MIME_TYPES.has(normalized)) {
      return { allowed: true, mimeType: normalized };
    }
    // Step 2: Match blocked MIME -> specific message
    for (const [prefix, msg] of Object.entries(BLOCKED_MIME_MESSAGES)) {
      if (prefix.endsWith("/")) {
        if (normalized.startsWith(prefix)) {
          return { allowed: false, mimeType: normalized, message: msg };
        }
      } else if (normalized === prefix) {
        return { allowed: false, mimeType: normalized, message: msg };
      }
    }
    // Unknown MIME — block with generic message
    return {
      allowed: false,
      mimeType: normalized,
      message: `Site returned an unsupported content type (${normalized})`,
    };
  }
  // No Content-Type header — check raw content
  const sample = rawSample.trimStart().substring(0, 2048);
  if (/<!doctype\s+html/i.test(sample) || /<html[\s>]/.test(sample)) {
    return {
      allowed: false,
      mimeType: null,
      message: "Site returned an HTML webpage instead of an llms.txt file",
    };
  }
  return { allowed: true, mimeType: null };
}

const WAF_SIGNATURES = [
  /<!doctype\s+html/i,
  /<html[\s>]/i,
  /<script[^>]*>/i,
  /<head[^>]*>/i,
  /<meta[^>]*name=["']robots["'][^>]*content=["']noindex/i,
  /cloudflare|challenges\.cloudflare\.com/i,
  /incapsula|imp\.acquia/i,
  /datadome|perimeterx/i,
];

export interface WafDetectionResult {
  blocked: boolean;
  matchedSignatures: string[];
  message: string;
}

export function detectWafResponse(rawBody: string): WafDetectionResult {
  if (!rawBody || rawBody.length === 0) {
    return { blocked: false, matchedSignatures: [], message: "" };
  }
  const sample = rawBody.substring(0, 1000);
  const matched: string[] = [];
  for (const sig of WAF_SIGNATURES) {
    if (sig.test(sample)) {
      matched.push(sig.source);
    }
  }
  if (matched.length > 0) {
    return {
      blocked: true,
      matchedSignatures: matched,
      message:
        "Request intercepted by website firewall or anti-bot system (e.g. Cloudflare, Incapsula). " +
        "The server returned a challenge page instead of the llms.txt file.",
    };
  }
  return { blocked: false, matchedSignatures: [], message: "" };
}
