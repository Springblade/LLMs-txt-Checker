/**
 * URL Prioritization — unified module for scoring and applying crawl controls.
 * Combines: scoring.ts + controls.ts
 *
 * Rationale: Both operate on the same data shape (DiscoveredUrl[] -> ScoredUrl[]).
 * Centralized here for easier tuning.
 */

import type { DiscoveredUrl, ScoredUrl } from "./types";

export function scoreUrls(urls: DiscoveredUrl[], includePaths: string[] = []): ScoredUrl[] {
  return urls.map((url) => {
    let score = 0;
    const pathname = new URL(url.url).pathname;

    // Depth bonus
    if (url.depth === 0) score += 10;
    else if (url.depth === 1) score += 7;
    else if (url.depth === 2) score += 4;
    else score += 1;

    // Path type bonus
    if (/\/docs?\//i.test(pathname)) score += 5;
    if (/\/blog\//i.test(pathname)) score += 3;
    if (/\/api\//i.test(pathname)) score += 4;
    if (/\/reference\//i.test(pathname)) score += 4;
    if (/\/pricing\//i.test(pathname)) score += 3;
    if (/\/about\//i.test(pathname)) score += 2;
    if (/\/contact\//i.test(pathname)) score += 2;
    if (/changelog|news|releases/i.test(pathname)) score += 2;

    // User-provided priority paths
    for (const p of includePaths) {
      if (pathname.includes(p)) score += 10;
    }

    // Penalty for non-document pages
    if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|mp3|mp4|avi|mov)(\?|$)/i.test(pathname)) {
      score -= 20;
    }

    // Penalty for query strings
    if (url.url.includes("?")) score -= 2;

    return { ...url, score: Math.max(0, score) };
  });
}

export function applyControls(
  urls: ScoredUrl[],
  maxUrls: number,
  excludePaths: string[] = []
): ScoredUrl[] {
  const sorted = [...urls].sort((a, b) => b.score - a.score);

  const filtered = sorted.filter((url) => {
    const pathname = new URL(url.url).pathname;
    return !excludePaths.some((p) => pathname.includes(p));
  });

  return filtered.slice(0, maxUrls);
}
