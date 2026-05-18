"use client";

import { useState, useEffect } from "react";
import { AuditFileItem, type FileItemStatus } from "./audit-file-item";
import type { DiscoverResult, FileType } from "@/lib/discovery/types";

const ALL_FILES: FileType[] = [
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
];

type Phase = "discover" | "validate" | "analyze" | "complete";

interface PhaseDef {
  label: string;
  startMs: number;
  endMs: number;
  progressPct: number;
}

const PHASES: PhaseDef[] = [
  { label: "DISCOVER", startMs: 0, endMs: 800, progressPct: 25 },
  { label: "VALIDATE", startMs: 800, endMs: 1800, progressPct: 60 },
  { label: "ANALYZE", startMs: 1800, endMs: 2600, progressPct: 90 },
  { label: "COMPLETE", startMs: 2600, endMs: 3200, progressPct: 100 },
];

const ANALYZE_MESSAGES = [
  "Analyzing content quality...",
  "Checking broken links...",
  "Validating file structure...",
];

interface AuditProgressPanelProps {
  url: string;
  onComplete: (result: DiscoverResult) => void;
  onError: (message: string) => void;
}

export function AuditProgressPanel({ url, onComplete, onError }: AuditProgressPanelProps) {
  const [elapsed, setElapsed] = useState(0);
  const [apiResult, setApiResult] = useState<DiscoverResult | null>(null);
  const [animationDone, setAnimationDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const currentPhase = (): Phase => {
    if (elapsed < 800) return "discover";
    if (elapsed < 1800) return "validate";
    if (elapsed < 2600) return "analyze";
    return "complete";
  };

  const phaseProgress = ((): number => {
    const phase = PHASES.find(
      (p) => elapsed >= p.startMs && elapsed < p.endMs
    );
    if (!phase) return 100;
    const phaseElapsed = elapsed - phase.startMs;
    const phaseDuration = phase.endMs - phase.startMs;
    return Math.min(((phaseElapsed / phaseDuration) * 100), phase.progressPct);
  })();

  // Animation timer
  useEffect(() => {
    const startTime = Date.now();
    let raf = 0;
    raf = requestAnimationFrame(function tick() {
      const now = Date.now();
      const delta = now - startTime;
      setElapsed(delta);
      raf = requestAnimationFrame(tick);
      if (delta >= 3200) {
        cancelAnimationFrame(raf);
        setAnimationDone(true);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Fetch API in parallel
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    fetch("/api/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeout);
        if (data.error) {
          onError(data.error);
        } else {
          setApiResult(data as DiscoverResult);
        }
      })
      .catch((e) => {
        clearTimeout(timeout);
        if (e instanceof Error && e.name !== "AbortError") {
          onError("Network error. Please check your connection.");
        }
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [url, onError]);

  // Trigger onComplete when both done
  useEffect(() => {
    if (!animationDone || !apiResult) return;
    setFadingOut(true);
    const t = setTimeout(() => {
      onComplete(apiResult);
    }, 350);
    return () => clearTimeout(t);
  }, [animationDone, apiResult, onComplete]);

  // Derive file statuses from real API result
  const fileStates = (): Record<string, FileItemStatus> => {
    if (!apiResult) {
      // Still loading — show idle/running based on phase
      if (currentPhase() === "discover") return Object.fromEntries(ALL_FILES.map((f) => [f, "running"]));
      return Object.fromEntries(ALL_FILES.map((f) => [f, "running"]));
    }
    return Object.fromEntries(
      ALL_FILES.map((file) => {
        const f = apiResult.files.find((x) => x.type === file);
        if (!f) return [file, "idle" as FileItemStatus];
        if (!f.found) return [file, "missing" as FileItemStatus];
        if (f.errors.length > 0) return [file, "fail" as FileItemStatus];
        if (f.warnings.length > 0) return [file, "warning" as FileItemStatus];
        return [file, "pass" as FileItemStatus];
      })
    );
  };

  const statuses = fileStates();
  const analyzeMessage = ANALYZE_MESSAGES[Math.floor(elapsed / 300) % ANALYZE_MESSAGES.length] ?? ANALYZE_MESSAGES[0]!;

  const foundCount = apiResult ? apiResult.files.filter((f) => f.found).length : 0;
  const passCount = Object.values(statuses).filter((s) => s === "pass").length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          borderBottom: "1px solid var(--mm-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          background: "var(--mm-bg)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 13,
            fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
            color: "var(--mm-text-muted)",
          }}
        >
          {url}
        </span>
        <div style={{ marginLeft: "auto" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 20,
              border: "1px solid var(--mm-border)",
              background: "transparent",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              color: "var(--mm-text-muted)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "audit-spin 0.8s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Scanning
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          overflow: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "var(--mm-bg)",
            border: "1px solid var(--mm-border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--mm-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--mm-text-subtle)",
                  fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
                }}
              >
                AUDIT PROGRESS
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--mm-text-muted)",
                  fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
                }}
              >
                {Math.round(phaseProgress)}%
              </span>
            </div>
            <div
              style={{
                height: 3,
                background: "var(--mm-bg-secondary)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${phaseProgress}%`,
                  background: "var(--brand)",
                  borderRadius: 2,
                  transition: "width 0.1s linear",
                }}
              />
            </div>
          </div>

          {/* Phase stepper */}
          <div
            style={{
              display: "flex",
              padding: "14px 20px",
              borderBottom: "1px solid var(--mm-border)",
              overflowX: "auto",
            }}
          >
            {PHASES.map((phase, i) => {
              const phaseKey = phase.label.toLowerCase() as Phase;
              const isActive = currentPhase() === phaseKey;
              const phaseIdx = PHASES.findIndex((p) => p.label === phase.label);
              const currentIdx = PHASES.findIndex((p) => p.label.toLowerCase() === currentPhase());
              const isPast = phaseIdx < currentIdx;

              return (
                <div
                  key={phase.label}
                  style={{ display: "flex", alignItems: "center", flex: 1 }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: `1.5px solid ${isActive || isPast ? "var(--brand)" : "var(--mm-border)"}`,
                        background: isPast ? "var(--brand)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.25s ease",
                      }}
                    >
                      {isPast ? (
                        <span style={{ fontSize: 11, color: "white", lineHeight: 1 }}>✓</span>
                      ) : isActive ? (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--brand)",
                            animation: "audit-pulse 1s ease-in-out infinite",
                          }}
                        />
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--mm-border)" }} />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: isActive ? 700 : 400,
                        letterSpacing: "0.08em",
                        color: isActive ? "var(--mm-text)" : isPast ? "var(--brand)" : "var(--mm-text-subtle)",
                        fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {phase.label}
                    </span>
                  </div>
                  {i < PHASES.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: isPast ? "var(--brand)" : "var(--mm-border)",
                        margin: "0 4px",
                        marginBottom: 18,
                        transition: "background 0.25s ease",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary row */}
          {apiResult && (
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 20px",
                borderBottom: "1px solid var(--mm-border)",
                background: "var(--mm-bg-secondary)",
              }}
            >
              <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "ui-monospace, monospace" }}>
                {foundCount} found
              </span>
              <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "ui-monospace, monospace" }}>
                {ALL_FILES.length - foundCount} missing
              </span>
              {passCount > 0 && (
                <span style={{ fontSize: 11, color: "#eab308", fontFamily: "ui-monospace, monospace" }}>
                  {passCount} with issues
                </span>
              )}
            </div>
          )}

          {/* File list */}
          <div
            style={{
              padding: "12px 20px",
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {currentPhase() === "analyze" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  color: "var(--mm-text-muted)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--mm-text-muted)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "audit-spin 0.8s linear infinite", flexShrink: 0 }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
                  }}
                >
                  {analyzeMessage}
                </span>
              </div>
            ) : (
              ALL_FILES.map((file, i) => (
                <AuditFileItem
                  key={file}
                  filename={file}
                  status={statuses[file] ?? "idle"}
                  delay={currentPhase() === "discover" ? i * 80 : 0}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "10px 20px",
              borderTop: "1px solid var(--mm-border)",
              background: "var(--mm-bg-secondary)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "var(--mm-text-subtle)",
                fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
              }}
            >
              {currentPhase() === "complete"
                ? "✓ Audit complete — preparing results..."
                : apiResult
                  ? `Scanning ${url} — ${foundCount} files found`
                  : `Scanning ${url}`}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes audit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes audit-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
