import { describe, it, expect } from "vitest";
import { scoreUrls } from "./scoring";
import type { DiscoveredUrl } from "./types";

describe("scoreUrls", () => {
  it("scores depth 0 higher than depth 1", () => {
    const urls: DiscoveredUrl[] = [
      { url: "https://example.com/", normalizedUrl: "https://example.com/", depth: 0, source: "homepage" },
      { url: "https://example.com/about", normalizedUrl: "https://example.com/about", depth: 1, source: "homepage" },
    ];
    const result = scoreUrls(urls, []);
    const home = result.find((u) => u.depth === 0);
    const about = result.find((u) => u.depth === 1);
    expect((home?.score ?? 0)).toBeGreaterThan((about?.score ?? 0));
  });

  it("scores /docs/ paths higher", () => {
    const urls: DiscoveredUrl[] = [
      { url: "https://example.com/about", normalizedUrl: "https://example.com/about", depth: 1, source: "homepage" },
      { url: "https://example.com/docs/guide", normalizedUrl: "https://example.com/docs/guide", depth: 1, source: "homepage" },
    ];
    const result = scoreUrls(urls, []);
    const docs = result.find((u) => u.url.includes("/docs/"));
    const about = result.find((u) => u.url.includes("/about"));
    expect((docs?.score ?? 0)).toBeGreaterThan((about?.score ?? 0));
  });

  it("deducts points for file extensions", () => {
    const urls: DiscoveredUrl[] = [
      { url: "https://example.com/page", normalizedUrl: "https://example.com/page", depth: 1, source: "homepage" },
      { url: "https://example.com/doc.pdf", normalizedUrl: "https://example.com/doc.pdf", depth: 1, source: "homepage" },
    ];
    const result = scoreUrls(urls, []);
    const page = result.find((u) => u.url.includes("/page"));
    const pdf = result.find((u) => u.url.includes(".pdf"));
    expect((pdf?.score ?? 0)).toBeLessThan((page?.score ?? 0));
  });

  it("boosts includePaths", () => {
    const urls: DiscoveredUrl[] = [
      { url: "https://example.com/about", normalizedUrl: "https://example.com/about", depth: 1, source: "homepage" },
      { url: "https://example.com/docs/guide", normalizedUrl: "https://example.com/docs/guide", depth: 1, source: "homepage" },
    ];
    const result = scoreUrls(urls, ["/about"]);
    const about = result.find((u) => u.url.includes("/about"));
    const docs = result.find((u) => u.url.includes("/docs/"));
    expect((about?.score ?? 0)).toBeGreaterThan((docs?.score ?? 0));
  });
});