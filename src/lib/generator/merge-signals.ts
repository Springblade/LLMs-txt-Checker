import type { ExtractedSchema } from "./extract-structured-data";

export type PageSignals = {
  url: string;
  canonical?: string;
  schemaUrl?: string;
  title?: string;
  metaDescription?: string;
  h1?: string;
  schema?: ExtractedSchema;
};

export type MergedPageSignal = {
  url: string;
  canonical: string;
  name: string;
  description?: string;
  schema?: ExtractedSchema;
};

export type SiteSignal = {
  name: string;
  description?: string;
  organization?: ExtractedSchema["organization"];
  faqPage?: ExtractedSchema["faqPage"];
  pages: MergedPageSignal[];
};

export function mergePageSignals(signals: PageSignals, schema?: ExtractedSchema): MergedPageSignal {
  const name =
    schema?.organization?.name ??
    signals.schema?.organization?.name ??
    signals.title ??
    signals.h1 ??
    signals.url;

  const description =
    schema?.organization?.description ??
    signals.schema?.organization?.description ??
    signals.metaDescription ??
    undefined;

  return {
    url: signals.url,
    canonical: signals.canonical ?? signals.schemaUrl ?? signals.url,
    name,
    description,
    schema,
  };
}

// Priority ranking for page types
const PAGE_TYPE_RANK: Record<string, number> = {
  homepage: 1,
  about: 2,
  services: 3,
  pricing: 4,
  contact: 5,
  docs: 6,
  blog: 7,
  default: 99,
};

function pageRank(url: string): number {
  const lower = url.toLowerCase();
  const pathname = lower.replace(/^https?:\/\/[^/]+/, "");

  // Homepage: empty path or just "/"
  if (pathname === "/" || pathname === "") return 1;
  // Match specific page type patterns
  for (const [type, rank] of Object.entries(PAGE_TYPE_RANK)) {
    if (type === "default" || type === "homepage") continue;
    if (pathname.includes(`/${type}`) || pathname === `/${type}`) return rank;
  }
  return PAGE_TYPE_RANK.default ?? 99;
}

export function mergeAcrossPages(pageSignals: MergedPageSignal[]): SiteSignal {
  // Deduplicate by canonical URL (keep first occurrence)
  const seen = new Set<string>();
  const unique = pageSignals.filter((p) => {
    if (seen.has(p.canonical)) return false;
    seen.add(p.canonical);
    return true;
  });

  // Sort by page type priority
  unique.sort((a, b) => pageRank(a.canonical) - pageRank(b.canonical));

  const homepage = unique.at(0);
  const faqPage = unique.find((p) => p.schema?.faqPage)?.schema?.faqPage;

  return {
    name: homepage?.name ?? "Unknown Site",
    description: homepage?.description,
    organization: homepage?.schema?.organization,
    faqPage,
    pages: unique,
  };
}
