import type { ScoredUrl } from "./types";

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