import { describe, it, expect } from "vitest";
import { buildPrompt, isQuotaError } from "./ai-generator";
import type { CrawledPage } from "./types";
import { GoogleGenerativeAIError } from "@google/generative-ai";

// Test buildPrompt
describe("buildPrompt", () => {
  it("includes URL in prompt", () => {
    const page: CrawledPage = {
      url: "https://example.com/docs/guide",
      normalizedUrl: "https://example.com/docs/guide",
      category: "documentation",
      score: 10,
      needsAi: true,
    };
    const prompt = buildPrompt(page);
    expect(prompt).toContain("https://example.com/docs/guide");
  });

  it("includes category in prompt", () => {
    const page: CrawledPage = {
      url: "https://example.com/blog/intro",
      normalizedUrl: "https://example.com/blog/intro",
      category: "blog",
      score: 5,
      needsAi: true,
    };
    const prompt = buildPrompt(page);
    expect(prompt).toContain("blog");
    expect(prompt).toContain("200 chars");
  });

  it("handles missing title and h1", () => {
    const page: CrawledPage = {
      url: "https://example.com/page",
      normalizedUrl: "https://example.com/page",
      category: "other",
      score: 1,
      needsAi: true,
    };
    const prompt = buildPrompt(page);
    expect(prompt).toContain("N/A");
  });

  it("limits content preview to 300 chars", () => {
    const page: CrawledPage = {
      url: "https://example.com/page",
      normalizedUrl: "https://example.com/page",
      content: "A".repeat(500),
      category: "other",
      score: 1,
      needsAi: true,
    };
    const prompt = buildPrompt(page);
    expect(prompt).not.toContain("A".repeat(301));
    expect(prompt).toContain("A".repeat(300));
  });
});

// Test isQuotaError
describe("isQuotaError", () => {
  it("detects 429 in Error message", () => {
    expect(isQuotaError(new Error("429 Too Many Requests"))).toBe(true);
  });

  it("detects quota in Error message", () => {
    expect(isQuotaError(new Error("Quota exceeded for this key"))).toBe(true);
  });

  it("detects rate limit in Error message", () => {
    expect(isQuotaError(new Error("Rate limit exceeded"))).toBe(true);
  });

  it("detects resource exhausted", () => {
    expect(isQuotaError(new Error("Resource has been exhausted"))).toBe(true);
  });

  it("detects too many requests", () => {
    expect(isQuotaError(new Error("Too many requests"))).toBe(true);
  });

  it("returns false for non-quota errors", () => {
    expect(isQuotaError(new Error("Invalid API key"))).toBe(false);
    expect(isQuotaError(new Error("Model not found"))).toBe(false);
    expect(isQuotaError(new Error("Network timeout"))).toBe(false);
  });

  it("detects quota in GoogleGenerativeAIError", () => {
    const error = new GoogleGenerativeAIError("429 Quota exceeded");
    expect(isQuotaError(error)).toBe(true);
  });

  it("returns false for unknown error types", () => {
    expect(isQuotaError("not an error")).toBe(false);
    expect(isQuotaError(null)).toBe(false);
  });
});
