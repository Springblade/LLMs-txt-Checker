"use client";

export type FileItemStatus = "idle" | "running" | "pass" | "fail" | "warning" | "missing";

interface AuditFileItemProps {
  filename: string;
  status: FileItemStatus;
  delay?: number;
}

const STATUS_CONFIG: Record<
  FileItemStatus,
  { icon: string; color: string; iconColor: string }
> = {
  idle: { icon: "◌", color: "var(--mm-text-subtle)", iconColor: "var(--mm-text-subtle)" },
  running: { icon: "", color: "var(--mm-text-muted)", iconColor: "var(--mm-text-muted)" },
  pass: { icon: "✓", color: "#22c55e", iconColor: "#22c55e" },
  fail: { icon: "✗", color: "#ef4444", iconColor: "#ef4444" },
  warning: { icon: "⚠", color: "#eab308", iconColor: "#eab308" },
  missing: { icon: "✗", color: "#ef4444", iconColor: "#ef4444" },
};

export function AuditFileItem({ filename, status, delay = 0 }: AuditFileItemProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 0",
        opacity: status === "idle" ? 0.4 : 1,
        transition: "opacity 0.2s ease",
        animationDelay: `${delay}ms`,
      }}
    >
      {status === "running" ? (
        <svg
          width="14"
          height="14"
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
            fontSize: 13,
            color: config.iconColor,
            fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
            width: 14,
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          {config.icon}
        </span>
      )}
      <span
        style={{
          fontSize: 12,
          fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
          color: config.color,
          letterSpacing: "0.02em",
        }}
      >
        {filename}
      </span>
    </div>
  );
}
