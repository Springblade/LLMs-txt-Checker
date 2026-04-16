import { describe, it, expect } from "vitest";
import { classifyPage, getCategoryLabel } from "./category-classifier";

describe("classifyPage", () => {
  it("classifies docs paths", () => {
    expect(classifyPage("https://example.com/docs/guide")).toBe("documentation");
    expect(classifyPage("https://example.com/guide")).toBe("documentation");
    expect(classifyPage("https://example.com/tutorial/intro", "Getting Started Tutorial")).toBe("documentation");
  });

  it("classifies blog paths", () => {
    expect(classifyPage("https://example.com/blog/intro")).toBe("blog");
    expect(classifyPage("https://example.com/posts/2024/intro")).toBe("blog");
  });

  it("classifies api-reference paths", () => {
    expect(classifyPage("https://example.com/api/users")).toBe("api-reference");
    expect(classifyPage("https://example.com/reference", "API Reference")).toBe("api-reference");
  });

  it("classifies pricing", () => {
    expect(classifyPage("https://example.com/pricing")).toBe("pricing");
    expect(classifyPage("https://example.com/plans", "Pricing Plans")).toBe("pricing");
  });

  it("classifies other as default", () => {
    expect(classifyPage("https://example.com/weird-path")).toBe("other");
  });
});

describe("getCategoryLabel", () => {
  it("returns human-readable labels", () => {
    expect(getCategoryLabel("documentation")).toBe("Documentation");
    expect(getCategoryLabel("blog")).toBe("Blog Post");
    expect(getCategoryLabel("api-reference")).toBe("API Reference");
    expect(getCategoryLabel("other")).toBe("Page");
  });
});
