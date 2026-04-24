import { describe, it, expect } from "vitest";
import {
  validateAiJson,
  validateIdentityJson,
  validateAiTxt,
  validateFaqAiTxt,
  validateBrandTxt,
  validateDeveloperAiTxt,
  validateLlmsHtml,
  validateRobotsAiTxt,
} from "./ai-discovery-scanner";

describe("validateAiJson", () => {
  it("returns 0 errors for valid spec-compliant JSON", () => {
    const content = JSON.stringify({
      name: "Example Site",
      url: "https://example.com",
      permissions: ["read"],
      restrictions: [],
    });
    const result = validateAiJson(content);
    expect(result.errors).toHaveLength(0);
  });

  it("returns 1 error when name field is missing", () => {
    const content = JSON.stringify({
      url: "https://example.com",
      permissions: ["read"],
      restrictions: [],
    });
    const result = validateAiJson(content);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rule).toBe("has_name");
  });

  it("returns 1 error when url field is missing", () => {
    const content = JSON.stringify({
      name: "Example Site",
      permissions: ["read"],
      restrictions: [],
    });
    const result = validateAiJson(content);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rule).toBe("has_url");
  });

  it("returns 1 error when permissions array is missing", () => {
    const content = JSON.stringify({
      name: "Example Site",
      url: "https://example.com",
      restrictions: [],
    });
    const result = validateAiJson(content);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rule).toBe("has_permissions");
  });

  it("returns 1 error when restrictions array is missing", () => {
    const content = JSON.stringify({
      name: "Example Site",
      url: "https://example.com",
      permissions: ["read"],
    });
    const result = validateAiJson(content);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rule).toBe("has_restrictions");
  });

  it("returns 1 error with Invalid JSON message for malformed JSON", () => {
    const content = "{ invalid json }";
    const result = validateAiJson(content);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rule).toBe("valid_json");
    expect(result.errors[0]?.message).toContain("Invalid JSON");
  });

  it("returns 1 warning, 0 errors when version field is missing", () => {
    const content = JSON.stringify({
      name: "Example Site",
      url: "https://example.com",
      permissions: ["read"],
      restrictions: [],
    });
    const result = validateAiJson(content);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.rule).toBe("has_version");
  });
});

describe("validateIdentityJson", () => {
  it("returns 0 errors for valid JSON with correct $schema (ai-visibility.org.uk)", () => {
    const content = JSON.stringify({
      $schema: "https://ai-visibility.org.uk/schemas/identity.json",
      name: "Example Site",
      url: "https://example.com",
    });
    const result = validateIdentityJson(content);
    expect(result.errors).toHaveLength(0);
  });

  it("returns 1 error when $schema points to 365i.co.uk", () => {
    const content = JSON.stringify({
      $schema: "https://365i.co.uk/schemas/identity.json",
      name: "Example Site",
      url: "https://example.com",
    });
    const result = validateIdentityJson(content);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rule).toBe("has_schema_ai_visibility");
  });

  it("returns 1 warning, 0 errors when $schema is missing", () => {
    const content = JSON.stringify({
      name: "Example Site",
      url: "https://example.com",
    });
    const result = validateIdentityJson(content);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.rule).toBe("has_schema");
  });

  it("returns 1 error when name is missing", () => {
    const content = JSON.stringify({
      url: "https://example.com",
    });
    const result = validateIdentityJson(content);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rule).toBe("has_name");
  });

  it("returns 1 error when url is missing", () => {
    const content = JSON.stringify({
      name: "Example Site",
    });
    const result = validateIdentityJson(content);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rule).toBe("has_url");
  });

  it("returns 1 error for invalid JSON", () => {
    const content = "{ invalid json }";
    const result = validateIdentityJson(content);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.rule).toBe("valid_json");
  });
});

describe("validateAiTxt", () => {
  it("returns 0 errors for valid INI content with all sections", () => {
    const content = `[official-names]
Example Site

[permissions]
read

[restrictions]
`;
    const result = validateAiTxt(content);
    expect(result.errors).toHaveLength(0);
  });

  it("returns 1 error when [official-names] is missing", () => {
    const content = `[permissions]
read
`;
    const result = validateAiTxt(content);
    expect(result.errors.some((e) => e.rule === "has_official_names")).toBe(true);
  });

  it("returns 1 error when [permissions] is missing", () => {
    const content = `[official-names]
Example Site
`;
    const result = validateAiTxt(content);
    expect(result.errors.some((e) => e.rule === "has_permissions")).toBe(true);
  });

  it("returns warnings for optional sections [overview], [restrictions], [contact]", () => {
    const content = `[official-names]
Example Site

[permissions]
read
`;
    const result = validateAiTxt(content);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.rule === "has_overview")).toBe(true);
  });
});

describe("validateFaqAiTxt", () => {
  it("returns 0 errors for valid Q:/A: pairs with URL attribution", () => {
    const content = `Q: How do I reset my password?
A: Go to settings and click reset.
URL: [https://example.com/faq]

Q: How do I contact support?
A: Email support@example.com.
URL: [https://example.com/contact]
`;
    const result = validateFaqAiTxt(content);
    expect(result.errors).toHaveLength(0);
  });

  it("returns 1 error when no Q:/A: pairs exist", () => {
    const result = validateFaqAiTxt("Some random content");
    expect(result.errors.some((e) => e.rule === "has_qa_pairs")).toBe(true);
  });

  it("returns 1 error when URL attribution is missing", () => {
    const content = `Q: How do I reset my password?
A: Go to settings.
`;
    const result = validateFaqAiTxt(content);
    expect(result.errors.some((e) => e.rule === "has_url_attrib")).toBe(true);
  });

  it("warns when question has no answer", () => {
    const content = `Q: How do I reset my password?
`;
    const result = validateFaqAiTxt(content);
    expect(result.warnings.some((w) => w.rule === "no_orphan_q")).toBe(true);
  });
});

