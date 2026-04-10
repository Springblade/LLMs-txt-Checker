import { describe, it, expect } from "vitest";
import { sniffContentType, detectWafResponse } from "./content-sniffer";

describe("sniffContentType", () => {
  it("allows text/plain", () => {
    const result = sniffContentType("text/plain", "");
    expect(result.allowed).toBe(true);
    expect(result.mimeType).toBe("text/plain");
  });

  it("allows text/markdown", () => {
    const result = sniffContentType("text/markdown", "");
    expect(result.allowed).toBe(true);
    expect(result.mimeType).toBe("text/markdown");
  });

  it("blocks text/html", () => {
    const result = sniffContentType("text/html", "");
    expect(result.allowed).toBe(false);
    expect(result.message).toContain("HTML webpage");
  });

  it("blocks application/pdf", () => {
    const result = sniffContentType("application/pdf", "");
    expect(result.allowed).toBe(false);
    expect(result.message).toContain("PDF document");
  });

  it("blocks image/ prefix", () => {
    const result = sniffContentType("image/png", "");
    expect(result.allowed).toBe(false);
    expect(result.message).toContain("image");
  });

  it("blocks HTML by raw content when no Content-Type", () => {
    const result = sniffContentType(
      null,
      "<!DOCTYPE html><html><body>test</body></html>"
    );
    expect(result.allowed).toBe(false);
  });
});

describe("detectWafResponse", () => {
  it("returns blocked when doctype html found in body", () => {
    const result = detectWafResponse(
      "<!DOCTYPE html><html><body>challenge</body></html>"
    );
    expect(result.blocked).toBe(true);
    expect(result.matchedSignatures.length).toBeGreaterThan(0);
  });

  it("returns blocked when Cloudflare signature found", () => {
    const result = detectWafResponse(
      '<html><head><meta name="robots" content="noindex"></head></html>'
    );
    expect(result.blocked).toBe(true);
  });

  it("returns not blocked for plain text", () => {
    const result = detectWafResponse("# Hello World\n\n- [Link](./file.md)");
    expect(result.blocked).toBe(false);
    expect(result.matchedSignatures).toEqual([]);
  });

  it("returns not blocked for empty body", () => {
    const result = detectWafResponse("");
    expect(result.blocked).toBe(false);
  });

  it("returns blocked when <script> tag found in text/plain body", () => {
    const result = detectWafResponse("<script>alert('challenge')</script>");
    expect(result.blocked).toBe(true);
  });

  it("returns blocked when <head> tag found", () => {
    const result = detectWafResponse("<head><title>Verification</title></head>");
    expect(result.blocked).toBe(true);
  });
});
