"use client";

import Link from "next/link";
import type { ValidationResult } from "@/lib/types";
import { ResultSidebar } from "@/components/result-sidebar";
import ResultTabs from "@/components/result-tabs";
import { QuickSuggestions } from "@/components/quick-suggestions";

interface ResultsPageProps {
  result: ValidationResult;
  checkedUrl: string;
  onBack: () => void;
}

// GitHub icon component
function GitHubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// Breadcrumb link component
function BreadcrumbLink({ url }: { url: string }) {
  const displayUrl = url.length > 50 ? url.substring(0, 50) + "..." : url;

  return (
    <div className="flex items-center gap-2 text-sm">
      <svg
        className="w-4 h-4 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
      <span className="text-slate-500">Analyzed:</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-primary)] hover:underline font-medium truncate max-w-[300px]"
        title={url}
      >
        {displayUrl}
      </a>
    </div>
  );
}

export default function ResultsPage({ result, checkedUrl, onBack }: ResultsPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo + breadcrumb */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight hidden sm:block">
                LLMs.txt Checker
              </span>
            </Link>

            {/* Breadcrumb separator */}
            <span className="text-slate-300 hidden sm:block">/</span>

            {/* URL breadcrumb */}
            <BreadcrumbLink url={checkedUrl} />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Back button */}
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Open Source badge */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Open Source
            </span>

            {/* GitHub button */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="GitHub"
            >
              <GitHubIcon />
            </a>
          </div>
        </div>
      </header>

      {/* Main content area - three-column layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] xl:grid-cols-[260px_1fr_260px]">
        {/* Left sidebar - ResultSidebar */}
        {result.healthScore && (
          <div className="hidden lg:block">
            <ResultSidebar healthScore={result.healthScore} />
          </div>
        )}

        {/* Center content - ResultTabs */}
        <div className="min-w-0 p-4 sm:p-6">
          <ResultTabs result={result} />
        </div>

        {/* Right sidebar - QuickSuggestions */}
        <div className="hidden lg:block">
          {result.suggestions && result.suggestions.length > 0 && (
            <QuickSuggestions suggestions={result.suggestions} />
          )}
        </div>
      </main>

      {/* Mobile sidebar collapse */}
      <div className="lg:hidden border-t border-slate-200 bg-white">
        <details className="group">
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
            <span className="text-sm font-medium text-slate-700">
              {result.healthScore ? `Health Score: ${result.healthScore.score}/100` : "View Stats"}
            </span>
            <svg
              className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180"
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
          </summary>
          <div className="border-t border-slate-100">
            {result.healthScore && (
              <div className="p-4">
                <ResultSidebar healthScore={result.healthScore} />
              </div>
            )}
          </div>
        </details>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left copyright */}
            <div className="text-sm text-slate-500 order-2 sm:order-1">
              © 2026 LLMs.txt Checker. Open source under MIT License.
            </div>

            {/* Center links */}
            <div className="flex items-center gap-5 text-sm order-1 sm:order-2">
              <Link
                href="/privacy"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-slate-500 hover:text-slate-700 transition-colors"
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
