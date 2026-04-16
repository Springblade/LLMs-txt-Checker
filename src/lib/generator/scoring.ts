import type { DiscoveredUrl, ScoredUrl } from "./types";

export function scoreUrls(urls: DiscoveredUrl[], includePaths: string[] = []): ScoredUrl[] {
  return urls.map((url) => {
    let score = 0;
    const pathname = new URL(url.url).pathname;

    if (url.depth === 0) score += 10;
    else if (url.depth === 1) score += 7;
    else if (url.depth === 2) score += 4;
    else score += 1;

    if (/\/docs?\//i.test(pathname)) score += 5;
    if (/\/blog\//i.test(pathname)) score += 3;
    if (/\/api\//i.test(pathname)) score += 4;
    if (/\/reference\//i.test(pathname)) score += 4;
    if (/\/pricing\//i.test(pathname)) score += 3;
    if (/\/about\//i.test(pathname)) score += 2;
    if (/\/contact\//i.test(pathname)) score += 2;
    if (/changelog|news|releases/i.test(pathname)) score += 2;

    for (const p of includePaths) {
      if (pathname.includes(p)) score += 10;
    }

    if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|mp3|mp4|avi|mov)(\?|$)/i.test(pathname)) {
      score -= 20;
    }

    if (url.url.includes("?")) score -= 2;

    return { ...url, score: Math.max(0, score) };
  });
}