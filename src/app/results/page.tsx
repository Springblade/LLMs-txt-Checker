"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DiscoverResult, FileType, FileScanResult } from "@/lib/discovery/types";
import { FILE_TIER } from "@/lib/discovery/types";
import type { FileTier } from "@/lib/discovery/types";

import { ResultsSkeleton } from "@/components/landing/results-skeleton";
import { AuditProgressPanel } from "@/components/audit";
import { FileCard } from "@/components/audit";
import { SiteLogo } from "@/components/site-logo";
import { UpgradeModal } from "@/components/landing/upgrade-modal";
import { SummaryCard } from "@/components/results/summary-card";
import {
  getGenerationCount,
  isOverGenerationLimit,
  incrementGenerationCount,
  GENERATION_LIMIT,
} from "@/hooks/use-generation-quota";
import { tierInfo } from "@/lib/design-tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleDownload(file: FileScanResult) {
  const blob = new Blob([file.content ?? ""], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.type;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Page Component ───────────────────────────────────────────────────────────

function ResultsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url") ?? "";

  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inProgressFiles, setInProgressFiles] = useState<Set<FileType>>(new Set());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!rawUrl) {
      router.replace("/");
      return;
    }
    setLoading(true);
  }, [rawUrl, router]);

  const handleAuditComplete = useCallback((apiResult: DiscoverResult) => {
    setResult(apiResult);
    setLoading(false);
  }, []);

  const handleAuditError = (message: string) => {
    setError(message);
    setLoading(false);
  };

  const handleGenerate = async (fileType: FileType) => {
    if (!result) return;

    const origin = result.origin;

    // Client-side quota gate — block before API call
    if (isOverGenerationLimit(origin)) {
      setShowUpgradeModal(true);
      return;
    }

    setInProgressFiles((prev) => new Set([...prev, fileType]));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: origin, fileType }),
      });
      const data = await res.json();

      if (data.success && data.content) {
        // Increment quota counter on successful generation
        incrementGenerationCount(origin);
        const generatedFile: FileScanResult = {
          type: fileType,
          found: true,
          content: data.content,
          checklist: data.checklist ?? [],
          errors: data.errors ?? data.validation?.errors ?? [],
          warnings: data.warnings ?? data.validation?.warnings ?? [],
          url: "",
        };
        setResult((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            files: prev.files.map((f) =>
              f.type === fileType ? generatedFile : f,
            ),
          };
        });
      }
    } catch {
      // swallow — inProgressFiles still cleared in finally
    } finally {
      setInProgressFiles((prev) => {
        const next = new Set(prev);
        next.delete(fileType);
        return next;
      });
    }
  };

  const scannedUrl = result?.origin ?? rawUrl;
  const usedCount = result ? getGenerationCount(result.origin) : 0;

  // ── Error / loading states ──────────────────────────────────────────────────

  if (error || (!loading && !result)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: 48 }}>
          <p style={{ color: "var(--error)", marginBottom: 16 }}>{error ?? "Something went wrong."}</p>
          <a href="/" style={{ color: "var(--brand)" }}>Go back home</a>
        </div>
      </div>
    );
  }

  if (loading || !result) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
        {/* Header */}
        <div style={{ height: 56, borderBottom: "1px solid var(--mm-border)", background: "var(--mm-bg)", flexShrink: 0 }} />
        {loading ? (
          <AuditProgressPanel url={rawUrl} onComplete={handleAuditComplete} onError={handleAuditError} />
        ) : (
          <ResultsSkeleton />
        )}
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
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
        <SiteLogo height={28} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: "#71717a",
          padding: "4px 10px",
          borderRadius: 6,
          border: "1px solid #27272a",
          maxWidth: 480,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
        }}>
          {scannedUrl}
        </span>
        {result && (
          <div
            title={`${usedCount} of ${GENERATION_LIMIT} free generations used`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: usedCount >= GENERATION_LIMIT ? "#eab308" : "#27272a",
              background: usedCount >= GENERATION_LIMIT ? "rgba(234,179,8,0.08)" : "transparent",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              color: usedCount >= GENERATION_LIMIT ? "#eab308" : "#71717a",
              flexShrink: 0,
              transition: "border-color 0.2s, background 0.2s, color 0.2s",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {usedCount} / {GENERATION_LIMIT}
          </div>
        )}

        <div style={{ marginLeft: "auto" }}>
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid var(--mm-border)",
              background: "var(--mm-bg-secondary)",
              color: "var(--mm-text-muted)",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 500,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Scan new
          </a>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Main content area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Summary strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "12px 24px",
              borderBottom: "1px solid #18181f",
              background: "var(--bg)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#52525b",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Scan Results
            </span>
            {result && (
              <>
                <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>
                  {result.files.filter((f) => f.found).length} found
                </span>
                <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>
                  {result.files.filter((f) => !f.found && !f.content).length} missing
                </span>
              </>
            )}
          </div>

          {/* File cards scrollable area */}
          <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
            {/* Summary Card */}
            {result.crawlResult && (
              <div style={{ marginBottom: 16 }}>
                <SummaryCard crawlResult={result.crawlResult} />
              </div>
            )}
            {(["essential", "recommended", "complete"] as FileTier[]).map((tier) => {
              const tierFiles = result.files.filter((f) => FILE_TIER[f.type] === tier);
              if (tierFiles.length === 0) return null;
              const info = tierInfo[tier];
              return (
                <div key={tier} style={{ marginBottom: 40 }}>
                  {/* Tier header */}
                  <div
                    style={{
                      padding: "0 0 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: info.color,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#e4e4e7",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        {info.label}
                      </span>
                      <span style={{ fontSize: 11, color: "#52525b" }}>
                        · {tierFiles.length} files
                      </span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: `linear-gradient(to right, ${info.color}22, transparent)`,
                      }}
                    />
                  </div>

                  {/* Cards grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 12,
                      alignItems: "start",
                    }}
                  >
                    {tierFiles.map((file) => (
                      <FileCard
                        key={file.type}
                        fileType={file.type}
                        tier={FILE_TIER[file.type]}
                        found={file.found}
                        content={file.content}
                        checklist={file.checklist}
                        isGenerating={inProgressFiles.has(file.type)}
                        onGenerate={() => {
                          if (isOverGenerationLimit(result.origin)) {
                            setShowUpgradeModal(true);
                            return;
                          }
                          void handleGenerate(file.type);
                        }}
                        onDownload={() => handleDownload(file)}
                        onRegenerate={() => void handleGenerate(file.type)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Upgrade modal */}
      {result && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          usedCount={usedCount}
          limit={GENERATION_LIMIT}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsPageInner />
    </Suspense>
  );
}
