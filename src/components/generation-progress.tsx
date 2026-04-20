"use client";

import type { FileGenerationStatus } from "@/lib/discovery/types";

interface GenerationProgressProps {
  files: FileGenerationStatus[];
  overallStatus: "idle" | "scanning" | "generating" | "done";
}

const STATUS_STYLES = {
  idle: { dot: "var(--mm-border)", text: "var(--mm-text-muted)", label: "Idle" },
  scanning: { dot: "var(--mm-brand)", text: "var(--mm-brand)", label: "Scanning" },
  crawling: { dot: "var(--mm-brand)", text: "var(--mm-brand)", label: "Crawling" },
  generating: { dot: "var(--mm-warning)", text: "var(--mm-warning)", label: "Generating" },
  validating: { dot: "var(--mm-info)", text: "var(--mm-info)", label: "Validating" },
  done: { dot: "var(--mm-success)", text: "var(--mm-success)", label: "Done" },
  error: { dot: "var(--mm-error)", text: "var(--mm-error)", label: "Error" },
} as const;

const FILE_SHORT_NAMES: Record<string, string> = {
  "llms.txt": "llms.txt",
  "llm.txt": "llm.txt",
  "ai.txt": "ai.txt",
  "faq-ai.txt": "faq-ai.txt",
  "brand.txt": "brand.txt",
  "developer-ai.txt": "dev-ai.txt",
  "llms.html": "llms.html",
  "robots-ai.txt": "robots-ai.txt",
  "identity.json": "identity.json",
  "ai.json": "ai.json",
};

export function GenerationProgress({ files, overallStatus }: GenerationProgressProps) {
  if (overallStatus === "idle") return null;

  const overallMeta = STATUS_STYLES[overallStatus] ?? STATUS_STYLES.idle;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid var(--mm-border)",
        borderRadius: "var(--mm-radius-md)",
        padding: "1rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: overallMeta.dot,
            animation: overallStatus !== "done" ? "pulse-ring 1.5s ease-in-out infinite" : "none",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: overallMeta.text }}>
          {overallMeta.label}
        </span>
      </div>

      {/* File list */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {files.map((f) => {
          const s = STATUS_STYLES[f.status] ?? STATUS_STYLES.idle;
          const shortName = FILE_SHORT_NAMES[f.type] ?? f.type;
          const isActive = f.status === "scanning" || f.status === "generating" || f.status === "crawling" || f.status === "validating";

          return (
            <li
              key={f.type}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                color: "var(--mm-text)",
              }}
            >
              {f.status === "done" ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--mm-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : f.status === "error" ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--mm-error)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : isActive ? (
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: s.dot,
                    animation: "pulse-ring 1.5s ease-in-out infinite",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: s.dot, flexShrink: 0 }} />
              )}

              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem", flexShrink: 0, minWidth: "90px" }}>
                {shortName}
              </span>

              {f.message && (
                <span style={{ fontSize: "0.75rem", color: s.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.message}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
