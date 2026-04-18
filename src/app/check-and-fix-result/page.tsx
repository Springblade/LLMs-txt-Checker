"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ResultShell from "@/components/result-shell";
import { Badge } from "@/components/ui/badge";
import type {
  CheckAndFixResult,
  CheckAndFixError,
} from "@/lib/check-and-fix/types";

// ── Icons ────────────────────────────────────────────────────────────────────

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function AlertTriangleIcon({
  className = "w-4 h-4",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
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
  );
}

function ChevronDownIcon({
  className = "w-4 h-4",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function ChevronUpIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({
  mode,
  passed,
}: {
  mode: CheckAndFixResult["mode"];
  passed: boolean;
}) {
  if (mode === "validated") {
    return (
      <Badge variant={passed ? "success" : "warning"}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          {passed ? (
            <CheckCircleIcon className="w-3.5 h-3.5" />
          ) : (
            <AlertTriangleIcon className="w-3.5 h-3.5" />
          )}
          {passed ? "Valid" : "Has Issues"}
        </span>
      </Badge>
    );
  }
  return (
    <Badge variant={passed ? "success" : "warning"}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
        }}
      >
        {passed ? (
          <CheckCircleIcon className="w-3.5 h-3.5" />
        ) : (
          <AlertTriangleIcon className="w-3.5 h-3.5" />
        )}
        {passed ? "Generated & Valid" : "Generated with Issues"}
      </span>
    </Badge>
  );
}

