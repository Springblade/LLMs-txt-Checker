"use client";

import { useState, useRef } from "react";
import type { ValidationResult, ErrorCode, FileType } from "@/lib/types";
import type { AnalyzeResult } from "@/lib/ai-discovery-scanner";
import { ALL_FILE_TYPES } from "@/lib/types";

interface ValidatorFormProps {
  onAnalyzeResult: (result: AnalyzeResult) => void;
  onValidateResult: (result: ValidationResult, label: string) => void;
  defaultMode?: "analyze" | "text";
}

type InputMode = "analyze" | "text";

const FILE_TYPE_LABELS: Record<FileType, string> = {
  "llms.txt": "llms.txt — Main AI discovery file",
  "llm.txt": "llm.txt — Redirect compatibility",
  "ai.txt": "ai.txt — AI permissions & restrictions",
  "faq-ai.txt": "faq-ai.txt — Q&A for AI",
  "brand.txt": "brand.txt — Brand naming rules",
  "developer-ai.txt": "developer-ai.txt — Technical context",
  "llms.html": "llms.html — HTML with Schema.org",
  "robots-ai.txt": "robots-ai.txt — AI directives for robots.txt",
  "identity.json": "identity.json — Structured identity (JSON)",
  "ai.json": "ai.json — Machine-readable AI guidance",
};

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

type FetchResult =
  | { ok: true; data: ValidationResult }
  | { ok: false; message: string; errorCode: ErrorCode };

async function handleApiResponse(res: Response): Promise<FetchResult> {
  if (!res.ok) {
    const errorCodes: Partial<Record<number, ErrorCode>> = {
      401: "access_denied",
      403: "access_denied",
      404: "not_found",
      500: "server_error",
      502: "server_error",
      503: "server_error",
    };
    const errorCode: ErrorCode = errorCodes[res.status] ?? "http_error";
    return {
      ok: false,
      message:
        res.status === 401 || res.status === 403
          ? "Access denied — this URL requires authentication"
          : res.status === 404
            ? "llms.txt file not found at this URL"
            : res.status >= 500
              ? "Server error — please try again later"
              : `HTTP error ${res.status}`,
      errorCode,
    };
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {
      ok: false,
      message: "Unexpected server response (expected JSON). Please try again.",
      errorCode: "invalid_response",
    };
  }

  try {
    const data: ValidationResult = await res.json();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      message: "Failed to parse server response. Please try again.",
      errorCode: "invalid_response",
    };
  }
}

