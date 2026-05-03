import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { ContentHashMap } from "./content-hash";
import fs from "fs/promises";
import path from "path";

const TEST_DIR = ".cache/test-hash";

describe("ContentHashMap", () => {
  let hashMap: ContentHashMap;

  beforeEach(() => {
    hashMap = new ContentHashMap(TEST_DIR);
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { force: true, recursive: true });
  });

  it("returns true for unseen URLs", async () => {
    const hasChanged = await hashMap.hasChanged("https://example.com", "content");
    expect(hasChanged).toBe(true);
  });

  it("returns false when content matches stored hash", async () => {
    const content = "Hello, world!";
    await hashMap.record("https://example.com", content);
    const hasChanged = await hashMap.hasChanged("https://example.com", content);
    expect(hasChanged).toBe(false);
  });

  it("returns true when content differs from stored hash", async () => {
    await hashMap.record("https://example.com", "Old content");
    const hasChanged = await hashMap.hasChanged("https://example.com", "New content");
    expect(hasChanged).toBe(true);
  });

  it("persists across instances", async () => {
    const content = "Persistent content";
    await hashMap.record("https://example.com", content);

    const map2 = new ContentHashMap(TEST_DIR);
    const hasChanged = await map2.hasChanged("https://example.com", content);
    expect(hasChanged).toBe(false);
  });

  it("handles corrupt file gracefully", async () => {
    await hashMap.record("https://example.com", "test");
    const hashFile = path.join(TEST_DIR, "content-hashes.json");
    await fs.writeFile(hashFile, "not valid json{{{", "utf-8");

    const hasChanged = await hashMap.hasChanged("https://example.com", "test");
    expect(hasChanged).toBe(false);
  });

  it("uses instance dir for hash file", async () => {
    const customDir = ".cache/custom-hash";
    const map = new ContentHashMap(customDir);
    await map.record("https://example.com", "content");

    const hashFile = path.join(customDir, "content-hashes.json");
    const exists = await fs.access(hashFile).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    await fs.rm(customDir, { force: true, recursive: true });
  });

  it("stores and retrieves generated output", async () => {
    const fileType = "brand.txt";
    const content = "# Brand Content";

    await hashMap.saveOutput(fileType, content);
    const cached = await hashMap.getOutput(fileType);
    expect(cached).toBe(content);
  });

  it("returns null for non-existent output", async () => {
    const cached = await hashMap.getOutput("nonexistent.txt");
    expect(cached).toBeNull();
  });

  it("handles special characters in file type", async () => {
    const fileType = "ai.txt";
    const content = "# AI Content";

    await hashMap.saveOutput(fileType, content);
    const cached = await hashMap.getOutput(fileType);
    expect(cached).toBe(content);
  });
});
