"use client";

import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, style, ...props }: TextareaProps) {
  return (
    <textarea
      style={{
        width: "100%",
        padding: "0.75rem 1rem",
        fontSize: "0.875rem",
        backgroundColor: "#ffffff",
        color: "var(--mm-text)",
        border: `1px solid ${error ? "var(--mm-error)" : "var(--mm-border)"}`,
        borderRadius: "var(--mm-radius)",
        outline: "none",
        resize: "vertical",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        fontFamily: "inherit",
        lineHeight: 1.6,
        boxSizing: "border-box",
        ...style,
      }}
      {...props}
    />
  );
}
