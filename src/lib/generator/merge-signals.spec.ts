import { describe, it, expect } from "vitest";
import { mergePageSignals, mergeAcrossPages } from "./merge-signals";
import type { ExtractedSchema } from "./extract-structured-data";

describe("mergePageSignals", () => {
  it("prefers canonical URL over schema URL", () => {
    const signals = {
      url: "https://example.com/about-us",
      canonical: "https://example.com/about",
      schemaUrl: "https://example.com/about-us",
      title: "About Us",
      metaDescription: "About our company",
    };
    const result = mergePageSignals(signals);
    expect(result.canonical).toBe("https://example.com/about");
  });

  it("falls back to schema URL when no canonical", () => {
    const signals = {
      url: "https://example.com/about",
      schemaUrl: "https://example.com/about",
      title: "About Us",
    };
    const result = mergePageSignals(signals);
    expect(result.canonical).toBe("https://example.com/about");
  });

  it("falls back to URL when no canonical or schemaUrl", () => {
    const signals = {
      url: "https://example.com/about",
      title: "About Us",
    };
    const result = mergePageSignals(signals);
    expect(result.canonical).toBe("https://example.com/about");
  });

  it("derives name from schema.organization when available", () => {
    const schema: ExtractedSchema = {
      organization: { name: "Acme Corp" },
      rawJsonLd: [],
    };
    const signals = { url: "https://example.com", title: "Home" };
    const result = mergePageSignals(signals, schema);
    expect(result.name).toBe("Acme Corp");
  });

  it("falls back to signals.schema.organization.name when available", () => {
    const schema: ExtractedSchema = {
      organization: { name: "Signal Org" },
      rawJsonLd: [],
    };
    const signals = {
      url: "https://example.com",
      title: "Home Page",
      schema,
    };
    const result = mergePageSignals(signals);
    expect(result.name).toBe("Signal Org");
  });

  it("falls back to title when no schema", () => {
    const signals = { url: "https://example.com", title: "Home Page" };
    const result = mergePageSignals(signals);
    expect(result.name).toBe("Home Page");
  });

  it("falls back to h1 when no title", () => {
    const signals = { url: "https://example.com", h1: "Home H1" };
    const result = mergePageSignals(signals);
    expect(result.name).toBe("Home H1");
  });

  it("falls back to url when no other name source", () => {
    const signals = { url: "https://example.com/about" };
    const result = mergePageSignals(signals);
    expect(result.name).toBe("https://example.com/about");
  });

  it("derives description from schema.organization.description", () => {
    const schema: ExtractedSchema = {
      organization: { name: "Acme", description: "Best company" },
      rawJsonLd: [],
    };
    const signals = { url: "https://example.com" };
    const result = mergePageSignals(signals, schema);
    expect(result.description).toBe("Best company");
  });

  it("derives description from signals.schema.organization.description", () => {
    const schema: ExtractedSchema = {
      organization: { name: "Acme", description: "Signal description" },
      rawJsonLd: [],
    };
    const signals = {
      url: "https://example.com",
      metaDescription: "Meta desc",
      schema,
    };
    const result = mergePageSignals(signals);
    expect(result.description).toBe("Signal description");
  });

  it("falls back to metaDescription when no schema description", () => {
    const signals = {
      url: "https://example.com",
      metaDescription: "Meta description",
    };
    const result = mergePageSignals(signals);
    expect(result.description).toBe("Meta description");
  });

  it("handles empty signals gracefully", () => {
    const signals = { url: "https://example.com" };
    const result = mergePageSignals(signals);
    expect(result.url).toBe("https://example.com");
    expect(result.canonical).toBe("https://example.com");
    expect(result.name).toBe("https://example.com");
    expect(result.description).toBeUndefined();
  });

  it("preserves schema in result", () => {
    const schema: ExtractedSchema = {
      organization: { name: "Acme" },
      rawJsonLd: [],
    };
    const signals = { url: "https://example.com", schema };
    const result = mergePageSignals(signals, schema);
    expect(result.schema).toBe(schema);
  });
});

