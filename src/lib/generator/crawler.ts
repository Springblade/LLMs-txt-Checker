import type { CrawledPage, ExtractedMetadata, FetchResult, ScoredUrl } from "./types";
import { mapNetworkError } from "@/lib/network-error-mapper";
import { assertUrlSafe } from "./security";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

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

async function fetchWithRetry(
  _url: string,
  fetchFn: () => Promise<Response>,
  retries: number
): Promise<{ res: Response | null; error?: string }> {
  let lastError = "";

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchFn();
      return { res };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      if (attempt < retries) {
        // Exponential backoff: 1s, 2s
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }

  return { res: null, error: lastError };
}

function extractMetadata(html: string, _url: string): ExtractedMetadata {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta\s+(?:name="description"\s+)?content="([^"]+)"/i);
  const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let content: string | undefined;
  if (bodyMatch) {
    const text = bodyMatch[1]!
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    content = text.slice(0, 500);
  }

  return {
    title: titleMatch?.[1]?.trim(),
    description: descMatch?.[1]?.trim(),
    canonicalUrl: canonicalMatch?.[1]?.trim(),
    h1: h1Match?.[1]?.trim(),
    content,
  };
}

// ─── Jina Reader API (Primary) ─────────────────────────────────────────────────
async function fetchViaJina(pageUrl: string): Promise<FetchResult> {
  const jinaUrl = `https://r.jina.ai/api/v1/content/${encodeURIComponent(pageUrl)}`;
  const headers: HeadersInit = { Accept: "text/plain" };

  // Add API key if provided (for higher rate limits)
  const jinaKey = process.env.JINA_API_KEY;
  if (jinaKey) {
    headers["Authorization"] = `Bearer ${jinaKey}`;
  }

  const result = await fetchWithRetry(jinaUrl, () => fetchWithTimeout(jinaUrl, FETCH_TIMEOUT_MS), MAX_RETRIES);

  if (!result.res) {
    return { url: pageUrl, error: result.error ?? "Jina fetch failed", provider: null };
  }

  if (!result.res.ok) {
    return { url: pageUrl, error: `Jina returned ${result.res.status}`, provider: null };
  }

  try {
    const text = await result.res.text();
    // Jina returns "Title: ...\n\nUrl: ...\n\nContent: ..."
    const contentMatch = text.match(/^Content:\s*([\s\S]*)$/m);
    const extractedContent = contentMatch?.[1]?.trim() ?? text;
    return { url: pageUrl, content: extractedContent, provider: "jina" };
  } catch {
    return { url: pageUrl, error: "Failed to parse Jina response", provider: null };
  }
}

// ─── Native Fetch (Fallback 1) ─────────────────────────────────────────────────
async function fetchViaNative(pageUrl: string): Promise<FetchResult> {
  const result = await fetchWithRetry(
    pageUrl,
    () => fetchWithTimeout(pageUrl, FETCH_TIMEOUT_MS),
    MAX_RETRIES
  );

  if (!result.res) {
    const mapped = mapNetworkError(new Error(result.error ?? "Native fetch failed"));
    return { url: pageUrl, error: mapped.displayMessage, provider: null };
  }

  if (!result.res.ok) {
    return { url: pageUrl, error: `HTTP ${result.res.status}`, provider: null };
  }

  try {
    const text = await result.res.text();
    return { url: pageUrl, content: text, provider: "native" };
  } catch {
    return { url: pageUrl, error: "Failed to read response body", provider: null };
  }
}

// ─── Firecrawl (Fallback 2) ───────────────────────────────────────────────────
async function fetchViaFirecrawl(pageUrl: string): Promise<FetchResult> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlKey) {
    return { url: pageUrl, error: "Firecrawl API key not configured", provider: null };
  }

  const firecrawlUrl = "https://api.firecrawl.dev/v0/scrape";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(firecrawlUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firecrawlKey}`,
      },
      body: JSON.stringify({
        url: pageUrl,
        pageOptions: { onlyMainContent: true },
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { url: pageUrl, error: `Firecrawl returned ${res.status}`, provider: null };
    }

    const data = await res.json() as {
      success?: boolean;
      data?: { content?: string; title?: string };
      error?: string;
    };

    if (!data.success || !data.data?.content) {
      return { url: pageUrl, error: data.error ?? "Firecrawl scrape failed", provider: null };
    }

    return { url: pageUrl, content: data.data.content, provider: "firecrawl" };
  } catch (e) {
    const mapped = mapNetworkError(e instanceof Error ? e : new Error(String(e)));
    return { url: pageUrl, error: mapped.displayMessage, provider: null };
  }
}

// ─── Main Crawl Function ───────────────────────────────────────────────────────
async function crawlBatched(urls: ScoredUrl[], concurrency: number): Promise<FetchResult[]> {
  const results: FetchResult[] = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((u) => fetchWithCascade(u.url)));
    results.push(...batchResults);
    if (i + concurrency < urls.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return results;
}

async function fetchWithCascade(pageUrl: string): Promise<FetchResult> {
  // SSRF check — must pass before any network call
  try {
    assertUrlSafe(pageUrl);
  } catch (e) {
    return { url: pageUrl, error: e instanceof Error ? e.message : String(e), provider: null };
  }

  // Step 1: Jina (primary)
  const jinaResult = await fetchViaJina(pageUrl);
  if (jinaResult.content) {
    return jinaResult;
  }

  // Step 2: Native fetch (fallback 1)
  const nativeResult = await fetchViaNative(pageUrl);
  if (nativeResult.content) {
    return nativeResult;
  }

  // Step 3: Firecrawl (fallback 2)
  const firecrawlResult = await fetchViaFirecrawl(pageUrl);
  if (firecrawlResult.content) {
    return firecrawlResult;
  }

  // All methods failed
  return {
    url: pageUrl,
    error: jinaResult.error ?? nativeResult.error ?? firecrawlResult.error ?? "All fetch methods failed",
    provider: null,
  };
}

export async function crawlPages(urls: ScoredUrl[], concurrency: number = 5): Promise<CrawledPage[]> {
  const fetchResults = await crawlBatched(urls, concurrency);

  return fetchResults.map((result) => {
    if (!result.content) {
      return {
        url: result.url,
        normalizedUrl: result.url,
        category: "other" as const,
        score: 0,
        needsAi: true,
        error: result.error,
      };
    }

    const metadata = extractMetadata(result.content, result.url);

    let category: CrawledPage["category"] = "other";
    const pathname = new URL(result.url).pathname.toLowerCase();
    if (/\/docs?\//.test(pathname)) category = "documentation";
    else if (/\/blog\//.test(pathname)) category = "blog";
    else if (/\/api\//.test(pathname) || /reference/.test(pathname)) category = "api-reference";
    else if (/pricing/.test(pathname)) category = "pricing";
    else if (/about/.test(pathname)) category = "about";
    else if (/contact/.test(pathname)) category = "contact";
    else if (/privacy|terms|legal|cookies/.test(pathname)) category = "legal";

    const needsAi = !metadata.description || metadata.description.trim() === "";

    return {
      url: result.url,
      normalizedUrl: result.url,
      canonicalUrl: metadata.canonicalUrl,
      title: metadata.title,
      description: metadata.description,
      h1: metadata.h1,
      content: metadata.content,
      category,
      score: urls.find((u) => u.url === result.url)?.score ?? 0,
      needsAi,
      provider: result.provider,
    };
  });
}
