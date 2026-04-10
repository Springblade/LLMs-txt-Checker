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

  const tabContent = {
    issues: (
      <ErrorBoundary>
        <ValidationDetailsTab result={result} />
      </ErrorBoundary>
    ),
    preview: (
      <ErrorBoundary>
        <div className="p-4">
          {!result.found ? (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-10 text-center text-sm text-[var(--color-text-secondary)]">
              <p className="font-medium text-zinc-900">No preview available</p>
              <p className="mt-2 text-[var(--color-text-secondary)]">
                {result.message ?? "llms.txt was not loaded, so there is nothing to preview."}
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
        <div className="p-4">
          {!result.found ? (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-10 text-center text-sm text-[var(--color-text-secondary)]">
              <p className="font-medium text-zinc-900">No raw content</p>
              <p className="mt-2 text-[var(--color-text-secondary)]">
                {result.message ?? "llms.txt was not loaded."}
              </p>
            </div>
          ) : (
            <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap min-h-[200px]">
              {result.content || "No raw content available"}
            </pre>
          )}
        </div>
      </ErrorBoundary>
    ),
  };

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--color-border)] bg-zinc-50/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-150 relative ${
              activeTab === tab.id
                ? "text-zinc-900"
                : "text-[var(--color-text-secondary)] hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{tabContent[activeTab]}</div>
    </div>
  );
}
