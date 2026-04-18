"use client";

import { useState } from "react";
import type { ValidationResult } from "@/lib/types";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import MarkdownPreview from "@/components/markdown-preview";
import ValidationDetailsTab from "@/components/validation-details-tab";
import ErrorBoundary from "@/components/error-boundary";

interface ResultTabsProps {
  result: ValidationResult;
}

type TabId = "issues" | "preview" | "raw";

const tabs = [
  { id: "issues" as TabId, label: "Details" },
  { id: "preview" as TabId, label: "Preview" },
  { id: "raw" as TabId, label: "Raw" },
];

export default function ResultTabs({ result }: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("issues");

  return (
    <Card
      style={{ overflow: "hidden" }}
      padding="0"
    >
      <Tabs
        tabs={tabs.map((t) => ({ id: t.id, label: t.label }))}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />

      <div style={{ padding: "1.25rem" }}>
        {activeTab === "issues" && (
          <ErrorBoundary>
            <ValidationDetailsTab result={result} />
          </ErrorBoundary>
        )}

        {activeTab === "preview" && (
          <ErrorBoundary>
            {!result.found ? (
              <EmptyState
                title="No preview available"
                description={
                  result.message ??
                  "llms.txt was not loaded, so there is nothing to preview."
                }
              />
            ) : (
              <MarkdownPreview content={result.content ?? ""} />
            )}
          </ErrorBoundary>
        )}

        {activeTab === "raw" && (
          <ErrorBoundary>
            {!result.found ? (
              <EmptyState
                title="No raw content"
                description={
                  result.message ?? "llms.txt was not loaded."
                }
              />
            ) : (
              <pre
                className="code-block"
                style={{ minHeight: "12rem", margin: 0 }}
              >
                {result.content || "No raw content available"}
              </pre>
            )}
          </ErrorBoundary>
        )}
      </div>
    </Card>
  );
}
