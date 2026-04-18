"use client";

import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ style, children, ...props }: SelectProps) {
  return (
    <select
      style={{
        width: "100%",
        padding: "0.625rem 0.875rem",
        fontSize: "0.875rem",
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        outline: "none",
        cursor: "pointer",
        transition: "border-color 0.15s ease",
        fontFamily: "inherit",
        boxSizing: "border-box",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
}
