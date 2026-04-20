"use client";

import { useState } from "react";
import type { FileScanResult, FileGenerateResult, FileType } from "@/lib/discovery/types";
import { FILE_TIER } from "@/lib/discovery/types";
import { FileCard } from "./file-card";

interface FileListProps {
  scanResults: FileScanResult[];
  generatedFiles: Map<FileType, FileGenerateResult>;
  generatingFiles: Set<FileType>;
  onGenerate: (fileType: FileType) => void;
  onGenerateAll: () => void;
}

function TierLabel({ tier }: { tier: "essential" | "recommended" | "optional" }) {
  const labels = { essential: "Essential", recommended: "Recommended", optional: "Optional" };
  return (
    <p
      style={{
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--mm-text-muted)",
        marginBottom: "0.75rem",
      }}
    >
      {labels[tier]}
    </p>
  );
}

function ScoreBar({ score, found, total }: { score: number; found: number; total: number }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid var(--mm-border)",
        borderRadius: "var(--mm-radius-md)",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        boxShadow: "var(--mm-shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--mm-text)" }}>
          AI Discovery Score
        </span>
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--mm-brand)" }}>
          {score}/100
        </span>
      </div>

      {/* Bar */}
      <div
        style={{
          height: "8px",
          backgroundColor: "var(--mm-bg-secondary)",
          borderRadius: "9999px",
          overflow: "hidden",
          marginBottom: "0.375rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            backgroundColor: score >= 80 ? "var(--mm-success)" : score >= 50 ? "var(--mm-warning)" : "var(--mm-error)",
            borderRadius: "9999px",
            transition: "width 0.5s ease",
          }}
        />
      </div>

      <p style={{ fontSize: "0.75rem", color: "var(--mm-text-muted)", margin: 0 }}>
        {found} of {total} files found
      </p>
    </div>
  );
}

export function FileList({
  scanResults,
  generatedFiles,
  generatingFiles,
  onGenerate,
  onGenerateAll,
}: FileListProps) {
  const [showOptional, setShowOptional] = useState(false);

  const essential = scanResults.filter((f) => FILE_TIER[f.type] === "essential");
  const recommended = scanResults.filter((f) => FILE_TIER[f.type] === "recommended");
  const optional = scanResults.filter((f) => FILE_TIER[f.type] === "optional");

  const missingCount = scanResults.filter((f) => !f.found).length;
  const foundCount = scanResults.filter((f) => f.found).length;
  const score = Math.round((foundCount / scanResults.length) * 100);

  return (
    <div>
      <ScoreBar score={score} found={foundCount} total={scanResults.length} />

      {/* Essential */}
      {essential.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <TierLabel tier="essential" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            {essential.map((r) => (
              <FileCard
                key={r.type}
                result={r}
                generated={generatedFiles.get(r.type)}
                generating={generatingFiles.has(r.type)}
                onGenerate={!r.found && !generatingFiles.has(r.type) && !generatedFiles.has(r.type) ? () => onGenerate(r.type) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <TierLabel tier="recommended" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            {recommended.map((r) => (
              <FileCard
                key={r.type}
                result={r}
                generated={generatedFiles.get(r.type)}
                generating={generatingFiles.has(r.type)}
                onGenerate={!r.found && !generatingFiles.has(r.type) && !generatedFiles.has(r.type) ? () => onGenerate(r.type) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional */}
      {optional.length > 0 && (
        <div>
          <TierLabel tier="optional" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            {(showOptional ? optional : optional.slice(0, 3)).map((r) => (
              <FileCard
                key={r.type}
                result={r}
                generated={generatedFiles.get(r.type)}
                generating={generatingFiles.has(r.type)}
                onGenerate={!r.found && !generatingFiles.has(r.type) && !generatedFiles.has(r.type) ? () => onGenerate(r.type) : undefined}
              />
            ))}
          </div>

          {optional.length > 3 && (
            <button
              onClick={() => setShowOptional(!showOptional)}
              style={{
                marginTop: "0.75rem",
                background: "none",
                border: "1px solid var(--mm-border)",
                borderRadius: "var(--mm-radius)",
                padding: "0.375rem 0.75rem",
                fontSize: "0.8125rem",
                color: "var(--mm-brand)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
              }}
            >
              {showOptional ? "Show less" : `Show all (${optional.length})`}
            </button>
          )}
        </div>
      )}

      {/* Generate All Missing */}
      {missingCount > 0 && (
        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
          <button
            onClick={onGenerateAll}
            style={{
              padding: "0.625rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              backgroundColor: "var(--mm-brand)",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--mm-radius)",
              cursor: "pointer",
              transition: "background-color 0.15s ease, transform 0.15s ease",
            }}
          >
            Generate All Missing ({missingCount})
          </button>
        </div>
      )}
    </div>
  );
}
