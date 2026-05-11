"use client";

interface StatPillProps {
  label: string;
  value: number | string;
  color?: string;
  delay?: number;
}

export function StatPill({ label, value, color, delay }: StatPillProps) {
  return (
    <div
      className="card-stagger"
      style={{
        animationDelay: delay ? `${delay}s` : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 20px",
        background: "var(--mm-bg-tertiary)",
        border: "1px solid var(--mm-border)",
        borderRadius: "10px",
        minWidth: 80,
      }}
    >
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "22px",
          fontWeight: 700,
          color: color ?? "var(--mm-text)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "11px",
          color: "var(--mm-text-muted)",
          marginTop: 4,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
    </div>
  );
}
