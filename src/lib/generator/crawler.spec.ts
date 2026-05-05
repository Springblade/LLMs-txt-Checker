import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ScoredUrl } from "./types";
import { extractMetadata, isFallbackPage } from "./crawler";

describe("extractMetadata", () => {
  it('parses Jina Markdown format with Title prefix', () => {
    const markdown = `Title: Generative Engine Optimization Solutions

URL Source: https://example.ai/

Markdown Content:
# Example AI
This is the first paragraph of content.
Another paragraph here.
`;

    const result = extractMetadata(markdown, 'https://example.ai/');
    
    expect(result.title).toBe('Generative Engine Optimization Solutions');
    expect(result.description).toContain('first paragraph');
  });

  it('extracts H1 from markdown content', () => {
    const markdown = `Title: Page Title

URL Source: https://example.ai/

Markdown Content:
# Main Heading
Content here.
`;

    const result = extractMetadata(markdown, 'https://example.ai/');
    
    expect(result.h1).toBe('Main Heading');
  });

  it('handles content with links and images in first paragraph', () => {
    const markdown = `Title: Test

Markdown Content:
# Title
[Link Text](https://example.com) and ![Image](img.png)
This is actual content.
`;

    const result = extractMetadata(markdown, 'https://example.ai/');
    
    expect(result.description).toBe('This is actual content.');
  });

  it('falls back gracefully when Title prefix missing', () => {
    const markdown = `# Just a heading
Some content here.
`;
    
    const result = extractMetadata(markdown, 'https://example.ai/');
    
    expect(result.title).toBeUndefined();
    expect(result.description).toContain('Some content');
  });

  it('limits description to 200 chars', () => {
    const longContent = 'A'.repeat(300);
    const markdown = `Title: Test

Markdown Content:
# Title
${longContent}
`;

    const result = extractMetadata(markdown, 'https://example.ai/');

    expect(result.description).toBeDefined();
    expect(result.description?.length).toBe(200);
  });

  it('returns empty description when only headings exist', () => {
    const markdown = `Title: Test

Markdown Content:
# Only Heading
## Another Heading
`;

    const result = extractMetadata(markdown, 'https://example.ai/');

    expect(result.description).toBe('');
  });

  it('limits content to 3000 chars', () => {
    const longContent = 'x'.repeat(4000);
    const markdown = `Title: Test

Markdown Content:
# Title
${longContent}
`;

    const result = extractMetadata(markdown, 'https://example.ai/');

    expect(result.content?.length).toBeLessThanOrEqual(3000);
  });
});

describe("isFallbackPage", () => {
  it("returns true when title contains 404", () => {
    const content = "<html><head><title>404 - Page Not Found</title></head></html>";
    expect(isFallbackPage(content, "https://example.com/deep/nested/path")).toBe(true);
  });

  it("returns false for homepage URL", () => {
    const content = "<html><head><title>404 - Page Not Found</title></head></html>";
    expect(isFallbackPage(content, "https://example.com/")).toBe(false);
  });

  it("returns false for empty content", () => {
    expect(isFallbackPage("", "https://example.com/page")).toBe(false);
  });

  it("does not throw on malformed URL", () => {
    const content = "<html><head><title>Site</title></head></html>";
    expect(() => isFallbackPage(content, "not-a-url")).not.toThrow();
  });

  it("returns true for site not found title", () => {
    const content = "<html><head><title>Site Not Found | Provider</title></head></html>";
    expect(isFallbackPage(content, "https://example.com/page")).toBe(true);
  });

  it("returns true for page not found title", () => {
    const content = "<html><head><title>Page Not Found | MySite</title></head></html>";
    expect(isFallbackPage(content, "https://example.com/nonexistent")).toBe(true);
  });

  it("returns false for normal page title", () => {
    const content = "<html><head><title>About Us - Company</title></head></html>";
    expect(isFallbackPage(content, "https://example.com/about")).toBe(false);
  });
});

