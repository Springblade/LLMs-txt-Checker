"use client";

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, style, ...props }: InputProps) {
  return (
    <input
      style={{
        width: "100%",
        padding: "0.625rem 0.875rem",
        fontSize: "0.875rem",
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
        borderRadius: "var(--radius)",
        outline: "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        fontFamily: "inherit",
        boxSizing: "border-box",
        ...style,
      }}
      {...props}
    />
  );
}
