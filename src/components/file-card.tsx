"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { FileScanResult, FileGenerateResult } from "@/lib/discovery/types";
import { Checklist } from "./checklist";
import { Badge } from "@/components/ui/badge";

const COLORS = {
  bg: "#f5f5f5",
  text: "#45515e",
  border: "#e5e7eb",
  headerBg: "#45515e",
  headerText: "#ffffff",
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
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: COLORS.headerText, fontFamily: "ui-monospace, monospace" }}>
            {result.type}
          </span>
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
