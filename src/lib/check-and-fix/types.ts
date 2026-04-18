// Types for the check-and-fix flow

import type { ValidationError, ValidationWarning } from "@/lib/types";

/** Result returned from /api/check-and-fix */
export interface CheckAndFixResult {
  success: true;
  /** "validated" = existing llms.txt was validated */
  /** "generated_and_validated" = no file found, was generated then validated */
  mode: "validated" | "generated_and_validated";
  /** Original URL the user entered */
  origin: string;
  /** Full URL of the llms.txt file */
  llmsUrl: string;
  /** File content */
  content: string;
  /** Download filename, e.g. "example-com-llms.txt" */
  fileName: string;
  /** Validation report */
  validation: ValidationReport;
  /** Generation / crawl metadata */
  metadata: {
    pagesFound?: number;
    pagesCrawled?: number;
    siteName?: string;
    generatedAt?: string;
  };
}

/** Validation report embedded in CheckAndFixResult */
export interface ValidationReport {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/** Error returned from /api/check-and-fix */
export interface CheckAndFixError {
  success: false;
  errorCode: CheckAndFixErrorCode;
  message: string;
  /** Original URL the user entered (available on most errors) */
  origin?: string;
}

export type CheckAndFixErrorCode =
  | "INVALID_URL"
  | "SITE_UNREACHABLE"
  | "TIMEOUT"
  | "ACCESS_DENIED"
  | "SERVER_ERROR"
  | "GENERATION_FAILED"
  | "VALIDATION_FAILED";

/** Discriminated union for the API response */
export type CheckAndFixResponse = CheckAndFixResult | CheckAndFixError;

/** Client-side loading states */
export type LoadingState =
  | { phase: "idle" }
  | { phase: "checking"; message: string }
  | { phase: "generating"; message: string }
  | { phase: "validating"; message: string }
  | { phase: "error"; errorCode: string; message: string };
