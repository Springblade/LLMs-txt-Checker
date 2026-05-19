"use client";

export type FileItemStatus = "idle" | "running" | "pass" | "fail" | "warning" | "missing";

interface AuditFileItemProps {
  filename: string;
  status: FileItemStatus;
  delay?: number;
}

const STATUS_CONFIG: Record<
  FileItemStatus,
  { icon: string; bgColor: string; textColor: string }
> = {
  idle: { icon: "○", bgColor: "transparent", textColor: "var(--mm-text-subtle)" },
  running: { icon: "", bgColor: "transparent", textColor: "var(--mm-text-muted)" },
  pass: { icon: "✓", bgColor: "#22c55e20", textColor: "#22c55e" },
  fail: { icon: "✗", bgColor: "#ef444420", textColor: "#ef4444" },
  warning: { icon: "⚠", bgColor: "#eab30820", textColor: "#eab308" },
  missing: { icon: "–", bgColor: "#ef444420", textColor: "#ef4444" },
};

export function AuditFileItem({ filename, status, delay = 0 }: AuditFileItemProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 6,
        background: config.bgColor,
        opacity: status === "idle" ? 0.5 : 1,
        transition: "all 0.2s ease",
        animationDelay: `${delay}ms`,
      }}
    >
      {status === "running" ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--mm-text-muted)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: "audit-spin 0.8s linear infinite", flexShrink: 0 }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        <span
          style={{
            fontSize: 11,
            color: config.textColor,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {config.icon}
        </span>
      )}
      <span
        style={{
          fontSize: 11,
          fontFamily: "'DM Sans', sans-serif",
          color: config.textColor,
          letterSpacing: "0.01em",
        }}
      >
        {filename}
      </span>
    </div>
  );
}
