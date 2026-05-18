"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DiscoverResult, FileType, FileScanResult } from "@/lib/discovery/types";
import { FILE_TIER } from "@/lib/discovery/types";
import type { FileTier } from "@/lib/discovery/types";

import { ResultsSkeleton } from "@/components/landing/results-skeleton";
import { IconSidebar } from "@/components/landing/icon-sidebar";
import { CodePreview } from "@/components/landing/code-preview";
import { ResultsRightPanel } from "@/components/landing/results-right-panel";
import { MissingFileState } from "@/components/landing/missing-file-state";
import { FileTabBar } from "@/components/landing/file-tab-bar";
import type { TabFile } from "@/components/landing/file-tab-bar";
import { UrlBadge } from "@/components/landing/url-badge";
import { SiteLogo } from "@/components/site-logo";
import { FILE_DESCRIPTIONS } from "@/lib/file-descriptions";
import { UpgradeModal } from "@/components/landing/upgrade-modal";
import {
  getGenerationCount,
  isOverGenerationLimit,
  incrementGenerationCount,
  GENERATION_LIMIT,
} from "@/hooks/use-generation-quota";

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

function toPanelFileResult(file: FileScanResult) {
  const status: "found" | "missing" | "partial" = file.found ? "found" : file.content ? "partial" : "missing";
  const tier = FILE_TIER[file.type];
  return {
    name: file.type,
    tier,
    status,
    lines: file.content ? file.content.split("\n").length : 0,
    url: file.url || null,
    content: file.content || null,
  };
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

  // Active file state
  const [activeFile, setActiveFile] = useState<FileScanResult | undefined>(undefined);

  useEffect(() => {
    if (!rawUrl) {
      router.replace("/");
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/discover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: rawUrl }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error ?? "Something went wrong.");
          return;
        }
        setResult(data as DiscoverResult);
      } catch {
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [rawUrl, router]);

  // Initialize activeFile when result arrives
  useEffect(() => {
    if (!result) return;
    if (!activeFile && result.files.length > 0) {
      setActiveFile(result.files[0]);
    }
  }, [result, activeFile]);

  // Sync activeFile when result updates
  useEffect(() => {
    if (!result || !activeFile) return;
    const updated = result.files.find((f) => f.type === activeFile.type);
    if (updated && updated !== activeFile) {
      setActiveFile(updated);
    }
  }, [result, activeFile]);

  // Tier counts for strip
  const tierCounts = useMemo(() => {
    if (!result) return undefined;
    const counts: Record<FileTier, number> = { essential: 0, recommended: 0, complete: 0 };
    for (const f of result.files) {
      counts[FILE_TIER[f.type]]++;
    }
    return counts;
  }, [result]);

  // All files as tabs
  const allTabs: TabFile[] = useMemo(
    () =>
      result
        ? result.files.map((f) => {
            const status: "found" | "missing" | "partial" = f.found ? "found" : f.content ? "partial" : "missing";
            return { type: f.type, status, tier: FILE_TIER[f.type] };
          })
        : [],
    [result]
  );

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

  const handleFileSelect = (fileType: string) => {
    const file = result?.files.find((f) => f.type === fileType);
    if (file) setActiveFile(file);
  };

  const scannedUrl = result?.origin ?? rawUrl;
  const showMissingState =
    activeFile && !activeFile.found && !activeFile.content;

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
        <ResultsSkeleton />
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
        <UrlBadge url={scannedUrl} />
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
        {/* Nav rail */}
        <IconSidebar />

        {/* Main content area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Tab bar with tier strip */}
          <FileTabBar
            files={allTabs}
            activeFileType={activeFile?.type}
            onFileSelect={handleFileSelect}
            tierCounts={tierCounts}
          />

          {/* Content body */}
          {showMissingState ? (
            <MissingFileState
              file={{ name: activeFile.type }}
              description={FILE_DESCRIPTIONS[activeFile.type]}
              onGenerate={() => handleGenerate(activeFile.type)}
              isGenerating={inProgressFiles.has(activeFile.type)}
            />
          ) : (
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              {/* Code preview */}
              <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <CodePreview
                  content={activeFile?.content ?? ""}
                  lineCount={activeFile?.content?.split("\n").length ?? 0}
                />
              </div>

              {/* Right panel */}
              {activeFile && (
                <ResultsRightPanel
                  file={toPanelFileResult(activeFile)}
                  checklist={activeFile.checklist}
                  onGenerate={() => handleGenerate(activeFile.type)}
                  onDownload={() => handleDownload(activeFile)}
                  onRegenerate={() => handleGenerate(activeFile.type)}
                  isGenerating={inProgressFiles.has(activeFile.type)}
                  allFiles={result.files.map((f) => toPanelFileResult(f))}
                />
              )}
            </div>
          )}
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
