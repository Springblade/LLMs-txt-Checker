import fs from "fs/promises";
import path from "path";

const CACHE_DIR = process.env.CRAWL_CACHE_DIR ?? ".cache";

function getDefaultTtlMs(): number {
  return parseInt(process.env.CRAWL_CACHE_TTL_MS ?? "", 10) || 3 * 24 * 60 * 60 * 1000;
}

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class CrawlManager<T> {
  private memory = new Map<string, CacheEntry<T>>();
  private inFlight = new Map<string, Promise<T>>();
  private diskLoaded = false;
  private readonly ttlMs: number;
  private readonly cacheDir: string;
  private readonly cacheFile: string;
  private contentHashes = new Map<string, { url: string; timestamp: number }>();

  constructor(ttlMs?: number, cacheDir?: string) {
    this.ttlMs = ttlMs ?? getDefaultTtlMs();
    this.cacheDir = cacheDir ?? CACHE_DIR;
    this.cacheFile = path.join(this.cacheDir, "crawl-cache.json");
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    if (this.ttlMs === 0) return true;
    return Date.now() - entry.timestamp > this.ttlMs;
  }

  private hashContent(content: string): string {
    // FNV-1a — fast non-crypto hash with good distribution for content dedup
    let hash = 2166136261;
    for (let i = 0; i < content.length; i++) {
      hash ^= content.charCodeAt(i);
      hash = (hash * 16777619) & 0xffffffff;
    }
    return (hash >>> 0).toString(36);
  }

  private evictStaleHashes(): void {
    if (this.ttlMs === 0) return;
    const now = Date.now();
    for (const [h, entry] of this.contentHashes) {
      if (now - entry.timestamp > this.ttlMs) {
        this.contentHashes.delete(h);
      }
    }
  }

  private async loadDiskCache(): Promise<void> {
    if (this.diskLoaded) return;
    try {
      const raw = await fs.readFile(this.cacheFile, "utf-8");
      const parsed = JSON.parse(raw) as Record<string, CacheEntry<T>>;
      for (const [url, entry] of Object.entries(parsed)) {
        if (!this.isExpired(entry)) {
          this.memory.set(url, entry);
        }
      }
    } catch {
      // File missing or corrupt — start fresh
    }
    this.diskLoaded = true;
  }

  private async writeDiskCache(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      const disk: Record<string, CacheEntry<T>> = {};
      for (const [url, entry] of this.memory) {
        disk[url] = entry;
      }
      await fs.writeFile(this.cacheFile, JSON.stringify(disk, null, 2), "utf-8");
    } catch (e) {
      console.warn("[CrawlManager] Failed to write disk cache:", e);
    }
  }

  async getOrCrawl(url: string, fetcher: () => Promise<T>): Promise<T> {
    // Memory hit?
    const memEntry = this.memory.get(url);
    if (memEntry && !this.isExpired(memEntry)) {
      return memEntry.data;
    }

    // Load disk cache lazily (once)
    await this.loadDiskCache();
    const diskEntry = this.memory.get(url);
    if (diskEntry && !this.isExpired(diskEntry)) {
      return diskEntry.data;
    }

    // In-flight deduplication
    const existing = this.inFlight.get(url);
    if (existing) {
      return existing;
    }

    // Start fetch, store promise
    const promise = fetcher()
      .then(async (data) => {
        const entry: CacheEntry<T> = { data, timestamp: Date.now() };
        this.memory.set(url, entry);

        if (typeof data === "object" && data !== null && "content" in data) {
          const content = String((data as Record<string, unknown>)["content"]);
          if (content) {
            const hash = this.hashContent(content);
            const existingEntry = this.contentHashes.get(hash);
            if (existingEntry && existingEntry.url !== url) {
              const existingData = this.memory.get(existingEntry.url);
              if (existingData) {
                this.memory.set(url, existingData);
              }
            } else {
              this.contentHashes.set(hash, { url, timestamp: Date.now() });
            }
            this.evictStaleHashes();
          }
        }

        await this.writeDiskCache();
        return data;
      })
      .finally(() => {
        this.inFlight.delete(url);
      });

    this.inFlight.set(url, promise);
    return promise;
  }

  async clearCache(): Promise<void> {
    this.memory.clear();
    this.diskLoaded = true;
    try {
      await fs.rm(this.cacheFile, { force: true });
    } catch {
      // Ignore
    }
  }

  static getInstance(): CrawlManager<unknown> {
    return getCrawlManager();
  }

  getTtlMs(): number {
    return this.ttlMs;
  }
}

// Singleton instance - typed as CrawlManager<unknown> since we're caching FetchResult
type FetchResultCache = {
  url: string;
  content?: string;
  error?: string;
  provider?: string | null;
};

let _instance: CrawlManager<FetchResultCache> | null = null;

function getCrawlManager(): CrawlManager<FetchResultCache> {
  if (!_instance) {
    _instance = new CrawlManager<FetchResultCache>();
  }
  return _instance;
}

// Export the singleton instance
const crawlManager = getCrawlManager();

export { CrawlManager, crawlManager, getCrawlManager };
export type { FetchResultCache };