describe("mergeAcrossPages", () => {
  it("deduplicates pages by canonical URL", () => {
    const pageSignals = [
      { url: "https://example.com/about", canonical: "https://example.com/about", name: "About" },
      { url: "https://example.com/about-us", canonical: "https://example.com/about", name: "About Us" },
      { url: "https://example.com/contact", canonical: "https://example.com/contact", name: "Contact" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages).toHaveLength(2);
  });

  it("keeps first occurrence on duplicate", () => {
    const pageSignals = [
      { url: "https://example.com/about", canonical: "https://example.com/about", name: "About" },
      { url: "https://example.com/about-us", canonical: "https://example.com/about", name: "About Us" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages[0]?.name).toBe("About");
  });

  it("ranks pages: homepage first", () => {
    const pageSignals = [
      { url: "https://example.com/blog/post-1", canonical: "https://example.com/blog/post-1", name: "Blog Post" },
      { url: "https://example.com/about", canonical: "https://example.com/about", name: "About" },
      { url: "https://example.com/", canonical: "https://example.com/", name: "Home" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages[0]?.canonical).toBe("https://example.com/");
  });

  it("ranks pages: about before services", () => {
    const pageSignals = [
      { url: "https://example.com/services/seo", canonical: "https://example.com/services/seo", name: "SEO Service" },
      { url: "https://example.com/about", canonical: "https://example.com/about", name: "About" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages[0]?.name).toBe("About");
    expect(result.pages[1]?.name).toBe("SEO Service");
  });

  it("ranks pages: pricing after services", () => {
    const pageSignals = [
      { url: "https://example.com/pricing", canonical: "https://example.com/pricing", name: "Pricing" },
      { url: "https://example.com/services/seo", canonical: "https://example.com/services/seo", name: "SEO Service" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages[0]?.name).toBe("SEO Service");
    expect(result.pages[1]?.name).toBe("Pricing");
  });

  it("uses homepage name for site name", () => {
    const pageSignals = [
      { url: "https://example.com/", canonical: "https://example.com/", name: "Homepage Name" },
      { url: "https://example.com/about", canonical: "https://example.com/about", name: "About" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.name).toBe("Homepage Name");
  });

  it("falls back to 'Unknown Site' when no pages", () => {
    const result = mergeAcrossPages([]);
    expect(result.name).toBe("Unknown Site");
  });

  it("extracts organization from homepage", () => {
    const schema = { organization: { name: "Acme" }, rawJsonLd: [] };
    const pageSignals = [
      { url: "https://example.com/", canonical: "https://example.com/", name: "Home", schema },
      { url: "https://example.com/about", canonical: "https://example.com/about", name: "About" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.organization?.name).toBe("Acme");
  });

  it("finds faqPage from any page", () => {
    const faqSchema = {
      faqPage: { mainEntity: [{ "@type": "Question" as const, name: "Q1", acceptedAnswer: { "@type": "Answer" as const, text: "A1" } }] },
      rawJsonLd: [],
    };
    const pageSignals = [
      { url: "https://example.com/", canonical: "https://example.com/", name: "Home" },
      { url: "https://example.com/faq", canonical: "https://example.com/faq", name: "FAQ", schema: faqSchema },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.faqPage).toBeDefined();
    expect(result.faqPage?.mainEntity).toHaveLength(1);
    expect(result.faqPage?.mainEntity[0]?.name).toBe("Q1");
  });

  it("handles single page", () => {
    const pageSignals = [
      { url: "https://example.com/", canonical: "https://example.com/", name: "Home" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages).toHaveLength(1);
    expect(result.name).toBe("Home");
  });

  it("handles docs before blog in ranking", () => {
    const pageSignals = [
      { url: "https://example.com/blog/post", canonical: "https://example.com/blog/post", name: "Blog" },
      { url: "https://example.com/docs/guide", canonical: "https://example.com/docs/guide", name: "Docs" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages[0]?.name).toBe("Docs");
    expect(result.pages[1]?.name).toBe("Blog");
  });
});
