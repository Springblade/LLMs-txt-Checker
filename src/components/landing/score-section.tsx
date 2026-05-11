"use client";

import { ScoreRing } from "./score-ring";
import { StatPill } from "./stat-pill";

interface ScoreSectionProps {
  score: number;
  tier: string;
  tierColor: string;
  tierDescription: string;
  pagesScanned: number;
  foundCount: number;
  missingCount: number;
  partialCount: number;
}

export function ScoreSection({
  score,
  tier,
  tierColor,
  tierDescription,
  pagesScanned,
  foundCount,
  missingCount,
  partialCount,
}: ScoreSectionProps) {
  return (
    <section
      style={{
        padding: "64px 0 56px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        animation: "mm-fade-in 0.6s ease-out",
      }}
    >
      {/* Tier badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 16px",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Outfit', sans-serif",
          borderRadius: 20,
          background: `${tierColor}15`,
          color: tierColor,
          border: `1px solid ${tierColor}30`,
          marginBottom: 32,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "currentColor",
            display: "inline-block",
          }}
        />
        {tier} AI Readiness
      </div>

      {/* Score + description */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 32,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 32,
        }}
      >
        <ScoreRing score={score} size={160} />
        <div style={{ textAlign: "left", maxWidth: 280 }}>
          <p
            style={{
              color: "var(--mm-text-muted)",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            {tierDescription}
          </p>
        </div>
      </div>

      {/* Stat pills */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <StatPill label="Pages" value={pagesScanned} delay={0.2} />
        <StatPill label="Found" value={foundCount} color="#22c55e" delay={0.3} />
        <StatPill label="Missing" value={missingCount} color="#ef4444" delay={0.4} />
        <StatPill label="Partial" value={partialCount} color="#eab308" delay={0.5} />
      </div>
    </section>
  );
}
