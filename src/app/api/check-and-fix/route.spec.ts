import { describe, it, expect } from "vitest";
import { POST } from "./route";

describe("POST /api/check-and-fix", () => {
  it("returns 400 when url field is missing", async () => {
    const req = new Request("http://localhost/api/check-and-fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errorCode).toBe("INVALID_URL");
  });

  it("returns 400 when url is not a valid URL", async () => {
    const req = new Request("http://localhost/api/check-and-fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "not-a-url" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errorCode).toBe("INVALID_URL");
  });

  it("returns 400 when url does not start with http", async () => {
    const req = new Request("http://localhost/api/check-and-fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "ftp://example.com" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errorCode).toBe("INVALID_URL");
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/check-and-fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.errorCode).toBe("INVALID_URL");
  });
});
