"use client";

const CONFIG = {
  found: { label: "Found", color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)" },
  missing: { label: "Missing", color: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)" },
  partial: { label: "Partial", color: "#eab308", bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.3)" },
} as const;

type FileStatus = keyof typeof CONFIG;

interface StatusBadgeProps {
  status: FileStatus;
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AlertIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const icons: Record<FileStatus, React.ReactNode> = {
  found: <CheckIcon />,
  missing: <XIcon />,
  partial: <AlertIcon />,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        borderRadius: 4,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {icons[status]}
      {cfg.label}
    </span>
  );
}
