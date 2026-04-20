"use client";

import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ style, children, ...props }: SelectProps) {
  return (
    <select
      style={{
        width: "100%",
        padding: "0.625rem 0.875rem",
        fontSize: "0.875rem",
        backgroundColor: "#ffffff",
        color: "var(--mm-text)",
        border: "1px solid var(--mm-border)",
        borderRadius: "var(--mm-radius)",
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
