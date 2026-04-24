"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface FileResult {
  name: string;
  found: boolean;
  url: string;
  content: string;
  errors: Array<{ rule: string; message: string; line?: number }>;
  warnings: Array<{ rule: string; message: string; line?: number }>;
}

type CardState = "ok" | "errors" | "warnings" | "notFound";

function getCardState(file: FileResult): CardState {
  if (!file.found) return "notFound";
  if (file.errors.length > 0) return "errors";
  if (file.warnings.length > 0) return "warnings";
  return "ok";
}

const FILE_DESCRIPTIONS: Partial<Record<string, string>> = {
  "llms.txt": "Main AI discovery file",
  "llm.txt": "Redirect compatibility",
  "ai.txt": "AI policies and terms",
  "faq-ai.txt": "AI-friendly FAQ responses",
  "brand.txt": "Brand naming guidelines",
  "developer-ai.txt": "Developer documentation",
  "llms.html": "HTML-based AI discovery",
  "robots-ai.txt": "AI crawler access control",
  "identity.json": "Machine-readable identity",
  "ai.json": "AI interaction guidelines",
};

// AI Visibility Impact Classification
// Based on ai-visibility.org.uk specification v1.1.1/v1.2.0
type FileTier = "essential" | "recommended" | "complete";

const FILE_TIERS: Partial<Record<string, FileTier>> = {
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

const TIER_CONFIG: Record<FileTier, { label: string; color: string; bgColor: string; borderColor: string }> = {
  essential: {
    label: "Essential",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  recommended: {
    label: "Recommended",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  complete: {
    label: "Complete",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
};

// Distinctive SVG icons for each file type
const FILE_ICONS: Partial<Record<string, string>> = {
  "llms.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  "llm.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><polyline points="21 3 21 9 15 9"/><path d="M21 3l-7 6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 9"/></svg>`,
  "ai.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M16 11a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0v-1a4 4 0 0 1 4-4z"/><path d="M8 11a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0v-1a4 4 0 0 1 4-4z"/><path d="M12 22v-3"/><circle cx="12" cy="22" r="1"/></svg>`,
  "faq-ai.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  "brand.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="12" r="2.5"/><circle cx="8.5" cy="17.5" r="2.5"/><circle cx="15.5" cy="17.5" r="2.5"/></svg>`,
  "developer-ai.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
  "llms.html": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>`,
  "robots-ai.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`,
  "identity.json": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M6 21l2-2"/><path d="M18 21l-2-2"/></svg>`,
  "ai.json": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
};

const FILE_TEMPLATE_PATHS: Record<string, string> = {
  "llms.txt": "/ai-discovery-templates/text-based/llms.txt",
  "llm.txt": "/ai-discovery-templates/text-based/llm.txt",
  "ai.txt": "/ai-discovery-templates/text-based/ai.txt",
  "faq-ai.txt": "/ai-discovery-templates/text-based/faq-ai.txt",
  "brand.txt": "/ai-discovery-templates/text-based/brand.txt",
  "developer-ai.txt": "/ai-discovery-templates/text-based/developer-ai.txt",
  "llms.html": "/ai-discovery-templates/html/llms.html",
  "robots-ai.txt": "/ai-discovery-templates/text-based/robots-ai.txt",
  "identity.json": "/ai-discovery-templates/json/identity.json",
  "ai.json": "/ai-discovery-templates/json/ai.json",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function handleDownload(fileType: string) {
  const path = FILE_TEMPLATE_PATHS[fileType];
  if (!path) return;
  try {
    const res = await fetch(path);
    if (!res.ok) return;
    const text = await res.text();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileType;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("[DownloadTemplate]", e);
  }
}

const STATE_ACCENT: Record<CardState, { color: string; label: string; badgeVariant: "success" | "warning" | "error" | "neutral" }> = {
  ok: { color: "var(--color-success)", label: "Valid", badgeVariant: "success" },
  warnings: { color: "var(--color-warning)", label: "Warnings", badgeVariant: "warning" },
  errors: { color: "var(--color-error)", label: "Errors", badgeVariant: "error" },
  notFound: { color: "var(--color-text-muted)", label: "Not Found", badgeVariant: "neutral" },
};

const STATE_DESCRIPTION: Record<CardState, string> = {
  ok: "File found and valid.",
  warnings: "File is missing recommended sections.",
  errors: "File has syntax errors.",
  notFound: "File was not found on the server.",
};

const STATE_IMPACT: Record<CardState, string> = {
  ok: "Impacts SEO and AI model discovery of your content.",
  warnings: "Impacts SEO and AI model discovery of your content.",
  errors: "Impacts SEO and AI model parsing of your content.",
  notFound: "Impacts SEO and AI model discovery of your content.",
};

export default function AnalyzeFileCard({ file }: { file: FileResult }) {
  const state = getCardState(file);
  const description = FILE_DESCRIPTIONS[file.name] ?? "AI discovery file";
  const accent = STATE_ACCENT[state];
  const tier = FILE_TIERS[file.name] ?? "recommended";
  const tierConfig = TIER_CONFIG[tier];
  const icon = FILE_ICONS[file.name];
  const contentSize = file.found && file.content
    ? formatSize(new TextEncoder().encode(file.content).length)
    : "N/A";

  return (
    <Card
      style={{
        padding: 0,
        overflow: "hidden",
        borderTop: `3px solid ${accent.color}`,
      }}
    >
      {/* ── Card body ── */}
      <div style={{ padding: "1rem" }}>
        {/* File name + tier badge + status badge */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.5rem",
            marginBottom: "0.375rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* File icon */}
            {icon && (
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  color: tierConfig.color,
                  opacity: 0.8,
                  flexShrink: 0,
                }}
                dangerouslySetInnerHTML={{ __html: icon }}
              />
            )}
            <span
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text)",
                lineHeight: 1.4,
              }}
            >
              {file.name}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
            {/* Tier badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.125rem 0.5rem",
                borderRadius: "9999px",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                backgroundColor: tierConfig.bgColor,
                color: tierConfig.color,
                border: `1px solid ${tierConfig.borderColor}`,
              }}
            >
              {tier === "essential" && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              )}
              {tierConfig.label}
            </span>
            <Badge variant={accent.badgeVariant}>{accent.label}</Badge>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            margin: "0 0 0.75rem",
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>

        {/* ── Impact message ── */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.625rem 0.75rem",
            backgroundColor: "var(--color-bg-tertiary)",
            borderRadius: "4px",
            marginBottom: "0.75rem",
          }}
        >
          <span style={{ flexShrink: 0, marginTop: "0.0625rem" }}>
            {state === "errors" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
            )}
          </span>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 500, color: accent.color, margin: "0 0 0.125rem", lineHeight: 1.4 }}>
              {STATE_DESCRIPTION[state]}
            </p>
            <p style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.4 }}>
              {STATE_IMPACT[state]}
            </p>
          </div>
        </div>

        {/* ── Tech specs grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem 1rem",
          }}
        >
          {[
            { label: "FILE", value: file.name },
            { label: "STATUS", value: file.found ? "exists" : "not_found" },
            { label: "SIZE", value: contentSize },
            { label: "ERRORS", value: file.errors.length > 0 ? `${file.errors.length}` : file.found ? "0" : "N/A" },
          ].map((item) => (
            <div key={item.label}>
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  margin: "0 0 0.125rem",
                }}
              >
                {item.label}
              </p>
              {item.label === "STATUS" ? (
                <Badge variant={file.found ? "success" : "error"}>
                  {item.value}
                </Badge>
              ) : (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: item.value === "N/A" ? "var(--color-text-muted)" : "var(--color-text)",
                    margin: 0,
                  }}
                >
                  {item.value}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Download template CTA ── */}
      {state === "notFound" && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <Button
            variant="primary"
            onClick={() => void handleDownload(file.name)}
            style={{ width: "100%", justifyContent: "center" }}
            size="sm"
          >
            Download Template
          </Button>
        </div>
      )}
    </Card>
  );
}
