// Validation types for llms.txt checker

export interface ValidationError {
  rule: string;
  message: string;
  line?: number;
}

export interface ValidationWarning {
  rule: string;
  message: string;
  line?: number;
}

export interface LinkData {
  title: string;
  url: string;
  description?: string;
}

export interface ParsedData {
  title?: string;
  description?: string; // Brief description from blockquote
  descriptions: string[]; // Detailed paragraphs after blockquote
  links: LinkData[];
  hasQuoteBlock: boolean;
  headingCount: number; // Count of H2+ headings
}

export interface LinkResult {
  url: string;
  status: number;
  ok: boolean;
}

export type ErrorCode =
  | "access_denied"
  | "not_found"
  | "http_error"
  | "invalid_response"
  | "connection_error"
  | "timeout"
  | "server_error"
  | "not_llms_txt"
  | "ssl_error"
  | "redirect_loop"
  | "dns_error"
  | "geo_blocked"
  | "unsupported_encoding";

// Supported AI Discovery File types
export type FileType =
  | "llms.txt"
  | "llm.txt"
  | "ai.txt"
  | "faq-ai.txt"
  | "brand.txt"
  | "developer-ai.txt"
  | "llms.html"
  | "robots-ai.txt"
  | "identity.json"
  | "ai.json";

export const ALL_FILE_TYPES: FileType[] = [
  "llms.txt",
  "llm.txt",
  "ai.txt",
  "faq-ai.txt",
  "brand.txt",
  "developer-ai.txt",
  "llms.html",
  "robots-ai.txt",
  "identity.json",
  "ai.json",
];

export interface ValidationResult {
  found: boolean;
  message?: string;
  errorCode?: ErrorCode;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  content?: string;
  parsedData?: ParsedData;
  linkResults?: LinkResult[];
}
