import { describe, it, expect } from "vitest";
import { deduplicateUrls } from "./deduplication";
import type { DiscoveredUrl } from "./types";

describe("deduplicateUrls", () => {
  it("removes duplicate trailing slash URLs", () => {
    const urls: DiscoveredUrl[] = [
      { url: "https://example.com/page", normalizedUrl: "https://example.com/page", depth: 1, source: "homepage" },
      { url: "https://example.com/page/", normalizedUrl: "https://example.com/page", depth: 1, source: "sitemap" },
    ];
    const result = deduplicateUrls(urls);
    expect(result.length).toBe(1);
    expect(result[0]?.normalizedUrl).toBe("https://example.com/page");
  });

  it("removes duplicate query param URLs", () => {
    const urls: DiscoveredUrl[] = [
      { url: "https://example.com/page", normalizedUrl: "https://example.com/page", depth: 1, source: "homepage" },
      { url: "https://example.com/page?ref=footer", normalizedUrl: "https://example.com/page", depth: 1, source: "sitemap" },
    ];
    const result = deduplicateUrls(urls);
    expect(result.length).toBe(1);
  });

  it("keeps different paths", () => {
    const urls: DiscoveredUrl[] = [
      { url: "https://example.com/page1", normalizedUrl: "https://example.com/page1", depth: 1, source: "homepage" },
      { url: "https://example.com/page2", normalizedUrl: "https://example.com/page2", depth: 1, source: "sitemap" },
    ];
    const result = deduplicateUrls(urls);
    expect(result.length).toBe(2);
  });
});