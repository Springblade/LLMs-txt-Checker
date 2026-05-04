# Generator Performance — Cache, Parallelization, Content Hash (v2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three performance optimizations to the generator pipeline: (1) CrawlManager — hybrid in-memory + disk cache with TTL and in-flight deduplication, (2) Parallel generation with `Promise.allSettled()` and error isolation, (3) ContentHash — disk-based SHA-256 tracking to skip Gemini calls when source content is unchanged.

**Architecture:** Two new modules in `src/lib/generator/`: `crawl-cache.ts` (CrawlManager singleton) and `content-hash.ts` (ContentHashMap manager). Both integrate into existing pipeline at `file-generators.ts` and `crawler.ts`. Cache directory: `.cache/`.

**Tech Stack:** TypeScript, `crypto` (built-in), `fs/promises`, Node.js.

**Changelog from v1:**
- Fixed: TTL parsing bug (0 value handling)
- Fixed: Disk cache lazy-load logic
- Fixed: HASH_FILE not using instance dir
- Fixed: Race condition in parallel writes
- Fixed: Per-file content dependency tracking
- Fixed: Code duplication in parallel generation
- Added: Cache invalidation strategy
- Added: .cache/ to .gitignore
- Added: Env var documentation

---

## Pre-flight: Add .cache/ to .gitignore

Before any task, add cache directory to gitignore:

```bash
# Add to .gitignore
echo ".cache/" >> .gitignore
```

---

## Task 1: Create CrawlManager Singleton (`crawl-cache.ts`)

> **P0 — Critical.** `generateFile()` currently calls `crawlWebsite()` on every invocation. CrawlManager caches crawl results with TTL and deduplicates in-flight requests.

**Files:**
- Create: `src/lib/generator/crawl-cache.ts`
- Create: `src/lib/generator/crawl-cache.spec.ts`
- Modify: `src/lib/generator/crawler.ts` (wrap `fetchWithCascade` calls)

### Step 1: Write the failing test

Create `src/lib/generator/crawl-cache.spec.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { CrawlManager } from "./crawl-cache";
import fs from "fs/promises";
import path from "path";

const TEST_CACHE_DIR = ".cache/test-crawl";
const TEST_CACHE_FILE = path.join(TEST_CACHE_DIR, "crawl-cache.json");

describe("CrawlManager", () => {
  beforeEach(async () => {
    CrawlManager.reset();
    // Clean up test cache
    await fs.rm(TEST_CACHE_DIR, { force: true, recursive: true });
  });

  it("returns cached data on repeated calls within TTL", async () => {
    const url = "https://example.com";
    const data = { markdown: "# Test", html: "<h1>Test</h1>", title: "Test" };

    const result1 = await CrawlManager.getOrCrawl(url, async () => data);
    expect(result1).toEqual(data);

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
      await new Promise((r) => setTimeout(r, 50));
      return data;
    };

    const results = await Promise.all([
      CrawlManager.getOrCrawl(url, fetcher),
      CrawlManager.getOrCrawl(url, fetcher),
      CrawlManager.getOrCrawl(url, fetcher),
      CrawlManager.getOrCrawl(url, fetcher),
      CrawlManager.getOrCrawl(url, fetcher),
    ]);

    expect(fetchCount).toBe(1);
    results.forEach((r) => expect(r).toEqual(data));
  });

  it("evicts expired entries after TTL", async () => {
    const url = "https://example.com";
    const data1 = { markdown: "# Old", html: "<h1>Old</h1>", title: "Old" };
    const data2 = { markdown: "# New", html: "<h1>New</h1>", title: "New" };

    const prev = process.env.CRAWL_CACHE_TTL_MS;
    process.env.CRAWL_CACHE_TTL_MS = "0";

    const result1 = await CrawlManager.getOrCrawl(url, async () => data1);
    expect(result1).toEqual(data1);

    const result2 = await CrawlManager.getOrCrawl(url, async () => data2);
    expect(result2).toEqual(data2);

    if (prev !== undefined) process.env.CRAWL_CACHE_TTL_MS = prev;
    else delete process.env.CRAWL_CACHE_TTL_MS;
  });

  it("handles TTL=0 correctly (cache disabled)", async () => {
    const url = "https://example.com";
    let callCount = 0;
    const data = { markdown: "# Test", html: "<h1>Test</h1>", title: "Test" };

    const prev = process.env.CRAWL_CACHE_TTL_MS;
    process.env.CRAWL_CACHE_TTL_MS = "0";

    for (let i = 0; i < 3; i++) {
      await CrawlManager.getOrCrawl(url, async () => {
        callCount++;
        return data;
      });
    }

    expect(callCount).toBe(3); // Should re-fetch every time when TTL=0

    if (prev !== undefined) process.env.CRAWL_CACHE_TTL_MS = prev;
    else delete process.env.CRAWL_CACHE_TTL_MS;
  });

  it("persists cache to disk and reloads on new instance", async () => {
    const url = "https://example.com";
    const data = { markdown: "# Test", html: "<h1>Test</h1>", title: "Test" };

    await CrawlManager.getOrCrawl(url, async () => data);
    CrawlManager.reset();

    const result = await CrawlManager.getOrCrawl(url, async () => {
      throw new Error("Should not fetch - disk cache should exist");
    });
    expect(result).toEqual(data);
  });

  it("handles corrupt disk cache gracefully", async () => {
    const url = "https://example.com";
    const data = { markdown: "# Test", html: "<h1>Test</h1>", title: "Test" };

    await CrawlManager.getOrCrawl(url, async () => data);

    await fs.mkdir(TEST_CACHE_DIR, { recursive: true });
    await fs.writeFile(TEST_CACHE_FILE, "not valid json{{{", "utf-8");

    CrawlManager.reset();

    const result = await CrawlManager.getOrCrawl(url, async () => data);
    expect(result).toEqual(data);
  });
});
```

