import { describe, it, expect } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "./route";

function makeReq(body: unknown) {
  return {
    json: async () => body,
  } as unknown as NextRequest;
}

describe("POST /api/check-and-fix", () => {
  it("returns 400 when url field is missing", async () => {
    const req = makeReq({});
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errorCode).toBe("INVALID_URL");
  });

  it("returns 400 when url is not a valid URL", async () => {
    const req = makeReq({ url: "not-a-url" });
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errorCode).toBe("INVALID_URL");
  });

  it("returns 400 when url does not start with http", async () => {
    const req = makeReq({ url: "ftp://example.com" });
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errorCode).toBe("INVALID_URL");
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = makeReq({ _invalidJson: true });
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errorCode).toBe("INVALID_URL");
  });
});
