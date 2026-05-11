"use client";

import type { Tier } from "@/lib/design-tokens";
import { tierInfo } from "@/lib/design-tokens";

interface TierBadgeProps {
  tier: Tier;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const info = tierInfo[tier];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        borderRadius: 4,
        background: `${info.color}15`,
        color: info.color,
        border: `1px solid ${info.color}30`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "currentColor",
          boxShadow: `0 0 6px ${info.color}`,
          flexShrink: 0,
        }}
      />
      {info.label}
    </span>
  );
}