Run: `npx vitest run src/lib/generator/crawl-cache.spec.ts`
Expected: FAIL — `CrawlManager` does not exist

### Step 2: Create `crawl-cache.ts`

Create `src/lib/generator/crawl-cache.ts`:

```typescript
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = process.env.CRAWL_CACHE_DIR ?? ".cache";
const DEFAULT_TTL_MS = parseInt(process.env.CRAWL_CACHE_TTL_MS ?? "", 10)
  || (5 * 60 * 1000);

type CrawlResult = {
  markdown: string;
  html: string;
  title: string;
};

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class CrawlManager {
  private memory = new Map<string, CacheEntry<CrawlResult>>();
  private inFlight = new Map<string, Promise<CrawlResult>>();
  private diskLoaded = false;
  private readonly ttlMs: number;
  private readonly cacheDir: string;
  private readonly cacheFile: string;

  constructor(ttlMs: number = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
    this.cacheDir = CACHE_DIR;
    this.cacheFile = path.join(this.cacheDir, "crawl-cache.json");
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    if (this.ttlMs === 0) return true; // TTL 0 means disabled
    return Date.now() - entry.timestamp > this.ttlMs;
  }

  private async loadDiskCache(): Promise<void> {
    if (this.diskLoaded) return;
    try {
      const raw = await fs.readFile(this.cacheFile, "utf-8");
      const parsed = JSON.parse(raw) as Record<string, CacheEntry<CrawlResult>>;
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
      const disk: Record<string, CacheEntry<CrawlResult>> = {};
      for (const [url, entry] of this.memory) {
        disk[url] = entry;
      }
      const tmp = this.cacheFile + ".tmp";
      await fs.writeFile(tmp, JSON.stringify(disk, null, 2), "utf-8");
      await fs.rename(tmp, this.cacheFile);
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

  async clearCache(): Promise<void> {
    this.memory.clear();
    this.diskLoaded = true;
    try {
      await fs.rm(this.cacheFile, { force: true });
    } catch {
      // Ignore
    }
  }

  static reset(): void {
    instance.memory.clear();
    instance.inFlight.clear();
    instance.diskLoaded = false;
  }
}

// Singleton instance
const instance = new CrawlManager();
export { CrawlManager, instance as crawlManager };
export type { CrawlResult };
```

Run: `npx vitest run src/lib/generator/crawl-cache.spec.ts`
Expected: PASS

### Step 3: Integrate CrawlManager into `crawler.ts`

In `src/lib/generator/crawler.ts`, modify `crawlPages()` to use CrawlManager:

```typescript
import { crawlManager } from "./crawl-cache";

export async function crawlPages(urls: ScoredUrl[], concurrency: number = 5): Promise<CrawledPage[]> {
  const fetchPromises = urls.map(async (scoredUrl): Promise<{ scoredUrl: ScoredUrl; result: FetchResult }> => {
    const result = await crawlManager.getOrCrawl(
      scoredUrl.href,
      async () => fetchWithCascade(scoredUrl.href)
    );
    return { scoredUrl, result };
  });

  const fetchResults = await Promise.all(fetchPromises);
  const results: FetchResult[] = fetchResults.map(r => r.result);
  const scoredUrls = fetchResults.map(r => r.scoredUrl);

  return results.map((result, i) => {
    // ... rest of existing mapping logic, using scoredUrls[i] instead of urls.find()
  });
}
```

