"use client";

import React, { useState } from "react";
import type { ChecklistItem } from "@/lib/discovery/types";
import type { FileTier } from "@/lib/discovery/types";
import { TIER_COLORS } from "@/lib/discovery/types";
import { FILE_DESCRIPTIONS } from "@/lib/file-descriptions";

// ─── Design tokens ──────────────────────────────────────────────────────────────

const t = {
  bg: "#09090e",
  panel: "#111118",
  border: "#27272a",
  divider: "#18181f",
  accent: "#818cf8",
  text: "#e4e4e7",
  textMuted: "#71717a",
  textSubtle: "#52525b",
  success: "#22c55e",
  successBg: "rgba(34,197,94,0.08)",
  warning: "#eab308",
  warningBg: "rgba(234,179,8,0.08)",
  error: "#ef4444",
  errorBg: "rgba(239,68,68,0.12)",
} as const;

// ─── Icons ────────────────────────────────────────────────────────────────────

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
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 11-2.36-9.36L23 10" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 01-1.275 1.275L3 12l5.813 1.912a2 2 0 011.275 1.275L12 21l1.912-5.813a2 2 0 011.275-1.275L21 12l-5.813-1.912a2 2 0 01-1.275-1.275L12 3z" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getStatusIcon(status: ChecklistItem["status"]) {
  if (status === "passed") return <CheckIcon />;
  if (status === "failed") return <XIcon />;
  if (status === "warning") return <AlertIcon />;
  return null;
}

function getStatusColor(status: ChecklistItem["status"]) {
  return status === "passed" ? t.success : status === "failed" ? t.error : t.warning;
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: "found" | "missing" | "partial";
}

function StatusBadge({ status }: StatusBadgeProps) {
  const map = {
    found: { label: "FOUND", color: t.success, bg: "rgba(34,197,94,0.12)" },
    partial: { label: "PARTIAL", color: t.warning, bg: "rgba(234,179,8,0.12)" },
    missing: { label: "MISSING", color: t.error, bg: "rgba(239,68,68,0.12)" },
  };
  const b = map[status] ?? map.found;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: b.color,
        background: b.bg,
        padding: "2px 7px",
        borderRadius: 4,
        letterSpacing: "0.04em",
      }}
    >
      {b.label}
    </span>
  );
}

interface MetaRowProps {
  lines: number;
  chars: number;
  passed: number;
  total: number;
}

function MetaRow({ lines, chars, passed, total }: MetaRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 14px",
        background: t.panel,
        borderBottom: `1px solid ${t.divider}`,
      }}
    >
      <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
        {lines} lines
      </span>
      <span style={{ color: t.textSubtle, fontSize: 10 }}>·</span>
      <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
        {chars.toLocaleString()} chars
      </span>
      {total > 0 && (
        <>
          <span style={{ color: t.textSubtle, fontSize: 10 }}>·</span>
          <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
            {passed}/{total} checks
          </span>
        </>
      )}
    </div>
  );
}

interface ChecklistProps {
  items: ChecklistItem[];
}

