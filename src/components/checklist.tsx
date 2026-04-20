"use client";

import type { ChecklistItem } from "@/lib/discovery/types";

interface ChecklistProps {
  items: ChecklistItem[];
  compact?: boolean;
  defaultExpanded?: boolean;
}

const STATUS_META = {
  passed: {
    color: "var(--mm-success)",
    bg: "var(--mm-success-bg)",
    border: "var(--mm-success-border)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  failed: {
    color: "var(--mm-error)",
    bg: "var(--mm-error-bg)",
    border: "var(--mm-error-border)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    color: "var(--mm-warning)",
    bg: "var(--mm-warning-bg)",
    border: "var(--mm-warning-border)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  skipped: {
    color: "var(--mm-text-muted)",
    bg: "var(--mm-bg-secondary)",
    border: "var(--mm-border)",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
      </svg>
    ),
  },
} as const;

export function Checklist({ items, compact = false, defaultExpanded = false }: ChecklistProps) {
  const failedCount = items.filter((i) => i.status === "failed").length;
  const warningCount = items.filter((i) => i.status === "warning").length;
  const [expanded, setExpanded] = useState(defaultExpanded || failedCount + warningCount === 0);

  const visibleItems = expanded ? items : items.filter((i) => i.status === "failed" || i.status === "warning");
  const hiddenCount = items.length - visibleItems.length;

  if (items.length === 0) return null;

  return (
    <div>
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.25rem 0",
          fontSize: "0.75rem",
          color: "var(--mm-text-muted)",
          fontFamily: "inherit",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        {expanded ? "Hide" : "Show"} checklist
        {!expanded && hiddenCount > 0 && ` (${hiddenCount} passed)`}
      </button>

      {/* Items */}
      {expanded && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {visibleItems.map((item) => {
            const meta = STATUS_META[item.status];
            return (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  padding: "0.375rem 0.5rem",
                  backgroundColor: meta.bg,
                  borderLeft: `2px solid ${meta.border}`,
                  borderRadius: "0 var(--mm-radius-sm) var(--mm-radius-sm) 0",
                }}
              >
                <span style={{ color: meta.color, flexShrink: 0, marginTop: "1px" }}>{meta.icon}</span>
                <span
                  style={{
                    fontSize: compact ? "0.75rem" : "0.8125rem",
                    color: item.status === "skipped" ? "var(--mm-text-muted)" : meta.color,
                    fontStyle: item.status === "skipped" ? "italic" : "normal",
                    lineHeight: 1.5,
                  }}
                >
                  {item.label}
                  {item.value !== undefined && (
                    <span style={{ fontWeight: 600, marginLeft: "0.25rem" }}>({item.value})</span>
                  )}
                  {item.message && (
                    <span style={{ display: "block", fontSize: "0.75rem", marginTop: "0.125rem", opacity: 0.8 }}>
                      {item.message}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Inline useState import
import { useState } from "react";
