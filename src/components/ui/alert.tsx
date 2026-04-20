"use client";

import type { ReactNode } from "react";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children?: ReactNode;
}

const VARIANT_STYLES = {
  info: {
    bg: "var(--mm-info-bg)",
    border: "var(--mm-info)",
    color: "var(--mm-info)",
  },
  success: {
    bg: "var(--mm-success-bg)",
    border: "var(--mm-success)",
    color: "var(--mm-success)",
  },
  warning: {
    bg: "var(--mm-warning-bg)",
    border: "var(--mm-warning)",
    color: "var(--mm-warning)",
  },
  error: {
    bg: "var(--mm-error-bg)",
    border: "var(--mm-error)",
    color: "var(--mm-error)",
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
        borderRadius: "var(--mm-radius)",
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
