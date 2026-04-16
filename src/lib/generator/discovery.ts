import { mapNetworkError } from "@/lib/network-error-mapper";
import type { DiscoveredUrl } from "./types";

const FETCH_TIMEOUT_MS = 10_000;

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

function normalizeUrl(url: string): string {
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

export async function discoverUrls(targetUrl: string): Promise<DiscoveredUrl[]> {
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