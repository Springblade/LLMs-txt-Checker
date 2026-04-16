import type { DiscoveredUrl } from "./types";

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