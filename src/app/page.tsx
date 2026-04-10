"use client";

import { useState } from "react";
import Link from "next/link";
import type { ValidationResult } from "@/lib/types";
import ValidatorForm from "@/components/validator-form";
import ResultsPage from "@/app/results-page";

// Feature card data
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Syntax Validation",
    description: "Ensures your llms.txt follows the correct markdown syntax with proper headings, links, and structure.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    title: "Link Health",
    description: "Validates all URLs are accessible and returns proper HTTP status codes.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.135-1.76-.398-2.551l.548-.547z" />
      </svg>
    ),
    title: "AI Readability",
    description: "Checks that LLMs can easily parse and understand your documentation for AI-powered features.",
  },
];

// GitHub icon
function GitHubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// Main page component
export default function HomePage() {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [checkedUrl, setCheckedUrl] = useState("");

  const handleResult = (validationResult: ValidationResult, url: string) => {
    setResult(validationResult);
    setCheckedUrl(url);
  };

  const handleBack = () => {
    setResult(null);
    setCheckedUrl("");
  };

  // If there's a result, show ResultsPage
  if (result) {
    return <ResultsPage result={result} checkedUrl={checkedUrl} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-zinc-900 tracking-tight">LLMs.txt Checker</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Open Source
            </span>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all duration-150"
              aria-label="GitHub"
            >
              <GitHubIcon />
            </a>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-1 bg-[var(--color-bg-secondary)]">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-900 tracking-tight mb-6 animate-slide-up">
              Ensure your site is LLM-ready
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up stagger-1">
              Validate your llms.txt file against the official standard. Check syntax, verify links, and ensure AI models can read your documentation.
            </p>

            {/* URL input form using ValidatorForm component */}
            <div className="w-full max-w-xl mx-auto animate-slide-up stagger-2">
              <ValidatorForm onResult={handleResult} />
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`card-interactive bg-white rounded-lg p-6 border border-[var(--color-border)] animate-slide-up stagger-${index + 1}`}
              >
                <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-600 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Additional info section */}
          <div className="bg-[var(--color-bg-secondary)] rounded-lg p-8 border border-[var(--color-border)] text-center animate-slide-up stagger-4">
            <p className="text-[var(--color-text-secondary)]">
              The llms.txt specification is a proposed standard to help Large Language Models discover and understand your website content.{" "}
              <a
                href="https://llmstxt.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:underline font-medium hover-arrow inline-flex items-center gap-1 group"
              >
                Learn more about the standard
                <svg className="w-4 h-4 arrow-icon transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[var(--color-text-secondary)]">
              © 2026 LLMs.txt Checker. Open source under MIT License.
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-[var(--color-text-secondary)] hover:text-zinc-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[var(--color-text-secondary)] hover:text-zinc-900 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
