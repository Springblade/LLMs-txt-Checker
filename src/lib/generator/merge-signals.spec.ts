import { describe, it, expect } from "vitest";
import { mergePageSignals, mergeAcrossPages } from "./merge-signals";
import type { ExtractedSchema } from "./extract-structured-data";

describe("mergePageSignals", () => {
  it("prefers canonical URL over schema URL", () => {
    const signals = {
      url: "https://example.com/about",
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

  it("derives name from schema.organization when available", () => {
    const schema: ExtractedSchema = {
      organization: { name: "Acme Corp" },
      rawJsonLd: [],
    };
    const signals = { url: "https://example.com", title: "Home" };
    const result = mergePageSignals(signals, schema);
    expect(result.name).toBe("Acme Corp");
  });

  it("falls back to title when no schema", () => {
    const signals = { url: "https://example.com", title: "Home Page" };
    const result = mergePageSignals(signals);
    expect(result.name).toBe("Home Page");
  });

  it("prefers schema description over meta description", () => {
    const schema: ExtractedSchema = {
      organization: { description: "Schema description" },
      rawJsonLd: [],
    };
    const signals = {
      url: "https://example.com",
      title: "Home",
      metaDescription: "Meta description",
    };
    const result = mergePageSignals(signals, schema);
    expect(result.description).toBe("Schema description");
  });

  it("falls back to meta description when no schema description", () => {
    const signals = {
      url: "https://example.com",
      title: "Home",
      metaDescription: "Meta description",
    };
    const result = mergePageSignals(signals);
    expect(result.description).toBe("Meta description");
  });

  it("uses URL as fallback name when no title or schema", () => {
    const signals = { url: "https://example.com/products/widgets" };
    const result = mergePageSignals(signals);
    expect(result.name).toBe("https://example.com/products/widgets");
  });

  it("includes schema in result when provided", () => {
    const schema: ExtractedSchema = {
      organization: { name: "Acme Corp", description: "Test corp" },
      rawJsonLd: [],
    };
    const signals = { url: "https://example.com", title: "Home" };
    const result = mergePageSignals(signals, schema);
    expect(result.schema).toBe(schema);
  });
});

describe("mergeAcrossPages", () => {
  it("deduplicates pages by canonical URL", () => {
    const pageSignals = [
      { canonical: "https://example.com/about", name: "About", url: "https://example.com/about" },
      { canonical: "https://example.com/about", name: "About Us", url: "https://example.com/about" },
      { canonical: "https://example.com/contact", name: "Contact", url: "https://example.com/contact" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages).toHaveLength(2);
    expect(result.pages[0]?.canonical).toBe("https://example.com/about");
  });

  it("ranks pages: homepage > about > services > docs > blog", () => {
    const pageSignals = [
      { canonical: "https://example.com/blog/post-1", name: "Blog Post", url: "https://example.com/blog/post-1" },
      { canonical: "https://example.com/services/seo", name: "SEO Service", url: "https://example.com/services/seo" },
      { canonical: "https://example.com/about", name: "About", url: "https://example.com/about" },
      { canonical: "https://example.com/", name: "Home", url: "https://example.com/" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages[0]?.canonical).toBe("https://example.com/");
    expect(result.pages[1]?.canonical).toBe("https://example.com/about");
    expect(result.pages[2]?.canonical).toBe("https://example.com/services/seo");
    expect(result.pages[3]?.canonical).toBe("https://example.com/blog/post-1");
  });

  it("extracts homepage name as site name", () => {
    const pageSignals = [
      { canonical: "https://example.com/about", name: "About", url: "https://example.com/about" },
      { canonical: "https://example.com/", name: "Example Corp", url: "https://example.com/" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.name).toBe("Example Corp");
  });

  it("uses first page name when no homepage", () => {
    const pageSignals = [
      { canonical: "https://example.com/about", name: "About", url: "https://example.com/about" },
      { canonical: "https://example.com/blog", name: "Blog", url: "https://example.com/blog" },
    ];
    const result = mergeAcrossPages(pageSignals);
    // First page (about, rank 2) is used as site name since there's no homepage (rank 1)
    expect(result.name).toBe("About");
  });

  it("keeps first occurrence of duplicate canonical URLs", () => {
    const pageSignals = [
      { canonical: "https://example.com/about", name: "First About", url: "https://example.com/about?ref=1" },
      { canonical: "https://example.com/about", name: "Second About", url: "https://example.com/about?ref=2" },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]?.name).toBe("First About");
  });

  it("extracts FAQPage from any page in the site", () => {
    const schema: ExtractedSchema = {
      faqPage: {
        mainEntity: [
          {
            "@type": "Question",
            name: "Test question?",
            acceptedAnswer: { "@type": "Answer", text: "Test answer." },
          },
        ],
      },
      rawJsonLd: [],
    };
    const pageSignals = [
      { canonical: "https://example.com/faq", name: "FAQ", url: "https://example.com/faq", schema },
    ];
    const result = mergeAcrossPages(pageSignals);
    expect(result.faqPage).toBeDefined();
    expect(result.faqPage?.mainEntity[0]?.name).toBe("Test question?");
  });
});
