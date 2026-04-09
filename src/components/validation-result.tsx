"use client";

import { useState } from "react";
import type { ValidationResult } from "@/lib/types";
import { HealthScoreRing } from "@/components/health-score-ring";
import { IssuesList } from "@/components/issues-list";
import MarkdownPreview from "@/components/markdown-preview";

interface ValidationResultProps {
  result: ValidationResult | null;
}

type TabId = "issues" | "preview" | "raw";

const tabs: { id: TabId; label: string }[] = [
  { id: "issues", label: "Details" },
  { id: "preview", label: "Preview" },
  { id: "raw", label: "Raw" },
];

export default function ValidationResult({ result }: ValidationResultProps) {
  const [activeTab, setActiveTab] = useState<TabId>("issues");

  if (!result) {
    return (
      <div className="bg-white rounded-[var(--radius)] border border-slate-100 p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-500 text-sm">Enter a URL and click Validate to start checking</p>
      </div>
    );
  }

  if (!result.found) {
    return (
      <div className="bg-white rounded-[var(--radius)] border border-slate-100 p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-slate-700 font-medium mb-1">llms.txt not found</p>
        <p className="text-slate-500 text-sm">{result.message ?? "File does not exist or cannot be accessed"}</p>
      </div>
    );
  }

  const healthScore = result.healthScore;
  const score = healthScore?.score ?? 0;
  const scoreStatus = healthScore?.status ?? "fail";

  const tabContent = {
    issues: (
      <div className="bg-slate-900 rounded-lg overflow-hidden">
        <IssuesList
          found={result.found}
          message={result.message}
          errors={result.errors ?? []}
          warnings={result.warnings ?? []}
        />
      </div>
    ),
    preview: (
      <div className="p-4">
        <MarkdownPreview content={result.content ?? ""} />
      </div>
    ),
    raw: (
      <div className="p-4">
        <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap min-h-[200px]">
          {result.content || "No raw content available"}
        </pre>
      </div>
    ),
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Score Ring + summary */}
      <div className="bg-white rounded-[var(--radius)] border border-slate-100 p-6 flex flex-col sm:flex-row items-center gap-6">
        <HealthScoreRing score={score} status={scoreStatus} />
        <div className="flex-1 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-800">{result.errors.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Errors</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{result.warnings.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Warnings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{result.linkResults?.length ?? 0}</p>
            <p className="text-xs text-slate-500 mt-0.5">Links</p>
          </div>
        </div>
      </div>

      {/* 3 Tabs */}
      <div className="bg-white rounded-[var(--radius)] border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-[var(--color-primary)]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" />
              )}
            </button>
          ))}
        </div>
        <div>{tabContent[activeTab]}</div>
      </div>
    </div>
  );
}
