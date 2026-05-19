import type { CrawlResult } from "@/lib/discovery/types";

interface SiteCrawlCacheEntry {
  siteName: string;
  origin: string;
  description: string;
  pages: Array<{ url: string; title: string; description: string; category?: string }>;
  llmsTxtContent?: string;
  cachedAt: number;
}

const DEFAULT_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const memoryCache = new Map<string, SiteCrawlCacheEntry>();
const inFlight = new Map<string, Promise<CrawlResult>>();

function getCacheKey(origin: string): string {
  return origin.endsWith("/") ? origin.slice(0, -1) : origin;
}

export function isCacheFresh(entry: SiteCrawlCacheEntry, ttlMs: number): boolean {
  return Date.now() - entry.cachedAt < ttlMs;
}

export function buildDescription(
  pages: Array<{ url: string; title: string; description: string; category?: string }>,
  origin: string,
  siteName: string
): string {
  const homepage = pages.find((p) => {
    const normalizedUrl = p.url.replace(/\/$/, "");
    return (
      normalizedUrl === origin ||
      normalizedUrl === origin.replace(/\/$/, "") ||
      !p.url.includes("/") ||
      p.url === origin + "/"
    );
  });

  if (homepage?.description) {
    return homepage.description.slice(0, 200);
  }
  if (homepage?.title) {
    return homepage.title;
  }
  return siteName;
}

export async function getOrCrawlSite(
  origin: string,
  fetcher: () => Promise<{ siteName: string; origin: string; pages: Array<{ url: string; title: string; description: string; category?: string }>; llmsTxtContent?: string }>,
  ttlMs: number = DEFAULT_CACHE_TTL_MS
): Promise<CrawlResult> {
  const key = getCacheKey(origin);

  // Check memory cache first
  const cached = memoryCache.get(key);
  if (cached && isCacheFresh(cached, ttlMs)) {
    return {
      siteName: cached.siteName,
      origin: cached.origin,
      description: cached.description,
      pages: cached.pages,
      llmsTxtContent: cached.llmsTxtContent,
      cachedAt: cached.cachedAt,
    };
  }

  // Check in-flight requests (deduplication)
  const existing = inFlight.get(key);
  if (existing) {
    return existing;
  }

  // Start new crawl
  const promise = (async () => {
    try {
      const crawl = await fetcher();
      const description = buildDescription(crawl.pages, crawl.origin, crawl.siteName);

      const entry: SiteCrawlCacheEntry = {
        siteName: crawl.siteName,
        origin: crawl.origin,
        description,
        pages: crawl.pages,
        llmsTxtContent: crawl.llmsTxtContent,
        cachedAt: Date.now(),
      };

      memoryCache.set(key, entry);

      return {
        siteName: entry.siteName,
        origin: entry.origin,
        description: entry.description,
        pages: entry.pages,
        llmsTxtContent: entry.llmsTxtContent,
        cachedAt: entry.cachedAt,
      };
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

export function getCachedSiteCrawl(origin: string): CrawlResult | undefined {
  const key = getCacheKey(origin);
  const cached = memoryCache.get(key);
  if (!cached) return undefined;

  return {
    siteName: cached.siteName,
    origin: cached.origin,
    description: cached.description,
    pages: cached.pages,
    llmsTxtContent: cached.llmsTxtContent,
    cachedAt: cached.cachedAt,
  };
}

export function clearSiteCache(origin?: string): void {
  if (origin) {
    const key = getCacheKey(origin);
    memoryCache.delete(key);
    inFlight.delete(key);
  } else {
    memoryCache.clear();
    inFlight.clear();
  }
}
