"use client";

import { tierInfo, type Tier } from "@/lib/design-tokens";

const fileTypes: Array<{ name: string; tier: Tier; desc: string }> = [
  { name: "llms.txt", tier: "essential", desc: "Primary machine-readable site map for AI agents. Lists all public pages with descriptions." },
  { name: "ai.txt", tier: "essential", desc: "Authoritative AI discovery file. Can include brand guidelines and content policies." },
  { name: "faq-ai.txt", tier: "recommended", desc: "Structured Q&A pairs that train AI to answer common questions about your product." },
  { name: "brand.txt", tier: "recommended", desc: "Brand voice, tone, and messaging guidelines for consistent AI-generated content." },
  { name: "identity.json", tier: "recommended", desc: "Structured identity data for verifying your organization and content authenticity." },
  { name: "ai.json", tier: "recommended", desc: "Comprehensive AI configuration file with metadata, endpoints, and policies." },
  { name: "llm.txt", tier: "complete", desc: "Alternative format gaining traction. Mirrors llms.txt purpose with slightly different syntax." },
  { name: "developer-ai.txt", tier: "complete", desc: "Technical documentation for AI agents that need to integrate with your APIs." },
  { name: "llms.html", tier: "complete", desc: "HTML alternative for llms.txt with richer formatting and metadata support." },
  { name: "robots-ai.txt", tier: "complete", desc: "AI-specific crawl directives extending standard robots.txt behavior." },
];

const groupedFiles = {
  essential: fileTypes.filter((f) => f.tier === "essential"),
  recommended: fileTypes.filter((f) => f.tier === "recommended"),
  complete: fileTypes.filter((f) => f.tier === "complete"),
};

interface FileCardProps {
  file: (typeof fileTypes)[number];
  delay: number;
}

function FileCard({ file, delay }: FileCardProps) {
  return (
    <div
      className="card-stagger"
      style={{
        padding: 24,
        background: "var(--mm-bg-secondary)",
        border: "1px solid var(--mm-border)",
        borderRadius: 12,
        transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
        animationDelay: `${delay}s`,
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--mm-brand)";
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 4px 20px rgba(20,86,240,0.1)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "var(--mm-border)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "var(--mm-text)",
          marginBottom: 8,
          fontFeatureSettings: '"liga" 1',
        }}
      >
        {file.name}
      </div>
      <p
        style={{
          color: "var(--mm-text-muted)",
          fontSize: "0.8125rem",
          lineHeight: 1.5,
        }}
      >
        {file.desc}
      </p>
    </div>
  );
}

export function FileShowcaseSection() {
  return (
    <section
      id="files"
      style={{
        padding: "80px 24px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        className="mm-fade-in"
        style={{
          textAlign: "center",
          marginBottom: 48,
          animationDelay: "0.8s",
        }}
      >
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            fontWeight: 600,
            marginBottom: "1rem",
            color: "var(--mm-text)",
          }}
        >
          AI discovery file types
        </h2>
        <p
          style={{
            color: "var(--mm-text-muted)",
            fontSize: "1rem",
            maxWidth: "36ch",
            margin: "0 auto",
          }}
        >
          Ten standardized file formats that help AI agents understand and
          navigate your site.
        </p>
      </div>

      {/* Groups */}
      {(Object.entries(groupedFiles) as [Tier, typeof fileTypes][]).map(
        ([tier, files]) => {
          const info = tierInfo[tier];
          return (
            <div key={tier} style={{ marginBottom: 48 }}>
              {/* Tier header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: info.color,
                    boxShadow: `0 0 8px ${info.color}`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: info.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {info.label}
                </span>
              </div>
              <p
                style={{
                  color: "var(--mm-text-muted)",
                  fontSize: "0.8125rem",
                  marginBottom: 16,
                  marginLeft: 20,
                }}
              >
                {info.description}
              </p>

              {/* File grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {files.map((file, idx) => (
                  <FileCard
                    key={file.name}
                    file={file}
                    delay={1 + idx * 0.08}
                  />
                ))}
              </div>
            </div>
          );
        }
      )}
    </section>
  );
}
