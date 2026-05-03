import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateSchemaFirst } from "./generate-ai-descriptions";
import type { SiteSignal } from "./merge-signals";

// Mock the template fetcher
vi.mock("@/lib/discovery/template-fetcher", () => ({
  fetchTemplate: vi.fn(),
}));

// Mock the Gemini template filler
vi.mock("./gemini-template-filler", () => ({
  generateTemplateContent: vi.fn(),
}));

import { fetchTemplate } from "@/lib/discovery/template-fetcher";
import { generateTemplateContent } from "./gemini-template-filler";

const mockFetchTemplate = fetchTemplate as ReturnType<typeof vi.fn>;
const mockGenerateTemplateContent = generateTemplateContent as ReturnType<typeof vi.fn>;

describe("generateSchemaFirst", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("faq-ai.txt with FAQPage schema", () => {
    it("extracts FAQPage directly without calling Gemini", async () => {
      const siteSignal: SiteSignal = {
        name: "Acme Corp",
        faqPage: {
          mainEntity: [
            {
              "@type": "Question" as const,
              name: "Do you offer emergency services?",
              acceptedAnswer: { "@type": "Answer" as const, text: "Yes, we offer 24/7 emergency drainage repairs." },
            },
            {
              "@type": "Question" as const,
              name: "What areas do you cover?",
              acceptedAnswer: { "@type": "Answer" as const, text: "We cover all of Greater London." },
            },
          ],
        },
        pages: [],
      };

      const result = await generateSchemaFirst(siteSignal, "faq-ai.txt");

      expect(result.content).toContain("Do you offer emergency services?");
      expect(result.content).toContain("Yes, we offer 24/7 emergency drainage repairs.");
      expect(result.content).toContain("What areas do you cover?");
      expect(result.content).toContain("We cover all of Greater London.");
      expect(result.geminiCalled).toBe(false);
      expect(result.missingFields).toHaveLength(0);
      expect(mockGenerateTemplateContent).not.toHaveBeenCalled();
    });
  });

  describe("brand.txt with full schema", () => {
    it("fills all fields without calling Gemini", async () => {
      mockFetchTemplate.mockReturnValue({
        success: true,
        content: `[official-names]
{{trading-name}}
{{legal-name}}

[incorrect-names]
{{incorrect-name-1}}
{{incorrect-name-2}}

[naming-rules]
{{naming-rule-1}}
{{naming-rule-2}}

[contact]
{{contact-email}}`,
      });

      const siteSignal: SiteSignal = {
        name: "Acme Corp",
        organization: {
          name: "Acme Corp",
          url: "https://acme.com",
          legalName: "Acme Corporation Ltd",
          description: "Emergency drainage services",
          contactPoint: [{ email: "info@acme.com" }],
        },
        pages: [],
      };

      const result = await generateSchemaFirst(siteSignal, "brand.txt");

      expect(result.content).toContain("Acme Corp");
      expect(result.content).toContain("Acme Corporation Ltd");
      expect(result.content).toContain("info@acme.com");
      expect(result.geminiCalled).toBe(false);
      expect(mockGenerateTemplateContent).not.toHaveBeenCalled();
    });

    it("calls Gemini when schema is incomplete", async () => {
      mockFetchTemplate.mockReturnValue({
        success: true,
        content: "[official-names]\n{{trading-name}}\n{{legal-name}}",
      });
      mockGenerateTemplateContent.mockResolvedValue("Generated content");

      const siteSignal: SiteSignal = {
        name: "Acme Corp",
        pages: [{ url: "https://acme.com", canonical: "https://acme.com", name: "Home" }],
      };

      const result = await generateSchemaFirst(siteSignal, "brand.txt");

      expect(result.content).toBe("Generated content");
      expect(result.geminiCalled).toBe(true);
      expect(result.missingFields).toContain("contact-email");
      expect(mockGenerateTemplateContent).toHaveBeenCalled();
    });
  });

  describe("template not found", () => {
    it("falls back to Gemini", async () => {
      mockFetchTemplate.mockReturnValue({
        success: false,
        error: "Template not found",
      });
      mockGenerateTemplateContent.mockResolvedValue("Fallback content");

      const siteSignal: SiteSignal = {
        name: "Acme Corp",
        pages: [{ url: "https://acme.com", canonical: "https://acme.com", name: "Home" }],
      };

      const result = await generateSchemaFirst(siteSignal, "brand.txt");

      expect(result.content).toBe("Fallback content");
      expect(result.geminiCalled).toBe(true);
    });
  });

  describe("ai.txt with schema", () => {
    it("fills placeholders from organization schema", async () => {
      mockFetchTemplate.mockReturnValue({
        success: true,
        content: `[official-names]
{{trading-name}}
{{legal-name}}

[overview]
{{business-description}}

[contact]
{{contact-email}}`,
      });

      const siteSignal: SiteSignal = {
        name: "Acme Corp",
        description: "Drainage services provider",
        organization: {
          name: "Acme Corp",
          description: "Emergency drainage services",
          contactPoint: [{ email: "info@acme.com" }],
        },
        pages: [],
      };

      const result = await generateSchemaFirst(siteSignal, "ai.txt");

      expect(result.content).toContain("Acme Corp");
      expect(result.content).toContain("Emergency drainage services");
      expect(result.content).toContain("info@acme.com");
      expect(result.geminiCalled).toBe(false);
    });
  });

  describe("error handling", () => {
    it("handles missing FAQPage gracefully", async () => {
      mockFetchTemplate.mockReturnValue({
        success: true,
        content: "FAQ template content",
      });
      mockGenerateTemplateContent.mockResolvedValue("Generated FAQ");

      const siteSignal: SiteSignal = {
        name: "Acme Corp",
        pages: [],
      };

      const result = await generateSchemaFirst(siteSignal, "faq-ai.txt");

      // No FAQPage, so it falls through to template generation
      expect(mockGenerateTemplateContent).toHaveBeenCalled();
    });

    it("replaces remaining placeholders with N/A", async () => {
      mockFetchTemplate.mockReturnValue({
        success: true,
        content: `Name: {{business-name}}
Legal: {{legal-name}}
Twitter: {{social-twitter}}`,
      });
      mockGenerateTemplateContent.mockResolvedValue("Filled content with N/A");

      const siteSignal: SiteSignal = {
        name: "Acme Corp",
        pages: [],
      };

      const result = await generateSchemaFirst(siteSignal, "brand.txt");

      expect(result.geminiCalled).toBe(true);
    });
  });
});
