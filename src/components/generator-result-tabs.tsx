"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import MarkdownPreview from "@/components/markdown-preview";
import ErrorBoundary from "@/components/error-boundary";
import type { GeneratorResult } from "@/lib/generator";

interface GeneratorResultTabsProps {
  result: GeneratorResult;
}

type TabId = "preview" | "raw";

const tabDefs = [
  { id: "preview" as TabId, label: "Preview" },
  { id: "raw" as TabId, label: "Raw" },
];

export default function GeneratorResultTabs({ result }: GeneratorResultTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("preview");

  return (
    <Card style={{ overflow: "hidden" }} padding="0">
      <Tabs
        tabs={tabDefs.map((t) => ({ id: t.id, label: t.label }))}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />

      <div style={{ padding: "1.25rem" }}>
        {activeTab === "preview" && (
          <ErrorBoundary>
            {!result.content ? (
              <EmptyState
                title="No content generated"
                description="The generator did not produce any content."
              />
            ) : (
              <MarkdownPreview content={result.content} />
            )}
          </ErrorBoundary>
        )}

        {activeTab === "raw" && (
          <ErrorBoundary>
            {!result.content ? (
              <EmptyState
                title="No raw content"
                description="No content was generated."
              />
            ) : (
              <pre
                className="code-block"
                style={{ minHeight: "12rem", margin: 0 }}
              >
                {result.content}
              </pre>
            )}
          </ErrorBoundary>
        )}
      </div>
    </Card>
  );
}
