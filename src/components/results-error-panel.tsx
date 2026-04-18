"use client";

import type { ErrorCode } from "@/lib/types";

interface ResultsErrorPanelProps {
  message?: string;
  errorCode?: ErrorCode;
  checkedUrl: string;
  onRetry: () => void;
}

const ERROR_TITLES: Record<ErrorCode, string> = {
  not_found: "Could not find llms.txt",
  not_llms_txt: "Not a valid llms.txt file",
  access_denied: "Access denied",
  timeout: "Request timed out",
  invalid_response: "Invalid response received",
  server_error: "Server error occurred",
  http_error: "HTTP error",
  connection_error: "Connection failed",
  ssl_error: "SSL certificate error",
  redirect_loop: "Too many redirects",
  dns_error: "DNS resolution failed",
  geo_blocked: "Access blocked",
  unsupported_encoding: "Unsupported character encoding",
};

const DEFAULT_TITLE = "Could not load llms.txt";

function getOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

export function ResultsErrorPanel({
  message,
  errorCode,
  checkedUrl,
  onRetry,
}: ResultsErrorPanelProps) {
  const title = errorCode
    ? ERROR_TITLES[errorCode] ?? DEFAULT_TITLE
    : DEFAULT_TITLE;
  const origin = getOrigin(checkedUrl);
  const expectedUrl = origin + "/llms.txt";

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div
        className="w-full max-w-lg"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-golden-lg)",
          overflow: "hidden",
        }}
      >
        {/* Mistral Block top bar */}
        <div className="mistral-block" />

        {/* Content */}
        <div className="px-8 py-10 flex flex-col items-center text-center gap-6">
          {/* Amber/Orange icon */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius)",
              background:
                "var(--gradient-icon-bg)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              className="w-7 h-7"
              style={{ color: "var(--color-primary)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title + message */}
          <div>
            <h2
              className="font-display"
              style={{
                fontSize: "var(--font-size-h3)",
                color: "var(--color-text)",
                letterSpacing: "-0.01em",
                fontWeight: 400,
              }}
            >
              {title}
            </h2>
            {message && (
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {message}
              </p>
            )}
          </div>

          {/* Expected URL hint */}
          <div
            className="w-full"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              padding: "0.625rem 0.875rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              className="text-xs font-mono truncate"
              style={{ color: "var(--color-text-muted)" }}
              title={expectedUrl}
            >
              {expectedUrl}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full">
            {/* Primary: Mistral dark solid */}
            <button
              onClick={onRetry}
              className="btn-dark w-full min-h-[44px] flex items-center justify-center gap-2 text-sm font-medium btn-primary"
              style={{
                padding: "0.625rem 1rem",
                borderRadius: "var(--radius)",
              }}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Check another URL
            </button>

            {/* Secondary: Cream surface */}
            <a
              href={expectedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cream w-full min-h-[44px] flex items-center justify-center gap-2 text-sm font-medium"
              style={{
                padding: "0.625rem 1rem",
                borderRadius: "var(--radius)",
                color: "var(--color-text)",
              }}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Open expected file
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
