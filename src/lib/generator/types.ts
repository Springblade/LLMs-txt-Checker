// Generator-specific types

export interface GeneratorInput {
  url: string;             // required, target website URL
  maxUrls?: number;        // default: 50, max: 200
  includePaths?: string[]; // paths to prioritize, e.g. ["/docs", "/blog"]
  excludePaths?: string[]; // paths to exclude, e.g. ["/login", "/admin"]
}

export interface CrawledPage {
  url: string;             // original URL
  normalizedUrl: string;   // deduplicated URL (no trailing slash, no query)
  canonicalUrl?: string;   // canonical URL from <link rel="canonical">
  title?: string;
  description?: string;
  h1?: string;
  content?: string;         // raw content for AI description generation
  category: PageCategory;
  score: number;
  needsAi: boolean;        // true if description is missing/empty
  provider?: "jina" | "native" | "firecrawl" | null;
  error?: string;
}

export type PageCategory =
  | "documentation"
  | "blog"
  | "api-reference"
  | "pricing"
  | "about"
  | "contact"
  | "legal"
  | "other";

export interface GeneratorResult {
  success: boolean;
  content?: string;         // Generated llms.txt content
  fileName?: string;        // e.g. "example-com-llms.txt"
  pagesFound: number;       // Total pages discovered
  pagesCrawled: number;     // Pages successfully crawled
  errors: string[];         // Non-blocking warnings
  validation?: {
    passed: boolean;
    errors: { rule: string; message: string; line?: number }[];
    warnings: { rule: string; message: string; line?: number }[];
  };
  metadata: {
    siteName?: string;
    generatedAt: string;
    generatorVersion: string;
  };
}

export interface GeneratorError {
  success: false;
  error: string;
  errorCode: "INVALID_URL" | "FETCH_ERROR" | "NO_CONTENT" | "ALL_FETCH_FAILED" | "TIMEOUT" | "RATE_LIMITED" | "UNKNOWN";
  details?: string;
}

export type GenerateResponse = GeneratorResult | GeneratorError;

export interface ProgressEvent {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  stepName: string;
  pagesFound?: number;
  pagesCrawled?: number;
  currentUrl?: string;
}

// Internal pipeline types
export interface DiscoveredUrl {
  url: string;
  normalizedUrl: string;
  depth: number;
  source: "homepage" | "sitemap" | "fallback";
}

export interface ScoredUrl extends DiscoveredUrl {
  score: number;
}

export interface FetchResult {
  url: string;
  content?: string;
  error?: string;
  provider?: "jina" | "native" | "firecrawl" | null;
}

export interface ExtractedMetadata {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  h1?: string;
  content?: string; // first 500 chars for AI
}