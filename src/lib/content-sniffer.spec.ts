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

  it("blocks HTML content when MIME is text/plain (server misreports type)", () => {
    const result = sniffContentType(
      "text/plain",
      "<!DOCTYPE html><html><head></head><body>Error 404</body></html>",
      "llm.txt"
    );
    expect(result.allowed).toBe(false);
    expect(result.mimeType).toBe("text/html");
    expect(result.message).toContain("HTML content");
    expect(result.message).toContain("llm.txt");
  });

  it("blocks HTML with <html> tag when MIME is text/markdown", () => {
    const result = sniffContentType(
      "text/markdown",
      "<html><body>Not a markdown</body></html>",
      "llms.txt"
    );
    expect(result.allowed).toBe(false);
    expect(result.mimeType).toBe("text/html");
  });

  it("blocks HTML with <head> tag when MIME is text/plain", () => {
    const result = sniffContentType(
      "text/plain",
      "<head><title>Verification Required</title></head>",
      "ai.txt"
    );
    expect(result.allowed).toBe(false);
    expect(result.mimeType).toBe("text/html");
  });

  it("blocks HTML with <body> tag when MIME is application/octet-stream", () => {
    const result = sniffContentType(
      "application/octet-stream",
      "<body>Access Denied</body>",
      "llm.txt"
    );
    expect(result.allowed).toBe(false);
    expect(result.mimeType).toBe("text/html");
  });

  it("blocks partial HTML with <div> tag when MIME is text/plain", () => {
    const result = sniffContentType(
      "text/plain",
      "<div>Error 404 - Page Not Found</div>",
      "llm.txt"
    );
    expect(result.allowed).toBe(false);
    expect(result.mimeType).toBe("text/html");
  });

  it("blocks partial HTML with <p> tag when MIME is text/markdown", () => {
    const result = sniffContentType(
      "text/markdown",
      "<p>Access Denied</p>",
      "llms.txt"
    );
    expect(result.allowed).toBe(false);
    expect(result.mimeType).toBe("text/html");
  });

  it("blocks HTML with <script> tag when MIME is text/plain", () => {
    const result = sniffContentType(
      "text/plain",
      "<script>window.location='/login'</script>",
      "ai.txt"
    );
    expect(result.allowed).toBe(false);
    expect(result.mimeType).toBe("text/html");
  });

  it("blocks HTML with <span> tag when MIME is text/plain", () => {
    const result = sniffContentType(
      "text/plain",
      "<span class='error'>Forbidden</span>",
      "llm.txt"
    );
    expect(result.allowed).toBe(false);
    expect(result.mimeType).toBe("text/html");
  });

  it("allows HTML inside fenced code blocks", () => {
    const result = sniffContentType(
      "text/markdown",
      "# llms.txt\n\nExample HTML:\n\n```html\n<!DOCTYPE html>\n<html>\n<head></head>\n<body>Content</body>\n</html>\n```\n\nReal content here.",
      "llms.txt"
    );
    expect(result.allowed).toBe(true);
  });

  it("allows HTML inside inline code", () => {
    const result = sniffContentType(
      "text/plain",
      "# Example\n\nUse `<div>` for block elements.\n\nMore content.",
      "llm.txt"
    );
    expect(result.allowed).toBe(true);
  });

  it("still blocks HTML outside code blocks", () => {
    const result = sniffContentType(
      "text/markdown",
      "# llms.txt\n\n<div>Error 404</div>\n\n```html\n<!DOCTYPE html>\n</div>\n```",
      "llms.txt"
    );
    expect(result.allowed).toBe(false);
    expect(result.message).toContain("HTML content");
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
