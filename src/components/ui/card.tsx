"use client";

import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  padding?: "sm" | "md" | "lg" | "0";
  style?: CSSProperties;
}

const PADDING_MAP = {
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  "0": "0",
};

export function Card({ children, padding = "md", style }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: PADDING_MAP[padding],
        boxShadow: "var(--shadow-golden-sm)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
