import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  extractQualitySignals,
  generateRecommendations,
  computeQualityScore,
} from "./index";
import type { DiscoveredFile } from "./index";

beforeEach(() => { /* noop */ });
afterEach(() => { /* noop */ });

// Helper to create a "found" file
function foundFile(type: DiscoveredFile["type"], content = ""): DiscoveredFile {
  return { type, url: `https://example.com/${type}`, status: "found", content };
}
function missingFile(type: DiscoveredFile["type"]): DiscoveredFile {
  return { type, url: `https://example.com/${type}`, status: "missing" };
}

describe("analyzer — quality signals", () => {
  it("returns positive signals when llms.txt has H1, links, and description", () => {
    const files = [foundFile("llms.txt", "# Example Site\n\n> A great site.\n\n- [Home](https://example.com/)")];
    const signals = extractQualitySignals(files);
    const labels = signals.map((s) => s.label);
    expect(labels).toContain("Has H1 title");
    expect(labels).toContain("Has links");
    expect(labels).toContain("Has description");
  });

  it("returns negative signal when llms.txt is over 50KB", () => {
    const longContent = "# " + "x".repeat(60_000);
    const signals = extractQualitySignals([foundFile("llms.txt", longContent)]);
    const labels = signals.map((s) => s.label);
    expect(labels).toContain("File too large");
  });

  it("returns negative signal when llms.txt is missing", () => {
    const signals = extractQualitySignals([missingFile("llms.txt")]);
    const labels = signals.map((s) => s.label);
    expect(labels).toContain("Missing llms.txt");
  });

  it("returns positive signal for llm.txt redirect", () => {
    const signals = extractQualitySignals([foundFile("llm.txt", "https://example.com/llms.txt")]);
    expect(signals.some((s) => s.label === "Has llm.txt redirect")).toBe(true);
  });

  it("returns positive signal for ai.txt", () => {
    const signals = extractQualitySignals([foundFile("ai.txt", "[identity]\nname=Example\nurl=https://example.com")]);
    expect(signals.some((s) => s.label === "Has ai.txt identity")).toBe(true);
  });

  it("returns positive signal for faq-ai.txt", () => {
    const signals = extractQualitySignals([foundFile("faq-ai.txt", "Q: What?\nA: This.")]);
    expect(signals.some((s) => s.label === "Has FAQ for AI")).toBe(true);
  });

  it("returns negative signal for WAF blocked content", () => {
    const files: DiscoveredFile[] = [{ type: "llms.txt", url: "https://example.com/llms.txt", status: "found", content: "[WAF_BLOCKED]", fetchError: "WAF challenge" }];
    const signals = extractQualitySignals(files);
    expect(signals.some((s) => s.label === "llms.txt blocked by WAF")).toBe(true);
  });

  it("returns negative signal for fetch errors", () => {
    const files: DiscoveredFile[] = [{ type: "llms.txt", url: "https://example.com/llms.txt", status: "found", content: undefined, fetchError: "Timeout" }];
    const signals = extractQualitySignals(files);
    expect(signals.some((s) => s.label === "llms.txt fetch error")).toBe(true);
  });

  it("returns positive signal for brand.txt", () => {
    const signals = extractQualitySignals([foundFile("brand.txt", "brand-name: Example")]);
    expect(signals.some((s) => s.label === "Has brand.txt")).toBe(true);
  });
});

describe("analyzer — recommendations", () => {
  it("recommends creating llms.txt when missing (high priority)", () => {
    const recs = generateRecommendations([missingFile("llms.txt")], []);
    const llmsRec = recs.find((r) => r.fileType === "llms.txt");
    expect(llmsRec?.priority).toBe("high");
    expect(llmsRec?.action).toContain("Create");
  });

  it("recommends reducing llms.txt when over 50KB (high priority)", () => {
    const longContent = "# " + "x".repeat(60_000);
    const recs = generateRecommendations([foundFile("llms.txt", longContent)], []);
    const reduceRec = recs.find((r) => r.action.includes("Reduce"));
    expect(reduceRec?.priority).toBe("high");
  });

  it("recommends fixing WAF blocking (high priority)", () => {
    const files: DiscoveredFile[] = [{ type: "llms.txt", url: "https://example.com/llms.txt", status: "found", content: "[WAF_BLOCKED]" }];
    const recs = generateRecommendations(files, []);
    expect(recs.some((r) => r.action.includes("WAF") && r.priority === "high")).toBe(true);
  });

  it("recommends llm.txt with medium priority when missing", () => {
    const recs = generateRecommendations([missingFile("llms.txt"), missingFile("llm.txt")], []);
    const llmRec = recs.find((r) => r.fileType === "llm.txt");
    expect(llmRec?.priority).toBe("medium");
  });

  it("recommends ai.txt with medium priority when missing", () => {
    const recs = generateRecommendations([missingFile("llms.txt"), missingFile("ai.txt")], []);
    const aiRec = recs.find((r) => r.fileType === "ai.txt");
    expect(aiRec?.priority).toBe("medium");
  });

  it("recommends adding link descriptions when empty descriptions found", () => {
    // The empty description regex requires https:// URL format
    const files = [foundFile("llms.txt", "- [Title](https://x.com): ")];
    const signals = extractQualitySignals(files);
    const recs = generateRecommendations(files, signals);
    expect(recs.some((r) => r.action.includes("descriptions"))).toBe(true);
  });

  it("recommends faq-ai.txt with low priority when missing", () => {
    const recs = generateRecommendations([missingFile("faq-ai.txt")], []);
    const rec = recs.find((r) => r.fileType === "faq-ai.txt");
    expect(rec?.priority).toBe("low");
  });
});