export default function ValidatorForm({
  onAnalyzeResult,
  onValidateResult,
  defaultMode,
}: ValidatorFormProps) {
  const [url, setUrl] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>(defaultMode ?? "analyze");
  const [textContent, setTextContent] = useState("");
  const [selectedFileType, setSelectedFileType] = useState<FileType>("llms.txt");
  const [textError, setTextError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleAnalyzeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError("");

    if (!url.trim()) {
      setInputError("Please enter a URL");
      return;
    }

    if (!isValidUrl(url.trim())) {
      setInputError("URL must start with http:// or https:// and be valid");
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Server error" }));
        setInputError(err.error ?? "Server error. Please try again.");
        return;
      }

      const data: AnalyzeResult = await res.json();
      onAnalyzeResult(data);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setInputError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTextError("");

    if (!textContent.trim()) {
      setTextError("Please paste some content to validate");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/validate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textContent,
          fileType: selectedFileType,
        }),
      });

      const result = await handleApiResponse(res);
      if (!result.ok) {
        onValidateResult(
          {
            found: false,
            message: result.message,
            errorCode: result.errorCode,
            errors: [],
            warnings: [],
          },
          selectedFileType
        );
        return;
      }
      onValidateResult(result.data, selectedFileType);
    } catch {
      onValidateResult(
        {
          found: false,
          message: "Connection error. Please try again.",
          errorCode: "connection_error" as ErrorCode,
          errors: [],
          warnings: [],
        },
        selectedFileType
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit =
    inputMode === "analyze" ? handleAnalyzeSubmit : handleTextSubmit;

  return (
    <div
      className="card-float"
      style={{ borderRadius: "var(--radius)" }}
    >
      {/* ── Mode tabs — cream background ─────────────────────────────── */}
      <div
        className="flex"
        style={{
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-secondary)",
        }}
      >
        <button
          type="button"
          onClick={() => setInputMode("analyze")}
          className={`px-5 py-3 text-sm font-medium transition-all duration-150 tab-underline ${
            inputMode === "analyze" ? "active" : ""
          }`}
          style={
            inputMode === "analyze"
              ? { color: "var(--color-text)" }
              : { color: "var(--color-text-secondary)" }
          }
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Analyze
          </span>
        </button>
        <button
          type="button"
          onClick={() => setInputMode("text")}
          className={`px-5 py-3 text-sm font-medium transition-all duration-150 tab-underline ${
            inputMode === "text" ? "active" : ""
          }`}
          style={
            inputMode === "text"
              ? { color: "var(--color-text)" }
              : { color: "var(--color-text-secondary)" }
          }
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Validate Text
          </span>
        </button>
      </div>

      {/* ── Analyze tab ────────────────────────────────────────────── */}
      {inputMode === "analyze" && (
        <form onSubmit={handleSubmit} className="p-6">
          <label
            htmlFor="url-input"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text)" }}
          >
            Website URL
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (inputError) setInputError("");
                }}
                placeholder="https://example.com"
                required
                className={`w-full px-4 py-3 text-sm input-focus-ring placeholder-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] ${
                  inputError
                    ? "border-[var(--color-error)]"
                    : "border-[var(--color-border)]"
                }`}
                style={{
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderRadius: "var(--radius)",
                  color: "var(--color-text)",
                  backgroundColor: "var(--color-bg-secondary)",
                }}
              />
              {inputError && (
                <p
                  className="mt-1.5 text-xs"
                  style={{ color: "var(--color-error)" }}
                >
                  {inputError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-dark px-6 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap btn-primary"
              style={{
                borderRadius: "var(--radius)",
                fontWeight: 400,
              }}
            >
              {isLoading ? (
                <>
                  {/* Mistral Orange spinner */}
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="var(--color-primary)"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Analyze URL
                </>
              )}
            </button>
          </div>
          <p
            className="mt-3 text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            Scans all 10 AI Discovery Files, validates each one, and checks
            consistency across files.
          </p>
        </form>
      )}

      {/* ── Validate Text tab ───────────────────────────────────────── */}
      {inputMode === "text" && (
        <form
          onSubmit={handleSubmit}
          className="p-6 flex flex-col gap-5"
        >
          {/* File type selector */}
          <div>
            <label
              htmlFor="file-type-select"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text)" }}
            >
              File Type
            </label>
            <select
              id="file-type-select"
              value={selectedFileType}
              onChange={(e) =>
                setSelectedFileType(e.target.value as FileType)
              }
              className="w-full px-4 py-3 text-sm input-focus-ring bg-[var(--color-bg-secondary)]"
              style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius)",
                color: "var(--color-text)",
              }}
            >
              {ALL_FILE_TYPES.map((ft) => (
                <option key={ft} value={ft}>
                  {FILE_TYPE_LABELS[ft]}
                </option>
              ))}
            </select>
            <p
              className="mt-1.5 text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Select the type of file you are pasting below.
            </p>
          </div>

          {/* Content textarea */}
          <div>
            <label
              htmlFor="content-textarea"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text)" }}
            >
              File Content
            </label>
            <textarea
              id="content-textarea"
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                if (textError) setTextError("");
              }}
              placeholder={
                selectedFileType === "identity.json" ||
                selectedFileType === "ai.json"
                  ? '{\n  "name": "...",\n  "url": "..."\n}'
                  : selectedFileType === "llms.html"
                    ? "<html>...</html>"
                    : "# My Project\n\nA brief description..."
              }
              rows={14}
              className={`w-full px-4 py-3 text-sm input-focus-ring placeholder-[var(--color-text-muted)] font-mono resize-y bg-[var(--color-bg-secondary)] ${
                textError
                  ? "border-[var(--color-error)]"
                  : "border-[var(--color-border)]"
              }`}
              style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderRadius: "var(--radius)",
                color: "var(--color-text)",
                backgroundColor: "var(--color-bg-secondary)",
              }}
            />
            {textError && (
              <p
                className="mt-1.5 text-xs"
                style={{ color: "var(--color-error)" }}
              >
                {textError}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-orange px-6 py-3 text-sm font-medium flex items-center gap-2 self-start btn-primary"
            style={{
              borderRadius: "var(--radius)",
              fontWeight: 400,
            }}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="white"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Validating...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Validate Content
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
