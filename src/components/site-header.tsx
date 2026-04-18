"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface SiteHeaderProps {
  showGitHub?: boolean;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  backLabel?: string;
  breadcrumb?: ReactNode;
}

export default function SiteHeader({
  showGitHub = true,
  title,
  showBackButton,
  onBack,
  backLabel = "Back",
  breadcrumb,
}: SiteHeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingTop: "0.75rem",
          paddingBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left — back button + logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                transition: "color 150ms ease-out, background-color 150ms ease-out",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-text)";
                e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-label="Go back"
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
                aria-hidden="true"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              <span className="hidden sm:inline">{backLabel}</span>
            </button>
          )}

          {breadcrumb && (
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              /
            </span>
          )}

          {breadcrumb && (
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                flexShrink: 0,
              }}
            >
              {breadcrumb}
            </span>
          )}

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img
              src="/Aivify-dark.svg"
              alt="Aivify"
              style={{ height: "2.75rem", width: "auto" }}
            />
          </Link>

          {title && (
            <>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                /
              </span>
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  letterSpacing: "-0.01em",
                  display: "none",
                }}
                className="sm:block"
              >
                {title}
              </span>
            </>
          )}
        </div>

        {/* Right — GitHub link */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
          {showGitHub && (
            <a
              href="https://github.com/wayadv/llms-txt"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                transition: "color 150ms ease-out, background-color 150ms ease-out",
              }}
              aria-label="View on GitHub"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-text)";
                e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
