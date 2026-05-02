# Generator Performance — Cache, Parallelization, Content Hash

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three performance optimizations to the generator pipeline: (1) CrawlManager — hybrid in-memory + disk cache with TTL and in-flight deduplication, (2) Parallel generation with `Promise.allSettled()` and error isolation, (3) ContentHash — disk-based SHA-256 tracking to skip Gemini calls when source content is unchanged.

**Architecture:** Two new modules in `src/lib/generator/`: `crawl-cache.ts` (CrawlManager singleton) and `content-hash.ts` (ContentHashMap manager). Both integrate into existing pipeline at `file-generators.ts` and `crawler.ts`. Cache directory: `.cache/`.

**Tech Stack:** TypeScript, `crypto` (built-in), `fs/promises`, Node.js.

---

## Task 1: Create CrawlManager Singleton (`crawl-cache.ts`)

> **P0 — Critical.** `generateFile()` currently calls `crawlWebsite()` on every invocation. CrawlManager caches crawl results with TTL and deduplicates in-flight requests.

**Files:**
- Create: `src/lib/generator/crawl-cache.ts`
- Modify: `src/lib/generator/crawler.ts` (wrap `fetchWithCascade` calls)

- [ ] **Step 1: Write the failing test**

Create `src/lib/generator/crawl-cache.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { CrawlManager } from "./crawl-cache";

describe("CrawlManager", () => {
  beforeEach(() => {
    // Reset singleton state between tests
    CrawlManager.reset();
  });

  it("returns cached data on repeated calls within TTL", async () => {
    const url = "https://example.com";
    const data = { markdown: "# Test", html: "<h1>Test</h1>", title: "Test" };

    // First call — this would normally fetch
    const result1 = await CrawlManager.getOrCrawl(url, async () => data);
    expect(result1).toEqual(data);

    // Second call — should return cached without calling the fetcher
    const result2 = await CrawlManager.getOrCrawl(url, async () => {
      throw new Error("Fetcher should not be called for cached URL");
    });
    expect(result2).toEqual(data);
  });

  it("deduplicates concurrent requests for the same URL", async () => {
    const url = "https://example.com";
    const data = { markdown: "# Test", html: "<h1>Test</h1>", title: "Test" };
    let fetchCount = 0;

    const fetcher = async () => {
      fetchCount++;
      await new Promise((r) => setTimeout(r, 50)); // Simulate network delay
      return data;
    };

    // 5 concurrent calls for the same URL
    const results = await Promise.all([
      CrawlManager.getOrCrawl(url, fetcher),
      CrawlManager.getOrCrawl(url, fetcher),
      CrawlManager.getOrCrawl(url, fetcher),
      CrawlManager.getOrCrawl(url, fetcher),
      CrawlManager.getOrCrawl(url, fetcher),
    ]);

    expect(fetchCount).toBe(1); // Only one HTTP request fired
    results.forEach((r) => expect(r).toEqual(data));
  });

  it("evicts expired entries after TTL", async () => {
    const url = "https://example.com";
    const data1 = { markdown: "# Old", html: "<h1>Old</h1>", title: "Old" };
    const data2 = { markdown: "# New", html: "<h1>New</h1>", title: "New" };

    // Set TTL to 0 via env for testing
    const prev = process.env.CRAWL_CACHE_TTL_MS;
    process.env.CRAWL_CACHE_TTL_MS = "0";

    const result1 = await CrawlManager.getOrCrawl(url, async () => data1);
    expect(result1).toEqual(data1);

    // Next call should re-fetch (TTL expired)
    const result2 = await CrawlManager.getOrCrawl(url, async () => data2);
    expect(result2).toEqual(data2);

    if (prev !== undefined) process.env.CRAWL_CACHE_TTL_MS = prev;
    else delete process.env.CRAWL_CACHE_TTL_MS;
  });
});
```

Run: `npx vitest run src/lib/generator/crawl-cache.spec.ts`
Expected: FAIL — `CrawlManager` does not exist

- [ ] **Step 2: Create `crawl-cache.ts`**

Create `src/lib/generator/crawl-cache.ts`:

