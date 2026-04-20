"use client";

import { useState } from "react";
import type { DiscoverResult, FileType, FileGenerateResult } from "@/lib/discovery/types";
import { FileList } from "./file-list";
import { Suggestions } from "./suggestions";
import { GenerationProgress } from "./generation-progress";
import { Button } from "@/components/ui/button";

interface ResultSectionProps {
  result: DiscoverResult;
  generatingFiles: Map<FileType, FileGenerateResult>;
  inProgressFiles: Set<FileType>;
  onGenerate: (fileType: FileType) => void;
  onGenerateAll: () => void;
  onReset: () => void;
}

export function ResultSection({
  result,
  generatingFiles,
  inProgressFiles,
  onGenerate,
  onGenerateAll,
  onReset,
}: ResultSectionProps) {
  const [overallStatus, setOverallStatus] = useState<"idle" | "scanning" | "generating" | "done">("idle");

  const handleGenerateAll = async () => {
    if (result.missingFiles.length === 0) return;
    setOverallStatus("generating");
    await onGenerateAll();
    setOverallStatus("done");
  };

  const foundCount = result.files.filter((f) => f.found).length;
  const missingCount = result.files.filter((f) => !f.found).length;
  const displayOrigin = result.origin.replace(/^https?:\/\//, "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid var(--mm-border)",
          borderRadius: "var(--mm-radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--mm-shadow-lg)",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <p
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--mm-text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            Scan Results
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" as const }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--mm-text)",
                margin: 0,
              }}
            >
              {displayOrigin}
            </h2>
            <span
              style={{
                padding: "0.25rem 0.625rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                backgroundColor: "var(--mm-success-bg)",
                color: "var(--mm-success)",
                border: "1px solid var(--mm-success-border)",
                borderRadius: "var(--mm-radius-pill)",
              }}
            >
              {foundCount} found
            </span>
            {missingCount > 0 && (
              <span
                style={{
                  padding: "0.25rem 0.625rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: "var(--mm-warning-bg)",
                  color: "var(--mm-warning)",
                  border: "1px solid var(--mm-warning-border)",
                  borderRadius: "var(--mm-radius-pill)",
                }}
              >
                {missingCount} missing
              </span>
            )}
          </div>
        </div>

        {overallStatus !== "idle" && (
          <div style={{ marginBottom: "1rem" }}>
            <GenerationProgress
              files={result.files.map((f) => ({
                type: f.type,
                status: inProgressFiles.has(f.type)
                  ? "generating"
                  : f.found
                    ? "done"
                    : generatingFiles.has(f.type)
                      ? "done"
                      : "idle",
              }))}
              overallStatus={overallStatus}
            />
          </div>
        )}

        <FileList
          scanResults={result.files}
          generatedFiles={generatingFiles}
          generatingFiles={inProgressFiles}
          onGenerate={onGenerate}
          onGenerateAll={handleGenerateAll}
        />
      </div>

      {result.suggestions.length > 0 && (
        <Suggestions suggestions={result.suggestions} defaultExpanded={true} />
      )}

      <div style={{ display: "flex", justifyContent: "center", paddingTop: "0.5rem" }}>
        <Button variant="ghost" size="md" onClick={onReset}>
          Scan Another URL
        </Button>
      </div>
    </div>
  );
}
