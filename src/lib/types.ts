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

export interface HealthScore {
  score: number; // 0-100
  status: "pass" | "fail";
  totalLinks: number;
  errorCount: number;
  warningCount: number;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export type ErrorCode =
  | "not_found"
  | "access_denied"
  | "timeout"
  | "invalid_response"
  | "server_error"
  | "http_error"
  | "connection_error";

export interface ValidationResult {
  found: boolean;
  message?: string;
  errorCode?: ErrorCode;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  content?: string;
  parsedData?: ParsedData;
  linkResults?: LinkResult[];
  healthScore?: HealthScore;
  suggestions?: Suggestion[];
}
