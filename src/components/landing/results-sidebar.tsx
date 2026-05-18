'use client';

import { useMemo } from 'react';
import type { FileTier } from '@/lib/discovery/types';
import { Logo } from '@/components/site-header';

export type FileStatus = 'found' | 'missing' | 'partial';

export interface FileResult {
  id: string;
  name: string;
  tier: FileTier;
  status: FileStatus;
  lines: number;
  url: string | null;
}

interface ResultsSidebarProps {
  files: FileResult[];
  activeId: string;
  onSelect: (file: FileResult) => void;
  url: string;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
const t = {
  bg: 'var(--mm-bg)',
  bgSecondary: 'var(--mm-bg-secondary)',
  bgTertiary: 'var(--mm-bg-tertiary)',
  border: 'var(--mm-border)',
  text: 'var(--mm-text)',
  textMuted: 'var(--mm-text-muted)',
  textSubtle: 'var(--mm-text-subtle)',
  brand: 'var(--mm-brand)',
  success: 'var(--mm-success)',
  warning: 'var(--mm-warning)',
  error: 'var(--mm-error)',
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconRefresh() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.36-9.36L1 14" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// ─── Tier helpers ─────────────────────────────────────────────────────────────
const TIER_LABELS: Record<FileTier, string> = {
  essential: 'Essential',
  recommended: 'Recommended',
  complete: 'Optional',
};

const TIER_DOT_COLORS: Record<FileTier, string> = {
  essential: t.success,
  recommended: t.warning,
  complete: t.textMuted,
};

const FILE_STATUS_DOT_COLOR: Record<FileStatus, string> = {
  found: t.success,
  missing: t.error,
  partial: t.warning,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatsBar({ files }: { files: FileResult[] }) {
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
            padding: '10px 0',
            borderRight: i < stats.length - 1 ? `1px solid ${t.border}` : 'none',
            background: `${s.color}06`,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: s.color,
              fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
              lineHeight: 1,
            }}
          >
            {s.value}
          </span>
          <span style={{ fontSize: 10, color: t.textMuted, marginTop: 3, fontWeight: 500 }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

interface FileTreeItemProps {
  file: FileResult;
  active: boolean;
  onClick: () => void;
}

function FileTreeItem({ file, active, onClick }: FileTreeItemProps) {
  const dotColor = FILE_STATUS_DOT_COLOR[file.status];
  const tierColor = TIER_DOT_COLORS[file.tier];

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        borderRadius: 6,
        cursor: 'pointer',
        background: active ? t.bgTertiary : 'transparent',
        borderLeft: active ? `2px solid ${t.brand}` : '2px solid transparent',
        marginLeft: -2,
        transition: 'background 0.12s, border-left-color 0.12s',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
          boxShadow: `0 0 5px ${dotColor}`,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            color: active ? t.text : t.textMuted,
            fontWeight: active ? 500 : 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {file.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
          <span style={{ fontSize: 10, color: tierColor, fontWeight: 500 }}>
            {TIER_LABELS[file.tier]}
          </span>
          {file.lines > 0 && (
            <span style={{ fontSize: 10, color: t.textSubtle }}>
              {file.lines} lines
            </span>
          )}
        </div>
      </div>

      {active && (
        <span style={{ color: t.textSubtle, display: 'flex', flexShrink: 0 }}>
          <IconChevronRight />
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResultsSidebar({ files, activeId, onSelect, url }: ResultsSidebarProps) {
  const grouped = useMemo(() => {
    const groups: Record<FileTier, FileResult[]> = {
      essential: [],
      recommended: [],
      complete: [],
    };
    for (const f of files) {
      groups[f.tier].push(f);
    }
    return groups;
  }, [files]);

  const displayUrl = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <div
      style={{
        width: 244,
        flexShrink: 0,
        borderRight: `1px solid ${t.border}`,
        display: 'flex',
        flexDirection: 'column',
        background: t.bg,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 14,
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Logo />
        </div>

        {/* URL badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            background: t.bgSecondary,
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: t.success,
              flexShrink: 0,
              boxShadow: `0 0 6px ${t.success}`,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              color: t.textMuted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayUrl}
          </span>
        </div>

        {/* Stats bar */}
        <StatsBar files={files} />
      </div>

      {/* File tree */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 10px' }}>
        {(Object.keys(grouped) as FileTier[]).map((tier) =>
          grouped[tier].length > 0 ? (
            <div key={tier} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: TIER_DOT_COLORS[tier],
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '0 4px',
                  marginBottom: 3,
                }}
              >
                {TIER_LABELS[tier]}
              </div>
              {grouped[tier].map((file) => (
                <FileTreeItem
                  key={file.id}
                  file={file}
                  active={file.id === activeId}
                  onClick={() => onSelect(file)}
                />
              ))}
            </div>
          ) : null,
        )}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: `1px solid ${t.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 500,
            color: t.textMuted,
            textDecoration: 'none',
            transition: 'color 0.15s',
            padding: '4px 0',
          }}
        >
          <IconRefresh />
          Scan another URL
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: t.textSubtle,
            display: 'flex',
            transition: 'color 0.15s',
            padding: '4px',
          }}
        >
          <IconGitHub />
        </a>
      </div>
    </div>
  );
}
