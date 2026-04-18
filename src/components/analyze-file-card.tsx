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
        {/* File name + badge */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.5rem",
            marginBottom: "0.375rem",
          }}
        >
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
          <Badge variant={accent.badgeVariant}>{accent.label}</Badge>
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
