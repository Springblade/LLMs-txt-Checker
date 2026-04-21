export type FileType =
  | "llms.txt" | "llm.txt" | "ai.txt" | "faq-ai.txt" | "brand.txt"
  | "developer-ai.txt" | "llms.html" | "robots-ai.txt" | "identity.json" | "ai.json";

export const ALL_FILE_TYPES: FileType[] = [
  "llms.txt", "llm.txt", "ai.txt", "faq-ai.txt", "brand.txt",
  "developer-ai.txt", "llms.html", "robots-ai.txt", "identity.json", "ai.json",
];

export const FILE_TIER: Record<FileType, "essential" | "recommended" | "optional"> = {
  "llms.txt": "essential",
  "llm.txt": "essential",
  "ai.txt": "recommended",
  "faq-ai.txt": "recommended",
  "brand.txt": "recommended",
  "developer-ai.txt": "optional",
  "llms.html": "optional",
  "robots-ai.txt": "optional",
  "identity.json": "optional",
  "ai.json": "optional",
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
