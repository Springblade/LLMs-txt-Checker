"use client";

import type { ReactNode } from "react";

interface Tab {
  id: string;
  label: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        borderBottom: "1px solid var(--color-border)",
        paddingLeft: "0.25rem",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: isActive ? "var(--color-text)" : "var(--color-text-secondary)",
              background: "transparent",
              border: "none",
              borderBottom: isActive
                ? "2px solid var(--color-primary)"
                : "2px solid transparent",
              cursor: "pointer",
              transition: "color 0.15s ease, border-color 0.15s ease",
              fontFamily: "inherit",
              letterSpacing: "inherit",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
