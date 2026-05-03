import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CrawlManager } from "./crawl-cache";
import type { FetchResultCache } from "./crawl-cache";
import fs from "fs/promises";
import path from "path";

const TEST_CACHE_DIR = ".cache/test-crawl";
const TEST_CACHE_FILE = path.join(TEST_CACHE_DIR, "crawl-cache.json");

describe("CrawlManager", () => {
  let manager: CrawlManager<FetchResultCache>;

  beforeEach(async () => {
    manager = new CrawlManager<FetchResultCache>(undefined, TEST_CACHE_DIR);
    await fs.rm(TEST_CACHE_DIR, { force: true, recursive: true });
  });

  afterEach(async () => {
    await fs.rm(TEST_CACHE_DIR, { force: true, recursive: true });
  });

  it("returns cached data on repeated calls within TTL", async () => {
    const url = "https://example.com";
    const data: FetchResultCache = { url, content: "test content" };

    const result1 = await manager.getOrCrawl(url, async () => data);
    expect(result1.content).toBe(data.content);

    const result2 = await manager.getOrCrawl(url, async () => {
      throw new Error("Fetcher should not be called for cached URL");
    });
    expect(result2.content).toBe(data.content);
  });

  it("deduplicates concurrent requests for the same URL", async () => {
    const url = "https://example.com";
    const data: FetchResultCache = { url, content: "test content" };
    let fetchCount = 0;

    const fetcher = async () => {
      fetchCount++;
      await new Promise<void>((r) => setTimeout(r, 50));
      return data;
    };

    const results = await Promise.all([
      manager.getOrCrawl(url, fetcher),
      manager.getOrCrawl(url, fetcher),
      manager.getOrCrawl(url, fetcher),
      manager.getOrCrawl(url, fetcher),
      manager.getOrCrawl(url, fetcher),
    ]);

    expect(fetchCount).toBe(1);
    results.forEach((r) => expect(r.content).toBe(data.content));
  });

  it("evicts expired entries after TTL", async () => {
    const url = "https://example.com";
    const data1: FetchResultCache = { url, content: "old content" };
    const data2: FetchResultCache = { url, content: "new content" };

    const expiredManager = new CrawlManager<FetchResultCache>(0, TEST_CACHE_DIR);

    const result1 = await expiredManager.getOrCrawl(url, async () => data1);
    expect(result1.content).toBe(data1.content);

    const result2 = await expiredManager.getOrCrawl(url, async () => data2);
    expect(result2.content).toBe(data2.content);
  });

  it("handles TTL=0 correctly (cache disabled)", async () => {
    const url = "https://example.com";
    let callCount = 0;
    const data: FetchResultCache = { url, content: "test" };

    const disabledManager = new CrawlManager<FetchResultCache>(0, TEST_CACHE_DIR);

    for (let i = 0; i < 3; i++) {
      await disabledManager.getOrCrawl(url, async () => {
        callCount++;
        return data;
      });
    }

    expect(callCount).toBe(3);
  });

  it("persists cache to disk and reloads", async () => {
    const url = "https://example.com";
    const data: FetchResultCache = { url, content: "test content" };

    await manager.getOrCrawl(url, async () => data);

    const newManager = new CrawlManager<FetchResultCache>(undefined, TEST_CACHE_DIR);
    const result = await newManager.getOrCrawl(url, async () => {
      throw new Error("Should not fetch - disk cache should exist");
    });
    expect(result.content).toBe(data.content);
  });

  it("handles corrupt disk cache gracefully", async () => {
    const url = "https://example.com";
    const data: FetchResultCache = { url, content: "test content" };

    await manager.getOrCrawl(url, async () => data);

    await fs.mkdir(TEST_CACHE_DIR, { recursive: true });
    await fs.writeFile(TEST_CACHE_FILE, "not valid json{{{", "utf-8");

    const newManager = new CrawlManager<FetchResultCache>(undefined, TEST_CACHE_DIR);
    const result = await newManager.getOrCrawl(url, async () => data);
    expect(result.content).toBe(data.content);
  });
});