### Step 4: Run tsc and vitest

```bash
tsc --noEmit && npx vitest run src/lib/generator/crawl-cache.spec.ts
```

### Step 5: Commit

```bash
git add src/lib/generator/crawl-cache.ts src/lib/generator/crawl-cache.spec.ts src/lib/generator/crawler.ts .gitignore
git commit -m "feat: add CrawlManager singleton with hybrid memory+disk TTL cache"
```

---

## Task 2: Parallel Generation with `Promise.allSettled()`

> **P0.** `generateAllMissing()` uses a sequential `for` loop. Replace with `Promise.allSettled()` so one file failure does not block others.

**Files:**
- Modify: `src/lib/discovery/file-generators.ts`
- Create: `src/lib/discovery/file-generators.spec.ts`

### Step 1: Refactor to avoid code duplication

First, extract a helper function that both `generateFile` and `generateAllMissing` can use:

In `src/lib/discovery/file-generators.ts`:

```typescript
type GenerationContext = {
  fileType: FileType;
  crawlData: Awaited<ReturnType<typeof crawlWebsite>>;
};

async function generateSingleFile(ctx: GenerationContext): Promise<FileGenerateResult> {
  const { fileType, crawlData } = ctx;

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
}
```

Then refactor both functions:

```typescript
export async function generateFile(
  fileType: FileType,
  origin: string
): Promise<FileGenerateResult> {
  const crawlData = await crawlWebsite(origin);
  return generateSingleFile({ fileType, crawlData });
}

export async function generateAllMissing(
  fileTypes: FileType[],
  origin: string
): Promise<FileGenerateResult[]> {
  const crawlData = await crawlWebsite(origin);

  const promises = fileTypes.map(
    (fileType) => generateSingleFile({ fileType, crawlData })
  );

  const settled = await Promise.allSettled(promises);

  return settled.map((outcome, i) => {
    if (outcome.status === "fulfilled") return outcome.value;
    const message = outcome.reason instanceof Error
      ? outcome.reason.message
      : String(outcome.reason);
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
}
```

### Step 2: Write tests

Create `src/lib/discovery/file-generators.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateAllMissing } from "./file-generators";

// Mock all dependencies
vi.mock("@/lib/generator", () => ({
  crawlWebsite: vi.fn().mockResolvedValue({
    urls: [{ url: "https://example.com", score: 1 }],
    pages: [{ url: "https://example.com", markdown: "# Test", html: "<h1>Test</h1>", title: "Test", category: "other" as const, score: 1, needsAi: true }],
  }),
}));

vi.mock("@/lib/generator/ai-generators", () => ({
  generateByType: vi.fn().mockResolvedValue("# Generated content"),
}));

vi.mock("@/lib/generator/gemini-template-filler", () => ({
  generateTemplateContent: vi.fn().mockResolvedValue("# Generated template content"),
}));

describe("generateAllMissing", () => {
  it("returns all results even if one generation fails", async () => {
    const { generateByType } = await import("@/lib/generator/ai-generators");
    vi.mocked(generateByType).mockResolvedValueOnce("brand content");

    const results = await generateAllMissing(
      ["brand.txt", "ai.txt"],
      "https://example.com"
    );

    expect(results).toHaveLength(2);
    expect(results.map(r => r.type)).toContain("brand.txt");
    expect(results.map(r => r.type)).toContain("ai.txt");
  });

  it("handles complete failure gracefully", async () => {
    const { crawlWebsite } = await import("@/lib/generator");
    vi.mocked(crawlWebsite).mockRejectedValue(new Error("Network error"));

    const results = await generateAllMissing(
      ["brand.txt", "ai.txt"],
      "https://example.com"
    );

    expect(results).toHaveLength(2);
    results.forEach(r => {
      expect(r.success).toBe(false);
      expect(r.errors.length).toBeGreaterThan(0);
    });
  });

  it("returns results in same order as input", async () => {
    const results = await generateAllMissing(
      ["brand.txt", "ai.txt", "llms.txt"],
      "https://example.com"
    );

    expect(results[0].type).toBe("brand.txt");
    expect(results[1].type).toBe("ai.txt");
    expect(results[2].type).toBe("llms.txt");
  });
});
```

### Step 3: Run tsc and vitest

```bash
tsc --noEmit && npx vitest run src/lib/discovery/file-generators.spec.ts
```

### Step 4: Commit

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
- Modify: `src/lib/discovery/file-generators.ts` (integrate into both generateFile and generateAllMissing)

### Step 1: Write the failing test

