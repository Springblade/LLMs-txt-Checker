"use client";

import type { ReactNode } from "react";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children?: ReactNode;
}

const VARIANT_STYLES = {
  info: {
    bg: "rgba(250, 82, 15, 0.08)",
    border: "rgba(250, 82, 15, 0.3)",
    color: "var(--color-primary)",
  },
  success: {
    bg: "rgba(230, 126, 34, 0.12)",
    border: "rgba(230, 126, 34, 0.4)",
    color: "#e67e22",
  },
  warning: {
    bg: "rgba(243, 156, 18, 0.12)",
    border: "rgba(243, 156, 18, 0.4)",
    color: "#f39c12",
  },
  error: {
    bg: "rgba(231, 76, 60, 0.12)",
    border: "rgba(231, 76, 60, 0.4)",
    color: "#e74c3c",
  },
};

export function Alert({ variant = "info", title, children }: AlertProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <div
      style={{
        padding: "0.875rem 1rem",
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.color}`,
        borderRadius: "var(--radius)",
        color: s.color,
      }}
    >
      {title && (
        <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: children ? "0.375rem" : 0 }}>
          {title}
        </p>
      )}
      {children && (
        <p style={{ fontSize: "0.8125rem", lineHeight: 1.5 }}>
          {children}
        </p>
      )}
    </div>
  );
}
