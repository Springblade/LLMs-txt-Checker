import { describe, it, expect } from "vitest";
import { extractStructuredData } from "./extract-structured-data";

describe("extractStructuredData", () => {
  it("extracts Organization schema from JSON-LD script tag", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@type": "Organization",
          "name": "Acme Corp",
          "url": "https://acme.com",
          "legalName": "Acme Corporation Ltd"
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.organization?.name).toBe("Acme Corp");
    expect(result.organization?.url).toBe("https://acme.com");
    expect(result.organization?.legalName).toBe("Acme Corporation Ltd");
  });

  it("extracts FAQPage schema for faq-ai.txt", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What services do you offer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We offer emergency drainage repairs."
              }
            }
          ]
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.faqPage).toBeDefined();
    expect(result.faqPage?.mainEntity).toHaveLength(1);
    expect(result.faqPage?.mainEntity[0]?.name).toBe("What services do you offer?");
  });

  it("flattens @graph arrays", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@graph": [
            { "@type": "Organization", "name": "Acme" },
            { "@type": "WebSite", "name": "Acme Site" }
          ]
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.organization?.name).toBe("Acme");
    expect(result.website?.name).toBe("Acme Site");
  });

  it("handles malformed JSON-LD gracefully", () => {
    const html = `
      <html>
        <script type="application/ld+json">
          { "name": "Test", invalid }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.organization).toBeUndefined();
  });

  it("returns empty for HTML without JSON-LD", () => {
    const html = "<html><body>No schema here</body></html>";
    const result = extractStructuredData(html);
    expect(result.organization).toBeUndefined();
    expect(result.faqPage).toBeUndefined();
    expect(result.rawJsonLd).toHaveLength(0);
  });

  it("handles multiple JSON-LD script tags", () => {
    const html = `
      <html>
        <script type="application/ld+json">
          { "@type": "Organization", "name": "First Org" }
        </script>
        <script type="application/ld+json">
          { "@type": "Organization", "name": "Second Org" }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.organization?.name).toBe("First Org");
  });

  it("handles nested @graph structures", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@graph": [
            {
              "@type": "WebSite",
              "name": "Main Site",
              "@graph": [
                { "@type": "Organization", "name": "Nested Org" }
              ]
            }
          ]
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.website?.name).toBe("Main Site");
    expect(result.organization?.name).toBe("Nested Org");
  });

  it("extracts full Organization properties", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@type": "Organization",
          "name": "Acme Corp",
          "alternateName": ["Acme", "Acme Ltd"],
          "description": "Emergency drainage services",
          "foundingDate": "2010",
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "info@acme.com",
            "telephone": "+44-123-456-7890",
            "contactType": "customer service"
          },
          "sameAs": ["https://twitter.com/acme", "https://linkedin.com/company/acme"],
          "founder": { "name": "John Doe" }
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.organization?.name).toBe("Acme Corp");
    expect(result.organization?.alternateName).toEqual(["Acme", "Acme Ltd"]);
    expect(result.organization?.description).toBe("Emergency drainage services");
    expect(result.organization?.foundingDate).toBe("2010");
    expect(result.organization?.contactPoint?.[0]?.email).toBe("info@acme.com");
    expect(result.organization?.contactPoint?.[0]?.telephone).toBe("+44-123-456-7890");
    expect(result.organization?.sameAs).toContain("https://twitter.com/acme");
    expect(result.organization?.founder?.name).toBe("John Doe");
  });
});
