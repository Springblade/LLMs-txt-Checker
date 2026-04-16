"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GeneratorResultTabs from "@/components/generator-result-tabs";
import type { GeneratorResult } from "@/lib/generator";

export default function GeneratorResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`generator-result-${id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.success) {
          setResult(parsed);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-zinc-900 tracking-tight">LLMs.txt Generator</span>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Results not found</h1>
            <p className="text-muted-foreground mb-6">
              The generation results have expired or do not exist.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-zinc-900 tracking-tight">LLMs.txt Generator</span>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-zinc-900 tracking-tight">LLMs.txt Generator</span>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Generated llms.txt</h1>
          <p className="text-muted-foreground">
            {result.pagesCrawled} of {result.pagesFound} pages crawled
          </p>
        </div>

        <GeneratorResultTabs result={result} />

        {result.errors.length > 0 && (
          <div className="mt-6 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <h3 className="font-medium mb-2 text-yellow-600 dark:text-yellow-400">Warnings</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {result.errors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