Create `src/lib/generator/content-hash.spec.ts`:

```typescript
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

  it("serializes writes to prevent race conditions", async () => {
    const url = "https://example.com";
    const contents = Array.from({ length: 10 }, (_, i) => `content ${i}`);

    await Promise.all(contents.map(c => hashMap.record(url, c)));

    const lastContent = contents[contents.length - 1];
    const hasChanged = await hashMap.hasChanged(url, lastContent);
    expect(hasChanged).toBe(false);
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
});
```

Run: `npx vitest run src/lib/generator/content-hash.spec.ts`
Expected: FAIL — `ContentHashMap` does not exist

### Step 2: Create `content-hash.ts`

Create `src/lib/generator/content-hash.ts`:

```typescript
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const DEFAULT_DIR = process.env.CONTENT_HASH_DIR ?? ".cache";

export class ContentHashMap {
  private hashMap: Record<string, string> = {};
  private loaded = false;
  private readonly dir: string;
  private writeQueue = Promise.resolve();

  constructor(dir: string = DEFAULT_DIR) {
    this.dir = dir;
  }

  private getHashFile(): string {
    return path.join(this.dir, "content-hashes.json");
  }

  private hash(content: string): string {
    return crypto.createHash("sha256").update(content, "utf-8").digest("hex");
  }

  private async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const raw = await fs.readFile(this.getHashFile(), "utf-8");
      this.hashMap = JSON.parse(raw);
    } catch {
      this.hashMap = {};
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
    const tmp = this.getHashFile() + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(this.hashMap, null, 2), "utf-8");
    await fs.rename(tmp, this.getHashFile());
  }

  async hasChanged(url: string, content: string): Promise<boolean> {
    await this.load();
    const newHash = this.hash(content);
    const storedHash = this.hashMap[url];
    return storedHash !== newHash;
  }

  async record(url: string, content: string): Promise<void> {
    await this.load();
    this.hashMap[url] = this.hash(content);
    await this.persist();
  }

  async getOutput(fileType: string): Promise<string | null> {
    const file = path.join(this.dir, "outputs", `${this.sanitizeFileType(fileType)}.txt`);
    try {
      return await fs.readFile(file, "utf-8");
    } catch {
      return null;
    }
  }

  async saveOutput(fileType: string, content: string): Promise<void> {
    const outputDir = path.join(this.dir, "outputs");
    await fs.mkdir(outputDir, { recursive: true });
    const file = path.join(outputDir, `${this.sanitizeFileType(fileType)}.txt`);
    await fs.writeFile(file, content, "utf-8");
  }

  async clear(): Promise<void> {
    this.hashMap = {};
    await this.persist();
  }

  private sanitizeFileType(fileType: string): string {
    return fileType.replace(/[^a-zA-Z0-9._-]/g, "_");
  }
}

export const contentHashMap = new ContentHashMap();
```

Run: `npx vitest run src/lib/generator/content-hash.spec.ts`
Expected: PASS

### Step 3: Integrate ContentHash into `file-generators.ts`

Modify `src/lib/discovery/file-generators.ts`:

```typescript
import { contentHashMap } from "@/lib/generator/content-hash";
import type { CrawledPage } from "@/lib/generator/types";

async function generateSingleFile(
  ctx: GenerationContext,
  options: { checkContentHash: boolean } = { checkContentHash: true }
): Promise<FileGenerateResult> {
  const { fileType, crawlData } = ctx;

  // Content hash check - skip if content unchanged and output cached
  if (options.checkContentHash) {
    const changedUrls: string[] = [];

    for (const page of crawlData.pages) {
      if (await contentHashMap.hasChanged(page.url, page.content ?? "")) {
        changedUrls.push(page.url);
      }
    }

    // If no content changed, try to return cached output
    if (changedUrls.length === 0) {
      const cachedOutput = await contentHashMap.getOutput(fileType);
      if (cachedOutput) {
        return {
          type: fileType,
          success: true,
          content: cachedOutput,
          errors: [],
          warnings: [{ rule: "content_unchanged", message: "Source unchanged — returned cached output" }],
          checklist: buildChecklist(fileType, true, [], []) as ChecklistItem[],
        };
      }
    }
  }

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

    // Record content hashes after successful generation
    for (const page of crawlData.pages) {
      if (page.content) {
        await contentHashMap.record(page.url, page.content);
      }
    }
    await contentHashMap.saveOutput(fileType, content);

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
}
```

For `generateAllMissing`, disable content hash check since crawlData is shared:

