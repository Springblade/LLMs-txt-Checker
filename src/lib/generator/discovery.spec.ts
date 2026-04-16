import { describe, it, expect, vi } from "vitest";
import { discoverUrls } from "./discovery";

describe("discoverUrls", () => {
  it("extracts internal links from homepage HTML", async () => {
    const html = `
      <html><body>
        <a href="/page1">Page 1</a>
        <a href="/page2">Page 2</a>
        <a href="https://other.com/external">External</a>
      </body></html>
    `;
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await discoverUrls("https://example.com");

    const internalLinks = result.filter((u) => u.url.startsWith("https://example.com"));
    expect(internalLinks.length).toBeGreaterThanOrEqual(2);
    expect(internalLinks.some((u) => u.url.includes("/page1"))).toBe(true);
  });

  it("extracts sitemap URLs from robots.txt", async () => {
    const robotsTxt = "User-agent: *\nSitemap: https://example.com/sitemap.xml";
    const sitemapXml = `<?xml version="1.0"?>
      <urlset>
        <url><loc>https://example.com/blog/post1</loc></url>
        <url><loc>https://example.com/docs/guide</loc></url>
      </urlset>`;
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(robotsTxt) });
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve(sitemapXml) });
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await discoverUrls("https://example.com");

    expect(result.some((u) => u.url.includes("/blog/post1"))).toBe(true);
    expect(result.some((u) => u.url.includes("/docs/guide"))).toBe(true);
  });

  it("returns homepage links when no sitemap found", async () => {
    const html = `<html><body><a href="/about">About</a></body></html>`;
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await discoverUrls("https://example.com");

    expect(result.length).toBeGreaterThan(0);
  });

  it("throws on invalid URL", async () => {
    await expect(discoverUrls("not-a-url")).rejects.toThrow("Invalid URL");
  });
});