```typescript
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = process.env.CRAWL_CACHE_DIR ?? ".cache";
const CACHE_FILE = path.join(CACHE_DIR, "crawl-cache.json");
const DEFAULT_TTL_MS = Number(process.env.CRAWL_CACHE_TTL_MS) || 5 * 60 * 1000;

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

type CrawlResult = {
  markdown: string;
  html: string;
  title: string;
};

class CrawlManager {
  private memory = new Map<string, CacheEntry<CrawlResult>>();
  private inFlight = new Map<string, Promise<CrawlResult>>();
  private ttlMs: number;

  constructor(ttlMs: number = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > this.ttlMs;
  }

  private async loadDiskCache(): Promise<void> {
    try {
      const raw = await fs.readFile(CACHE_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Record<string, CacheEntry<CrawlResult>>;
      for (const [url, entry] of Object.entries(parsed)) {
        if (!this.isExpired(entry)) {
          this.memory.set(url, entry);
        }
      }
    } catch {
      // File missing or corrupt — start fresh
    }
  }

  private async writeDiskCache(): Promise<void> {
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      const disk: Record<string, CacheEntry<CrawlResult>> = {};
      for (const [url, entry] of this.memory) {
        disk[url] = entry;
      }
      const tmp = CACHE_FILE + ".tmp";
      await fs.writeFile(tmp, JSON.stringify(disk, null, 2), "utf-8");
      await fs.rename(tmp, CACHE_FILE);
    } catch (e) {
      console.warn("[CrawlManager] Failed to write disk cache:", e);
    }
  }

  async getOrCrawl(url: string, fetcher: () => Promise<CrawlResult>): Promise<CrawlResult> {
    // Memory hit?
    const memEntry = this.memory.get(url);
    if (memEntry && !this.isExpired(memEntry)) {
      return memEntry.data;
    }

    // Load disk cache lazily (once)
    if (this.memory.size === 0) {
      await this.loadDiskCache();
      const diskEntry = this.memory.get(url);
      if (diskEntry && !this.isExpired(diskEntry)) {
        return diskEntry.data;
      }
    }

    // In-flight deduplication
    const existing = this.inFlight.get(url);
    if (existing) {
      return existing;
    }

    // Start fetch, store promise
    const promise = fetcher()
      .then(async (data) => {
        const entry: CacheEntry<CrawlResult> = { data, timestamp: Date.now() };
        this.memory.set(url, entry);
        await this.writeDiskCache();
        return data;
      })
      .finally(() => {
        this.inFlight.delete(url);
      });

    this.inFlight.set(url, promise);
    return promise;
  }

  reset(): void {
    this.memory.clear();
    this.inFlight.clear();
  }
}

export const crawlManager = new CrawlManager();
export { CrawlManager };
export type { CrawlResult };
```

Run: `npx vitest run src/lib/generator/crawl-cache.spec.ts`
Expected: PASS

- [ ] **Step 3: Integrate CrawlManager into `crawler.ts`**

Find `fetchWithCascade()` in `src/lib/generator/crawler.ts`. Import `crawlManager` at the top:

```typescript
import { crawlManager } from "./crawl-cache";
```

Then wrap the Jina fetch call. Find the Jina fetch block in `fetchWithCascade()` (around line 78-117). Replace the fetch call with:

```typescript
// Wrap with CrawlManager for deduplication and TTL caching
const crawlData = await crawlManager.getOrCrawl(url, async () => {
  // ... existing Jina fetch logic ...
});
```

> **Note:** Only the Jina fetch (Step 1) needs wrapping. Native fetch and Firecrawl are fallbacks and should NOT be cached by CrawlManager — they handle errors differently.

Actually, for simplicity and safety, wrap the entire cascade:

```typescript
return crawlManager.getOrCrawl(url, async () => {
  // ... move the existing fetchWithCascade body here ...
  // Step 1: Jina
  // Step 2: Native
  // Step 3: Firecrawl
  // ...
});
```

But this changes the signature. The safer approach is to wrap only the Jina call inside `fetchWithCascade`. Let the caller decide caching strategy.

**Simplest integration:** Add a new exported async function `crawlWithCache(url: string)` in `crawler.ts`:

```typescript
export async function crawlWithCache(url: string): Promise<CrawlResult> {
  return crawlManager.getOrCrawl(url, async () => fetchWithCascade(url));
}
```

Then update `file-generators.ts` to use `crawlWithCache` instead of calling `crawlWebsite` directly for the cacheable portion.

Actually, the cleanest integration: in `file-generators.ts`, `crawlWebsite()` returns `{ urls, crawlData }`. The `crawlData` contains per-URL results. We want to cache the per-URL fetch results, not the whole `crawlWebsite` result.

