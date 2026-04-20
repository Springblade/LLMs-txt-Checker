"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DiscoverResult } from "@/lib/discovery/types";

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

interface SmartFormProps {
  onResult: (result: DiscoverResult) => void;
}

export function SmartForm({ onResult }: SmartFormProps) {
  const [url, setUrl] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const isLoading = loading;

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
      onResult(data as DiscoverResult);
    } catch {
      clearInterval(msgInterval);
      setLoadingMessage("");
      setInputError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "34rem", margin: "0 auto" }}>
      <form onSubmit={handleSubmit} style={{ display: "contents" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="scan-url"
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--mm-text-secondary)",
                marginBottom: "0.375rem",
              }}
            >
              Website URL
            </label>
            <Input
              id="scan-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="https://github.com"
              required
              error={!!inputError}
              aria-describedby={inputError ? "url-error" : undefined}
              aria-invalid={!!inputError}
              style={{ height: "48px" }}
            />
          </div>
          <div style={{ paddingTop: "1.5rem" }}>
            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              leftIcon={
                !isLoading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : undefined
              }
              size="lg"
            >
              Scan
            </Button>
          </div>
        </div>

        {inputError && (
          <p
            id="url-error"
            style={{
              fontSize: "0.75rem",
              color: "var(--mm-error)",
              marginTop: "0.25rem",
            }}
            role="alert"
          >
            {inputError}
          </p>
        )}
      </form>

      {/* Progress indicator */}
      {isLoading && loadingMessage && (
        <div
          role="status"
          aria-live="polite"
          aria-label={loadingMessage}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
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
          <span style={{ fontSize: "0.875rem", color: "var(--mm-text-secondary)" }}>
            {loadingMessage}
          </span>
        </div>
      )}
    </div>
  );
}
