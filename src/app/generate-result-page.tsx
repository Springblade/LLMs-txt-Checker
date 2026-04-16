"use client";

import { useState } from "react";
import Link from "next/link";
import type { GeneratorResult } from "@/lib/generator/types";

interface GenerateResultPageProps {
  result: GeneratorResult;
  onBack: () => void;
}

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function AlertIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export default function GenerateResultPage({ result, onBack }: GenerateResultPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (result.content) {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result.content || !result.fileName) return;
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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-secondary)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 hover-scale">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-base font-semibold text-zinc-900 tracking-tight hidden sm:block">
                LLMs.txt Generator
              </span>
            </Link>

            <span className="text-[var(--color-text-muted)] hidden sm:block">/</span>

            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Generated</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all duration-150"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              New
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-[var(--color-border)]">
            <div className="text-2xl font-semibold text-zinc-900">{result.pagesFound}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Pages Found</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[var(--color-border)]">
            <div className="text-2xl font-semibold text-zinc-900">{result.pagesCrawled}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Pages Crawled</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-semibold ${result.validation?.passed ? "text-green-600" : "text-amber-600"}`}>
                {result.validation?.passed ? "Passed" : "Issues"}
              </div>
              {result.validation?.passed ? (
                <span className="text-green-600"><CheckIcon /></span>
              ) : (
                <span className="text-amber-600"><AlertIcon /></span>
              )}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">Validation</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[var(--color-border)]">
            <div className="text-2xl font-semibold text-zinc-900">{result.metadata.siteName ?? "—"}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Site Name</div>
          </div>
        </div>

        {/* Validation issues */}
        {result.validation && !result.validation.passed && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
              <AlertIcon />
              Validation Issues
            </h3>
            <ul className="space-y-1">
              {result.validation.errors.map((err, i) => (
                <li key={i} className="text-sm text-amber-700">
                  <span className="font-medium">{err.rule}:</span> {err.message}
                  {err.line && ` (line ${err.line})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content preview */}
        <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-zinc-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-zinc-700">{result.fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all duration-150"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-md transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>

          {/* Content */}
          <pre className="p-4 text-sm text-zinc-700 overflow-x-auto max-h-[500px] overflow-y-auto font-mono whitespace-pre-wrap">
            {result.content}
          </pre>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-zinc-900 text-zinc-300 rounded-lg p-4 text-sm">
          <h3 className="font-medium text-white mb-2">Next Steps</h3>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Download the generated <code className="text-amber-400">llms.txt</code> file</li>
            <li>Place it at the root of your website: <code className="text-amber-400">https://yoursite.com/llms.txt</code></li>
            <li>Validate your deployment using the Analyze tab above</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