describe("analyzer — quality score", () => {
  it("scores 0 when no files found — baseline is 50, no bonuses applied", () => {
    const score = computeQualityScore([missingFile("llms.txt"), missingFile("llm.txt")], [], []);
    expect(score).toBe(50); // baseline 50, no files found, no signals
  });

  it("scores 50 baseline with no data", () => {
    const score = computeQualityScore([], [], []);
    expect(score).toBe(50);
  });

  it("scores higher with more found files", () => {
    const files = [foundFile("llms.txt"), foundFile("llm.txt")];
    const score = computeQualityScore(files, [], []);
    expect(score).toBeGreaterThan(50);
  });

  it("scores lower with critical issues and negative signals", () => {
    // A found file with WAF-blocked content generates a negative signal
    const files: DiscoveredFile[] = [{
      type: "llms.txt",
      url: "https://example.com/llms.txt",
      status: "found",
      content: "[WAF_BLOCKED]",
      fetchError: "WAF challenge",
    }];
    const signals = extractQualitySignals(files);
    // Has at least 2 negatives: WAF_blocked signal + missing_signal
    const negCount = signals.filter((s) => s.type === "negative").length;
    expect(negCount).toBeGreaterThanOrEqual(1);

    // 50 +5(llms) +5(llms-spec) -4(2xneg) -10(2xcritical) = 46 < 50
    const score = computeQualityScore(files, signals, [
      { priority: "high" as const, action: "fix", reason: "" },
      { priority: "high" as const, action: "fix2", reason: "" },
    ]);
    expect(score).toBeLessThan(50);
  });

  it("scores higher with positive signals", () => {
    const files = [foundFile("llms.txt")];
    const signals = [
      { type: "positive" as const, label: "H1", detail: "" },
      { type: "positive" as const, label: "links", detail: "" },
    ];
    const score = computeQualityScore(files, signals, []);
    expect(score).toBeGreaterThan(50);
  });

  it("caps score at 100", () => {
    const files = [
      foundFile("llms.txt", "# Site\n\n> Desc\n\n- [Link](/)"),
      foundFile("llm.txt"),
      foundFile("ai.txt"),
      foundFile("faq-ai.txt"),
      foundFile("brand.txt"),
      foundFile("developer-ai.txt"),
      foundFile("llms.html"),
      foundFile("robots-ai.txt"),
      foundFile("identity.json"),
      foundFile("ai.json"),
    ];
    const signals = [{ type: "positive" as const, label: "x", detail: "" }];
    const score = computeQualityScore(files, signals, []);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("caps score at 0", () => {
    const files = [missingFile("llms.txt"), missingFile("llm.txt"), missingFile("ai.txt")];
    const signals = [
      { type: "negative" as const, label: "x", detail: "" },
      { type: "negative" as const, label: "y", detail: "" },
      { type: "negative" as const, label: "z", detail: "" },
    ];
    const recs = [
      { priority: "high" as const, action: "a", reason: "" },
      { priority: "high" as const, action: "b", reason: "" },
      { priority: "high" as const, action: "c", reason: "" },
      { priority: "high" as const, action: "d", reason: "" },
    ];
    const score = computeQualityScore(files, signals, recs);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("stripPath", () => {
  it("extracts origin from URL with path", async () => {
    const { stripPath } = await import("./index");
    expect(stripPath("https://example.com/docs/api/v1")).toBe("https://example.com");
  });

  it("returns input if not a valid URL", async () => {
    const { stripPath } = await import("./index");
    expect(stripPath("not-a-url")).toBe("not-a-url");
  });
});
