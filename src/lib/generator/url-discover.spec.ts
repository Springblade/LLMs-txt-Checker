import { describe, it, expect, vi, beforeEach } from "vitest";

describe("fetchLlmsTxt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns content when llms.txt exists and has # heading", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "# LLMs.txt\n\nContent here.",
    } as Response);

    const { fetchLlmsTxt } = await import("./url-discover");
    const result = await fetchLlmsTxt("https://example.ai");

    expect(result).toContain("# LLMs.txt");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.ai/llms.txt",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("returns null when llms.txt returns 404", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    } as Response);

    const { fetchLlmsTxt } = await import("./url-discover");
    const result = await fetchLlmsTxt("https://example.ai");

    expect(result).toBeNull();
  });

  it("returns null when content has no # heading", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "Just plain text without markdown heading",
    } as Response);

    const { fetchLlmsTxt } = await import("./url-discover");
    const result = await fetchLlmsTxt("https://example.ai");

    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { fetchLlmsTxt } = await import("./url-discover");
    const result = await fetchLlmsTxt("https://example.ai");

    expect(result).toBeNull();
  });

  it("handles origin with trailing slash", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "# LLMs\n\nContent",
    } as Response);

    const { fetchLlmsTxt } = await import("./url-discover");
    const result = await fetchLlmsTxt("https://example.ai/");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://example.ai/llms.txt",
      expect.any(Object)
    );
    expect(result).toContain("# LLMs");
  });
});
