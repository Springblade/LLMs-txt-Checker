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
    // Should not throw
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

  it("extracts WebSite schema", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@type": "WebSite",
          "name": "Acme Site",
          "url": "https://acme.com",
          "description": "The official Acme website"
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.website?.name).toBe("Acme Site");
    expect(result.website?.url).toBe("https://acme.com");
    expect(result.website?.description).toBe("The official Acme website");
  });

  it("handles multiple JSON-LD script tags", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        { "@type": "Organization", "name": "Org1" }
        </script>
        <script type="application/ld+json">
        { "@type": "Organization", "name": "Org2" }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    // Should extract first Organization found
    expect(result.organization?.name).toBe("Org1");
  });

  it("handles nested @graph arrays", () => {
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@graph": [
            { "@type": "Organization", "name": "Outer Org" },
            {
              "@type": "CollectionPage",
              "@graph": [
                { "@type": "Organization", "name": "Inner Org" }
              ]
            }
          ]
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    // Should flatten and find first Organization
    expect(result.organization?.name).toBe("Outer Org");
  });

  it("handles script tag with different quote styles", () => {
    const html = `
      <html>
        <script type='application/ld+json'>
        { "@type": "Organization", "name": "Test Org" }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.organization?.name).toBe("Test Org");
  });

  it("handles JSON-LD with real newlines in content", () => {
    // JSON.parse interprets \n as newlines, so actual string value is "Multi Line Org"
    const html = `
      <html>
        <script type="application/ld+json">
        {
          "@type": "Organization",
          "name": "Multi Line Org"
        }
        </script>
      </html>
    `;
    const result = extractStructuredData(html);
    expect(result.organization?.name).toBe("Multi Line Org");
  });
});
