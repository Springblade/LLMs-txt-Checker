import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const DEFAULT_DIR = process.env.CONTENT_HASH_DIR ?? ".cache";

export class ContentHashMap {
  private hashMap: Record<string, string> = {};
  private loaded = false;
  private readonly dir: string;

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
