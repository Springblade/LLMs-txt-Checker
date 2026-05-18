"use client";

import { Logo } from "@/components/site-header";
import Link from "next/link";

interface ResultsHeaderProps {
  url: string;
}

export function ResultsHeader({ url }: ResultsHeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(9,9,14,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--mm-border)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo */}
        <Logo />

        {/* URL badge */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 12,
            color: "var(--mm-text-muted)",
            background: "var(--mm-bg-tertiary)",
            border: "1px solid var(--mm-border)",
            borderRadius: 6,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 280,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22c55e",
              flexShrink: 0,
            }}
          />
          {url.replace(/^https?:\/\//, "")}
        </div>

        {/* Actions */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            color: "var(--mm-text-muted)",
            background: "transparent",
            border: "1px solid var(--mm-border)",
            borderRadius: 8,
            textDecoration: "none",
            flexShrink: 0,
            transition: "color 0.2s, border-color 0.2s",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Scan Another
        </Link>
      </div>
    </header>
  );
}
