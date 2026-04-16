"use client";

import type { ValidationResult } from "@/lib/types";
import {
  buildValidationChecks,
  type ValidationCheck,
  type ValidationCheckStatus,
} from "@/lib/validation-checklist";

interface StatusIconProps {
  status: ValidationCheckStatus;
  size?: "sm" | "md" | "lg";
}

function StatusIcon({ status, size = "md" }: StatusIconProps) {
  const sz =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  if (status === "success") {
    return (
      <svg
        className={sz}
        style={{ color: "var(--color-success)" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  if (status === "error") {
    return (
      <svg
        className={sz}
        style={{ color: "var(--color-error)" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M15 9l-6 6M9 9l6 6" />
      </svg>
    );
  }
  if (status === "warning") {
    return (
      <svg
        className={sz}
        style={{ color: "var(--color-warning)" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
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
    <svg
      className={sz}
      style={{ color: "var(--color-text-muted)" }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
    </svg>
  );
}

const CARD_BORDER: Record<ValidationCheckStatus, string> = {
  success: "4px solid var(--color-success)",
  error: "4px solid var(--color-error)",
  warning: "4px solid var(--color-warning)",
  info: "4px solid var(--color-border-strong)",
};

const ROW_BORDER: Record<ValidationCheckStatus, string> = {
  success: "4px solid var(--color-success)",
  error: "4px solid var(--color-error)",
  warning: "4px solid var(--color-warning)",
  info: "4px solid var(--color-border-strong)",
};

function SummaryCard({ check }: { check: ValidationCheck }) {
  return (
    <div
      className="flex gap-3 p-4"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        borderLeft: CARD_BORDER[check.status],
        boxShadow: "var(--shadow-golden-sm)",
      }}
    >
      <StatusIcon status={check.status} size="lg" />
      <div>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text)" }}
        >
          {check.order}. {check.title}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {check.message}
        </p>
      </div>
    </div>
  );
}

function DetailsRow({ check }: { check: ValidationCheck }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        borderLeft: ROW_BORDER[check.status],
      }}
    >
      <StatusIcon status={check.status} />
      <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
        {check.order}. {check.message}
      </span>
    </div>
  );
}

interface ValidationDetailsTabProps {
  result: ValidationResult;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display"
      style={{
        fontSize: "var(--font-size-small)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--color-text-secondary)",
        marginBottom: "1rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid var(--color-border)",
        fontWeight: 400,
      }}
    >
      {children}
    </h2>
  );
}

export default function ValidationDetailsTab({
  result,
}: ValidationDetailsTabProps) {
  if (!result.found) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
        }}
      >
        <svg
          className="w-12 h-12"
          style={{ color: "var(--color-warning)" }}
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
        <p
          className="mt-5 text-lg font-display"
          style={{
            fontSize: "var(--font-size-h3)",
            color: "var(--color-text)",
            letterSpacing: "-0.01em",
          }}
        >
          Could not load llms.txt
        </p>
        <p
          className="mt-3 text-sm max-w-md"
          style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}
        >
          {result.message ??
            "The file was not found or could not be fetched from this site."}
        </p>
        <p
          className="mt-5 text-xs font-mono"
          style={{ color: "var(--color-text-muted)" }}
        >
          Expected URL:{" "}
          <span
            className="px-2 py-1"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              borderRadius: "var(--radius)",
            }}
          >
            /llms.txt
          </span>{" "}
          at the site root.
        </p>
      </div>
    );
  }

  const checks = buildValidationChecks(result);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Validation Summary ─────────────────────────────────────── */}
      <section>
        <SectionHeading>Validation Summary</SectionHeading>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {checks.map((check) => (
            <SummaryCard key={check.id} check={check} />
          ))}
        </div>
      </section>

      {/* ── Validation Details ────────────────────────────────────── */}
      <section>
        <SectionHeading>Validation Details</SectionHeading>
        <div className="flex flex-col gap-2">
          {checks.map((check) => (
            <DetailsRow key={check.id} check={check} />
          ))}
        </div>
      </section>
    </div>
  );
}