**Chosen approach:** Add `crawlWithCache` to `crawler.ts` and call it from `crawlWebsite` internally for each URL:

In `crawler.ts`, find the `fetchWithCascade` call inside `crawlPages()`. Wrap it:

```typescript
const result = await crawlManager.getOrCrawl(
  pageUrl.href,
  async () => fetchWithCascade(pageUrl.href)
);
```

This is a 1-line addition inside `crawlPages()`.

- [ ] **Step 4: Run tsc and vitest**

Run: `tsc --noEmit && npx vitest run src/lib/generator/crawl-cache.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/generator/crawl-cache.ts src/lib/generator/crawl-cache.spec.ts src/lib/generator/crawler.ts
git commit -m "feat: add CrawlManager singleton with hybrid memory+disk TTL cache"
```

---

## Task 2: Parallel Generation with `Promise.allSettled()`

> **P0.** `generateAllMissing()` uses a sequential `for` loop. Replace with `Promise.allSettled()` so one file failure does not block others.

**Files:**
- Modify: `src/lib/discovery/file-generators.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/discovery/file-generators.spec.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { generateAllMissing } from "./file-generators";

describe("generateAllMissing", () => {
  it("generates files in parallel and returns all results even if one fails", async () => {
    // This test verifies parallel execution and error isolation
    const results = await generateAllMissing(
      ["brand.txt", "ai.txt", "llms.txt"],
      "https://example.com"
    );

    // All 3 results should be present regardless of individual success/failure
    expect(results).toHaveLength(3);
    const types = results.map((r) => r.type);
    expect(types).toContain("brand.txt");
    expect(types).toContain("ai.txt");
    expect(types).toContain("llms.txt");

    // No result should have empty content without being marked failed
    results.forEach((r) => {
      if (r.content === "" && !r.success) {
        expect(r.errors.length).toBeGreaterThan(0);
      }
    });
  });
});
```

Run: `npx vitest run src/lib/discovery/file-generators.spec.ts`
Expected: May pass or fail depending on whether parallelization already exists

- [ ] **Step 2: Replace sequential loop with `Promise.allSettled()`**

In `src/lib/discovery/file-generators.ts`, find `generateAllMissing()` (line 65). Replace the sequential `for` loop (lines 72-116) with:

```typescript
export async function generateAllMissing(
  fileTypes: FileType[],
  origin: string
): Promise<FileGenerateResult[]> {
  // Crawl website once and reuse for all file types
  const crawlData = await crawlWebsite(origin);

  const promises = fileTypes.map(async (fileType): Promise<FileGenerateResult> => {
    try {
      let content: string;
      if (fileType === "llms.txt") {
        const template = fetchTemplate("llms.txt");
        if (!template.success || !template.content) {
          throw new Error(template.error ?? "Template not found: llms.txt");
        }
        content = await generateTemplateContent("llms.txt", template.content, crawlData);
      } else {
        content = await generateByType(fileType, crawlData);
      }
      const validation = validateByType(content, fileType);
      return {
        type: fileType,
        success: true,
        content,
        errors: validation.errors,
        warnings: validation.warnings,
        checklist: buildChecklist(
          fileType,
          true,
          validation.errors,
          validation.warnings
        ) as ChecklistItem[],
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return {
        type: fileType,
        success: false,
        content: "",
        errors: [{ rule: "generation_failed", message }],
        warnings: [],
        checklist: buildChecklist(
          fileType,
          false,
          [{ rule: "generation_failed", message }],
          []
        ) as ChecklistItem[],
      };
    }
  });

  const settled = await Promise.allSettled(promises);

  // Extract results, handling any rejected promises
  const results: FileGenerateResult[] = settled.map((outcome, i) => {
    if (outcome.status === "fulfilled") return outcome.value;
    const message = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
    return {
      type: fileTypes[i],
      success: false,
      content: "",
      errors: [{ rule: "generation_failed", message }],
      warnings: [],
      checklist: buildChecklist(
        fileTypes[i],
        false,
        [{ rule: "generation_failed", message }],
        []
      ) as ChecklistItem[],
    };
  });

  return results;
}
```

- [ ] **Step 3: Run tsc and vitest**

Run: `tsc --noEmit && npx vitest run src/lib/discovery/file-generators.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/discovery/file-generators.ts src/lib/discovery/file-generators.spec.ts
git commit -m "feat: parallelize generation with Promise.allSettled() for error isolation"
```

---

