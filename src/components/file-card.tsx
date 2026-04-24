"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { FileScanResult, FileGenerateResult } from "@/lib/discovery/types";
import { FILE_TIER, TIER_COLORS } from "@/lib/discovery/types";
import { Checklist } from "./checklist";
import { Badge } from "@/components/ui/badge";

const COLORS = {
  bg: "#f5f5f5",
  text: "#45515e",
  border: "#e5e7eb",
  headerBg: "#45515e",
  headerText: "#ffffff",
};

// Distinctive SVG icons for each file type
const FILE_ICONS: Partial<Record<string, string>> = {
  "llms.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  "llm.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><polyline points="21 3 21 9 15 9"/><path d="M21 3l-7 6"/></svg>`,
  "ai.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M12 22v-3"/><circle cx="12" cy="22" r="1"/></svg>`,
  "faq-ai.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  "brand.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="12" r="2.5"/><circle cx="8.5" cy="17.5" r="2.5"/></svg>`,
  "developer-ai.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
  "llms.html": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>`,
  "robots-ai.txt": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>`,
  "identity.json": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  "ai.json": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/></svg>`,
};

// File description for tooltips
const FILE_DESCRIPTIONS: Partial<Record<string, string>> = {
  "llms.txt": "Standard AI-readable file listing all site pages",
  "llm.txt": "Compatibility variant — should redirect (301) to Ilms.txt",
  "ai.txt": "AI usage permissions, restrictions, and attribution requirements",
  "faq-ai.txt": "Frequently asked questions formatted for AI",
  "brand.txt": "Brand identity and visual guidelines",
  "developer-ai.txt": "Technical context for AI systems assisting developers",
  "llms.html": "Human-readable HTML presentation with Schema.org structured data",
  "robots-ai.txt": "AI crawler-specific access directives using robots.txt syntax",
  "identity.json": "Structured canonical identity data aligned with Schema.org Organization",
  "ai.json": "Machine-parseable AI interaction guidance with JSON Schema validation",
};

interface FileCardProps {
  result: FileScanResult;
  generated?: FileGenerateResult;
  generating?: boolean;
  onGenerate?: () => void;
  onDownload?: () => void;
  onCopy?: () => void;
}

export function FileCard({ result, generated, generating, onGenerate, onDownload, onCopy }: FileCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const failedCount = result.checklist.filter((i) => i.status === "failed").length;
  const warningCount = result.checklist.filter((i) => i.status === "warning").length;
  const hasIssues = failedCount > 0 || warningCount > 0;

  const displayResult = generated ?? (result.found ? result : null);
  const hasContent = !!(displayResult?.content);

  const tier = FILE_TIER[result.type];
  const tierColor = TIER_COLORS[tier].color;
  const icon = FILE_ICONS[result.type];

  const copyContent = () => {
    if (!displayResult?.content) return;
    navigator.clipboard.writeText(displayResult.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: `1px solid ${COLORS.border}`,
        borderRadius: "var(--mm-radius-md)",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className="card-interactive"
    >
      {/* File header */}
      <div
        style={{
          backgroundColor: COLORS.headerBg,
          padding: "0.5rem 0.875rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {icon && (
            <span
              style={{
                width: "16px",
                height: "16px",
                color: tierColor,
                opacity: 0.9,
                flexShrink: 0,
              }}
              dangerouslySetInnerHTML={{ __html: icon }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: COLORS.headerText, fontFamily: "ui-monospace, monospace" }}>
              {result.type}
            </span>
            <span style={{ fontSize: "0.6875rem", color: "rgba(180,190,210,1)", fontWeight: 400 }}>
              {FILE_DESCRIPTIONS[result.type]}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          {hasContent && (
            <button
              onClick={() => setShowModal(true)}
              title="View file content"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                padding: "0.125rem",
                display: "flex",
                alignItems: "center",
                transition: "color 0.15s ease",
                borderRadius: "var(--mm-radius-sm)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}
          {generating ? (
            <Badge variant="info">Generating</Badge>
          ) : generated ? (
            <Badge variant={generated.success ? (hasIssues ? "warning" : "success") : "error"}>
              {generated.success ? (hasIssues ? "Generated w/ Issues" : "Generated") : "Failed"}
            </Badge>
          ) : result.found ? (
            <Badge variant="success">Found</Badge>
          ) : (
            <span title={result.skipReason}>
              <Badge variant="neutral">Missing</Badge>
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "0.75rem" }}>
        {/* URL */}
        <div style={{ marginBottom: "0.5rem" }}>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.75rem",
              color: "var(--mm-text-muted)",
              fontFamily: "ui-monospace, monospace",
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
            title={result.url}
          >
            {result.url}
          </a>
        </div>

        {/* Checklist */}
        {displayResult && displayResult.checklist.length > 0 && (
          <div style={{ marginBottom: "0.75rem" }}>
            <Checklist items={displayResult.checklist} defaultExpanded={!result.found} />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {generating ? (
            <span style={{ fontSize: "0.75rem", color: "var(--mm-text-muted)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mm-brand)" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Generating...
            </span>
          ) : !result.found && onGenerate ? (
            <button
              onClick={onGenerate}
              style={{
                padding: "0.375rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                backgroundColor: "var(--mm-brand)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--mm-radius)",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
            >
              Generate
            </button>
          ) : null}

          {hasContent && onCopy && (
            <button
              onClick={onCopy}
              style={{
                padding: "0.375rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                backgroundColor: "var(--mm-bg-secondary)",
                color: "var(--mm-text-secondary)",
                border: "1px solid var(--mm-border)",
                borderRadius: "var(--mm-radius)",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
            >
              Copy
            </button>
          )}

          {hasContent && onDownload && (
            <button
              onClick={onDownload}
              style={{
                padding: "0.375rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                backgroundColor: "var(--mm-bg-secondary)",
                color: "var(--mm-text-secondary)",
                border: "1px solid var(--mm-border)",
                borderRadius: "var(--mm-radius)",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
            >
              Download
            </button>
          )}
        </div>
      </div>

      {/* Modal — rendered at page level via portal */}
      {showModal && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff", borderRadius: "var(--mm-radius-lg)",
              maxWidth: "900px", width: "100%", maxHeight: "85vh", overflow: "auto",
              boxShadow: "var(--mm-shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.75rem 1rem", borderBottom: "1px solid var(--mm-border)",
            }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>
                {result.type}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <button
                  onClick={copyContent}
                  title="Copy to clipboard"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: copied ? "var(--mm-success)" : "var(--mm-text-muted)",
                    padding: "0.25rem", display: "flex", alignItems: "center",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = copied ? "var(--mm-success)" : "var(--mm-text-muted)")}
                >
                  {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  )}
                </button>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mm-text-muted)", padding: "0.25rem", display: "flex", alignItems: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <pre style={{
              margin: 0, padding: "1rem", fontSize: "0.8125rem",
              fontFamily: "ui-monospace, monospace", color: "var(--mm-text-secondary)",
              lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {displayResult?.content ?? ""}
            </pre>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
