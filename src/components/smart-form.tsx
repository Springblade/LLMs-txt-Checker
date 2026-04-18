"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LoadingState } from "@/lib/check-and-fix/types";

const PROGRESS_STEPS = ["checking", "generating", "validating"] as const;
type ProgressStep = (typeof PROGRESS_STEPS)[number];

const LOADING_MESSAGES: Record<ProgressStep, string> = {
  checking: "Checking llms.txt file...",
  generating: "Generating llms.txt from your website...",
  validating: "Validating content quality...",
};

function getProgressIndex(phase: string): number {
  return PROGRESS_STEPS.indexOf(phase as ProgressStep);
}

function isValidUrl(input: string): boolean {
  if (!input.startsWith("http://") && !input.startsWith("https://")) {
    return false;
  }
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

export function SmartForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ phase: "idle" });

  const isLoading = loading.phase !== "idle" && loading.phase !== "error";
  const progressIndex = getProgressIndex(loading.phase);
  const currentMessage =
    loading.phase === "checking" ||
    loading.phase === "generating" ||
    loading.phase === "validating"
      ? LOADING_MESSAGES[loading.phase]
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setInputError("Please enter a URL");
      return;
    }

    if (!isValidUrl(trimmed)) {
      setInputError(
        "URL must start with http:// or https:// and be a valid URL"
      );
      return;
    }

    setLoading({ phase: "checking", message: LOADING_MESSAGES.checking });

    try {
      const res = await fetch("/api/check-and-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!data.success) {
        setLoading({
          phase: "error",
          errorCode: data.errorCode,
          message: data.message,
        });
        return;
      }

      sessionStorage.setItem("check-and-fix-result", JSON.stringify(data));
      router.push("/check-and-fix-result");
    } catch {
      setLoading({
        phase: "error",
        errorCode: "NETWORK_ERROR",
        message:
          "Network error. Please check your connection and try again.",
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "42rem" }}>
      <form onSubmit={handleSubmit} style={{ display: "contents" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <Input
              id="smart-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="https://example.com"
              required
              error={!!inputError}
              aria-describedby={inputError ? "url-error" : undefined}
              aria-invalid={!!inputError}
              style={{ height: "48px" }}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            leftIcon={
              !isLoading ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ) : undefined
            }
            size="lg"
          >
            Generate
          </Button>
        </div>

        {inputError && (
          <p
            id="url-error"
            style={{
              fontSize: "0.75rem",
              color: "var(--color-error)",
              marginTop: "0.25rem",
            }}
            role="alert"
          >
            {inputError}
          </p>
        )}
      </form>

      {/* Progress indicator */}
      {isLoading && currentMessage && (
        <div
          role="status"
          aria-live="polite"
          aria-label={currentMessage}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {/* Step labels */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {PROGRESS_STEPS.map((step, i) => {
              const isDone = i < progressIndex;
              const isCurrent = i === progressIndex;
              return (
                <span
                  key={step}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.75rem",
                    fontWeight: isCurrent ? 600 : 400,
                    color: isDone
                      ? "var(--color-success)"
                      : isCurrent
                        ? "var(--color-text)"
                        : "var(--color-text-muted)",
                    letterSpacing: "0.03em",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: isDone
                        ? "var(--color-success)"
                        : isCurrent
                          ? "var(--color-primary)"
                          : "var(--color-border)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  {step === "checking"
                    ? "Check"
                    : step === "generating"
                      ? "Generate"
                      : "Validate"}
                </span>
              );
            })}
          </div>

          {/* Current step message */}
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              margin: 0,
            }}
          >
            {currentMessage}
          </p>
        </div>
      )}

      {/* Error state */}
      {loading.phase === "error" && (
        <div
          role="alert"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            padding: "1rem",
            backgroundColor: "rgba(231, 76, 60, 0.1)",
            border: "1px solid rgba(231, 76, 60, 0.3)",
            borderLeft: "3px solid var(--color-error)",
            borderRadius: "var(--radius)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-error)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-error)",
              }}
            >
              {loading.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLoading({ phase: "idle" })}
            style={{
              alignSelf: "flex-start",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--color-primary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            Try another URL
          </button>
        </div>
      )}
    </div>
  );
}
