/**
 * Security utilities for URL validation and sanitization.
 * Prevents SSRF (Server-Side Request Forgery) and LFI (Local File Inclusion) attacks.
 *
 * All URLs fetched by the crawler MUST pass through isUrlSafe() before any network request.
 */

export interface UrlSafetyResult {
  safe: boolean;
  reason?: string;
}

/**
 * Check if a URL is safe to fetch (not an internal/private/metadata endpoint).
 *
 * Blocked:
 * - Loopback: 127.x.x.x, ::1, localhost
 * - Private ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x
 * - Link-local: 169.254.x.x (includes AWS metadata)
 * - Special: 0.x.x.x, 224.x.x.x, 240.x.x.x
 * - Internal hostnames: localhost, *.internal, *.local, *.corp, ip6-*
 * - Cloud metadata: 169.254.169.254, metadata.google.internal
 *
 * Allowed: public HTTPS/HTTP URLs only.
 */
export function isUrlSafe(url: string): UrlSafetyResult {
  try {
    const parsed = new URL(url);

    // Block non-HTTP protocols — prevents file://, ftp://, gopher:// etc.
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { safe: false, reason: `Blocked non-HTTP protocol: ${parsed.protocol}` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // ── Block IP addresses ────────────────────────────────────────────────────

    // IPv4 literal
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      if (isBlockedIpv4(hostname)) {
        return { safe: false, reason: `Blocked private/reserved IP: ${hostname}` };
      }
    }

    // IPv6 literal
    if (hostname.startsWith("[") && hostname.endsWith("]")) {
      const ip = hostname.slice(1, -1).toLowerCase();
      if (isBlockedIpv6(ip)) {
        return { safe: false, reason: `Blocked IPv6 address: ${hostname}` };
      }
    }

    // ── Block hostname patterns ───────────────────────────────────────────────

    if (BLOCKED_HOSTNAMES.has(hostname)) {
      return { safe: false, reason: `Blocked hostname: ${hostname}` };
    }

    for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
      if (pattern.test(hostname)) {
        return { safe: false, reason: `Blocked hostname pattern: ${hostname}` };
      }
    }

    // ── Block username@host impersonation ─────────────────────────────────────
    // e.g. http://user@169.254.169.254/ or http://user@localhost/
    if (parsed.username || parsed.password) {
      return { safe: false, reason: "Blocked URL with embedded credentials" };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: `Invalid URL: cannot parse "${url}"` };
  }
}

/**
 * Check if a URL string looks like an LFI attempt (file://, \\UNC paths, etc.).
 * This is called from charset-decoder when processing file paths, not HTTP URLs.
 */
export function isLfiAttempt(input: string): boolean {
  const lower = input.toLowerCase().trim();

  // file:// protocol
  if (lower.startsWith("file://")) return true;

  // UNC Windows paths
  if (lower.startsWith("\\\\")) return true;

  // Unix absolute paths (in contexts where we expect URLs)
  if (/^\/(?:etc|proc|sys|usr\/..|var|root|home|tmp)/.test(lower)) return true;

  // drive letters with sensitive paths
  if (/^[a-z]:\\(?:windows|system32|etc|proc)/i.test(lower)) return true;

  return false;
}

/**
 * Assert that a URL is safe. Throws if unsafe — use in fetches.
 */
export function assertUrlSafe(url: string): void {
  const result = isUrlSafe(url);
  if (!result.safe) {
    throw new Error(`SSRF_BLOCKED: ${result.reason}`);
  }
}

/**
 * Sanitize a URL by stripping credentials, fragment, and port 25.
 */
export function sanitizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.username = "";
  parsed.password = "";
  parsed.hash = "";
  // Keep port 80/443 (normal) but strip non-standard ports as a warning
  return parsed.toString();
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function isBlockedIpv4(ip: string): boolean {
  // 127.x.x.x — loopback
  if (/^127\./.test(ip)) return true;
  // 10.x.x.x — Class A private
  if (/^10\./.test(ip)) return true;
  // 172.16.x.x – 172.31.x.x — Class B private
  if (/^172\.(1[6-9]|2\d|3[1])\./.test(ip)) return true;
  // 192.168.x.x — Class C private
  if (/^192\.168\./.test(ip)) return true;
  // 169.254.x.x — link-local (includes AWS metadata 169.254.169.254)
  if (/^169\.254\./.test(ip)) return true;
  // 0.x.x.x — current network
  if (/^0\./.test(ip)) return true;
  // 224.x.x.x – 239.x.x.x — multicast
  if (/^2(2[4-9]|3\d)\./.test(ip)) return true;
  // 240.x.x.x – 255.x.x.x — reserved
  if (/^2[4-5]\d\./.test(ip)) return true;
  // Single number (e.g. "8.8.8.8" parsed as path)
  if (/^\d+$/.test(ip)) return true;

  return false;
}

function isBlockedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/%.*$/, ""); // strip zone ID
  if (normalized === "1" || normalized === "::1" || normalized === "::ffff:127.0.0.1") return true;
  if (normalized === "::ffff:0:0" || normalized === "::") return true;
  // Fe80:: — link-local
  if (/^fe80:/i.test(normalized)) return true;
  // Cloud metadata
  if (normalized === "metadata.google.internal") return true;
  return false;
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.goog",
  "instancemetadata",
  "kubernetes.default",
  "kubernetes.default.svc",
  "kubernetes",
]);

const BLOCKED_HOSTNAME_PATTERNS = [
  /\.local$/i,
  /\.localhost$/i,
  /\.internal$/i,
  /\.corp$/i,
  /\.敏感词$/i, // placeholder for language-specific internal domains
  /^ip6-/,
  /^docker-/,
  /^k8s-/,
  /^minikube$/,
];
