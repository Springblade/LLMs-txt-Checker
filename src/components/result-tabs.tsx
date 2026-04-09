"use client";

import { useState } from "react";
import type { ValidationResult } from "@/lib/types";
import MarkdownPreview from "@/components/markdown-preview";
import { IssuesList } from "@/components/issues-list";
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
        <div className="bg-slate-900 rounded-lg overflow-hidden">
          <IssuesList
            found={result.found}
            message={result.message}
            errors={result.errors ?? []}
            warnings={result.warnings ?? []}
          />
        </div>
      </ErrorBoundary>
    ),
    preview: (
      <ErrorBoundary>
        <div className="p-4">
          {!result.found ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
              <p className="font-medium text-slate-800">No preview available</p>
              <p className="mt-2 text-slate-500">
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
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
              <p className="font-medium text-slate-800">No raw content</p>
              <p className="mt-2 text-slate-500">
                {result.message ?? "llms.txt was not loaded."}
              </p>
            </div>
          ) : (
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap min-h-[200px]">
              {result.content || "No raw content available"}
            </pre>
          )}
        </div>
      </ErrorBoundary>
    ),
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{tabContent[activeTab]}</div>
    </div>
  );
}
