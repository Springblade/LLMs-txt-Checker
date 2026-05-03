import { describe, it, expect } from "vitest";
import { generateSchemaFirst } from "./generate-ai-descriptions";
import type { SiteSignal } from "./merge-signals";

describe("generateSchemaFirst", () => {
  it("extracts FAQPage directly for faq-ai.txt without calling LLM", async () => {
    const signal: SiteSignal = {
      name: "Acme Corp",
      faqPage: {
        mainEntity: [
          {
            "@type": "Question",
            name: "Do you offer emergency services?",
            acceptedAnswer: { "@type": "Answer", text: "Yes, we offer 24/7 emergency drainage repairs." },
          },
          {
            "@type": "Question",
            name: "What areas do you cover?",
            acceptedAnswer: { "@type": "Answer", text: "We cover all of Greater London." },
          },
        ],
      },
      pages: [],
    };

    const result = await generateSchemaFirst(signal, "faq-ai.txt");

    expect(result.geminiCalled).toBe(false);
    expect(result.source).toBe("schema");
    expect(result.content).toContain("Do you offer emergency services?");
    expect(result.content).toContain("Yes, we offer 24/7 emergency drainage repairs.");
    expect(result.content).toContain("What areas do you cover?");
    expect(result.content).toContain("We cover all of Greater London.");
  });

  it("formats FAQ content correctly with Q: and A:", async () => {
    const signal: SiteSignal = {
      name: "Test Corp",
      faqPage: {
        mainEntity: [
          {
            "@type": "Question",
            name: "Question 1?",
            acceptedAnswer: { "@type": "Answer", text: "Answer 1." },
          },
        ],
      },
      pages: [],
    };

    const result = await generateSchemaFirst(signal, "faq-ai.txt");

    expect(result.content).toContain("Q: Question 1?");
    expect(result.content).toContain("A: Answer 1.");
    expect(result.content).toContain("# FAQ");
  });

  it("handles FAQPage with empty mainEntity", async () => {
    const signal: SiteSignal = {
      name: "Test Corp",
      faqPage: {
        mainEntity: [],
      },
      pages: [],
    };

    const result = await generateSchemaFirst(signal, "faq-ai.txt");

    // Should still return valid content (no error)
    expect(result.geminiCalled).toBe(false);
    expect(result.content).toContain("# FAQ");
  });

  it("returns organization info in content when available", async () => {
    const signal: SiteSignal = {
      name: "Acme Corp",
      organization: {
        name: "Acme Corp",
        url: "https://acme.com",
        legalName: "Acme Corporation Ltd",
        description: "Emergency drainage services",
        contactPoint: [{ email: "info@acme.com", telephone: "+44-123-456-7890" }],
      },
      pages: [],
    };

    // The function will try to use template if available, fallback otherwise
    const result = await generateSchemaFirst(signal, "brand.txt");

    // If template is not available, it should use schema-only content
    if (result.source === "schema" || result.source === "fallback") {
      expect(result.content).toContain("Acme Corp");
      expect(result.content).toContain("info@acme.com");
    }
  });

  it("handles signal with only name and no pages", async () => {
    const signal: SiteSignal = {
      name: "Test Site",
      pages: [],
    };

    const result = await generateSchemaFirst(signal, "ai.txt");

    // Should not throw, should return some content or empty
    expect(result).toBeDefined();
    expect(result.source).toBeTruthy();
  });

  it("returns structured result with correct shape", async () => {
    const signal: SiteSignal = {
      name: "Test Site",
      pages: [{ url: "https://test.com", canonical: "https://test.com", name: "Home" }],
    };

    const result = await generateSchemaFirst(signal, "faq-ai.txt");

    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("geminiCalled");
    expect(result).toHaveProperty("source");
    expect(["schema", "llm", "fallback"]).toContain(result.source);
  });
});
