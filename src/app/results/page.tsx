"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DiscoverResult, FileType, FileGenerateResult, QuotaError } from "@/lib/discovery/types";
import { FILE_TIER } from "@/lib/discovery/types";
import type { Tier } from "@/lib/design-tokens";
import { ResultsHeader } from "@/components/landing/results-header";
import { ScoreSection } from "@/components/landing/score-section";
import { TabFilter } from "@/components/landing/tab-filter";
import { FileCardDetail } from "@/components/landing/file-card-detail";
import { BulkActionsBar } from "@/components/landing/bulk-actions-bar";
import { ResultsSkeleton } from "@/components/landing/results-skeleton";

function computeScore(result: DiscoverResult): number {
  const total = result.files.length;
  if (total === 0) return 0;
  const found = result.files.filter((f) => f.found).length;
  return Math.round((found / total) * 100);
}

function computeTierLabel(score: number): { label: string; color: string; description: string } {
  if (score >= 86)
    return { label: "Excellent", color: "#22c55e", description: "Your site has excellent AI discovery coverage." };
  if (score >= 61)
    return { label: "Good", color: "#1456f0", description: "Your site has good AI discovery coverage. A few improvements recommended." };
  if (score >= 31)
    return { label: "Fair", color: "#eab308", description: "Your site has basic AI discovery coverage. Adding essential missing files would significantly improve AI agent understanding." };
  return { label: "Poor", color: "#ef4444", description: "Your site lacks most AI discovery files. Start by adding the essential files." };
}

const TIER_MAP: Record<string, Tier> = {
  essential: "essential",
  recommended: "recommended",
  complete: "optional",
};

function ResultsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url") ?? "";

  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setGeneratingFiles] = useState<Map<FileType, FileGenerateResult>>(new Map());
  const [inProgressFiles, setInProgressFiles] = useState<Set<FileType>>(new Set());
  const [, setQuotaError] = useState<QuotaError | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

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

  useEffect(() => {
    if (!result) return;
    setSelectedFiles(new Set(result.missingFiles));
  }, [result]);

  const handleGenerate = async (fileType: FileType) => {
    if (!result) return;
    setInProgressFiles((prev) => new Set([...prev, fileType]));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: result.origin, fileType }),
      });
      const data = await res.json();
      setGeneratingFiles((prev) => {
        const next = new Map(prev);
        if (data.success && data.content) {
          next.set(fileType, {
            type: fileType,
            success: true,
            content: data.content,
            errors: data.errors ?? [],
            warnings: data.warnings ?? [],
            checklist: data.checklist ?? [],
          });
        } else if (data.error) {
          next.set(fileType, {
            type: fileType,
            success: false,
            content: "",
            errors: data.errors ?? [{ rule: "generation_failed", message: data.error }],
            warnings: data.warnings ?? [],
            checklist: data.checklist ?? [],
          });
          if (data.errorCode === "QUOTA_EXHAUSTED" || data.errorCode === "RATE_LIMITED") {
            setQuotaError({
              errorCode: data.errorCode,
              message: data.error,
              suggestions: data.suggestions ?? [],
            });
          }
        }
        return next;
      });
    } catch {
      setGeneratingFiles((prev) => {
        const next = new Map(prev);
        next.set(fileType, {
          type: fileType,
          success: false,
          content: "",
          errors: [{ rule: "network_error", message: "Network error." }],
          warnings: [],
          checklist: [],
        });
        return next;
      });
    } finally {
      setInProgressFiles((prev) => {
        const next = new Set(prev);
        next.delete(fileType);
        return next;
      });
    }
  };

  const handleToggle = (name: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSelectAllMissing = () => {
    if (!result) return;
    setSelectedFiles(new Set(result.missingFiles));
  };

  const handleClearAll = () => setSelectedFiles(new Set());

  const handleGenerateAll = async () => {
    if (!result) return;
    const toGenerate = result.missingFiles.filter((f) => selectedFiles.has(f));
    if (toGenerate.length === 0) return;

    setIsGeneratingAll(true);
    setInProgressFiles(new Set(toGenerate));

    const nextMap = new Map<FileType, FileGenerateResult>();

    for (const ft of toGenerate) {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: result.origin, fileType: ft }),
        });
        const data = await res.json();
        if (data.success && data.content) {
          nextMap.set(ft, {
            type: ft,
            success: true,
            content: data.content,
            errors: data.errors ?? [],
            warnings: data.warnings ?? [],
            checklist: data.checklist ?? [],
          });
        } else if (data.error) {
          nextMap.set(ft, {
            type: ft,
            success: false,
            content: "",
            errors: data.errors ?? [{ rule: "generation_failed", message: data.error }],
            warnings: data.warnings ?? [],
            checklist: data.checklist ?? [],
          });
          if (data.errorCode === "QUOTA_EXHAUSTED" || data.errorCode === "RATE_LIMITED") {
            setQuotaError({
              errorCode: data.errorCode,
              message: data.error,
              suggestions: data.suggestions ?? [],
            });
          }
        }
      } catch {
        nextMap.set(ft, {
          type: ft,
          success: false,
          content: "",
          errors: [{ rule: "network_error", message: "Network error." }],
          warnings: [],
          checklist: [],
        });
      }
    }

    setGeneratingFiles((prev) => new Map([...prev, ...nextMap]));
    setInProgressFiles(new Set());
    setIsGeneratingAll(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--mm-bg)" }}>
        <ResultsHeader url={rawUrl} />
        <ResultsSkeleton />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--mm-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: 48 }}>
          <p style={{ color: "var(--mm-error)", marginBottom: 16 }}>{error ?? "Something went wrong."}</p>
          <a href="/" style={{ color: "var(--mm-brand)" }}>Go back home</a>
        </div>
      </div>
    );
  }

  const score = computeScore(result);
  const tierInfo = computeTierLabel(score);
  const foundCount = result.files.filter((f) => f.found).length;
  const missingCount = result.files.filter((f) => !f.found).length;

  const counts = {
    all: result.files.length,
    essential: result.files.filter((f) => FILE_TIER[f.type] === "essential").length,
    recommended: result.files.filter((f) => FILE_TIER[f.type] === "recommended").length,
    optional: result.files.filter((f) => FILE_TIER[f.type] === "complete").length,
  };

  const filteredFiles =
    activeTab === "all"
      ? result.files
      : result.files.filter((f) => {
          const ft = FILE_TIER[f.type];
          return ft === activeTab || (activeTab === "optional" && ft === "complete");
        });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--mm-bg)",
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20, 86, 240, 0.08) 0%, transparent 60%)",
      }}
    >
      <ResultsHeader url={rawUrl} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 120px" }}>
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent 0%, var(--mm-border) 20%, var(--mm-border) 80%, transparent 100%)`,
          }}
        />

        <ScoreSection
          score={score}
          tier={tierInfo.label}
          tierColor={tierInfo.color}
          tierDescription={tierInfo.description}
          pagesScanned={0}
          foundCount={foundCount}
          missingCount={missingCount}
          partialCount={0}
        />

        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent 0%, var(--mm-border) 20%, var(--mm-border) 80%, transparent 100%)`,
            marginBottom: 48,
          }}
        />

        {/* Files section */}
        <div style={{ animation: "mm-fade-in 0.6s ease-out 0.3s both" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--mm-text)",
              }}
            >
              Discovery Files
            </h2>
            <TabFilter activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredFiles.map((file, idx) => {
              const status = file.found ? "found" : "missing";
              const tierKey = FILE_TIER[file.type];
              const tier: Tier = TIER_MAP[tierKey] ?? "optional";
              return (
                <FileCardDetail
                  key={file.type}
                  file={{
                    name: file.type,
                    tier,
                    status,
                    lines: file.content ? file.content.split("\n").length : 0,
                    content: file.content || null,
                    checklist: file.checklist,
                  }}
                  isSelected={selectedFiles.has(file.type)}
                  isGenerating={inProgressFiles.has(file.type)}
                  onToggle={handleToggle}
                  onGenerate={handleGenerate}
                  delay={0.1 + idx * 0.06}
                />
              );
            })}
          </div>
        </div>
      </main>

      <BulkActionsBar
        selectedCount={selectedFiles.size}
        totalMissing={missingCount}
        onSelectAll={handleSelectAllMissing}
        onClear={handleClearAll}
        onGenerateAll={handleGenerateAll}
        isGenerating={isGeneratingAll}
      />
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
