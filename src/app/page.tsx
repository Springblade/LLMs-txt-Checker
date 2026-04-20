"use client";

import { useState } from "react";
import { SmartForm } from "@/components/smart-form";
import SiteHeader from "@/components/site-header";
import AppFooter from "@/components/app-footer";
import { ResultSection } from "@/components/result-section";
import type { DiscoverResult, FileType, FileGenerateResult } from "@/lib/discovery/types";

export default function HomePage() {
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [generatingFiles, setGeneratingFiles] = useState<Map<FileType, FileGenerateResult>>(new Map());
  const [inProgressFiles, setInProgressFiles] = useState<Set<FileType>>(new Set());

  const handleResult = (r: DiscoverResult) => {
    setResult(r);
  };

  const handleGenerate = async (fileType: FileType) => {
    if (!result) return;

    // Add to in-progress set so spinner shows immediately
    setInProgressFiles((prev) => new Set([...prev, fileType]));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: result.origin, fileType }),
      });

      if (res.ok) {
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
          }
          return next;
        });
      }
    } finally {
      // Remove from in-progress set
      setInProgressFiles((prev) => {
        const next = new Set(prev);
        next.delete(fileType);
        return next;
      });
    }
  };

  const handleGenerateAll = async () => {
    if (!result) return;

    const missingFileTypes = result.missingFiles;

    // Add all to in-progress set so spinners show immediately
    setInProgressFiles(new Set(missingFileTypes));

    try {
      const nextMap = new Map<FileType, FileGenerateResult>();

      for (const fileType of missingFileTypes) {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: result.origin, fileType }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.content) {
            nextMap.set(fileType, {
              type: fileType,
              success: true,
              content: data.content,
              errors: data.errors ?? [],
              warnings: data.warnings ?? [],
              checklist: data.checklist ?? [],
            });
          } else if (data.error) {
            nextMap.set(fileType, {
              type: fileType,
              success: false,
              content: "",
              errors: data.errors ?? [{ rule: "generation_failed", message: data.error }],
              warnings: data.warnings ?? [],
              checklist: data.checklist ?? [],
            });
          }
        }
      }
      setGeneratingFiles(new Map(nextMap));
    } finally {
      setInProgressFiles(new Set());
    }
  };

  const handleReset = () => {
    setResult(null);
    setGeneratingFiles(new Map());
    setInProgressFiles(new Set());
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      <SiteHeader onLogoClick={() => { handleReset(); window.scrollTo({ top: 0, behavior: "smooth" }); }} />

      {/* Hero + Form */}
      <section
        style={{
          backgroundColor: "#ffffff",
          paddingTop: "5rem",
          paddingBottom: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
        >
          {/* Hero content — centered */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {/* Label */}
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#8e8e93",
                marginBottom: "0.375rem",
              }}
            >
              FOR AI AGENTS
            </span>

            {/* Headline */}
            <h1
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: "clamp(2.5rem, 8vw, 5rem)",
                fontWeight: 500,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "#222222",
                marginBottom: "0.625rem",
              }}
            >
              Free AI Discovery Scanner
            </h1>

            {/* Subtext */}
            <p
              style={{
                fontSize: "1.125rem",
                color: "#45515e",
                lineHeight: 1.6,
                maxWidth: "44ch",
                marginBottom: 0,
              }}
            >
              Check any website for AI-ready files. Missing? We generate them for you automatically.
            </p>
          </div>

          {/* Form Card */}
          <div
            style={{
              marginTop: "1.25rem",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "1.25rem",
              maxWidth: "38rem",
              marginLeft: "auto",
              marginRight: "auto",
              boxShadow: "0 0 15px rgba(44,30,116,0.16)",
            }}
          >
            <SmartForm onResult={handleResult} />
          </div>
        </div>
      </section>

      {/* Inline Results */}
      {result && (
        <section
          style={{
            backgroundColor: "#ffffff",
            paddingBottom: "4rem",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              marginLeft: "auto",
              marginRight: "auto",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
            }}
          >
            <ResultSection
              result={result}
              generatingFiles={generatingFiles}
              inProgressFiles={inProgressFiles}
              onGenerate={handleGenerate}
              onGenerateAll={handleGenerateAll}
              onReset={handleReset}
            />
          </div>
        </section>
      )}

      <AppFooter />
    </div>
  );
}
