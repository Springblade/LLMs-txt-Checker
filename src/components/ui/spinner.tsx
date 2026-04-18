"use client";

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        animation: "spin 1s linear infinite",
        color: "var(--color-primary)",
      }}
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}
