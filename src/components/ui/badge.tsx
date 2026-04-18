"use client";

type BadgeVariant = "success" | "error" | "warning" | "neutral" | "info";

import type { ReactNode } from "react";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const VARIANTS: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  success: {
    bg: "rgba(230, 126, 34, 0.15)",
    color: "#e67e22",
    border: "rgba(230, 126, 34, 0.4)",
  },
  error: {
    bg: "rgba(231, 76, 60, 0.15)",
    color: "#e74c3c",
    border: "rgba(231, 76, 60, 0.4)",
  },
  warning: {
    bg: "rgba(243, 156, 18, 0.15)",
    color: "#f39c12",
    border: "rgba(243, 156, 18, 0.4)",
  },
  neutral: {
    bg: "#333333",
    color: "#d4d0c8",
    border: "#3d3d3d",
  },
  info: {
    bg: "rgba(250, 82, 15, 0.12)",
    color: "var(--color-primary)",
    border: "rgba(250, 82, 15, 0.3)",
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
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: "var(--radius)",
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}