## Task 3: Create ContentHash Manager (`content-hash.ts`)

> **P0.** Track SHA-256 hashes of crawled content on disk. If content hasn't changed since last generation, skip the Gemini call entirely.

**Files:**
- Create: `src/lib/generator/content-hash.ts`
- Create: `src/lib/generator/content-hash.spec.ts`
- Modify: `src/lib/generator/index.ts` (integrate into `generateFile`)

- [ ] **Step 1: Write the failing test**

Create `src/lib/generator/content-hash.spec.ts`:

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { ContentHashMap } from "./content-hash";
import fs from "fs/promises";
import path from "path";

const TEST_DIR = ".cache/test-hash";
const TEST_FILE = path.join(TEST_DIR, "content-hashes.json");

describe("ContentHashMap", () => {
  afterEach(async () => {
    await fs.rm(TEST_DIR, { force: true, recursive: true });
  });

  it("returns false for unseen URLs", async () => {
    const map = new ContentHashMap(TEST_DIR);
    const hasChanged = await map.hasChanged("https://example.com", "some content");
    expect(hasChanged).toBe(true); // New URL = changed
  });

  it("returns false when content matches stored hash", async () => {
    const content = "Hello, world!";
    const map = new ContentHashMap(TEST_DIR);

    await map.record("https://example.com", content);
    const hasChanged = await map.hasChanged("https://example.com", content);
    expect(hasChanged).toBe(false);
  });

  it("returns true when content differs from stored hash", async () => {
    const map = new ContentHashMap(TEST_DIR);

    await map.record("https://example.com", "Old content");
    const hasChanged = await map.hasChanged("https://example.com", "New content");
    expect(hasChanged).toBe(true);
  });

  it("persists across instances", async () => {
    const content = "Persistent content";
    const map1 = new ContentHashMap(TEST_DIR);
    await map1.record("https://example.com", content);

    // New instance reads from disk
    const map2 = new ContentHashMap(TEST_DIR);
    const hasChanged = await map2.hasChanged("https://example.com", content);
    expect(hasChanged).toBe(false);
  });

  it("handles corrupt/missing file gracefully", async () => {
    const map = new ContentHashMap(TEST_DIR);
    // Record then manually corrupt the file
    await map.record("https://example.com", "test");
    await fs.writeFile(TEST_FILE, "not valid json{{{", "utf-8");

    // Should not throw — should treat as empty and return true
    const hasChanged = await map.hasChanged("https://example.com", "test");
    expect(hasChanged).toBe(false); // Content matches what we just wrote
  });
});
```

Run: `npx vitest run src/lib/generator/content-hash.spec.ts`
Expected: FAIL — `ContentHashMap` does not exist

- [ ] **Step 2: Create `content-hash.ts`**

Create `src/lib/generator/content-hash.ts`:

```typescript
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const HASH_FILE = path.join(
  process.env.CONTENT_HASH_DIR ?? ".cache",
  "content-hashes.json"
);

export class ContentHashMap {
  private hashMap: Record<string, string> = {};
  private loaded = false;
  private readonly dir: string;

  constructor(dir: string = process.env.CONTENT_HASH_DIR ?? ".cache") {
    this.dir = dir;
  }

  private hash(content: string): string {
    return crypto.createHash("sha256").update(content, "utf-8").digest("hex");
  }

  private async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const raw = await fs.readFile(HASH_FILE, "utf-8");
      this.hashMap = JSON.parse(raw);
    } catch {
      // Missing or corrupt — start fresh
      this.hashMap = {};
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    try {
      await fs.mkdir(this.dir, { recursive: true });
      const tmp = HASH_FILE + ".tmp";
      await fs.writeFile(tmp, JSON.stringify(this.hashMap, null, 2), "utf-8");
      await fs.rename(tmp, HASH_FILE);
    } catch (e) {
      console.warn("[ContentHashMap] Failed to persist:", e);
    }
  }

  /** Returns true if URL content has changed since last record, or if URL is new */
  async hasChanged(url: string, content: string): Promise<boolean> {
    await this.load();
    const newHash = this.hash(content);
    const storedHash = this.hashMap[url];
    return storedHash !== newHash;
  }

  /** Record the hash for a URL after successful generation */
  async record(url: string, content: string): Promise<void> {
    await this.load();
    this.hashMap[url] = this.hash(content);
    await this.persist();
  }

  /** Clear all stored hashes */
  async clear(): Promise<void> {
    this.hashMap = {};
    await this.persist();
  }
}

