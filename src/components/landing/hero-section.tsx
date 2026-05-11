"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LOADING_MESSAGES = [
  "Discovering files...",
  "Validating each file...",
  "Almost done...",
];

function isValidUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

interface HeroSectionProps {
  onNavigate?: (url: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setInputError("Please enter a URL");
      return;
    }

    const withProtocol = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

    if (!isValidUrl(withProtocol)) {
      setInputError("Please enter a valid URL");
      return;
    }

    if (onNavigate) {
      onNavigate(withProtocol);
      return;
    }

    // Inline scan mode (fallback)
    setLoading(true);
    setLoadingMessage("");
    setLoadingMessage(LOADING_MESSAGES[0] ?? "Discovering...");

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[msgIdx] ?? "Discovering...");
    }, 2000);

    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: withProtocol }),
      });

      clearInterval(msgInterval);
      setLoadingMessage("");

      const data = await res.json();
      if (!res.ok || data.error) {
        setInputError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      // Redirect to results page
      window.location.href = `/results?url=${encodeURIComponent(withProtocol)}`;
    } catch {
      clearInterval(msgInterval);
      setLoadingMessage("");
      setInputError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        padding: "100px 24px 120px",
        maxWidth: 720,
        margin: "0 auto",
        textAlign: "center",
        animation: "mm-fade-in 0.6s ease-out",
      }}
    >
      {/* Label */}
      <span
        style={{
          display: "block",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--mm-text-muted)",
          marginBottom: "0.5rem",
        }}
      >
        FOR AI AGENTS
      </span>

      {/* Headline */}
      <h1
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          marginBottom: "1.5rem",
          color: "var(--mm-text)",
        }}
      >
        Make Your Site{" "}
        <span style={{ color: "var(--mm-brand)" }}>AI-Discoverable</span>
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontSize: "1.125rem",
          color: "var(--mm-text-muted)",
          lineHeight: 1.7,
          maxWidth: "44ch",
          margin: "0 auto 2.5rem",
        }}
      >
        AI agents can&apos;t browse your site like humans do. Aivify creates the
        machine-readable files they need to understand, trust, and recommend your content.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 12,
          maxWidth: 520,
          margin: "0 auto",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 280px", minWidth: 0 }}>
          <Input
            id="scan-url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (inputError) setInputError(null);
            }}
            placeholder="https://your-site.com"
            required
            error={!!inputError}
            aria-describedby={inputError ? "url-error" : undefined}
            aria-invalid={!!inputError}
            style={{ height: 52, fontSize: 16 }}
          />
        </div>
        <div style={{ paddingTop: 2 }}>
          <Button type="submit" disabled={loading} loading={loading} size="lg">
            {!loading && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: 6 }}
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            Scan Site
          </Button>
        </div>
      </form>

      {inputError && (
        <p
          id="url-error"
          role="alert"
          style={{
            fontSize: "0.8125rem",
            color: "var(--mm-error)",
            marginTop: "0.75rem",
          }}
        >
          {inputError}
        </p>
      )}

      {/* Loading indicator */}
      {loading && loadingMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "1rem",
            justifyContent: "center",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--mm-brand)"
            strokeWidth="2"
            style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
          >
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          <span style={{ fontSize: "0.875rem", color: "var(--mm-text-muted)" }}>
            {loadingMessage}
          </span>
        </div>
      )}
    </section>
  );
}