describe("crawlPages cascade", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("JINA_API_KEY", "");
    vi.stubEnv("FIRECRAWL_API_KEY", "");
  });

  it("uses Jina Reader API as primary fetch", async () => {
    const { crawlPages } = await import("./crawler");
    // Use /team instead of /about to avoid triggering HTML fetch for priority pages
    const urls: ScoredUrl[] = [
      { url: "https://example.com/team", normalizedUrl: "https://example.com/team", depth: 1, source: "homepage", score: 50 },
    ];
    const jinaResponse = "Title: Team\n\nContent: This is the team page content.";

    const mockFetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString();

      if (urlStr.includes("r.jina.ai")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(jinaResponse),
        });
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve("<html><body><h1>Team</h1></body></html>"),
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const results = await crawlPages(urls, 5);

    expect(results.length).toBe(1);
    expect(results[0]?.provider).toBe("jina");
  });

  it("falls back to native fetch when Jina fails", async () => {
    // Clear module cache to ensure fresh mocks
    vi.resetModules();

    // Use a unique URL to avoid cache interference
    const testUrl = `https://test-${Date.now()}.example.com/team`;
    const { crawlPages } = await import("./crawler");
    const urls: ScoredUrl[] = [
      { url: testUrl, normalizedUrl: testUrl, depth: 1, source: "homepage", score: 50 },
    ];

    let jinaCalled = false;

    const mockFetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString();

      // Count Jina calls
      if (urlStr.includes("r.jina.ai")) {
        jinaCalled = true;
        // Return failure for all Jina calls
        return Promise.resolve({ ok: false, status: 500 });
      }

      // Native fetch succeeds
      return Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(
            "<html><head><title>Team</title><meta name=\"description\" content=\"Team page desc\"></head><body><h1>Our Team</h1></body></html>"
          ),
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const results = await crawlPages(urls, 5);

    // Debug output
    console.log("Jina called:", jinaCalled);
    console.log("Mock call count:", mockFetch.mock.calls.length);
    console.log("Provider:", results[0]?.provider);

    expect(results.length).toBe(1);
    expect(results[0]?.provider).toBe("native");
  });

  it.skip("falls back to Firecrawl when both Jina and native fail", async () => {
    // Set Firecrawl API key BEFORE importing the module
    vi.stubEnv("FIRECRAWL_API_KEY", "test-firecrawl-key");

    const { crawlPages } = await import("./crawler");
    const urls: ScoredUrl[] = [
      { url: "https://example.com/about", normalizedUrl: "https://example.com/about", depth: 1, source: "homepage", score: 50 },
    ];

    const mockFetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString();

      if (urlStr.includes("r.jina.ai")) {
        return Promise.resolve({ ok: false, status: 500 });
      }

      if (urlStr.includes("api.firecrawl.dev")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { content: "Firecrawl extracted content" },
            }),
        });
      }

      // Native fetch returns error (403)
      return Promise.resolve({ ok: false, status: 403 });
    });
    vi.stubGlobal("fetch", mockFetch);

    const results = await crawlPages(urls, 5);

    expect(results.length).toBe(1);
    expect(results[0]?.provider).toBe("firecrawl");
    expect(results[0]?.content).toBe("Firecrawl extracted content");
  });

  it("returns error when Firecrawl API key not configured", async () => {
    // Clear module cache to ensure fresh mocks
    vi.resetModules();

    // Use a unique URL to avoid cache interference
    const testUrl = `https://test-${Date.now()}.example.com/team`;
    const { crawlPages } = await import("./crawler");
    const urls: ScoredUrl[] = [
      { url: testUrl, normalizedUrl: testUrl, depth: 1, source: "homepage", score: 50 },
    ];

    const mockFetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString();

      // Jina fails
      if (urlStr.includes("r.jina.ai")) {
        return Promise.resolve({ ok: false, status: 500 });
      }

      // Native also fails
      return Promise.resolve({ ok: false, status: 403 });
    });
    vi.stubGlobal("fetch", mockFetch);

    const results = await crawlPages(urls, 5);

    // Debug output
    console.log("Error:", results[0]?.error);
    console.log("Content:", results[0]?.content);

    expect(results.length).toBe(1);
    // All fetch methods failed, so error should be set
    expect(results[0]?.error).toBeTruthy();
  });

  it("respects concurrency limit", async () => {
    const { crawlPages } = await import("./crawler");
    const urls: ScoredUrl[] = Array.from({ length: 10 }, (_, i) => ({
      url: `https://example.com/page${i}`,
      normalizedUrl: `https://example.com/page${i}`,
      depth: 1,
      source: "homepage" as const,
      score: 10,
    }));

    let maxConcurrent = 0;
    let currentConcurrent = 0;

    const mockFetch = vi.fn().mockImplementation(async () => {
      currentConcurrent++;
      maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
      await new Promise((r) => setTimeout(r, 50));
      currentConcurrent--;
      return {
        ok: true,
        text: () =>
          Promise.resolve(
            "<html><head><title>T</title><meta name=\"description\" content=\"desc\"></head><body><p>C</p></body></html>"
          ),
      };
    });
    vi.stubGlobal("fetch", mockFetch);

    await crawlPages(urls, 3);

    expect(maxConcurrent).toBeLessThanOrEqual(3);
  });

  it("adds rate limiting delay between batches", async () => {
    const { crawlPages } = await import("./crawler");
    const urls: ScoredUrl[] = Array.from({ length: 8 }, (_, i) => ({
      url: `https://example.com/page${i}`,
      normalizedUrl: `https://example.com/page${i}`,
      depth: 1,
      source: "homepage" as const,
      score: 10,
    }));

    const mockFetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(
            "<html><head><title>T</title><meta name=\"description\" content=\"desc\"></head><body><p>C</p></body></html>"
          ),
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const start = Date.now();
    await crawlPages(urls, 5);
    const elapsed = Date.now() - start;

    // With concurrency=5 and 8 URLs, expect 2 batches with 200ms delay
    expect(elapsed).toBeGreaterThanOrEqual(200);
  });
});
