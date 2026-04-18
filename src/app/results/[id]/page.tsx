"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GeneratorResultTabs from "@/components/generator-result-tabs";
import type { GeneratorResult } from "@/lib/generator";
import ResultShell from "@/components/result-shell";

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
      <ResultShell title="LLMs.txt Generator" showBackButton onBack={() => window.history.back()}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>Results not found</h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            The generation results have expired or do not exist.
          </p>
        </div>
      </ResultShell>
    );
  }

  if (!result) {
    return (
      <ResultShell title="LLMs.txt Generator" showBackButton onBack={() => window.history.back()}>
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" role="status" aria-label="Loading..." />
        </div>
      </ResultShell>
    );
  }

  return (
    <ResultShell title="LLMs.txt Generator" showBackButton onBack={() => window.history.back()}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>Generated llms.txt</h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          {result.pagesCrawled} of {result.pagesFound} pages crawled
        </p>
      </div>

      <GeneratorResultTabs result={result} />

      {result.errors.length > 0 && (
        <div className="mt-6 p-4 rounded-lg border impact-box-warnings">
          <h3 className="font-medium mb-2 flex items-center gap-2">Warnings</h3>
          <ul className="text-sm space-y-1">
            {result.errors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        </div>
      )}
    </ResultShell>
  );
}
