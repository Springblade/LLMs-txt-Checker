"use client";

import type { HealthScore } from "@/lib/types";
import { HealthScoreRing } from "@/components/health-score-ring";

interface ResultSidebarProps {
  healthScore: HealthScore;
}

interface StatBarProps {
  label: string;
  count: number;
  maxValue: number;
  colorClass: string;
  barColorClass: string;
}

function StatBar({ label, count, maxValue, colorClass, barColorClass }: StatBarProps) {
  const percentage = maxValue > 0 ? Math.min((count / maxValue) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${colorClass}`}>{label}</span>
        <span className={`text-sm font-semibold ${colorClass}`}>{count}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function ResultSidebar({ healthScore }: ResultSidebarProps) {
  const maxCount = Math.max(
    healthScore.totalLinks,
    healthScore.errorCount,
    healthScore.warningCount,
    1
  );

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col gap-6 p-4 bg-white border-r border-gray-200">
      {/* BETA Badge */}
      <div className="flex justify-center">
        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wide">
          BETA
        </span>
      </div>

      {/* Health Score Ring */}
      <HealthScoreRing
        score={healthScore.score}
        status={healthScore.status}
      />

      {/* Stats Section */}
      <div className="flex flex-col gap-4 px-2">
        <StatBar
          label="Links"
          count={healthScore.totalLinks}
          maxValue={maxCount}
          colorClass="text-gray-700"
          barColorClass="bg-blue-500"
        />

        <StatBar
          label="Errors"
          count={healthScore.errorCount}
          maxValue={maxCount}
          colorClass="text-red-600"
          barColorClass="bg-red-500"
        />

        <StatBar
          label="Warnings"
          count={healthScore.warningCount}
          maxValue={maxCount}
          colorClass="text-yellow-600"
          barColorClass="bg-yellow-500"
        />
      </div>
    </aside>
  );
}