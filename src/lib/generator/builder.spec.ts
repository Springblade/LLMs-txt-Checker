import { describe, it, expect } from "vitest";
import { buildLlmsTxt, buildFileName } from "./builder";
import type { CrawledPage } from "./types";

describe("buildLlmsTxt", () => {
  it("generates valid llms.txt format", () => {
    const pages: CrawledPage[] = [
      {
        url: "https://example.com/",
        normalizedUrl: "https://example.com/",
        title: "Home",
        description: "Welcome to the site",
        category: "other",
        score: 10,
        needsAi: false,
      },
    ];
    const result = buildLlmsTxt(pages);
    expect(result).toContain("# example.com");
    expect(result).toContain("https://example.com/");
    expect(result).toContain("Welcome to the site");
  });

  it("groups by category", () => {
    const pages: CrawledPage[] = [
      { url: "https://example.com/about", normalizedUrl: "https://example.com/about", category: "about", score: 5, needsAi: false },
      { url: "https://example.com/docs", normalizedUrl: "https://example.com/docs", category: "documentation", score: 8, needsAi: false },
      { url: "https://example.com/blog", normalizedUrl: "https://example.com/blog", category: "blog", score: 3, needsAi: false },
    ];
    const result = buildLlmsTxt(pages);
    expect(result).toContain("## About");
    expect(result).toContain("## Documentation");
    expect(result).toContain("## Blog Post");
  });

  it("uses siteName option", () => {
    const pages: CrawledPage[] = [
      { url: "https://example.com/", normalizedUrl: "https://example.com/", category: "other", score: 10, needsAi: false },
    ];
    const result = buildLlmsTxt(pages, { siteName: "My Custom Site" });
    expect(result).toContain("# My Custom Site");
  });

  it("handles pages without description", () => {
    const pages: CrawledPage[] = [
      { url: "https://example.com/page", normalizedUrl: "https://example.com/page", category: "other", score: 5, needsAi: true },
    ];
    const result = buildLlmsTxt(pages);
    expect(result).toContain("https://example.com/page");
  });
});

describe("buildFileName", () => {
  it("creates slugified filename from URL", () => {
    expect(buildFileName("https://example.com")).toBe("example-com-llms.txt");
    expect(buildFileName("https://www.example.com")).toBe("example-com-llms.txt");
    expect(buildFileName("https://api.example.com")).toBe("api-example-com-llms.txt");
  });

  it("falls back to llms.txt for invalid URL", () => {
    expect(buildFileName("not-a-url")).toBe("llms.txt");
  });
});