function Checklist({ items }: ChecklistProps) {
  const passedCount = items.filter((c) => c.status === "passed").length;
  const warningCount = items.filter((c) => c.status === "warning").length;
  const failedCount = items.filter((c) => c.status === "failed").length;

  return (
    <div style={{ padding: "10px 14px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: t.textSubtle,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Validation
        </span>
        <div style={{ flex: 1, height: 1, background: t.divider }} />
        <span style={{ fontSize: 10, color: t.success }}>{passedCount} passed</span>
        {warningCount > 0 && (
          <span style={{ fontSize: 10, color: t.warning }}>{warningCount} warning</span>
        )}
        {failedCount > 0 && (
          <span style={{ fontSize: 10, color: t.error }}>{failedCount} failed</span>
        )}
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "5px 9px",
              borderRadius: 5,
              borderLeft:
                item.status !== "passed"
                  ? `2px solid ${getStatusColor(item.status)}`
                  : "2px solid transparent",
              background: item.status === "passed" ? t.successBg : "transparent",
            }}
          >
            <span
              style={{ color: getStatusColor(item.status), marginTop: 1, flexShrink: 0 }}
            >
              {getStatusIcon(item.status)}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: t.text, lineHeight: 1.4 }}>
                {item.label}
              </p>
              {item.message && (
                <p
                  style={{
                    fontSize: 10,
                    color: getStatusColor(item.status),
                    marginTop: 1,
                    lineHeight: 1.4,
                  }}
                >
                  {item.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ContentPreviewProps {
  content: string;
}

function highlightUrls(text: string): React.ReactNode {
  type Segment =
    | { type: "heading"; level: 1 | 2 | 3; text: string }
    | { type: "mdLink"; bracket: string; url: string }
    | { type: "bracket"; text: string }
    | { type: "url"; text: string }
    | { type: "plain"; text: string };

  const HEADING_COLORS = { 1: "#f4f4f5", 2: "#d4d4d8", 3: "#a1a1aa" } as const;
  const BRACKET_COLOR = "#22d3ee";
  const URL_COLOR = t.accent as string;

  function renderSegments(segs: Segment[]): React.ReactNode {
    return segs.map((seg, i) => {
      if (seg.type === "heading") {
        return (
          <span key={i} style={{ color: HEADING_COLORS[seg.level], fontWeight: 700 }}>
            {"#".repeat(seg.level)}{" "}{seg.text}
          </span>
        );
      }
      if (seg.type === "mdLink") {
        return (
          <span key={i}>
            <span style={{ color: BRACKET_COLOR }}>{seg.bracket}</span>
            <span style={{ color: URL_COLOR }}>{seg.url}</span>
          </span>
        );
      }
      if (seg.type === "bracket") {
        return <span key={i} style={{ color: BRACKET_COLOR }}>{seg.text}</span>;
      }
      if (seg.type === "url") {
        return <span key={i} style={{ color: URL_COLOR }}>{seg.text}</span>;
      }
      // plain
      return <span key={i}>{seg.text}</span>;
    });
  }

  // Match h1/h2/h3 at start of line
  const headingMatch = text.match(/^(#{1,3})\s+(.*)$/);
  if (headingMatch) {
    return renderSegments([{ type: "heading", level: headingMatch[1]!.length as 1 | 2 | 3, text: headingMatch[2] ?? "" }]);
  }

  // Tokenize: markdown-link first (consumes [text](url) as one unit), then bracket, URL, plain
  // Note: md-link pattern must come BEFORE bracket so it matches first
  const mdLinkRe = /(\[[^\]]{1,200}\]\(https?:\/\/[^\s<>"{}|\\^`\[\]]+\))/g;
  const mdLinkParts = text.split(mdLinkRe);
  if (mdLinkParts.length > 1) {
    const segments: Segment[] = [];
    for (const part of mdLinkParts) {
      const mdMatch = part.match(/^(\[[^\]]{1,200}\]\()(https?:\/\/[^\s<>"{}|\\^`\[\]]+)\)$/);
      if (mdMatch) {
        segments.push({ type: "mdLink", bracket: mdMatch[1] ?? "", url: mdMatch[2] ?? "" });
      } else {
        // Recurse on non-md-link parts to handle brackets/URLs within them
        const inner = tokenizeToSegments(part);
        if (typeof inner === "string") {
          segments.push({ type: "plain", text: inner });
        } else {
          segments.push(...inner);
        }
      }
    }
    return renderSegments(segments);
  }

  const inner = tokenizeToSegments(text);
  return renderSegments(typeof inner === "string" ? [{ type: "plain", text: inner }] : inner);

  function tokenizeToSegments(input: string): string | Segment[] {
    if (!input) return "";
    const tokenRe =
      /(\[[^\]]{1,200}\])|(https?:\/\/[^\s<>"{}|\\^`\[\]]+)|([^\[\n]+)/g;
    const segs: Segment[] = [];
    let m: RegExpExecArray | null;
    while ((m = tokenRe.exec(input)) !== null) {
      if (m[1]) segs.push({ type: "bracket", text: m[1] });
      else if (m[2]) segs.push({ type: "url", text: m[2] });
      else if (m[3]) segs.push({ type: "plain", text: m[3] ?? "" });
    }
    return segs.length > 0 ? segs : input;
  }
}

function ContentPreview({ content }: ContentPreviewProps) {
  const previewLines = content.split("\n");
  return (
    <div style={{ padding: "0 14px 10px" }}>
      {/* Header label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: t.textMuted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Content
        </span>
        <div style={{ flex: 1, height: 1, background: t.divider }} />
      </div>
      {/* Preview box */}
      <div
        style={{
          maxHeight: 300,
          overflowY: "auto",
          padding: "10px 12px",
          background: t.panel,
          borderRadius: 6,
          border: `1px solid #1c1c24`,
        }}
      >
        {previewLines.map((line, i) => (
          <p
            key={i}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5,
              color: "#a1a1aa",
              lineHeight: 1.65,
              wordBreak: "break-word",
            }}
          >
            {highlightUrls(line) || "\u00a0"}
          </p>
        ))}
      </div>
    </div>
  );
}

interface ActionBarProps {
  content: string | null | undefined;
  onCopy: () => void;
  copied: boolean;
  onDownload: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  isMissing: boolean;
}

function ActionBar({
  content,
  onCopy,
  copied,
  onDownload,
  onRegenerate,
  isGenerating,
  isMissing,
}: ActionBarProps) {
  const btnStyle = (
    color: string,
    bg = "transparent",
    active = false,
    disabled = false,
  ) => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: "7px 10px",
    borderRadius: 6,
    border: `1px solid ${active ? color : t.border}`,
    cursor: disabled ? "not-allowed" : "pointer",
    background: bg,
    color: disabled ? t.textSubtle : color,
    fontSize: 11,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.15s, color 0.15s, border-color 0.15s",
    opacity: disabled ? 0.5 : 1,
  });

  if (isMissing) {
    return (
      <div style={{ padding: "10px 14px 14px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRegenerate();
          }}
          disabled={isGenerating}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            cursor: isGenerating ? "not-allowed" : "pointer",
            background: t.accent,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            opacity: isGenerating ? 0.75 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {isGenerating ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ animation: "spin 0.8s linear infinite" }}
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <SparkleIcon />
          )}
          {isGenerating ? "Generating..." : "Generate with AI"}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "10px 14px 14px",
        borderTop: `1px solid ${t.divider}`,
        display: "flex",
        gap: 6,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        disabled={!content}
        style={btnStyle(t.success, copied ? "rgba(34,197,94,0.08)" : "transparent", copied, !content)}
      >
        <CopyIcon />
        {copied ? "Copied!" : "Copy"}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDownload();
        }}
        disabled={!content}
        style={btnStyle(t.textMuted, "transparent", false, !content)}
      >
        <DownloadIcon />
        Download
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRegenerate();
        }}
        disabled={isGenerating}
        style={btnStyle(t.textMuted, "transparent", false, isGenerating)}
      >
        <RefreshIcon />
        Regenerate
      </button>
    </div>
  );
}

// ─── Main FileCard ──────────────────────────────────────────────────────────────

export interface FileCardProps {
  fileType: string;
  tier: FileTier;
  found: boolean;
  content: string | null | undefined;
  checklist: ChecklistItem[];
  isGenerating?: boolean;
  onGenerate?: () => void;
  onDownload: () => void;
  onRegenerate: () => void;
}

export function FileCard({
  fileType,
  tier,
  found,
  content,
  checklist,
  isGenerating = false,
  onGenerate,
  onDownload,
  onRegenerate,
}: FileCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const tierColor = TIER_COLORS[tier]?.color ?? "#8b5cf6";
  const lines = content ? content.split("\n").length : 0;
  const chars = content ? content.length : 0;
  const passed = checklist.filter((c) => c.status === "passed").length;
  const isMissing = !found && !content;
  const status: "found" | "missing" | "partial" = found ? "found" : content ? "partial" : "missing";
  const description = FILE_DESCRIPTIONS[fileType as keyof typeof FILE_DESCRIPTIONS]?.what ?? "";

  const handleCopy = () => {
    if (!content) return;
    void navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        onClick={() => setExpanded((e) => !e)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: t.bg,
          borderTop: `2px solid ${tierColor}`,
          borderRight: `1px solid ${hovered ? tierColor : t.border}`,
          borderBottom: `1px solid ${hovered ? tierColor : t.border}`,
          borderLeft: `1px solid ${hovered ? tierColor : t.border}`,
          borderRadius: 8,
          cursor: "pointer",
          overflow: "hidden",
          transition: "border-color 0.15s",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "11px 14px 9px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: tierColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              color: t.text,
              flex: 1,
            }}
          >
            {fileType}
          </span>
          <StatusBadge status={status} />
          <span
            style={{
              color: t.textMuted,
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
          >
            <ChevronIcon />
          </span>
        </div>

        {/* Description — always visible */}
        <div style={{ padding: "0 14px 6px" }}>
          <p
            style={{
              fontSize: 11.5,
              color: "#b5b5c0",
              lineHeight: 1.55,
              wordWrap: "break-word",
            }}
          >
            {description}
          </p>
        </div>

        {/* Meta row — always visible */}
        <MetaRow lines={lines} chars={chars} passed={passed} total={checklist.length} />

        {/* Divider below meta row */}
        <div style={{ height: 1, background: t.divider }} />

        {/* Expanded: checklist + content preview + action bar */}
        {expanded && (
          <div style={{ borderTop: `1px solid ${t.divider}`, animation: "fadeIn 0.2s ease" }}>
            {/* Validation checklist */}
            {checklist.length > 0 && <Checklist items={checklist} />}

            {/* Content preview */}
            {content && <ContentPreview content={content} />}

            {/* Action bar */}
            <ActionBar
              content={content}
              onCopy={handleCopy}
              copied={copied}
              onDownload={onDownload}
              onRegenerate={onGenerate ?? onRegenerate}
              isGenerating={isGenerating}
              isMissing={isMissing}
            />
          </div>
        )}
      </div>
    </>
  );
}
