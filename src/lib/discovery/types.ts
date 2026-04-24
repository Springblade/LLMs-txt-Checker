export type FileType =
  | "llms.txt" | "llm.txt" | "ai.txt" | "faq-ai.txt" | "brand.txt"
  | "developer-ai.txt" | "llms.html" | "robots-ai.txt" | "identity.json" | "ai.json";

export const ALL_FILE_TYPES: FileType[] = [
  "llms.txt", "llm.txt", "ai.txt", "faq-ai.txt", "brand.txt",
  "developer-ai.txt", "llms.html", "robots-ai.txt", "identity.json", "ai.json",
];

export type FileTier = "essential" | "recommended" | "complete";

export const FILE_TIER: Record<FileType, FileTier> = {
  // Essential tier (2 files) - Start here
  "llms.txt": "essential",
  "ai.txt": "essential",
  // Recommended tier (4 files) - Build on Essential
  "identity.json": "recommended",
  "faq-ai.txt": "recommended",
  "brand.txt": "recommended",
  "ai.json": "recommended",
  // Complete tier (4 files) - Full implementation
  "llm.txt": "complete",
  "llms.html": "complete",
  "developer-ai.txt": "complete",
  "robots-ai.txt": "complete",
};

export const TIER_COLORS: Record<FileTier, { color: string; bg: string }> = {
  essential: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  recommended: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
  complete: { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
};

export interface CrawledData {
  siteName: string;
  origin: string;
  description?: string;
  pages: Array<{
    url: string;
    title: string;
    description: string;
    category?: string;
  }>;
  brandName?: string;
  email?: string;
  techStack?: string[];
  faqs?: Array<{ q: string; a: string }>;
  llmsTxtContent?: string; // Authoritative content from website's llms.txt
}

export type ChecklistItem = {
  id: string;
  label: string;
  status: "passed" | "failed" | "warning" | "skipped";
  message?: string;
  value?: number;
};

export interface FileScanResult {
  type: FileType;
  found: boolean;
  url: string;
  content: string;
  errors: Array<{ rule: string; message: string; line?: number }>;
  warnings: Array<{ rule: string; message: string }>;
  checklist: ChecklistItem[];
  skipReason?: string;
}

export interface FileGenerateResult {
  type: FileType;
  success: boolean;
  content: string;
  errors: Array<{ rule: string; message: string }>;
  warnings: Array<{ rule: string; message: string }>;
  checklist: ChecklistItem[];
}

export interface DiscoverResult {
  origin: string;
  files: FileScanResult[];
  missingFiles: FileType[];
  generating?: FileGenerateResult[];
  suggestions: Suggestion[];
}

export interface Suggestion {
  fileType: FileType;
  action: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export type GenerationStatus = "idle" | "scanning" | "crawling" | "generating" | "validating" | "done" | "error";

export interface FileGenerationStatus {
  type: FileType;
  status: GenerationStatus;
  message?: string;
}

export interface QuotaError {
  errorCode: string;
  message: string;
  suggestions: string[];
}
