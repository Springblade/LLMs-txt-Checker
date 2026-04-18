"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        textAlign: "center",
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
      }}
    >
      {icon ? (
        <div style={{ marginBottom: "0.75rem", color: "var(--color-text-muted)" }}>
          {icon}
        </div>
      ) : (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: "var(--color-text-muted)", marginBottom: "0.75rem" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      )}
      <p
        style={{
          fontSize: "0.9375rem",
          fontWeight: 500,
          color: "var(--color-text)",
          marginBottom: description ? "0.375rem" : 0,
        }}
      >
        {title}
      </p>
      {description && (
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
            maxWidth: "40ch",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
