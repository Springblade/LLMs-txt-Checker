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

// Priority ranking for page types (lower = higher priority)
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
  
  // Homepage is root path
  if (lower === "https://example.com/" || lower === "http://example.com/" || 
      lower === "https://example.com" || lower === "http://example.com" ||
      lower.endsWith("/")) {
    const path = lower.replace(/^https?:\/\/[^/]+\/?$/, "");
    if (path === "/" || path === "") return 1; // homepage rank
  }
  
  for (const [type, rank] of Object.entries(PAGE_TYPE_RANK)) {
    if (type !== "default" && lower.includes(`/${type}`)) return rank ?? 99;
  }
  return 99;
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
  return {
    name: homepage?.name ?? "Unknown Site",
    description: homepage?.description,
    organization: homepage?.schema?.organization,
    faqPage: unique.find((p) => p.schema?.faqPage)?.schema?.faqPage,
    pages: unique,
  };
}
