import { describe, it, expect } from "vitest";
import { applyControls } from "./controls";
import type { ScoredUrl } from "./types";

describe("applyControls", () => {
  it("limits URLs by maxUrls", () => {
    const urls: ScoredUrl[] = Array.from({ length: 100 }, (_, i) => ({
      url: `https://example.com/page${i}`, normalizedUrl: `https://example.com/page${i}`,
      depth: 1, source: "homepage" as const, score: 100 - i,
    }));
    const result = applyControls(urls, 20, []);
    expect(result.length).toBe(20);
    expect(result[0]?.score).toBe(100);
  });

  it("sorts by score descending before limiting", () => {
    const urls: ScoredUrl[] = [
      { url: "https://example.com/low", normalizedUrl: "https://example.com/low", depth: 1, source: "homepage", score: 1 },
      { url: "https://example.com/high", normalizedUrl: "https://example.com/high", depth: 1, source: "homepage", score: 100 },
      { url: "https://example.com/mid", normalizedUrl: "https://example.com/mid", depth: 1, source: "homepage", score: 50 },
    ];
    const result = applyControls(urls, 2, []);
    expect(result[0]?.url).toBe("https://example.com/high");
    expect(result[1]?.url).toBe("https://example.com/mid");
  });

  it("excludes paths in excludePaths", () => {
    const urls: ScoredUrl[] = [
      { url: "https://example.com/about", normalizedUrl: "https://example.com/about", depth: 1, source: "homepage", score: 50 },
      { url: "https://example.com/secret", normalizedUrl: "https://example.com/secret", depth: 1, source: "homepage", score: 100 },
    ];
    const result = applyControls(urls, 50, ["/secret"]);
    expect(result.some((u) => u.url.includes("/secret"))).toBe(false);
    expect(result.some((u) => u.url.includes("/about"))).toBe(true);
  });
});