describe("validateBrandTxt", () => {
  it("returns 0 errors for valid INI content with required sections", () => {
    const content = `[official-names]
Example Site

[naming-rules]
Use "Example" in title case.
`;
    const result = validateBrandTxt(content);
    expect(result.errors).toHaveLength(0);
  });

  it("returns 1 error when [official-names] is missing", () => {
    const content = `[naming-rules]
Use "Example" in title case.
`;
    const result = validateBrandTxt(content);
    expect(result.errors.some((e) => e.rule === "has_official_names")).toBe(true);
  });

  it("returns 1 error when [naming-rules] is missing", () => {
    const content = `[official-names]
Example Site
`;
    const result = validateBrandTxt(content);
    expect(result.errors.some((e) => e.rule === "has_naming_rules")).toBe(true);
  });
});

describe("validateDeveloperAiTxt", () => {
  it("returns 0 errors for valid INI content with required sections", () => {
    const content = `[official-names]
Example API

[overview]
This is a developer API.

[public-api]
GET /users
`;
    const result = validateDeveloperAiTxt(content);
    expect(result.errors).toHaveLength(0);
  });

  it("returns 1 error when [official-names] is missing", () => {
    const content = `[overview]
This is an API.
`;
    const result = validateDeveloperAiTxt(content);
    expect(result.errors.some((e) => e.rule === "has_official_names")).toBe(true);
  });

  it("returns 1 error when [overview] is missing", () => {
    const content = `[official-names]
Example API
`;
    const result = validateDeveloperAiTxt(content);
    expect(result.errors.some((e) => e.rule === "has_overview")).toBe(true);
  });

  it("returns 1 error when [public-api] is missing", () => {
    const content = `[official-names]
Example API

[overview]
This is an API.
`;
    const result = validateDeveloperAiTxt(content);
    expect(result.errors.some((e) => e.rule === "has_public_api")).toBe(true);
  });
});

describe("validateLlmsHtml", () => {
  it("returns 0 errors for valid HTML with noindex and canonical", () => {
    const content = `<!DOCTYPE html>
<html>
<head>
  <meta name="robots" content="index, noindex, follow">
  <link rel="canonical" href="/llms.txt">
</head>
<body>
  <h1>Site Map</h1>
</body>
</html>`;
    const result = validateLlmsHtml(content);
    expect(result.errors).toHaveLength(0);
  });

  it("returns 1 error when <html> tag is missing", () => {
    const content = `<head></head><body><h1>Test</h1></body>`;
    const result = validateLlmsHtml(content);
    expect(result.errors.some((e) => e.rule === "has_html_tag")).toBe(true);
  });

  it("returns 1 error when <h1> is missing", () => {
    const content = `<html><head></head><body><p>Test</p></body></html>`;
    const result = validateLlmsHtml(content);
    expect(result.errors.some((e) => e.rule === "has_h1")).toBe(true);
  });

  it("returns 1 error when noindex meta is missing", () => {
    const content = `<html><head><meta name="robots" content="index, follow"></head><body><h1>Test</h1></body></html>`;
    const result = validateLlmsHtml(content);
    expect(result.errors.some((e) => e.rule === "has_noindex")).toBe(true);
  });

  it("returns 1 error when canonical link is missing", () => {
    const content = `<html><head><meta name="robots" content="index, noindex, follow"></head><body><h1>Test</h1></body></html>`;
    const result = validateLlmsHtml(content);
    expect(result.errors.some((e) => e.rule === "has_canonical")).toBe(true);
  });
});

describe("validateRobotsAiTxt", () => {
  it("returns 0 errors for valid INI content with required sections", () => {
    const content = `[official-names]
Example Site

[allow-training]
/llms.txt

[disallow-training]
/private/
`;
    const result = validateRobotsAiTxt(content);
    expect(result.errors).toHaveLength(0);
  });

  it("returns 1 error when [official-names] is missing", () => {
    const content = `[allow-training]
/llms.txt
`;
    const result = validateRobotsAiTxt(content);
    expect(result.errors.some((e) => e.rule === "has_official_names")).toBe(true);
  });

  it("returns 1 error when [allow-training] is missing", () => {
    const content = `[official-names]
Example Site
`;
    const result = validateRobotsAiTxt(content);
    expect(result.errors.some((e) => e.rule === "has_allow_training")).toBe(true);
  });

  it("returns 1 error when [disallow-training] is missing", () => {
    const content = `[official-names]
Example Site

[allow-training]
/llms.txt
`;
    const result = validateRobotsAiTxt(content);
    expect(result.errors.some((e) => e.rule === "has_disallow_training")).toBe(true);
  });

  it("returns warnings for optional sections [allow-retrieval], [disallow-retrieval], [allow-citation], [disallow-citation]", () => {
    const content = `[official-names]
Example Site

[allow-training]
/llms.txt

[disallow-training]
/private/
`;
    const result = validateRobotsAiTxt(content);
    expect(result.warnings.some((w) => w.rule === "has_allow_retrieval")).toBe(true);
    expect(result.warnings.some((w) => w.rule === "has_disallow_retrieval")).toBe(true);
    expect(result.warnings.some((w) => w.rule === "has_allow_citation")).toBe(true);
    expect(result.warnings.some((w) => w.rule === "has_disallow_citation")).toBe(true);
  });
});
