"use client";

import type { ReactNode } from "react";

type BadgeVariant = "success" | "error" | "warning" | "neutral" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const VARIANTS: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  success: {
    bg: "var(--mm-success-bg)",
    color: "var(--mm-success)",
    border: "var(--mm-success-border)",
  },
  error: {
    bg: "var(--mm-error-bg)",
    color: "var(--mm-error)",
    border: "var(--mm-error-border)",
  },
  warning: {
    bg: "var(--mm-warning-bg)",
    color: "var(--mm-warning)",
    border: "var(--mm-warning-border)",
  },
  neutral: {
    bg: "#f0f0f0",
    color: "#45515e",
    border: "var(--mm-border)",
  },
  info: {
    bg: "var(--mm-info-bg)",
    color: "var(--mm-info)",
    border: "var(--mm-info-border)",
  },
};

export function Badge({ variant = "neutral", children }: BadgeProps) {
  const s = VARIANTS[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.125rem 0.5rem",
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: "var(--mm-radius-pill)",
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}