function ValidationSection({
  passed,
  errors,
  warnings,
}: {
  passed: boolean;
  errors: CheckAndFixResult["validation"]["errors"];
  warnings: CheckAndFixResult["validation"]["warnings"];
}) {
  const [expanded, setExpanded] = useState(!passed);
  const hasIssues = errors.length > 0 || warnings.length > 0;

  if (!hasIssues) return null;

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        boxShadow: "var(--shadow-golden-sm)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.875rem 1.25rem",
          backgroundColor: "var(--color-bg-secondary)",
          border: "none",
          cursor: "pointer",
          gap: "0.75rem",
        }}
        aria-expanded={expanded}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-text)",
            }}
          >
            Validation Report
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color:
                errors.length > 0
                  ? "var(--color-error)"
                  : "var(--color-warning)",
              backgroundColor:
                errors.length > 0
                  ? "rgba(231, 76, 60, 0.12)"
                  : "rgba(255, 215, 0, 0.08)",
              padding: "0.125rem 0.5rem",
              borderRadius: "var(--radius)",
              border: `1px solid ${
                errors.length > 0
                  ? "rgba(231, 76, 60, 0.3)"
                  : "rgba(255, 215, 0, 0.3)"
              }`,
            }}
          >
            {errors.length > 0
              ? `${errors.length} error${errors.length > 1 ? "s" : ""}`
              : `${warnings.length} warning${warnings.length > 1 ? "s" : ""}`}
          </span>
        </div>
        {expanded ? (
          <span style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>
            <ChevronUpIcon className="w-4 h-4" />
          </span>
        ) : (
          <span style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>
            <ChevronDownIcon className="w-4 h-4" />
          </span>
        )}
      </button>

      {/* Body */}
      {expanded && (
        <div
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {errors.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-error)",
                  marginBottom: "0.5rem",
                }}
              >
                Errors
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {errors.map((err, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-error)",
                      paddingLeft: "0.875rem",
                      borderLeft: "2px solid rgba(231, 76, 60, 0.4)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{err.rule}</span>:{" "}
                    {err.message}
                    {err.line != null && (
                      <span
                        style={{
                          color: "var(--color-text-muted)",
                          marginLeft: "0.375rem",
                        }}
                      >
                        (line {err.line})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-warning)",
                  marginBottom: "0.5rem",
                }}
              >
                Warnings
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {warnings.map((warn, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-warning)",
                      paddingLeft: "0.875rem",
                      borderLeft: "2px solid rgba(255, 215, 0, 0.4)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{warn.rule}</span>:{" "}
                    {warn.message}
                    {warn.line != null && (
                      <span
                        style={{
                          color: "var(--color-text-muted)",
                          marginLeft: "0.375rem",
                        }}
                      >
                        (line {warn.line})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CheckAndFixResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<CheckAndFixResult | null>(null);
  const [error, setError] = useState<CheckAndFixError | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("check-and-fix-result");
    if (!stored) {
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.success) {
        setResult(parsed);
      } else {
        setError(parsed);
      }
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleCopy = async () => {
    if (!result?.content) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.content || !result.fileName) return;
    const blob = new Blob([result.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    sessionStorage.removeItem("check-and-fix-result");
    router.push("/");
  };

  // Loading state
  if (!result && !error) {
    return (
      <ResultShell title="LLMs.txt Generator" breadcrumb="Loading...">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "var(--color-text-muted)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            style={{ animation: "spin 1s linear infinite" }}
          >
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          <span style={{ fontSize: "0.875rem" }}>Loading result...</span>
        </div>
      </ResultShell>
    );
  }

  // Error state
  if (error) {
    return (
      <ResultShell
        title="LLMs.txt Generator"
        breadcrumb="Error"
        showBackButton
        onBack={handleBack}
        backLabel="Try Again"
      >
        <div
          role="alert"
          style={{
            maxWidth: "42rem",
            padding: "1.5rem",
            backgroundColor: "rgba(231, 76, 60, 0.1)",
            border: "1px solid rgba(231, 76, 60, 0.3)",
            borderLeft: "3px solid var(--color-error)",
            borderRadius: "var(--radius)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-error)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--color-error)",
              }}
            >
              {error.message}
            </span>
          </div>
          {error.origin && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              Tried to check:{" "}
              <code style={{ color: "var(--color-code)" }}>{error.origin}</code>
            </p>
          )}
          <button
            onClick={handleBack}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              alignSelf: "flex-start",
            }}
          >
            Try Another URL
          </button>
        </div>
      </ResultShell>
    );
  }

  // Success state
  const displayUrl = result!.origin.replace(/^https?:\/\//, "");
  const fileSizeKB = (
    new TextEncoder().encode(result!.content).length / 1024
  ).toFixed(1);
  const lineCount = result!.content.split("\n").length;

  return (
    <ResultShell
      title="LLMs.txt Generator"
      breadcrumb={
        result!.mode === "generated_and_validated"
          ? "Generated"
          : "Validated"
      }
      showBackButton
      onBack={handleBack}
      backLabel="New"
    >
      {/* ── Zone 1: Header ─────────────────────────────────────── */}
      <div
        className="animate-golden-fade stagger-1"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Row 1: Badge + URL breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <StatusBadge mode={result!.mode} passed={result!.validation.passed} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "50ch",
              }}
              title={displayUrl}
            >
              {displayUrl}
            </span>
          </div>
        </div>

        {/* Row 2: Stats + Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {/* Stats */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {result!.metadata.pagesFound !== undefined && (
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-muted)",
                }}
              >
                <span
                  style={{ fontWeight: 600, color: "var(--color-text)" }}
                >
                  {result!.metadata.pagesFound}
                </span>{" "}
                pages found
              </span>
            )}
            {result!.metadata.pagesCrawled !== undefined && (
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-muted)",
                }}
              >
                <span
                  style={{ fontWeight: 600, color: "var(--color-text)" }}
                >
                  {result!.metadata.pagesCrawled}
                </span>{" "}
                crawled
              </span>
            )}
            <span
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
              }}
            >
              <span
                style={{ fontWeight: 600, color: "var(--color-text)" }}
              >
                {lineCount}
              </span>{" "}
              lines
            </span>
            <span
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
              }}
            >
              <span
                style={{ fontWeight: 600, color: "var(--color-text)" }}
              >
                {fileSizeKB}
              </span>{" "}
              KB
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleCopy}
              aria-label="Copy llms.txt to clipboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.375rem 0.75rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                backgroundColor: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {copied ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-success)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: "var(--color-success)" }}>Copied!</span>
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              aria-label="Download llms.txt file"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.375rem 0.75rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#1f1f1f",
                backgroundColor: "#fffaeb",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* ── Zone 2: Validation Report ─────────────────────────── */}
      <div
        className="animate-golden-fade stagger-2"
        style={{ marginBottom: "1.5rem" }}
      >
        <ValidationSection
          passed={result!.validation.passed}
          errors={result!.validation.errors}
          warnings={result!.validation.warnings}
        />
      </div>

      {/* ── Zone 3: File Content ───────────────────────────────── */}
      <div
        className="animate-golden-fade stagger-3"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          borderLeft: "3px solid var(--color-primary)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          boxShadow: "var(--shadow-golden-md)",
          marginBottom: "2rem",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.25rem",
            backgroundColor: "var(--color-bg-tertiary)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
              }}
            >
              {result!.fileName}
            </span>
          </div>
          <a
            href={result!.llmsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
            title="View live file"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            {result!.llmsUrl}
          </a>
        </div>

        {/* Content */}
        <pre
          style={{
            margin: 0,
            padding: "1.25rem",
            fontSize: "0.8125rem",
            lineHeight: 1.6,
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "600px",
            color: "var(--color-text-secondary)",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {result!.content}
        </pre>
      </div>

      {/* ── Zone 4: Next Steps ─────────────────────────────────── */}
      <div
        className="animate-golden-fade stagger-4"
        style={{
          padding: "1.25rem",
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          maxWidth: "42rem",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "0.75rem",
          }}
        >
          Next Steps
        </p>
        <ol
          style={{
            margin: 0,
            paddingLeft: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <li
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            Download the{" "}
            <code style={{ color: "var(--color-code)" }}>llms.txt</code> file
          </li>
          <li
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            Place it at the root of your website:{" "}
            <code style={{ color: "var(--color-code)" }}>{result!.llmsUrl}</code>
          </li>
          <li
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            AI bots and tools will automatically find and use it
          </li>
        </ol>
      </div>
    </ResultShell>
  );
}
