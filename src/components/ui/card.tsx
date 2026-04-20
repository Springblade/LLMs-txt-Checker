"use client";

import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  padding?: "sm" | "md" | "lg" | "0";
  style?: CSSProperties;
  featured?: boolean;
  elevated?: boolean;
}

const PADDING_MAP = {
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  "0": "0",
};

export function Card({ children, padding = "md", style, featured, elevated }: CardProps) {
  let boxShadow = "var(--mm-shadow-sm)";
  if (featured) boxShadow = "var(--mm-shadow-lg)";
  else if (elevated) boxShadow = "var(--mm-shadow-xl)";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid var(--mm-border)",
        borderRadius: "var(--mm-radius-md)",
        padding: PADDING_MAP[padding],
        boxShadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
