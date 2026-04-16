"use client";

import { useState } from "react";
import type { ValidationResult } from "@/lib/types";
import MarkdownPreview from "@/components/markdown-preview";
import ValidationDetailsTab from "@/components/validation-details-tab";
import ErrorBoundary from "@/components/error-boundary";

interface ResultTabsProps {
  result: ValidationResult;
}

type TabId = "issues" | "preview" | "raw";

const tabs: { id: TabId; label: string }[] = [
  { id: "issues", label: "Details" },
  { id: "preview", label: "Preview" },
  { id: "raw", label: "Raw" },
];

export default function ResultTabs({ result }: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("issues");

  const tabContent: Record<TabId, React.ReactNode> = {
    issues: (
      <ErrorBoundary>
        <div className="px-4 py-4">
          <ValidationDetailsTab result={result} />
        </div>
      </ErrorBoundary>
    ),
    preview: (
      <ErrorBoundary>
        <div className="px-4 py-4">
          {!result.found ? (
            <div
              className="px-5 py-12 text-center"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
              }}
            >
              <p
                className="font-medium text-sm"
                style={{ color: "var(--color-text)" }}
              >
                No preview available
              </p>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {result.message ??
                  "llms.txt was not loaded, so there is nothing to preview."}
              </p>
            </div>
          ) : (
            <MarkdownPreview content={result.content ?? ""} />
          )}
        </div>
      </ErrorBoundary>
    ),
    raw: (
      <ErrorBoundary>
        <div className="px-4 py-4">
          {!result.found ? (
            <div
              className="px-5 py-12 text-center"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
              }}
            >
              <p
                className="font-medium text-sm"
                style={{ color: "var(--color-text)" }}
              >
                No raw content
              </p>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {result.message ?? "llms.txt was not loaded."}
              </p>
            </div>
          ) : (
            <pre
              className="p-5 pre-warm text-sm font-mono overflow-x-auto whitespace-pre-wrap min-h-[200px]"
              style={{ borderRadius: "var(--radius)" }}
            >
              {result.content || "No raw content available"}
            </pre>
          )}
        </div>
      </ErrorBoundary>
    ),
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow-golden-md)",
        overflow: "hidden",
      }}
    >
      {/* ── Tab bar — cream background ────────────────────────────── */}
      <div
        className="flex"
        style={{
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-secondary)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-all duration-150 tab-underline ${
              activeTab === tab.id ? "active" : ""
            }`}
            style={
              activeTab === tab.id
                ? { color: "var(--color-text)" }
                : { color: "var(--color-text-secondary)" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────── */}
      <div>{tabContent[activeTab]}</div>
    </div>
  );
}
