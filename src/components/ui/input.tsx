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
        padding: "0.5rem 0.875rem",
        fontSize: "0.9375rem",
        backgroundColor: "#ffffff",
        color: "var(--mm-text)",
        border: `1px solid ${error ? "var(--mm-error)" : "var(--mm-border)"}`,
        borderRadius: "var(--mm-radius)",
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
