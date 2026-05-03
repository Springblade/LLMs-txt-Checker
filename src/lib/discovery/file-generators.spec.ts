import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CrawledData } from "./types";

// Mock dependencies
vi.mock("@/lib/generator", () => ({
  crawlWebsite: vi.fn().mockResolvedValue({
    siteName: "Test Site",
    origin: "https://example.com",
    pages: [
      {
        url: "https://example.com",
        title: "Home",
        description: "Test page",
        category: "homepage" as const,
        score: 10,
        markdown: "# Test",
        needsAi: true,
      },
    ],
    llmsTxtContent: null,
  }),
}));

vi.mock("@/lib/generator/ai-generators", () => ({
  generateByType: vi.fn().mockResolvedValue("# Generated content"),
}));

vi.mock("@/lib/generator/gemini-template-filler", () => ({
  generateTemplateContent: vi.fn().mockResolvedValue("# Generated template content"),
}));

vi.mock("@/lib/discovery/template-fetcher", () => ({
  fetchTemplate: vi.fn().mockReturnValue({ success: true, content: "# Template" }),
}));

vi.mock("@/lib/ai-discovery-scanner", () => ({
  validateByType: vi.fn().mockReturnValue({ errors: [], warnings: [] }),
  buildChecklist: vi.fn().mockReturnValue([]),
}));

vi.mock("@/lib/generator/content-hash", () => ({
  contentHashMap: {
    hasChanged: vi.fn().mockResolvedValue(true),
    record: vi.fn().mockResolvedValue(undefined),
    getOutput: vi.fn().mockResolvedValue(null),
    saveOutput: vi.fn().mockResolvedValue(undefined),
  },
}));

// Import after mocks
import { generateAllMissing } from "./file-generators";
import { contentHashMap } from "@/lib/generator/content-hash";

describe("generateAllMissing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(contentHashMap.hasChanged).mockResolvedValue(true);
    vi.mocked(contentHashMap.getOutput).mockResolvedValue(null);
  });

  it("returns all results even if one generation fails", async () => {
    const results = await generateAllMissing(["brand.txt", "ai.txt"], "https://example.com");

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.type)).toContain("brand.txt");
    expect(results.map((r) => r.type)).toContain("ai.txt");
  });

  it("returns results in same order as input", async () => {
    const results = await generateAllMissing(
      ["brand.txt", "ai.txt", "llms.txt"],
      "https://example.com"
    );

    expect(results[0]!.type).toBe("brand.txt");
    expect(results[1]!.type).toBe("ai.txt");
    expect(results[2]!.type).toBe("llms.txt");
  });

  it("records content hashes for all pages", async () => {
    await generateAllMissing(["brand.txt"], "https://example.com");

    expect(contentHashMap.record).toHaveBeenCalled();
  });

  it("saves output after successful generation", async () => {
    await generateAllMissing(["brand.txt"], "https://example.com");

    expect(contentHashMap.saveOutput).toHaveBeenCalledWith(
      "brand.txt",
      expect.any(String)
    );
  });
});
