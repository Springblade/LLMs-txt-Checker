"use client";

import type { Suggestion as SuggestionType } from "@/lib/discovery/types";

interface SuggestionsProps {
  suggestions: SuggestionType[];
  defaultExpanded?: boolean;
}

const PRIORITY_META = {
  high: { bg: "var(--mm-error-bg)", color: "var(--mm-error)", border: "var(--mm-error-border)", label: "High" },
  medium: { bg: "var(--mm-warning-bg)", color: "var(--mm-warning)", border: "var(--mm-warning-border)", label: "Medium" },
  low: { bg: "var(--mm-info-bg)", color: "var(--mm-info)", border: "var(--mm-info-border)", label: "Low" },
} as const;

export function Suggestions({ suggestions, defaultExpanded = true }: SuggestionsProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (suggestions.length === 0) return null;

  const visible = expanded ? suggestions : suggestions.slice(0, 3);
  const hidden = suggestions.length - visible.length;

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mm-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4m0-4h.01" />
          </svg>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--mm-text)" }}>
            Suggestions
          </span>
        </div>
        {suggestions.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.75rem",
              color: "var(--mm-brand)",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            {expanded ? "Show less" : `Show all (${suggestions.length})`}
          </button>
        )}
      </div>

      {/* List */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {visible.map((s) => {
          const meta = PRIORITY_META[s.priority];
          return (
            <li
              key={s.fileType}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.5rem",
                backgroundColor: "var(--mm-bg-secondary)",
                borderRadius: "var(--mm-radius)",
              }}
            >
              <span
                style={{
                  padding: "0.125rem 0.375rem",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  backgroundColor: meta.bg,
                  color: meta.color,
                  border: `1px solid ${meta.border}`,
                  borderRadius: "var(--mm-radius-pill)",
                  flexShrink: 0,
                }}
              >
                {meta.label}
              </span>
              <div>
                <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--mm-text)", margin: 0 }}>
                  {s.action}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--mm-text-muted)", margin: "0.125rem 0 0 0", lineHeight: 1.4 }}>
                  {s.reason}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {expanded && hidden > 0 && (
        <p style={{ fontSize: "0.75rem", color: "var(--mm-text-muted)", marginTop: "0.5rem", textAlign: "center" }}>
          +{hidden} more suggestions
        </p>
      )}
    </div>
  );
}

import { useState } from "react";
