"use client";

import type { FileDescription } from "@/lib/file-descriptions";

interface MissingFileStateProps {
  file: { name: string };
  description: FileDescription;
  onGenerate: () => void;
  isGenerating: boolean;
}

function FileIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function IconWhat() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconWhy() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconConsequence() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  body: string;
  bg: string;
  border: string;
  iconColor: string;
  labelColor: string;
}

function InfoCard({ icon, label, body, bg, border, iconColor, labelColor }: InfoCardProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 400,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <span style={{ color: iconColor, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: labelColor,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--mm-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

export function MissingFileState({
  file,
  description,
  onGenerate,
  isGenerating,
}: MissingFileStateProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "40px 24px",
        overflowY: "auto",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ef4444",
        }}
      >
        <FileIcon />
      </div>

      {/* Title + question */}
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#e4e4e7",
            marginBottom: 4,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {file.name} not found
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#71717a",
            fontStyle: "italic",
          }}
        >
          &ldquo;{description.question}&rdquo;
        </div>
      </div>

      {/* Three info cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", alignItems: "center" }}>
        <InfoCard
          icon={<IconWhat />}
          label="What is this?"
          body={description.what}
          bg="var(--mm-card-what-bg)"
          border="var(--mm-card-what-border)"
          iconColor="var(--mm-card-what-icon)"
          labelColor="var(--mm-card-what-label)"
        />
        <InfoCard
          icon={<IconWhy />}
          label="Why does it matter?"
          body={description.why}
          bg="var(--mm-card-why-bg)"
          border="var(--mm-card-why-border)"
          iconColor="var(--mm-card-why-icon)"
          labelColor="var(--mm-card-why-label)"
        />
        <InfoCard
          icon={<IconConsequence />}
          label="What happens without it?"
          body={description.consequence}
          bg="var(--mm-card-consequence-bg)"
          border="var(--mm-card-consequence-border)"
          iconColor="var(--mm-card-consequence-icon)"
          labelColor="var(--mm-card-consequence-label)"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "10px 20px",
          width: "100%",
          maxWidth: 320,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          color: "#fff",
          background: isGenerating ? "#6366f1" : "#818cf8",
          border: "none",
          borderRadius: 8,
          cursor: isGenerating ? "wait" : "pointer",
          transition: "background 0.15s ease",
        }}
      >
        {isGenerating ? <SpinnerIcon /> : <SparkleIcon />}
        {isGenerating ? "Generating..." : "Generate with AI"}
      </button>
    </div>
  );
}
