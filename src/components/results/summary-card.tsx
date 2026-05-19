"use client";

import { useState } from "react";
import type { CrawlResult } from "@/lib/discovery/types";

interface SummaryCardProps {
  crawlResult: CrawlResult;
  onRefresh?: () => void;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const t = {
  bg: "#09090e",
  bgSecondary: "#111118",
  bgTertiary: "#18181f",
  border: "#27272a",
  borderHover: "#3f3f46",
  text: "#e4e4e7",
  textMuted: "#71717a",
  textSubtle: "#52525b",
  brand: "#818cf8",
  brandHover: "#a5b4fc",
} as const;

// ─── Icons ────────────────────────────────────────────────────────────────────

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const InfoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ─── Time Formatters ──────────────────────────────────────────────────────────

function formatRelativeTime(cachedAt: number): string {
  const diff = Date.now() - cachedAt;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function formatAbsoluteTime(cachedAt: number): string {
  return new Date(cachedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Section Header Component ──────────────────────────────────────────────────

interface SectionHeaderProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
}

function SectionHeader({ label, expanded, onToggle, badge }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "8px 14px",
        backgroundColor: t.bgTertiary,
        border: "none",
        borderTop: `1px solid ${t.border}`,
        cursor: "pointer",
        transition: "background-color 0.1s ease",
        color: t.textSubtle,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = t.bgSecondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = t.bgTertiary;
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {badge && (
          <span
            style={{
              fontSize: 10,
              color: t.textMuted,
              fontWeight: 500,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <span style={{ display: "flex", color: t.textSubtle }}>
        {expanded ? <MinusIcon /> : <ChevronDownIcon />}
      </span>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SummaryCard({ crawlResult, onRefresh }: SummaryCardProps) {
  const [hovered, setHovered] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(true);
  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const domain = new URL(crawlResult.origin).hostname.replace(/^www\./, "");
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  const totalPages = crawlResult.pages.length;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
      }}
      style={{
        backgroundColor: t.bgSecondary,
        border: `1px solid ${hovered ? t.borderHover : t.border}`,
        borderRadius: 8,
        marginBottom: 12,
        overflow: "hidden",
        transition: "border-color 0.15s ease",
      }}
    >
      {/* ── SITE INFO Section ── */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Favicon */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: t.bgTertiary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src={faviconUrl}
              alt=""
              style={{ width: 18, height: 18, borderRadius: 3 }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: t.text,
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.3,
                    marginBottom: 2,
                  }}
                >
                  {crawlResult.siteName}
                </h3>
                <code
                  style={{
                    fontSize: 11,
                    color: t.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {domain}
                </code>
                {crawlResult.cachedAt && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 4,
                      position: "relative",
                    }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: "#a1a1aa",
                      }}
                    >
                      Scanned {formatRelativeTime(crawlResult.cachedAt!)}
                    </span>
                    <span style={{ display: "flex", color: "#a1a1aa" }}>
                      <InfoIcon />
                    </span>
                    {showTooltip && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          marginTop: 4,
                          padding: "6px 10px",
                          backgroundColor: t.bgTertiary,
                          border: `1px solid ${t.border}`,
                          borderRadius: 4,
                          fontSize: 10,
                          color: t.textMuted,
                          whiteSpace: "nowrap",
                          zIndex: 10,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        }}
                      >
                        {formatAbsoluteTime(crawlResult.cachedAt!)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 4 }}>
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    title="Refresh"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      border: "none",
                      backgroundColor: "transparent",
                      color: t.textMuted,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = t.bgTertiary;
                      e.currentTarget.style.color = t.text;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = t.textMuted;
                    }}
                  >
                    <RefreshIcon />
                  </button>
                )}
                <a
                  href={crawlResult.origin}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open site"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    border: "none",
                    backgroundColor: "transparent",
                    color: t.textMuted,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = t.bgTertiary;
                    e.currentTarget.style.color = t.brand;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = t.textMuted;
                  }}
                >
                  <ExternalLinkIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESCRIPTION Section ── */}
      {crawlResult.description && (
        <>
          <SectionHeader
            label="Description"
            expanded={descriptionExpanded}
            onToggle={() => setDescriptionExpanded(!descriptionExpanded)}
          />
          {descriptionExpanded && (
            <div style={{ padding: "10px 14px", borderTop: `1px solid ${t.border}` }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: t.textMuted,
                  lineHeight: 1.5,
                }}
              >
                {crawlResult.description}
              </p>
            </div>
          )}
        </>
      )}

      {/* ── PAGES Section ── */}
      <SectionHeader
        label="Pages"
        expanded={pagesExpanded}
        onToggle={() => setPagesExpanded(!pagesExpanded)}
        badge={`${totalPages} ${totalPages === 1 ? "page" : "pages"}`}
      />
      {pagesExpanded && (
        <div
          style={{
            maxHeight: 240,
            overflowY: "auto",
            borderTop: `1px solid ${t.border}`,
          }}
        >
          {crawlResult.pages.map((page, index) => (
            <div
              key={`${page.url}-${index}`}
              style={{
                padding: "8px 14px",
                borderBottom:
                  index < crawlResult.pages.length - 1
                    ? `1px solid ${t.border}`
                    : "none",
                transition: "background-color 0.1s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = t.bgTertiary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  color: t.brand,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                <ExternalLinkIcon />
                {page.title || page.url}
              </a>
              {page.description && (
                <p
                  style={{
                    fontSize: 10,
                    color: t.textSubtle,
                    margin: 0,
                    paddingLeft: 16,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {page.description.slice(0, 80)}
                  {page.description.length > 80 ? "..." : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
