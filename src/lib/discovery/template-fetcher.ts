import { readFileSync } from "fs";
import { join } from "path";
import type { FileType } from "./types";

const TEMPLATE_BASE = join(process.cwd(), "public", "ai-discovery-templates");

export function getTemplatePath(fileType: FileType): string {
  if (fileType === "llms.html") {
    return join(TEMPLATE_BASE, "html", fileType);
  }
  if (fileType === "identity.json" || fileType === "ai.json") {
    return join(TEMPLATE_BASE, "json", fileType);
  }
  return join(TEMPLATE_BASE, "text-based", fileType);
}

export interface TemplateFetchResult {
  success: boolean;
  content?: string;
  error?: string;
}

export function fetchTemplate(fileType: FileType): TemplateFetchResult {
  const filePath = getTemplatePath(fileType);

  try {
    const content = readFileSync(filePath, "utf-8");
    return { success: true, content };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: `Template not found: ${filePath} — ${message}` };
  }
}
