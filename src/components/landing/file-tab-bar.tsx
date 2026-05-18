'use client';

import { useState } from 'react';
import type { FileTier } from '@/lib/discovery/types';
import { TIER_COLORS } from '@/lib/discovery/types';

type FileStatus = 'found' | 'missing' | 'partial';

const TIER_LABELS: Record<FileTier, string> = {
  essential: 'Essential',
  recommended: 'Recommended',
  complete: 'Optional',
};

export interface TabFile {
  type: string;
  status: FileStatus;
  tier: FileTier;
}

interface FileTabBarProps {
  files: TabFile[];
  activeFileType?: string;
  onFileSelect: (fileType: string) => void;
  tierCounts?: { essential: number; recommended: number; complete: number };
}

export function FileTabBar({ files, activeFileType, onFileSelect, tierCounts }: FileTabBarProps) {
  const [activeTier, setActiveTier] = useState<FileTier | 'all'>('all');

  const filteredFiles = activeTier === 'all' ? files : files.filter((f) => f.tier === activeTier);

  return (
    <>
      <style>{`
        .tab-bar-scroll::-webkit-scrollbar { display: none; }
        .tab-bar-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--mm-bg)',
          flexShrink: 0,
        }}
      >
        {/* Tier strip */}
        {tierCounts && (
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--mm-border)',
              padding: '0 12px',
              gap: 2,
            }}
          >
            {/* All */}
            <button
              onClick={() => setActiveTier('all')}
              style={{
                padding: '6px 10px',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeTier === 'all' ? 'var(--mm-text)' : 'transparent'}`,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: activeTier === 'all' ? 600 : 400,
                color: activeTier === 'all' ? 'var(--mm-text)' : 'var(--mm-text-muted)',
                transition: 'color 0.15s, border-color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              All · {files.length}
            </button>
            {(Object.keys(tierCounts) as FileTier[]).map((tier) =>
              tierCounts[tier] > 0 ? (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  style={{
                    padding: '6px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activeTier === tier ? TIER_COLORS[tier].color : 'transparent'}`,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: activeTier === tier ? 600 : 400,
                    color: activeTier === tier ? TIER_COLORS[tier].color : 'var(--mm-text-muted)',
                    transition: 'color 0.15s, border-color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {TIER_LABELS[tier]} · {tierCounts[tier]}
                </button>
              ) : null,
            )}
          </div>
        )}

        {/* Tab bar */}
        <div
          style={{
            height: 44,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            background: 'var(--mm-bg)',
          }}
        >
          {/* Fade mask */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 40,
              background: 'linear-gradient(to right, transparent, var(--mm-bg))',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          <div
            className="tab-bar-scroll"
            style={{
              display: 'flex',
              overflowX: 'auto',
              flex: 1,
              height: '100%',
            }}
          >
            {filteredFiles.map((f) => {
              const active = f.type === activeFileType;
              return (
                <button
                  key={f.type}
                  onClick={() => onFileSelect(f.type)}
                  style={{
                    padding: '0 14px',
                    height: '100%',
                    whiteSpace: 'nowrap',
                    color: active ? '#e4e4e7' : '#71717a',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${active ? 'var(--mm-brand)' : 'transparent'}`,
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    {f.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
