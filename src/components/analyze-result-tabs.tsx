"use client";

import type { AnalyzeResult } from "@/lib/ai-discovery-scanner";
import AnalyzeFileCard from "./analyze-file-card";

interface AnalyzeResultDetailsProps {
  result: AnalyzeResult;
}

const FILE_ORDER = [
  "llms.txt",
  "llm.txt",
  "ai.txt",
  "faq-ai.txt",
  "brand.txt",
  "developer-ai.txt",
  "llms.html",
  "robots-ai.txt",
  "identity.json",
  "ai.json",
] as const;

const SEVERITY_STYLES = {
  error: {
    borderLeft: "4px solid var(--color-error)",
    badge: "badge-error",
    icon: (
      <svg
        className="w-5 h-5"
        style={{ color: "var(--color-error)" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
  },
  warning: {
    borderLeft: "4px solid var(--color-warning)",
    badge: "badge-warning",
    icon: (
      <svg
        className="w-5 h-5"
        style={{ color: "var(--color-warning)" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
    ),
  },
};

const MATCH_BADGE = {
  true: { cls: "badge-success", label: "Match" },
  false: { cls: "badge-error", label: "Mismatch" },
  null: { cls: "badge-neutral", label: "Not found" },
};

// Section heading — Sora uppercase
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

export default function AnalyzeResultDetails({
  result,
}: AnalyzeResultDetailsProps) {
  const { origin, files, consistency } = result;

  const foundFiles = files.filter((f) => f.found);
  const foundCount = foundFiles.length;
  const totalCount = files.length;
  const totalErrors = files.reduce((sum, f) => sum + f.errors.length, 0);
  const totalWarnings = files.reduce((sum, f) => sum + f.warnings.length, 0);

  const orderedFiles = FILE_ORDER.map(
    (name) => files.find((f) => f.name === name)!
  );

  const totalChecks = consistency.summary.total;
  const consistencyErrors = consistency.summary.errors;
  const consistencyWarnings = consistency.summary.warnings;
  const consistencyPercent =
    totalChecks === 0
      ? 100
      : Math.round(((totalChecks - consistencyErrors) / totalChecks) * 100);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Stats Row — cream card with golden shadow ────────────────── */}
      <section>
        <div
          className="px-5 py-4 animate-golden-fade"
          style={{
            backgroundColor: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-golden-md)",
            borderRadius: "var(--radius)",
          }}
        >
          <div className="flex flex-wrap items-center gap-5">
            {/* Files found */}
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4"
                style={{ color: "var(--color-text-muted)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span
                className="font-medium"
                style={{ color: "var(--color-text)" }}
              >
                {foundCount}/{totalCount}
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                Files Found
              </span>
            </div>

            <div
              className="w-px h-4"
              style={{ backgroundColor: "var(--color-border)" }}
            />

            {/* Errors */}
            {totalErrors > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <svg
                  className="w-4 h-4"
                  style={{ color: "var(--color-error)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                  <path
                    strokeLinecap="round"
                    strokeWidth={2}
                    d="M15 9l-6 6M9 9l6 6"
                  />
                </svg>
                <span
                  className="font-medium"
                  style={{ color: "var(--color-error)" }}
                >
                  {totalErrors}
                </span>
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Errors
                </span>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--color-success)" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">No Errors</span>
              </div>
            )}

            {/* Warnings */}
            {totalWarnings > 0 && (
              <>
                <div
                  className="w-px h-4"
                  style={{ backgroundColor: "var(--color-border)" }}
                />
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4"
                    style={{ color: "var(--color-warning)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-warning)" }}
                  >
                    {totalWarnings}
                  </span>
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    Warnings
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Origin URL */}
          <p
            className="mt-3 text-xs font-mono"
            style={{ color: "var(--color-text-muted)" }}
          >
            {origin}
          </p>
        </div>
      </section>

      {/* ── AI Discovery Files ──────────────────────────────────────── */}
      <section>
        <SectionHeading>AI Discovery Files</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {orderedFiles.map((file) => (
            <AnalyzeFileCard key={file.name} file={file} />
          ))}
        </div>
      </section>

      {/* ── Field Consistency ───────────────────────────────────────── */}
      <section>
        <SectionHeading>Field Consistency</SectionHeading>

        {totalChecks === 0 ? (
          <div
            className="px-5 py-10 text-center"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
            }}
          >
            <svg
              className="w-8 h-8 mx-auto"
              style={{ color: "var(--color-text-muted)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <p
              className="mt-3 text-sm font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Need at least 2 files with identity fields for comparison
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Consistency checks are only possible when multiple files exist and
              share identity data.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Summary card */}
            <div
              className="px-5 py-4"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-golden-sm)",
                borderRadius: "var(--radius)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Consistency Score
                </span>
                <span
                  className="text-sm font-medium"
                  style={{
                    color:
                      consistencyPercent < 100
                        ? "var(--color-warning)"
                        : "var(--color-success)",
                  }}
                >
                  {consistencyPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="w-full"
                style={{
                  height: "4px",
                  backgroundColor: "var(--color-bg-secondary)",
                  borderRadius: "0",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${consistencyPercent}%`,
                    backgroundColor:
                      consistencyPercent === 100
                        ? "var(--color-success)"
                        : "var(--color-warning)",
                    borderRadius: "0",
                    transition: "width 0.5s ease-out",
                  }}
                />
              </div>

              {/* Labels */}
              <div className="flex items-center gap-5 mt-3">
                {consistencyErrors > 0 && (
                  <span
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--color-error)" }}
                  >
                    <span
                      className="inline-block w-2 h-2"
                      style={{
                        backgroundColor: "var(--color-error)",
                        borderRadius: "0",
                      }}
                    />
                    {consistencyErrors} error{consistencyErrors > 1 ? "s" : ""}
                  </span>
                )}
                {consistencyWarnings > 0 && (
                  <span
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--color-warning)" }}
                  >
                    <span
                      className="inline-block w-2 h-2"
                      style={{
                        backgroundColor: "var(--color-warning)",
                        borderRadius: "0",
                      }}
                    />
                    {consistencyWarnings} warning
                    {consistencyWarnings > 1 ? "s" : ""}
                  </span>
                )}
                {consistencyPercent === 100 && (
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "var(--color-success)" }}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    All fields consistent
                  </span>
                )}
              </div>
            </div>

            {/* Field check cards */}
            <div className="flex flex-col gap-3">
              {consistency.checks.map((check) => {
                const style = SEVERITY_STYLES[check.severity];
                return (
                  <div
                    key={check.field}
                    className="px-5 py-4 card-interactive"
                    style={{
                      backgroundColor: "var(--color-bg-secondary)",
                      border: "1px solid var(--color-border)",
                      borderLeft: style.borderLeft,
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {style.icon}
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text)" }}
                      >
                        {check.label}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                            <th
                              className="text-left pb-2 pr-4 font-medium"
                              style={{
                                color: "var(--color-text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                fontSize: "0.7rem",
                              }}
                            >
                              File
                            </th>
                            <th
                              className="text-left pb-2 pr-4 font-medium"
                              style={{
                                color: "var(--color-text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                fontSize: "0.7rem",
                              }}
                            >
                              Value
                            </th>
                            <th
                              className="text-left pb-2 font-medium"
                              style={{
                                color: "var(--color-text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                fontSize: "0.7rem",
                              }}
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {check.sources.map((source) => {
                            const badge =
                              source.value === null
                                ? MATCH_BADGE.null
                                : source.match
                                  ? MATCH_BADGE.true
                                  : MATCH_BADGE.false;
                            return (
                              <tr
                                key={source.file}
                                style={{
                                  borderBottom:
                                    "1px solid var(--color-border)",
                                }}
                              >
                                <td
                                  className="py-2 pr-4 font-mono"
                                  style={{ color: "var(--color-text)" }}
                                >
                                  {source.file}
                                </td>
                                <td
                                  className="py-2 pr-4 max-w-xs truncate"
                                  style={{ color: "var(--color-text)" }}
                                >
                                  {source.value ?? (
                                    <span
                                      className="italic"
                                      style={{
                                        color: "var(--color-text-muted)",
                                      }}
                                    >
                                      not found
                                    </span>
                                  )}
                                </td>
                                <td className="py-2">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${badge.cls}`}
                                    style={{ borderRadius: "var(--radius)" }}
                                  >
                                    {badge.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
