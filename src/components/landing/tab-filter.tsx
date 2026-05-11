"use client";

interface TabFilterProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: Record<string, number>;
}

const TABS = [
  { id: "all", label: "All" },
  { id: "essential", label: "Essential" },
  { id: "recommended", label: "Recommended" },
  { id: "optional", label: "Optional" },
];

export function TabFilter({ activeTab, onTabChange, counts }: TabFilterProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        background: "var(--mm-bg-tertiary)",
        padding: 4,
        borderRadius: 10,
        border: "1px solid var(--mm-border)",
        overflowX: "auto",
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: 7,
              cursor: "pointer",
              transition: "all 0.2s ease",
              border: "none",
              background: isActive ? "var(--mm-bg-secondary)" : "transparent",
              color: isActive ? "var(--mm-text)" : "var(--mm-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: 10,
                background: isActive ? "var(--mm-brand)" : "var(--mm-bg-secondary)",
                color: isActive ? "#fff" : "var(--mm-text-muted)",
                minWidth: 18,
                textAlign: "center",
              }}
            >
              {counts[tab.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
