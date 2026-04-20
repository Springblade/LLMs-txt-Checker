"use client";

import type { CSSProperties, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "pill";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: "var(--mm-brand)",
    color: "#ffffff",
  },
  secondary: {
    backgroundColor: "#f0f0f0",
    color: "#333333",
    border: "1px solid var(--mm-border)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "#45515e",
    border: "1px solid transparent",
  },
  danger: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
  },
  pill: {
    backgroundColor: "transparent",
    color: "#45515e",
    border: "1px solid var(--mm-border)",
  },
};

const SIZE_STYLES: Record<ButtonSize, CSSProperties> = {
  sm: { padding: "0.375rem 0.75rem", fontSize: "0.75rem", minHeight: "32px" },
  md: { padding: "0.5rem 1rem", fontSize: "0.8125rem", minHeight: "40px" },
  lg: { padding: "0.75rem 1.25rem", fontSize: "0.875rem", minHeight: "48px" },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontWeight: 500,
    border: "none",
    borderRadius: "var(--mm-radius)",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    transition: "all 0.15s ease",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
  };

  return (
    <button
      disabled={disabled || loading}
      style={{ ...baseStyle, ...SIZE_STYLES[size], ...VARIANT_STYLES[variant], ...style }}
      {...props}
    >
      {loading ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
