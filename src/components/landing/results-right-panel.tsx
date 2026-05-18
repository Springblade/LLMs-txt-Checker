"use client";

import { useCallback, useMemo, useState } from "react";
import type { ChecklistItem } from "@/lib/discovery/types";
import type { FileTier } from "@/lib/discovery/types";

type FileStatus = 'found' | 'missing' | 'partial';

interface FileResult {
  name: string;
  tier: FileTier;
  status: FileStatus;
  lines?: number;
  url?: string | null;
  content?: string | null;
}

interface StatsBarProps {
  files: FileResult[];
}

function StatsBar({ files }: StatsBarProps) {
  const stats = [
    { label: 'Found', value: files.filter((f) => f.status === 'found').length, color: t.success },
    { label: 'Missing', value: files.filter((f) => f.status === 'missing').length, color: t.error },
    { label: 'Partial', value: files.filter((f) => f.status === 'partial').length, color: t.warning },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${t.border}`,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 14,
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 0',
            borderRight: i < stats.length - 1 ? `1px solid ${t.border}` : 'none',
            background: `${s.color}06`,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: s.color,
              fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
              lineHeight: 1,
            }}
          >
            {s.value}
          </span>
          <span style={{ fontSize: 10, color: t.textMuted, marginTop: 2, fontWeight: 500 }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

interface ResultsRightPanelProps {
  file: FileResult;
  checklist: ChecklistItem[];
  onGenerate: () => void;
  onDownload: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  /** All files for StatsBar — passed from parent page */
  allFiles?: FileResult[];
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.36-9.36L23 10" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.92-9.19" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);


// ─── Design tokens (dark theme) ───────────────────────────────────────────────

const t = {
  bg: "#09090e",
  bgSecondary: "#111118",
  bgTertiary: "#18181f",
  border: "#27272a",
  text: "#e4e4e7",
  textMuted: "#71717a",
  textSubtle: "#52525b",
  brand: "#818cf8",
  success: "#22c55e",
  successBg: "rgba(34,197,94,0.08)",
  warning: "#eab308",
  warningBg: "rgba(234,179,8,0.08)",
  error: "#ef4444",
  errorBg: "rgba(239,68,68,0.08)",
} as const;

// ─── Action Button ────────────────────────────────────────────────────────────

function ActionButton({
  icon,
  label,
  onClick,
  variant = "default",
  loading = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "default" | "primary" | "success";
  loading?: boolean;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    transition: "all 0.15s",
    border: "none",
    opacity: disabled ? 0.4 : 1,
    width: "100%",
    justifyContent: "center" as const,
  };

  const variantStyles = {
    default: {
      background: "transparent",
      border: `1px solid ${t.border}`,
      color: t.textMuted,
    },
    primary: {
      background: loading ? t.bgTertiary : t.brand,
      color: "#fff",
    },
    success: {
      background: t.successBg,
      color: t.success,
      border: `1px solid ${t.success}30`,
    },
  };

  const hoverVariantStyles = {
    default: {
      background: t.bgSecondary,
      border: `1px solid ${t.textSubtle}`,
      color: t.text,
    },
    primary: {
      background: "#6d72f9",
      color: "#fff",
    },
    success: {
      background: "rgba(34,197,94,0.15)",
      border: `1px solid ${t.success}60`,
      color: t.success,
    },
  };

  const interactive = !disabled && !loading;

  return (
    <button
      onClick={interactive ? onClick : undefined}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...(interactive && hovered ? hoverVariantStyles[variant] : {}),
      }}
      disabled={disabled || loading}
    >
      {loading ? (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

// ─── Checklist Item ───────────────────────────────────────────────────────────

function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  const iconColor =
    item.status === "passed"
      ? t.success
      : item.status === "warning"
        ? t.warning
        : t.error;
  const bgColor =
    item.status === "passed"
      ? t.successBg
      : item.status === "warning"
        ? t.warningBg
        : t.errorBg;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 6,
        background: bgColor,
        transition: "background 0.15s",
      }}
    >
      <span
        style={{
          color: iconColor,
          marginTop: 1,
          flexShrink: 0,
          display: "flex",
        }}
      >
        {item.status === "passed" ? (
          <CheckCircleIcon />
        ) : item.status === "warning" ? (
          <AlertIcon />
        ) : (
          <XIcon />
        )}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: t.text,
          }}
        >
          {item.label}
        </div>
        {item.message && (
          <div style={{ fontSize: 11, color: iconColor, marginTop: 2 }}>
            {item.message}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ResultsRightPanel({
  file,
  checklist,
  onGenerate,
  onDownload,
  onRegenerate,
  isGenerating,
  allFiles,
}: ResultsRightPanelProps) {
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const passed = checklist.filter((c) => c.status === "passed").length;
    const warnings = checklist.filter((c) => c.status === "warning").length;
    const failed = checklist.filter((c) => c.status === "failed").length;
    return { passed, warnings, failed, total: checklist.length };
  }, [checklist]);

  const handleCopy = useCallback(async () => {
    if (!file.content) return;
    await navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [file.content]);

  return (
    <div
      style={{
        width: 288,
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        borderLeft: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        background: t.bg,
        overflow: "hidden",
      }}
    >
      {/* StatsBar */}
      {allFiles && allFiles.length > 0 && (
        <div
          style={{
            padding: '14px 14px 0',
            borderBottom: `1px solid ${t.border}`,
            flexShrink: 0,
          }}
        >
          <StatsBar files={allFiles} />
        </div>
      )}

      {/* ── Actions section ── */}
      <div
        style={{
          padding: 14,
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: t.textSubtle,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Actions
        </div>

        {file.status === "found" || file.status === "partial" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <ActionButton
              icon={copied ? <CheckCircleIcon /> : <CopyIcon />}
              label={copied ? "Copied!" : "Copy to clipboard"}
              variant={copied ? "success" : "default"}
              onClick={handleCopy}
              disabled={!file.content}
            />
            <ActionButton
              icon={<DownloadIcon />}
              label="Download file"
              variant="default"
              onClick={onDownload}
            />
            <ActionButton
              icon={<RefreshIcon />}
              label="Regenerate"
              variant="default"
              onClick={onRegenerate}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <ActionButton
              icon={<SparkleIcon />}
              label="Generate with AI"
              variant="primary"
              loading={isGenerating}
              onClick={onGenerate}
            />
            <div
              style={{
                fontSize: 11,
                color: t.textSubtle,
                textAlign: "center",
                marginTop: 4,
                lineHeight: 1.5,
              }}
            >
              AI will create this file based on your website content
            </div>
          </div>
        )}
      </div>

      {/* ── Validation section (scrollable) ── */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 14,
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: t.textSubtle,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
            }}
          >
            Validation
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {stats.passed > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: t.success }}>
                {stats.passed} passed
              </span>
            )}
            {stats.warnings > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: t.warning }}>
                {stats.warnings} warnings
              </span>
            )}
            {stats.failed > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: t.error }}>
                {stats.failed} failed
              </span>
            )}
            {stats.passed === stats.total && stats.failed === 0 && (
              <span
                style={{
                  fontSize: 11,
                  color: t.success,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <CheckCircleIcon /> all good
              </span>
            )}
            {stats.total === 0 && (
              <span style={{ fontSize: 11, color: t.textSubtle }}>
                no checks run
              </span>
            )}
          </div>
        </div>

        {/* Checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {checklist.map((item) => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
