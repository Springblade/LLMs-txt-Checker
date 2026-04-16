import { describe, it, expect } from "vitest";
import { filterUrls } from "./filtering";
import type { DiscoveredUrl } from "./types";

describe("filterUrls", () => {
  const baseUrls: DiscoveredUrl[] = [
    { url: "https://example.com/", normalizedUrl: "https://example.com/", depth: 0, source: "homepage" },
    { url: "https://example.com/about", normalizedUrl: "https://example.com/about", depth: 1, source: "homepage" },
    { url: "https://example.com/login", normalizedUrl: "https://example.com/login", depth: 1, source: "homepage" },
    { url: "https://example.com/admin/dashboard", normalizedUrl: "https://example.com/admin/dashboard", depth: 1, source: "homepage" },
    { url: "https://example.com/images/logo.png", normalizedUrl: "https://example.com/images/logo.png", depth: 1, source: "homepage" },
    { url: "https://example.com/blog/post", normalizedUrl: "https://example.com/blog/post", depth: 1, source: "sitemap" },
    { url: "https://example.com/blog/page/2", normalizedUrl: "https://example.com/blog/page/2", depth: 1, source: "homepage" },
    { url: "https://example.com/2024/post", normalizedUrl: "https://example.com/2024/post", depth: 1, source: "sitemap" },
    { url: "https://other.com/page", normalizedUrl: "https://other.com/page", depth: 1, source: "homepage" },
  ];

  it("filters login pages", () => {
    const result = filterUrls(baseUrls, []);
    expect(result.some((u) => u.url.includes("/login"))).toBe(false);
  });

  it("filters admin pages", () => {
    const result = filterUrls(baseUrls, []);
    expect(result.some((u) => u.url.includes("/admin"))).toBe(false);
  });

  it("filters asset files", () => {
    const result = filterUrls(baseUrls, []);
    expect(result.some((u) => u.url.includes(".png"))).toBe(false);
    expect(result.some((u) => u.url.includes("/images/"))).toBe(false);
  });

  it("filters pagination", () => {
    const result = filterUrls(baseUrls, []);
    expect(result.some((u) => u.url.includes("/page/"))).toBe(false);
  });

  it("filters external URLs", () => {
    const result = filterUrls(baseUrls, []);
    expect(result.some((u) => u.url.includes("other.com"))).toBe(false);
  });

  it("filters archive URLs (year-based)", () => {
    const result = filterUrls(baseUrls, []);
    expect(result.some((u) => u.url.includes("/2024/"))).toBe(false);
  });

  it("keeps homepage and allowed pages", () => {
    const result = filterUrls(baseUrls, []);
    expect(result.some((u) => u.url === "https://example.com/")).toBe(true);
    expect(result.some((u) => u.url.includes("/about"))).toBe(true);
    expect(result.some((u) => u.url.includes("/blog/post"))).toBe(true);
  });

  it("respects user excludePaths", () => {
    const result = filterUrls(baseUrls, ["/about"]);
    expect(result.some((u) => u.url.includes("/about"))).toBe(false);
    expect(result.some((u) => u.url.includes("/blog/post"))).toBe(true);
  });
});