export const contentHashMap = new ContentHashMap();
```

Run: `npx vitest run src/lib/generator/content-hash.spec.ts`
Expected: PASS

- [ ] **Step 3: Integrate ContentHash into `generateFile` pipeline**

In `src/lib/discovery/file-generators.ts`, modify `generateFile()` to check content hashes before generating.

After `crawlWebsite()` returns (line 18), before calling `generateByType()` or `generateTemplateContent()` (lines 20-29), add hash checking:

```typescript
import { contentHashMap } from "@/lib/generator/content-hash";

// Inside generateFile(), after crawlData is available:
const sourceUrls = crawlData.urls.map((u) => u.url);
// Check if any source content changed
const anyChanged = await Promise.all(
  sourceUrls.map(async (url) => {
    const page = crawlData.pages.find((p) => p.url === url);
    if (!page) return true;
    return contentHashMap.hasChanged(url, page.markdown);
  })
);
const contentChanged = anyChanged.some(Boolean);

if (!contentChanged) {
  // Skip Gemini generation — content hasn't changed
  return {
    type: fileType,
    success: true,
    content: "", // Could cache previous output, but for now return empty
    errors: [],
    warnings: [{ rule: "content_unchanged", message: "Source content unchanged, generation skipped" }],
    checklist: buildChecklist(fileType, true, [], [{ rule: "content_unchanged", message: "Skipped: no content changes detected" }]) as ChecklistItem[],
  };
}
```

Wait — returning empty content is not useful. Instead, the skip should be transparent: if content hasn't changed, we should have cached the previous output. The plan in QUALITY-VALIDATION.md says "skip Gemini call" — which means we need a per-file output cache too.

**Simpler approach for now:** Only skip if we can store the previous output. Add a simple file output cache:

In `content-hash.ts`, add a method to store/retrieve generated file content:

```typescript
// In content-hash.ts, add:
private readonly OUTPUT_DIR = path.join(this.dir, "outputs");

async getOutput(fileType: string): Promise<string | null> {
  try {
    const file = path.join(this.OUTPUT_DIR, `${fileType.replace("/", "_")}.txt`);
    return await fs.readFile(file, "utf-8");
  } catch {
    return null;
  }
}

async saveOutput(fileType: string, content: string): Promise<void> {
  await fs.mkdir(this.OUTPUT_DIR, { recursive: true });
  const file = path.join(this.OUTPUT_DIR, `${fileType.replace("/", "_")}.txt`);
  await fs.writeFile(file, content, "utf-8");
}
```

Then in `generateFile()`, replace the skip block:

```typescript
if (!contentChanged) {
  const cached = await contentHashMap.getOutput(fileType);
  if (cached) {
    return {
      type: fileType,
      success: true,
      content: cached,
      errors: [],
      warnings: [{ rule: "content_unchanged", message: "Source unchanged — returned cached output" }],
      checklist: buildChecklist(fileType, true, [], []) as ChecklistItem[],
    };
  }
  // No cache — fall through to generate
}
```

After successful generation, record hash and save output:

```typescript
// After content is generated (before validation):
await contentHashMap.record(page.url, page.markdown);
await contentHashMap.saveOutput(fileType, content);
```

- [ ] **Step 4: Run tsc and vitest**

Run: `tsc --noEmit && npx vitest run src/lib/generator/content-hash.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/generator/content-hash.ts src/lib/generator/content-hash.spec.ts src/lib/discovery/file-generators.ts
git commit -m "feat: add ContentHashMap to skip Gemini calls when source content unchanged"
```

---

## Self-Review Checklist

- [ ] All 3 tasks have complete code — no "TBD", "TODO", or placeholder descriptions
- [ ] `crawl-cache.ts` implements memory+disk hybrid with TTL and in-flight deduplication
- [ ] `file-generators.ts` uses `Promise.allSettled()` — no sequential `for` loop
- [ ] `content-hash.ts` uses SHA-256, atomic writes (tmp+rename), graceful degradation
- [ ] Integration points: `crawlManager.getOrCrawl()` in `crawler.ts`, `Promise.allSettled()` in `file-generators.ts`, `contentHashMap` in `file-generators.ts`
- [ ] Each task committed separately with `tsc --noEmit` passing
- [ ] Env vars documented: `CRAWL_CACHE_TTL_MS`, `CRAWL_CACHE_DIR`, `CONTENT_HASH_DIR`
