"use client";

import { useState, useEffect, useRef } from "react";
import { AuditFileItem, type FileItemStatus } from "./audit-file-item";
import type { DiscoverResult, CrawlResult, FileType } from "@/lib/discovery/types";

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

type Phase = "finding" | "checking" | "analyzing" | "ready";

interface PhaseDef {
  label: string;
  key: Phase;
  progressPct: number;
}

const PHASES: PhaseDef[] = [
  { label: "FINDING", key: "finding", progressPct: 25 },
  { label: "CHECKING", key: "checking", progressPct: 60 },
  { label: "ANALYZING", key: "analyzing", progressPct: 90 },
  { label: "READY", key: "ready", progressPct: 100 },
];

const ANALYZE_MESSAGES = [
  "Looking for AI files on your site...",
  "Checking your content quality...",
  "Calculating your AI readiness score...",
];

const CRAWL_TIMEOUT_MS = 60_000; // 60s timeout for crawl

interface AuditProgressPanelProps {
  url: string;
  onComplete: (result: DiscoverResult, crawlResult?: CrawlResult) => void;
  onError: (message: string) => void;
}

export function AuditProgressPanel({ url, onComplete, onError }: AuditProgressPanelProps) {
  const [phase, setPhase] = useState<Phase>("finding");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [apiResult, setApiResult] = useState<DiscoverResult | null>(null);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | undefined>(undefined);
  const [crawlWarning, setCrawlWarning] = useState<string | null>(null);
  const [discoverDone, setDiscoverDone] = useState(false);
  const [crawlDone, setCrawlDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const mountedRef = useRef(true);

  // Animation timer with dynamic phases
  useEffect(() => {
    const startTime = Date.now();
    let raf = 0;
    let lastPhase = "";

    const tick = () => {
      if (!mountedRef.current) return;

      const elapsed = Date.now() - startTime;

      // Determine phase based on elapsed time
      let newPhase: Phase;
      let progress = 0;

      if (elapsed < 3000) {
        newPhase = "finding";
        progress = Math.min(25, (elapsed / 3000) * 25);
      } else if (elapsed < 8000) {
        newPhase = "checking";
        const phaseElapsed = elapsed - 3000;
        progress = 25 + (phaseElapsed / 5000) * 35;
      } else if (elapsed < 55000) {
        newPhase = "analyzing";
        const phaseElapsed = elapsed - 8000;
        progress = 60 + (phaseElapsed / 47000) * 30;
      } else {
        newPhase = "ready";
        progress = 100;
      }

      if (newPhase !== lastPhase) {
        lastPhase = newPhase;
        setPhase(newPhase);
      }
      setPhaseProgress(Math.min(progress, 100));

      if (newPhase === "ready") {
        cancelAnimationFrame(raf);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  // Fire both APIs in parallel
  useEffect(() => {
    if (!mountedRef.current) return;

    const controller = new AbortController();
    let crawlCompleted = false;

    // Fetch discover API
    const fetchDiscover = async () => {
      try {
        const res = await fetch("/api/discover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
          signal: controller.signal,
        });
        const data = await res.json();

        if (!mountedRef.current) return;

        if (data.error) {
          setDiscoverDone(true);
          onError(data.error);
          return;
        }

        // Discover resolved - move to checking
        setPhase("checking");
        setPhaseProgress(30);

        // Check if crawl already completed
        if (crawlCompleted) {
          setPhase("analyzing");
          setPhaseProgress(75);
        }

        setApiResult(data as DiscoverResult);
        setDiscoverDone(true);
      } catch (e) {
        if (!mountedRef.current) return;
        setDiscoverDone(true);
        if (e instanceof Error && e.name !== "AbortError") {
          onError("Network error. Please check your connection.");
        }
      }
    };

    // Fetch crawl API with timeout
    const fetchCrawl = async () => {
      const timeoutPromise = new Promise<CrawlResult | null>((resolve) => {
        setTimeout(() => resolve(null), CRAWL_TIMEOUT_MS);
      });

      try {
        const res = await Promise.race([
          fetch("/api/crawl", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
            signal: controller.signal,
          }),
          timeoutPromise,
        ]);

        if (!mountedRef.current) return;

        if (res === null) {
          // Timeout
          crawlCompleted = true;
          setCrawlDone(true);
          setCrawlWarning("Crawl is taking longer than expected...");
          if (apiResult) {
            setPhase("analyzing");
            setPhaseProgress(75);
          }
          return;
        }

        const data = await (res as Response).json();

        if (!mountedRef.current) return;

        crawlCompleted = true;

        if (data.error) {
          setCrawlDone(true);
          setCrawlWarning("Crawl unavailable — some features may be limited");
          if (apiResult) {
            setPhase("analyzing");
            setPhaseProgress(75);
          }
          return;
        }

        setCrawlResult(data as CrawlResult);
        setCrawlDone(true);

        // Crawl resolved - if discover already done, move to analyzing
        if (apiResult) {
          setPhase("analyzing");
          setPhaseProgress(75);
        }
      } catch (e) {
        if (!mountedRef.current) return;
        crawlCompleted = true;
        setCrawlDone(true);
        setCrawlWarning("Crawl unavailable — some features may be limited");
        if (apiResult) {
          setPhase("analyzing");
          setPhaseProgress(75);
        }
      }
    };

    // Fire both in parallel
    fetchDiscover();
    fetchCrawl();

    return () => {
      controller.abort();
    };
  }, [url, onError]);

  // Trigger onComplete when both APIs settled
  useEffect(() => {
    const bothDone = discoverDone && crawlDone;
    if (!bothDone || !apiResult) return;

    setFadingOut(true);
    const t = setTimeout(() => {
      if (mountedRef.current) {
        const result: DiscoverResult = {
          ...apiResult,
          crawlResult: crawlResult ?? apiResult.crawlResult,
        };
        onComplete(result, crawlResult);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [discoverDone, crawlDone, apiResult, crawlResult, onComplete]);

  // Safety timeout - force complete after 90s max
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current && apiResult) {
        setFadingOut(true);
        const result: DiscoverResult = {
          ...apiResult,
          crawlResult: crawlResult ?? apiResult.crawlResult,
        };
        onComplete(result, crawlResult);
      }
    }, 90_000);
    return () => clearTimeout(safetyTimer);
  }, [apiResult, crawlResult, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Derive file statuses from real API result
  const fileStates = (): Record<string, FileItemStatus> => {
    if (!apiResult) {
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
  const messageIndex = Math.floor(phaseProgress / 8) % ANALYZE_MESSAGES.length;
  const analyzeMessage = ANALYZE_MESSAGES[messageIndex] ?? ANALYZE_MESSAGES[0]!;

  const foundCount = apiResult ? apiResult.files.filter((f) => f.found).length : 0;
  const passCount = Object.values(statuses).filter((s) => s === "pass").length;

  const currentPhaseIndex = PHASES.findIndex((p) => p.key === phase);

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
          height: 64,
          borderBottom: "1px solid var(--mm-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 12,
          background: "var(--mm-bg)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--mm-text)",
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Making your site visible to AI
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--mm-text-muted)",
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {url}
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
            maxWidth: 480,
            background: "var(--mm-bg)",
            border: "1px solid var(--mm-border)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Phase stepper */}
          <div
            style={{
              display: "flex",
              padding: "24px 24px 16px",
              gap: 0,
            }}
          >
            {PHASES.map((p, i) => {
              const isPast = PHASES.indexOf(p) < currentPhaseIndex;
              const isActive = p.key === phase;

              return (
                <div
                  key={p.label}
                  style={{ display: "flex", alignItems: "center", flex: 1 }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: `2px solid ${isActive ? "var(--brand)" : isPast ? "var(--brand)" : "var(--mm-border)"}`,
                        background: isPast ? "var(--brand)" : isActive ? "var(--brand)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        flexShrink: 0,
                      }}
                    >
                      {isPast ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : isActive ? (
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "white",
                            animation: "friendly-pulse 1.2s ease-in-out infinite",
                          }}
                        />
                      ) : (
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--mm-border)" }} />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: isActive ? 700 : 500,
                        letterSpacing: "0.06em",
                        color: isActive ? "var(--brand)" : isPast ? "var(--mm-text-muted)" : "var(--mm-text-subtle)",
                        fontFamily: "'DM Sans', sans-serif",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {p.label}
                    </span>
                  </div>
                  {i < PHASES.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: isPast ? "var(--brand)" : "var(--mm-border)",
                        margin: "0 4px",
                        marginBottom: 24,
                        transition: "background 0.3s ease",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress section */}
          <div style={{ padding: "0 24px 20px" }}>
            <div
              style={{
                height: 8,
                background: "var(--mm-bg-secondary)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${phaseProgress}%`,
                  background: "var(--brand)",
                  borderRadius: 4,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "var(--mm-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                {phase === "ready" ? "Your report is ready!" : analyzeMessage}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)", fontFamily: "'DM Sans', sans-serif" }}>
                {Math.round(phaseProgress)}%
              </span>
            </div>
            {crawlWarning && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  background: "rgba(234, 179, 8, 0.1)",
                  border: "1px solid rgba(234, 179, 8, 0.3)",
                  borderRadius: 6,
                  fontSize: 11,
                  color: "var(--mm-yellow)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {crawlWarning}
              </div>
            )}
          </div>

          {/* Summary */}
          {apiResult && (
            <div
              style={{
                display: "flex",
                gap: 16,
                margin: "0 24px 16px",
                padding: "12px 16px",
                background: "var(--mm-bg-secondary)",
                borderRadius: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>✓</span>
                <span style={{ fontSize: 12, color: "var(--mm-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                  <strong style={{ color: "var(--mm-text)" }}>{foundCount}</strong> found
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 20, lineHeight: 1, color: "#ef4444" }}>✗</span>
                <span style={{ fontSize: 12, color: "var(--mm-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                  <strong style={{ color: "var(--mm-text)" }}>{ALL_FILES.length - foundCount}</strong> missing
                </span>
              </div>
              {passCount > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 20, lineHeight: 1, color: "#eab308" }}>⚠</span>
                  <span style={{ fontSize: 12, color: "var(--mm-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                    <strong style={{ color: "var(--mm-text)" }}>{passCount}</strong> with issues
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Toggle details */}
          <div style={{ padding: "0 24px 20px" }}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: "100%",
                padding: "10px 16px",
                background: "transparent",
                border: "1px solid var(--mm-border)",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--mm-text-muted)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: "transform 0.2s ease", transform: showDetails ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
              {showDetails ? "Hide technical details" : "Show technical details"}
            </button>
          </div>

          {/* Technical details (collapsible) */}
          {showDetails && (
            <div
              style={{
                borderTop: "1px solid var(--mm-border)",
                padding: "16px 24px 20px",
                background: "var(--mm-bg-secondary)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {ALL_FILES.map((file, i) => (
                  <AuditFileItem
                    key={file}
                    filename={file}
                    status={statuses[file] ?? "idle"}
                    delay={phase === "finding" ? i * 100 : 0}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes friendly-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
