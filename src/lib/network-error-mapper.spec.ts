import { describe, it, expect } from "vitest";
import { mapNetworkError } from "./network-error-mapper";

describe("mapNetworkError", () => {
  it("maps SSL certificate expired error", () => {
    const err = new Error("certificate has expired");
    const result = mapNetworkError(err);
    expect(result.errorCode).toBe("ssl_error");
    expect(result.displayMessage).toContain("SSL");
  });

  it("maps redirect loop error", () => {
    const err = new Error("ERR_TOO_MANY_REDIRECTS");
    const result = mapNetworkError(err);
    expect(result.errorCode).toBe("redirect_loop");
    expect(result.displayMessage).toContain("Redirect");
  });

  it("maps DNS error", () => {
    const err = new Error("getaddrinfo ENOTFOUND example.invalid");
    const result = mapNetworkError(err);
    expect(result.errorCode).toBe("dns_error");
  });

  it("maps AbortError to timeout", () => {
    const err = new Error("The user aborted the request");
    err.name = "AbortError";
    const result = mapNetworkError(err);
    expect(result.errorCode).toBe("timeout");
  });

  it("returns connection_error for unknown errors", () => {
    const result = mapNetworkError(new Error("Something went wrong"));
    expect(result.errorCode).toBe("connection_error");
  });

  it("handles non-Error inputs", () => {
    const result = mapNetworkError("some string error");
    expect(result.errorCode).toBe("connection_error");
  });
});
