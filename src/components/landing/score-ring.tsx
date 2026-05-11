"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score >= 86) return "#22c55e";
  if (score >= 61) return "#1456f0";
  if (score >= 31) return "#eab308";
  return "#ef4444";
}

export function ScoreRing({ score, size = 160 }: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size / 2) * 0.875;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = size * 0.0625;

  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const scoreColor = getScoreColor(score);
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}
        aria-label={`AI Discovery Score: ${score} out of 100`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--mm-bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.5s ease-out, stroke 0.3s ease",
            filter: `drop-shadow(0 0 8px ${scoreColor}80)`,
          }}
        />
      </svg>
      {/* Score text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: size * 0.25,
            fontWeight: 700,
            color: scoreColor,
            lineHeight: 1,
          }}
        >
          {displayScore}
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: size * 0.075,
            color: "var(--mm-text-muted)",
            marginTop: size * 0.025,
          }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}
