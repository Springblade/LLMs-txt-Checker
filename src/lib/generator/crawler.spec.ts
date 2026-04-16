import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ScoredUrl } from "./types";

describe("crawlPages cascade", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("JINA_API_KEY", "");
    vi.stubEnv("FIRECRAWL_API_KEY", "");
  });

  it("uses Jina Reader API as primary fetch", async () => {
    const { crawlPages } = await import("./crawler");
    const urls: ScoredUrl[] = [
      { url: "https://example.com/about", normalizedUrl: "https://example.com/about", depth: 1, source: "homepage", score: 50 },
    ];
    const jinaResponse = "Title: About\n\nContent: This is the about page content.";

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
        text: () => Promise.resolve("<html><body><h1>About</h1></body></html>"),
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const results = await crawlPages(urls, 5);

    expect(results.length).toBe(1);
    expect(results[0]?.provider).toBe("jina");
  });

  it("falls back to native fetch when Jina fails", async () => {
    const { crawlPages } = await import("./crawler");
    const urls: ScoredUrl[] = [
      { url: "https://example.com/about", normalizedUrl: "https://example.com/about", depth: 1, source: "homepage", score: 50 },
    ];

    const mockFetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString();

      if (urlStr.includes("r.jina.ai")) {
        return Promise.resolve({ ok: false, status: 500 });
      }

      return Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(
            "<html><head><title>About</title><meta name=\"description\" content=\"About page desc\"></head><body><h1>About Us</h1></body></html>"
          ),
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const results = await crawlPages(urls, 5);

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
    const { crawlPages } = await import("./crawler");
    const urls: ScoredUrl[] = [
      { url: "https://example.com/about", normalizedUrl: "https://example.com/about", depth: 1, source: "homepage", score: 50 },
    ];

    // Mock Jina and native to both fail
    const mockFetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString();

      if (urlStr.includes("r.jina.ai")) {
        return Promise.resolve({ ok: false, status: 500 });
      }

      return Promise.resolve({ ok: false, status: 403 });
    });
    vi.stubGlobal("fetch", mockFetch);

    const results = await crawlPages(urls, 5);

    expect(results.length).toBe(1);
    // Firecrawl not used because API key not set, so error should be from native
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
