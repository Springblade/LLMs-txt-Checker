/**
 * URL Discovery — unified module for discovering, deduplicating, and filtering URLs.
 * Combines: discovery.ts + deduplication.ts + filtering.ts
 *
 * Rationale: URL normalization logic was duplicated across 3 files.
 * Now centralized in one place.
 */

import { mapNetworkError } from "@/lib/network-error-mapper";
import { assertUrlSafe } from "./security";
import type { DiscoveredUrl } from "./types";

const FETCH_TIMEOUT_MS = 10_000;

// ─── Shared URL normalization ───────────────────────────────────────────────────

/**
 * Normalize a URL: strip trailing slash, remove hash.
 * Used by all discovery, deduplication, and scoring steps.
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

// ─── Filtering constants (was in filtering.ts) ─────────────────────────────────

const AUTH_PATTERNS = [
  /\/login/i, /\/signup/i, /\/register/i, /\/logout/i,
  /\/sign-in/i, /\/sign-out/i, /\/reset-password/i,
  /\/forgot-password/i, /\/reset/i,
];

const ADMIN_PATTERNS = [
  /\/admin/i, /\/wp-admin/i, /\/dashboard\/?$/i, /\/manage/i, /\/backend/i,
];

const ASSET_PATTERNS = [
  /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot|ico)(\?|$)/i,
  /\/images?\//i, /\/static\//i, /\/assets?\//i,
  /\/\.well-known\//i, /\/media\//i, /\/uploads?\//i, /\/favicon/i,
];

const ARCHIVE_PATTERNS = [
  /\/[0-9]{4}\//i, /\/[0-9]{4}-[0-9]{2}\//i,
  /\/tag\//i, /\/tags\//i, /\/author\//i, /\/category\//i, /\/archive/i,
];

const PAGINATION_PATTERN = /\/(page|paged|cpage)\/\d+/i;

// ─── Fetch helpers ─────────────────────────────────────────────────────────────

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

async function fetchRobotsTxt(origin: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`${origin}/robots.txt`, FETCH_TIMEOUT_MS);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchSitemap(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.includes("<urlset") && !text.includes("<sitemap")) return null;
    return text;
  } catch {
    return null;
  }
}

async function fetchHomepage(origin: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(origin, FETCH_TIMEOUT_MS);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ─── HTML parsers ─────────────────────────────────────────────────────────────

function extractInternalLinks(html: string, baseOrigin: string): string[] {
  const linkRegex = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const links: Set<string> = new Set();
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]!;
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }
    try {
      if (href.startsWith("http://") || href.startsWith("https://")) {
        const parsed = new URL(href);
        if (parsed.origin === baseOrigin) {
          links.add(parsed.href);
        }
      } else if (href.startsWith("/")) {
        links.add(`${baseOrigin}${href}`);
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return Array.from(links);
}

function extractSitemapUrls(xml: string): string[] {
  const locRegex = /<loc[^>]*>([^<]+)<\/loc>/gi;
  const urls: string[] = [];
  let match;

  while ((match = locRegex.exec(xml)) !== null) {
    const url = match[1]?.trim();
    if (url) urls.push(url);
  }

  return urls;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function discoverUrls(targetUrl: string): Promise<DiscoveredUrl[]> {
  // SSRF check — must pass before any network call
  assertUrlSafe(targetUrl);

  let origin: string;
  try {
    const parsed = new URL(targetUrl);
    origin = parsed.origin;
  } catch {
    throw new Error("Invalid URL");
  }

  const [homepageHtml, robotsTxt] = await Promise.all([
    fetchHomepage(origin),
    fetchRobotsTxt(origin),
  ]);

  if (!homepageHtml) {
    const err = new Error("Failed to fetch homepage");
    const mapped = mapNetworkError(err);
    throw new Error(`FETCH_ERROR: ${mapped.displayMessage}`);
  }

  const sitemapMatch = robotsTxt?.match(/^Sitemap:\s*(.+)$/mi);
  const sitemapUrlFromRobots = sitemapMatch?.[1]?.trim() ?? null;

  let sitemapUrls: string[] = [];
  if (sitemapUrlFromRobots) {
    const xml = await fetchSitemap(sitemapUrlFromRobots);
    if (xml) sitemapUrls = extractSitemapUrls(xml);
  }

  if (sitemapUrls.length === 0) {
    const defaultSitemap = `${origin}/sitemap.xml`;
    const xml = await fetchSitemap(defaultSitemap);
    if (xml) sitemapUrls = extractSitemapUrls(xml);
  }

  const urlSet = new Map<string, DiscoveredUrl>();

  const homepageLinks = extractInternalLinks(homepageHtml, origin);
  for (const url of homepageLinks) {
    const normalized = normalizeUrl(url);
    if (!urlSet.has(normalized)) {
      urlSet.set(normalized, { url, normalizedUrl: normalized, depth: 1, source: "homepage" });
    }
  }

  for (const url of sitemapUrls) {
    const normalized = normalizeUrl(url);
    if (!urlSet.has(normalized)) {
      urlSet.set(normalized, { url, normalizedUrl: normalized, depth: 1, source: "sitemap" });
    }
  }

  if (urlSet.size === 0) {
    const normalized = normalizeUrl(origin);
    urlSet.set(normalized, { url: origin, normalizedUrl: normalized, depth: 0, source: "fallback" });
  }

  return Array.from(urlSet.values());
}

export function deduplicateUrls(urls: DiscoveredUrl[]): DiscoveredUrl[] {
  const seen = new Map<string, DiscoveredUrl>();

  for (const url of urls) {
    const normalized = url.normalizedUrl;
    if (!seen.has(normalized)) {
      seen.set(normalized, url);
    } else {
      const existing = seen.get(normalized)!;
      if (url.source === "homepage" && existing.source !== "homepage") {
        seen.set(normalized, url);
      }
    }
  }

  return Array.from(seen.values());
}

export function filterUrls(urls: DiscoveredUrl[], excludePaths: string[] = []): DiscoveredUrl[] {
  const originSet = new Set<string>();

  for (const url of urls) {
    try {
      originSet.add(new URL(url.url).origin);
    } catch {
      // skip invalid URLs
    }
  }

  const primaryOrigin = originSet.size > 0 ? Array.from(originSet)[0] : null;

  return urls.filter((url) => {
    if (!primaryOrigin) return false;

    try {
      const urlOrigin = new URL(url.url).origin;
      if (urlOrigin !== primaryOrigin) return false;
    } catch {
      return false;
    }

    const pathname = new URL(url.url).pathname;

    if (AUTH_PATTERNS.some((p) => p.test(pathname))) return false;
    if (ADMIN_PATTERNS.some((p) => p.test(pathname))) return false;
    if (ASSET_PATTERNS.some((p) => p.test(pathname))) return false;
    if (ARCHIVE_PATTERNS.some((p) => p.test(pathname))) return false;
    if (PAGINATION_PATTERN.test(pathname)) return false;
    if (excludePaths.some((p) => pathname.includes(p))) return false;

    return true;
  });
}
