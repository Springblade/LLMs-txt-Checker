"use client";

import { useEffect, useState } from "react";

interface HealthScoreRingProps {
  score: number;
  status: "pass" | "fail";
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HealthScoreRing({ score, status }: HealthScoreRingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const offset = CIRCUMFERENCE * (1 - score / 100);
  const color = status === "pass" ? "#16a34a" : "#dc2626";
  const isPass = status === "pass";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {/* Rotate only the rings so progress starts at top; keep score text upright */}
        <g transform="rotate(-90 50 50)">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={mounted ? offset : CIRCUMFERENCE}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </g>
        <text
          x="50"
          y="46"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-2xl font-bold"
          fill={color}
        >
          {score}
        </text>
        <text
          x="50"
          y="62"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-500"
        >
          /100
        </text>
      </svg>

      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-gray-600">Health Score</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
            isPass
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isPass ? "PASS" : "FAIL"}
        </span>
      </div>
    </div>
  );
}
