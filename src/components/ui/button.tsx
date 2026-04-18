"use client";

import type { CSSProperties, ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

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
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontWeight: 500,
    border: "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    transition: "all 0.15s ease",
    fontFamily: "inherit",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: "0.375rem 0.75rem", fontSize: "0.75rem", minHeight: "32px" },
    md: { padding: "0.5rem 1rem", fontSize: "0.8125rem", minHeight: "40px" },
    lg: { padding: "0.75rem 1.5rem", fontSize: "0.875rem", minHeight: "48px" },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--color-primary)",
      color: "#ffffff",
    },
    secondary: {
      backgroundColor: "var(--color-bg-secondary)",
      color: "var(--color-text)",
      border: "1px solid var(--color-border)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--color-text-secondary)",
    },
    danger: {
      backgroundColor: "var(--color-error)",
      color: "#ffffff",
    },
  };

  return (
    <button
      disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
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
          style={{ animation: "spin 1s linear infinite" }}
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
