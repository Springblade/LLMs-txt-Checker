"use client";

import { useState } from "react";
import type { ChecklistItem, FileType } from "@/lib/discovery/types";
import { TierBadge } from "./tier-badge";
import { StatusBadge } from "./status-badge";
import type { Tier } from "@/lib/design-tokens";

type FileStatus = "found" | "missing" | "partial";

interface FileCardDetailProps {
  file: {
    name: string;
    tier: Tier;
    status: FileStatus;
    lines?: number;
    content?: string | null;
    recommendation?: string | null;
    issue?: string | null;
    checklist?: ChecklistItem[];
  };
  isSelected: boolean;
  isGenerating: boolean;
  onToggle: (name: string) => void;
  onGenerate?: (name: FileType) => void;
  delay?: number;
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AlertIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

function CriteriaBadge({ checklist }: { checklist: ChecklistItem[] }) {
  const passCount = checklist.filter((c) => c.status === "passed").length;
  const total = checklist.length;
  const allPass = passCount === total;
  const majorityFail = passCount < total / 2;
  const badgeColor = allPass ? "#22c55e" : majorityFail ? "#ef4444" : "#eab308";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        fontSize: 11,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        borderRadius: 5,
        background: `${badgeColor}15`,
        color: badgeColor,
        border: `1px solid ${badgeColor}30`,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {allPass ? <CheckIcon /> : majorityFail ? <XIcon /> : <AlertIcon />}
      {passCount}/{total}
    </span>
  );
}

export function FileCardDetail({
  file,
  isSelected,
  isGenerating,
  onToggle,
  onGenerate,
  delay = 0,
}: FileCardDetailProps) {
  const [expanded, setExpanded] = useState(false);
  const [checklistExpanded, setChecklistExpanded] = useState(file.status === "missing");
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (!file.content) return;
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!file.content) return;
    await navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="card-stagger"
      style={{
        background: "var(--mm-bg-secondary)",
        border: `1px solid ${isSelected ? "rgba(20,86,240,0.4)" : "var(--mm-border)"}`,
        borderRadius: 14,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        animationDelay: `${delay}s`,
        position: "relative",
      }}
      onClick={() => onToggle(file.name)}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Left: checkbox + info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          {/* Checkbox */}
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              border: `2px solid ${isSelected ? "var(--mm-brand)" : "var(--mm-border)"}`,
              background: isSelected ? "var(--mm-brand)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s ease",
            }}
          >
            {isSelected && <CheckIcon />}
          </div>

          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--mm-text)",
                marginBottom: 6,
              }}
            >
              {file.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <TierBadge tier={file.tier} />
              <StatusBadge status={file.status} />
              {file.lines != null && file.lines > 0 && (
                <span style={{ fontSize: 11, color: "var(--mm-text-muted)" }}>
                  {file.lines} lines
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {file.checklist && file.checklist.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setChecklistExpanded(!checklistExpanded);
              }}
            >
              <CriteriaBadge checklist={file.checklist} />
            </span>
          )}

          {file.status === "missing" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerate?.(file.name as FileType);
              }}
              disabled={isGenerating}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                color: "#fff",
                background: isGenerating ? "var(--mm-bg-tertiary)" : "var(--mm-brand)",
                border: "none",
                borderRadius: 6,
                cursor: isGenerating ? "wait" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {isGenerating ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : (
                <SparkleIcon />
              )}
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          )}

          {file.status !== "missing" && (
            <>
              <button
                onClick={(e) => e.stopPropagation()}
                title="Regenerate"
                style={{
                  background: "none",
                  border: "1px solid rgba(59,130,246,0.25)",
                  color: "var(--mm-brand)",
                  cursor: "pointer",
                  padding: "5px 7px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 6,
                }}
              >
                <RefreshIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                title="Download"
                style={{
                  background: "none",
                  border: "1px solid rgba(59,130,246,0.25)",
                  color: "var(--mm-brand-light)",
                  cursor: "pointer",
                  padding: "5px 7px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 6,
                }}
              >
                <DownloadIcon />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                title={copied ? "Copied!" : "Copy markdown"}
                style={{
                  background: "none",
                  border: "none",
                  color: copied ? "#22c55e" : "var(--mm-text-muted)",
                  cursor: "pointer",
                  padding: "5px 7px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 6,
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--mm-text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recommendation for missing */}
      {file.status === "missing" && file.recommendation && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            background: "rgba(20,86,240,0.06)",
            border: "1px solid rgba(20,86,240,0.15)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--mm-text-muted)",
            lineHeight: 1.5,
          }}
        >
          {file.recommendation}
        </div>
      )}

      {/* Issue for partial */}
      {file.status === "partial" && file.issue && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "rgba(234,179,8,0.1)",
            border: "1px solid rgba(234,179,8,0.2)",
            borderRadius: 6,
            fontSize: 12,
            color: "#eab308",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <AlertIcon />
          {file.issue}
        </div>
      )}

      {/* Content preview */}
      {expanded && file.content && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            background: "var(--mm-bg-tertiary)",
            borderRadius: 8,
            border: "1px solid var(--mm-border)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--mm-text-muted)",
              marginBottom: 8,
            }}
          >
            Content preview
          </div>
          <pre
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 11,
              color: "var(--mm-text-muted)",
              lineHeight: 1.6,
              whiteSpace: "pre",
              overflow: "hidden",
            }}
          >
            {file.content.slice(0, 500)}
            {file.content.length > 500 ? "\n..." : ""}
          </pre>
        </div>
      )}

      {/* Validation checklist */}
      {file.checklist && file.checklist.length > 0 && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            background: "var(--mm-bg-tertiary)",
            borderRadius: 8,
            border: "1px solid var(--mm-border)",
          }}
        >
          {/* Checklist header */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setChecklistExpanded(!checklistExpanded);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              userSelect: "none",
              marginBottom: checklistExpanded ? 10 : 0,
            }}
          >
            <span
              style={{
                color: "var(--mm-text-muted)",
                display: "flex",
                alignItems: "center",
                transform: checklistExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.2s",
              }}
            >
              <ChevronDownIcon />
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--mm-text-muted)",
              }}
            >
              Validation checklist
            </span>
          </div>

          {checklistExpanded &&
            file.checklist.map((item, i) => {
              const color =
                item.status === "passed"
                  ? "#22c55e"
                  : item.status === "failed"
                  ? "#ef4444"
                  : "#eab308";
              const icon =
                item.status === "passed" ? (
                  <CheckIcon />
                ) : item.status === "failed" ? (
                  <XIcon />
                ) : (
                  <AlertIcon />
                );
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    padding: "8px 0",
                    borderBottom:
                      i < file.checklist!.length - 1
                        ? "1px solid var(--mm-border)"
                        : "none",
                    animation: "mm-fade-in 0.25s ease-out",
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <span style={{ color, marginTop: 1, flexShrink: 0 }}>{icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--mm-text)" }}>
                      {item.label}
                    </span>
                    {item.message && (
                      <span style={{ fontSize: 11, color: "var(--mm-text-muted)", marginLeft: 4 }}>
                        — {item.message}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
