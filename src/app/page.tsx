"use client";

import { useState } from "react";
import Link from "next/link";
import type { ValidationResult } from "@/lib/types";
import type { AnalyzeResult } from "@/lib/ai-discovery-scanner";
import type { GeneratorResult } from "@/lib/generator/types";
import ValidatorForm from "@/components/validator-form";
import ResultsPage from "@/app/results-page";
import AnalyzeResultDetails from "@/components/analyze-result-tabs";
import SiteHeader from "@/components/site-header";
import { GeneratorForm } from "@/components/generator-form";
import GenerateResultPage from "@/app/generate-result-page";

type MainTab = "generate" | "analyze" | "validate-text";

export default function HomePage() {
  const [mainTab, setMainTab] = useState<MainTab>("generate");
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [validateResult, setValidateResult] = useState<{ result: ValidationResult; label: string } | null>(null);
  const [generateResult, setGenerateResult] = useState<GeneratorResult | null>(null);

  const handleGenerateResult = (data: unknown) => {
    setGenerateResult(data as GeneratorResult);
  };

  const handleAnalyzeResult = (result: AnalyzeResult) => {
    setAnalyzeResult(result);
    setValidateResult(null);
  };

  const handleValidateResult = (result: ValidationResult, label: string) => {
    setValidateResult({ result, label });
    setAnalyzeResult(null);
  };

  if (validateResult) {
    return <ResultsPage result={validateResult.result} checkedUrl={validateResult.label} onBack={() => setValidateResult(null)} />;
  }

  if (generateResult) {
    return <GenerateResultPage result={generateResult} onBack={() => setGenerateResult(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <SiteHeader />

      {/* ── Hero Section — Full-width billboard, 96px/80px padding ─────── */}
      {!analyzeResult && (
        <section
          className="relative overflow-hidden hero-section"
          style={{
            backgroundColor: "var(--color-bg)",
            paddingTop: mainTab === "generate" ? "64px" : "96px",
            paddingBottom: mainTab === "generate" ? "48px" : "80px",
          }}
        >
          {/* Warm mesh overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(160deg, transparent 60%, rgba(255, 193, 16, 0.05) 100%)",
            }}
          />

          {/* Heading full-width — billboard scale per design spec */}
          <div className="relative max-w-[1280px] mx-auto px-6">
            <h1
              className="font-display animate-golden-fade"
              style={{
                fontSize: "var(--font-size-hero)",
                color: "var(--color-text)",
                letterSpacing: "-0.025em",
                lineHeight: 1.0,
                marginBottom: mainTab === "generate" ? "1.5rem" : "2rem",
              }}
            >
              {mainTab === "generate"
                ? "Generate llms.txt"
                : "Validate AI Discovery Files"}
            </h1>

            {/* Subtitle — 65ch max, within container */}
            <p
              className="max-w-[65ch] animate-golden-fade"
              style={{
                fontSize: "1.125rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                marginBottom: mainTab === "generate" ? "1.5rem" : "2rem",
                animationDelay: "0.1s",
              }}
            >
              {mainTab === "generate"
                ? "Crawl your website, discover pages, and generate an llms.txt file ready for AI models."
                : "Scan all 10 AI Discovery File formats, validate syntax, check consistency across files, and get actionable insights in seconds."}
            </p>

            {/* Block divider — 4px, full-width */}
            <div
              style={{
                height: "4px",
                width: "100%",
                background: "var(--gradient-block)",
                opacity: 0.5,
              }}
            />
          </div>
        </section>
      )}

      {/* ── Tab Navigation ────────────────────────────────────────────── */}
      {!analyzeResult && !generateResult && (
        <div
          style={{
            backgroundColor: "var(--color-bg)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <button
                type="button"
                onClick={() => setMainTab("generate")}
                className={`px-5 py-3 text-sm font-medium transition-all duration-150 tab-underline ${mainTab === "generate" ? "active" : ""}`}
                style={mainTab === "generate" ? { color: "var(--color-text)" } : { color: "var(--color-text-secondary)" }}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generate
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMainTab("analyze")}
                className={`px-5 py-3 text-sm font-medium transition-all duration-150 tab-underline ${mainTab === "analyze" ? "active" : ""}`}
                style={mainTab === "analyze" ? { color: "var(--color-text)" } : { color: "var(--color-text-secondary)" }}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Analyze
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMainTab("validate-text")}
                className={`px-5 py-3 text-sm font-medium transition-all duration-150 tab-underline ${mainTab === "validate-text" ? "active" : ""}`}
                style={mainTab === "validate-text" ? { color: "var(--color-text)" } : { color: "var(--color-text-secondary)" }}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Validate Text
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form Area — golden elevated card, 56px/64px padding ──────── */}
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          paddingTop: "56px",
          paddingBottom: "64px",
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="form-landing-zone">
            {/* Analyzed URL breadcrumb */}
            {analyzeResult && (
              <div
                className="flex items-center gap-2 text-sm mb-4 animate-golden-fade"
                style={{ padding: "1.25rem 1.5rem 0" }}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "var(--color-text-muted)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span style={{ color: "var(--color-text-secondary)" }}>Analyzed:</span>
                <span className="font-medium truncate" style={{ color: "var(--color-text)" }}>
                  {analyzeResult.origin.replace(/^https?:\/\//, "")}
                </span>
              </div>
            )}
            <div style={{ padding: analyzeResult ? "0 1.5rem 1.5rem" : "0" }}>
              {mainTab === "generate" && !generateResult && <GeneratorForm onGenerated={handleGenerateResult} />}
              {(mainTab === "analyze" || mainTab === "validate-text") && (
                <ValidatorForm
                  onAnalyzeResult={handleAnalyzeResult}
                  onValidateResult={handleValidateResult}
                  defaultMode={mainTab === "validate-text" ? "text" : undefined}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results Area ─────────────────────────────────────────────── */}
      {analyzeResult && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full">
          <AnalyzeResultDetails result={analyzeResult} />
        </div>
      )}

      {/* ── Footer — gradient strip + 2 columns + adequate padding ───────── */}
      <footer className="footer-sunset mt-auto" style={{ paddingTop: "0" }}>
        {/* Gradient separator strip */}
        <div
          style={{
            height: "3px",
            background: "linear-gradient(90deg, transparent 0%, #ffa110 20%, #d4400d 50%, #ffa110 80%, transparent 100%)",
          }}
        />

        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Left: copyright + tagline */}
            <div className="flex flex-col gap-1">
              <div
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                © 2026 Aivify
              </div>
              <div
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Open source under MIT License
              </div>
            </div>

            {/* Right: links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="transition-opacity hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="transition-opacity hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