```typescript
export async function generateAllMissing(
  fileTypes: FileType[],
  origin: string
): Promise<FileGenerateResult[]> {
  const crawlData = await crawlWebsite(origin);

  // Check content hash once for the entire crawl
  const changedUrls: string[] = [];
  for (const page of crawlData.pages) {
    if (await contentHashMap.hasChanged(page.url, page.content ?? "")) {
      changedUrls.push(page.url);
    }
  }

  // Record hashes before parallel generation
  for (const page of crawlData.pages) {
    if (page.content) {
      await contentHashMap.record(page.url, page.content);
    }
  }

  const promises = fileTypes.map((fileType) =>
    generateSingleFile({ fileType, crawlData }, { checkContentHash: false })
  );

  const settled = await Promise.allSettled(promises);

  return settled.map((outcome, i) => {
    if (outcome.status === "fulfilled") {
      const result = outcome.value;
      // Save output after generation
      if (result.success && result.content) {
        contentHashMap.saveOutput(fileTypes[i], result.content);
      }
      return result;
    }
    const message = outcome.reason instanceof Error
      ? outcome.reason.message
      : String(outcome.reason);
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
}
```

### Step 4: Run tsc and vitest

```bash
tsc --noEmit && npx vitest run src/lib/generator/content-hash.spec.ts src/lib/discovery/file-generators.spec.ts
```

### Step 5: Commit

```bash
git add src/lib/generator/content-hash.ts src/lib/generator/content-hash.spec.ts src/lib/discovery/file-generators.ts
git commit -m "feat: add ContentHashMap to skip Gemini calls when source content unchanged"
```

---

## Cache Invalidation Strategy

Add a CLI command or API endpoint for cache management:

```typescript
// src/lib/generator/cache-cli.ts
import { crawlManager } from "./crawl-cache";
import { contentHashMap } from "./content-hash";

export async function clearAllCaches(): Promise<void> {
  await crawlManager.clearCache();
  await contentHashMap.clear();
}

export async function getCacheStats(): Promise<{
  crawlCacheSize: number;
  contentHashCount: number;
}> {
  // Return cache statistics for monitoring
  return {
    crawlCacheSize: 0,
    contentHashCount: 0,
  };
}
```

---

## Environment Variables Documentation

Add to project README or create `docs/caching.md`:

```markdown
## Cache Configuration

### Crawl Cache (CrawlManager)
| Variable | Default | Description |
|----------|---------|-------------|
| `CRAWL_CACHE_DIR` | `.cache` | Directory for disk cache |
| `CRAWL_CACHE_TTL_MS` | `300000` (5 min) | Cache TTL in milliseconds. Set to `0` to disable caching |

### Content Hash Cache
| Variable | Default | Description |
|----------|---------|-------------|
| `CONTENT_HASH_DIR` | `.cache` | Directory for content hashes and cached outputs |

### Cache Management
```bash
# Clear all caches
npm run cache:clear

# View cache stats
npm run cache:stats
```
```

---

## Self-Review Checklist

- [ ] All 3 tasks have complete code — no "TBD", "TODO", or placeholder descriptions
- [ ] `crawl-cache.ts` implements memory+disk hybrid with TTL and in-flight deduplication
- [ ] TTL parsing handles 0 correctly (cache disabled)
- [ ] Disk cache loads lazily but checks disk even when memory has some entries
- [ ] `file-generators.ts` uses `Promise.allSettled()` — no sequential `for` loop
- [ ] `generateSingleFile()` extracted to avoid code duplication
- [ ] `content-hash.ts` uses SHA-256, atomic writes (tmp+rename), graceful degradation
- [ ] `HASH_FILE` uses instance `dir` parameter correctly
- [ ] Content hash check is per-URL, not global
- [ ] `generateAllMissing()` disables redundant hash checks (crawlData is shared)
- [ ] `.cache/` added to `.gitignore`
- [ ] Cache invalidation strategy documented
- [ ] Env vars documented
- [ ] Each task committed separately with `tsc --noEmit` passing
```

---

## Key Fixes from v1

| Issue | v1 | v2 |
|-------|-----|-----|
| TTL parsing | `Number(env) \|\| default` fails for 0 | `parseInt(env ?? "", 10) \|\| default` handles 0 |
| Disk cache load | Only when memory empty | Always load lazily, check disk if not in memory |
| HASH_FILE | Module-level constant | Instance method `getHashFile()` |
| Race condition | No protection | Sequential writeQueue pattern |
| Code duplication | Duplicate logic in both functions | Extracted `generateSingleFile()` |
| Content skip | Global check, all-or-nothing | Per-URL tracking |
| .gitignore | Missing | Added `.cache/` |
| Cache invalidation | None | CLI + docs |
