"use client";

import { useState, useRef } from "react";
import type { ValidationResult, ErrorCode } from "@/lib/types";

interface ValidatorFormProps {
  onResult: (result: ValidationResult, checkedUrl: string) => void;
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
      message: res.status === 401 || res.status === 403
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

export default function ValidatorForm({ onResult }: ValidatorFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setIsLoading(true);

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
        signal: abortRef.current.signal,
      });

      const result = await handleApiResponse(res);
      if (!result.ok) {
        onResult(
          {
            found: false,
            message: result.message,
            errorCode: result.errorCode,
            errors: [],
            warnings: [],
          },
          url.trim()
        );
        return;
      }
      onResult(result.data, url.trim());
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        return;
      }
      onResult(
        {
          found: false,
          message: "Connection error. Please try again.",
          errorCode: "connection_error" as ErrorCode,
          errors: [],
          warnings: [],
        },
        url.trim()
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-border)] rounded-lg p-5">
      <label htmlFor="url-input" className="block text-sm font-medium text-zinc-700 mb-2">
        Website URL
      </label>
      <div className="flex gap-2">
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
            className={`w-full px-3 py-2.5 text-sm border rounded-md input-focus-ring placeholder-[var(--color-text-muted)] bg-white ${
              inputError
                ? "border-red-500 focus:ring-red-950 focus:ring-offset-0"
                : "border-[var(--color-border)] focus:ring-zinc-950 focus:ring-offset-0"
            }`}
          />
          {inputError && (
            <p className="mt-1.5 text-xs text-[var(--color-error)]">{inputError}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md flex items-center gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Analyze URL
            </>
          )}
        </button>
      </div>
    </form>
  );
}
