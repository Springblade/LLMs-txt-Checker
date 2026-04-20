const ALLOWED_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/octet-stream", // fallback for servers that don't declare MIME
]);

const BLOCKED_MIME_MESSAGES: Record<string, string> = {
  "text/html": "Site returned an HTML webpage instead of a file",
  "application/pdf":
    "Site returned a PDF document instead of a file",
  "application/json":
    "Site returned a JSON response instead of a file",
  "image/": "Site returned an image instead of a file",
  "video/": "Site returned a video instead of a file",
  "audio/": "Site returned an audio file instead of a file",
};

export interface ContentSniffResult {
  allowed: boolean;
  mimeType: string | null;
  message?: string;
}

export function sniffContentType(
  contentType: string | null,
  rawSample: string,
  fileName = "file"
): ContentSniffResult {
  // Strip markdown code blocks to avoid false positives from HTML examples in docs
  const sample = rawSample
    .trimStart()
    .substring(0, 2048)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]+`/g, "");

  // Step 1: Check MIME whitelist
  if (contentType) {
    const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
    if (ALLOWED_MIME_TYPES.has(normalized)) {
      // Step 1b: Verify raw content is not HTML (server may misreport MIME type)
      if (/<(doctype|html|head|body|div|p|span|script|style)[\s>]/i.test(sample)) {
        console.debug(`[sniffContentType] ${fileName}: MIME=${normalized} but content looks like HTML`);
        return {
          allowed: false,
          mimeType: "text/html",
          message: `Site returned HTML content instead of a ${fileName} file`,
        };
      }
      return { allowed: true, mimeType: normalized };
    }
    // Step 2: Match blocked MIME -> specific message
    for (const [prefix, msg] of Object.entries(BLOCKED_MIME_MESSAGES)) {
      if (prefix.endsWith("/")) {
        if (normalized.startsWith(prefix)) {
          console.debug(`[sniffContentType] ${fileName}: blocked MIME prefix "${prefix}" matched ${normalized}`);
          return { allowed: false, mimeType: normalized, message: msg.replace(" a file", ` a ${fileName} file`) };
        }
      } else if (normalized === prefix) {
        console.debug(`[sniffContentType] ${fileName}: blocked MIME exact "${prefix}" matched`);
        return { allowed: false, mimeType: normalized, message: msg.replace(" a file", ` a ${fileName} file`) };
      }
    }
    // Unknown MIME — block with generic message
    console.debug(`[sniffContentType] ${fileName}: unknown MIME "${normalized}"`);
    return {
      allowed: false,
      mimeType: normalized,
      message: `Site returned an unsupported content type (${normalized})`,
    };
  }
  // No Content-Type header — check raw content (already stripped of code blocks)
  if (/<(doctype|html|head|body|div|p|script)[\s>]/i.test(sample)) {
    console.debug(`[sniffContentType] ${fileName}: no MIME header but content looks like HTML`);
    return {
      allowed: false,
      mimeType: null,
      message: `Site returned an HTML webpage instead of a ${fileName} file`,
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

const NOT_FOUND_PATTERNS = [
  /404[\s-]*(not\s+found|page|file)/i,
  /page\s+not\s+found/i,
  /file\s+not\s+found/i,
  /this\s+page\s+(does\s+)?(couldn'?t|doesn'?t)\s+(exist|find)/i,
  /the\s+page\s+you\s+(were\s+)?looking\s+for/i,
  /sorry,?\s+we\s+couldn'?t\s+(find|locate)/i,
  /resource\s+not\s+found/i,
  /oops[\s-]*(page\s+)?not\s+found/i,
  /error[\s]?404/i,
];

export interface NotFoundDetectionResult {
  is404Page: boolean;
  matchedPatterns: string[];
  message: string;
}

export function detectNotFoundPage(rawBody: string, fileName = "file"): NotFoundDetectionResult {
  if (!rawBody || rawBody.length === 0) {
    return { is404Page: false, matchedPatterns: [], message: "" };
  }
  const stripped = rawBody
    .substring(0, 3000)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]+`/g, "");
  const sample = stripped.substring(0, 1500);
  const matched: string[] = [];
  for (const pattern of NOT_FOUND_PATTERNS) {
    if (pattern.test(sample)) {
      matched.push(pattern.source);
    }
  }
  if (matched.length > 0) {
    console.debug(`[detectNotFoundPage] ${fileName}: 404 patterns matched: ${matched.join(", ")}`);
    return {
      is404Page: true,
      matchedPatterns: matched,
      message: `Server returned a 404 page instead of ${fileName} (file does not exist)`,
    };
  }
  return { is404Page: false, matchedPatterns: [], message: "" };
}

export interface WafDetectionResult {
  blocked: boolean;
  matchedSignatures: string[];
  message: string;
}

export function detectWafResponse(rawBody: string, fileName = "file"): WafDetectionResult {
  if (!rawBody || rawBody.length === 0) {
    return { blocked: false, matchedSignatures: [], message: "" };
  }
  // Strip markdown code blocks to avoid false positives from HTML examples in docs
  const stripped = rawBody
    .substring(0, 2000)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]+`/g, "");
  const sample = stripped.substring(0, 1000);
  const matched: string[] = [];
  for (const sig of WAF_SIGNATURES) {
    if (sig.test(sample)) {
      matched.push(sig.source);
    }
  }
  if (matched.length > 0) {
    console.debug(`[detectWafResponse] ${fileName}: WAF signatures matched: ${matched.join(", ")}`);
    return {
      blocked: true,
      matchedSignatures: matched,
      message:
        "Request intercepted by website firewall or anti-bot system (e.g. Cloudflare, Incapsula). " +
        `The server returned a challenge page instead of the ${fileName} file.`,
    };
  }
  return { blocked: false, matchedSignatures: [], message: "" };
}
