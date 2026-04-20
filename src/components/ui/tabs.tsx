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
        gap: "0.25rem",
        padding: "0.25rem",
        backgroundColor: "var(--mm-bg-secondary)",
        borderRadius: "var(--mm-radius)",
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
              padding: "0.375rem 0.75rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: isActive ? "#18181b" : "#45515e",
              backgroundColor: isActive ? "#ffffff" : "transparent",
              border: "none",
              borderRadius: "var(--mm-radius-pill)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
              boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
