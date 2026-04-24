import { describe, it, expect } from "vitest";
import { validateAiJson, validateIdentityJson } from "./ai-discovery-scanner";

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
