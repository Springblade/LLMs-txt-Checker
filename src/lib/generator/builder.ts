import type { CrawledPage } from "./types";
import { getCategoryLabel } from "./category-classifier";

export interface BuildOptions {
  siteName?: string;
  includeCategories?: boolean;
  includeScores?: boolean;
  maxPages?: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildLlmsTxt(pages: CrawledPage[], options: BuildOptions = {}): string {
  const {
    siteName = new URL(pages[0]?.url ?? "https://example.com").hostname.replace(/^www\./, ""),
    includeCategories = true,
    maxPages = 200,
  } = options;

  const lines: string[] = [
    `# ${siteName}`,
    "",
    `> Generated at ${new Date().toISOString()} by llms.txt Generator`,
    `> Total pages: ${pages.length}`,
    "",
  ];

  const categories = [...new Set(pages.map((p) => p.category))];

  for (const category of categories) {
    const categoryPages = pages.filter((p) => p.category === category).slice(0, maxPages);
    if (categoryPages.length === 0) continue;

    if (includeCategories) {
      const label = getCategoryLabel(category);
      lines.push(`## ${label}`, "");
    }

    for (const page of categoryPages) {
      const title = page.title ?? page.h1 ?? new URL(page.url).pathname;
      const description = page.description ?? "";

      lines.push(`### ${title}`);
      lines.push(`URL: ${page.url}`);
      if (description) {
        lines.push(`Description: ${description}`);
      }
      lines.push("");
    }

    lines.push("");
  }

  return lines.join("\n");
}

export function buildFileName(siteUrl: string): string {
  try {
    const url = new URL(siteUrl);
    const host = url.hostname.replace(/^www\./, "");
    const slug = slugify(host);
    return `${slug}-llms.txt`;
  } catch {
    return "llms.txt";
  }
}
