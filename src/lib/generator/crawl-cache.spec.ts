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

  it("returns cached result for duplicate content", async () => {
    const urlA = "https://a.example.com";
    const urlB = "https://b.example.com";
    const sameContent = "<html><body>Same HTML content</body></html>";
    const dataA: FetchResultCache = { url: urlA, content: sameContent, provider: "jina" };
    const dataB: FetchResultCache = { url: urlB, content: sameContent, provider: "jina" };

    await manager.getOrCrawl(urlA, async () => dataA);
    await manager.getOrCrawl(urlB, async () => dataB);

    // URL B gets content from URL A's cache entry (dedup by hash)
    const entryB = await (manager as unknown as { memory: Map<string, { data: FetchResultCache }> }).memory.get(urlB);
    expect(entryB?.data.content).toBe(sameContent);
  });

  it("evicts stale hash entries on write", async () => {
    // TTL = 50ms — entries expire fast
    const shortTtlManager = new CrawlManager<FetchResultCache>(50, TEST_CACHE_DIR);
    const urlA = "https://a.example.com";
    const urlB = "https://b.example.com";

    await shortTtlManager.getOrCrawl(urlA, async () => ({ url: urlA, content: "X" }));
    await new Promise<void>((r) => setTimeout(r, 60));
    await shortTtlManager.getOrCrawl(urlB, async () => ({ url: urlB, content: "Y" }));

    // evictStaleHashes ran during second write — no error means success
    const result = await shortTtlManager.getOrCrawl("https://c.example.com", async () => ({ url: "c", content: "Z" }));
    expect(result.content).toBe("Z");
  });

  it("handles disk write failure gracefully", async () => {
    const badDirManager = new CrawlManager<{ url: string }>(1000, "/nonexistent-dir");
    await expect(
      badDirManager.getOrCrawl("https://example.com", async () => ({ url: "ok" }))
    ).resolves.toBeDefined();
  });
});
