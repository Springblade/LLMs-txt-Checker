"use client";

import type { ValidationResult } from "@/lib/types";
import { buildValidationChecks, type ValidationCheck, type ValidationCheckStatus } from "@/lib/validation-checklist";

interface StatusIconProps {
  status: ValidationCheckStatus;
  size?: "sm" | "md" | "lg";
}

function StatusIcon({ status, size = "md" }: StatusIconProps) {
  const sz = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
  if (status === "success") {
    return (
      <svg className={`${sz} text-[var(--color-success)]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  if (status === "error") {
    return (
      <svg className={`${sz} text-[var(--color-error)]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M15 9l-6 6M9 9l6 6" />
      </svg>
    );
  }
  if (status === "warning") {
    return (
      <svg className={`${sz} text-[var(--color-warning)]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // info
  return (
    <svg className={`${sz} text-[var(--color-text-secondary)]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
    </svg>
  );
}

const CARD_STYLES: Record<ValidationCheckStatus, string> = {
  success: "border-l-4 border-green-600",
  error: "border-l-4 border-red-600",
  warning: "border-l-4 border-amber-500",
  info: "border-l-4 border-[var(--color-border)]",
};

const ROW_STYLES: Record<ValidationCheckStatus, string> = {
  success: "border-l-4 border-green-600",
  error: "border-l-4 border-red-600",
  warning: "border-l-4 border-amber-500",
  info: "border-l-4 border-[var(--color-border)]",
};

function SummaryCard({ check }: { check: ValidationCheck }) {
  return (
    <div
      className={`flex gap-3 p-4 rounded-lg border border-[var(--color-border)] bg-white ${CARD_STYLES[check.status]}`}
    >
      <StatusIcon status={check.status} size="lg" />
      <div>
        <p className="font-medium text-sm text-zinc-900">
          {check.order}. {check.title}
        </p>
        <p className="text-xs mt-0.5 text-[var(--color-text-secondary)]">
          {check.message}
        </p>
      </div>
    </div>
  );
}

function DetailsRow({ check }: { check: ValidationCheck }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--color-border)] bg-white ${ROW_STYLES[check.status]}`}
    >
      <StatusIcon status={check.status} />
      <span className="font-medium text-sm text-zinc-900">
        {check.order}. {check.message}
      </span>
    </div>
  );
}

interface ValidationDetailsTabProps {
  result: ValidationResult;
}

export default function ValidationDetailsTab({ result }: ValidationDetailsTabProps) {
  if (!result.found) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <svg
          className="w-12 h-12 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
          Could not load llms.txt
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] max-w-md">
          {result.message ?? "The file was not found or could not be fetched from this site."}
        </p>
        <p className="mt-4 text-xs text-[var(--color-text-tertiary)]">
          Expected URL: <span className="font-mono">/llms.txt</span> at the site root.
        </p>
      </div>
    );
  }

  const checks = buildValidationChecks(result);

  return (
    <div className="p-4 flex flex-col gap-8">
      {/* Validation Summary — responsive grid of cards */}
      <section>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3 pb-2 border-b border-[var(--color-border)]">
          Validation Summary
        </h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {checks.map((check) => (
            <SummaryCard key={check.id} check={check} />
          ))}
        </div>
      </section>

      {/* Validation Details — full-width rows, NOT grid */}
      <section>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3 pb-2 border-b border-[var(--color-border)]">
          Validation Details
        </h2>
        <div className="flex flex-col gap-2">
          {checks.map((check) => (
            <DetailsRow key={check.id} check={check} />
          ))}
        </div>
      </section>
    </div>
  );
}