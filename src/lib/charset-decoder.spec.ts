import { describe, it, expect } from "vitest";
import { decodeWithCharset, extractCharset } from "./charset-decoder";

describe("extractCharset", () => {
  it("extracts charset from Content-Type header", () => {
    expect(extractCharset("text/plain; charset=ISO-8859-1")).toBe(
      "ISO-8859-1"
    );
    expect(extractCharset("text/plain;charset=utf-8")).toBe("utf-8");
    expect(extractCharset("text/plain")).toBeNull();
    expect(extractCharset(null)).toBeNull();
  });
});

describe("decodeWithCharset", () => {
  it("decodes UTF-8 by default", () => {
    const encoder = new TextEncoder();
    const buffer = encoder.encode("# Hello\n\nContent").buffer;
    const result = decodeWithCharset(buffer, null);
    expect(result.success).toBe(true);
    expect(result.text).toContain("Hello");
    expect(result.charset).toBeNull();
  });

  it("decodes ISO-8859-1 when specified", () => {
    const bytes = new Uint8Array([72, 233, 108, 108, 111]);
    const result = decodeWithCharset(
      bytes.buffer,
      "text/plain; charset=ISO-8859-1"
    );
    expect(result.success).toBe(true);
    expect(result.text).toContain("H");
  });

  it("rejects unknown charset", () => {
    const bytes = new Uint8Array([72, 105]);
    const result = decodeWithCharset(
      bytes.buffer,
      "text/plain; charset=X-USER-DEFINED"
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain("Unsupported Character Encoding");
  });
});
