"use client";

import { useState } from "react";

interface GeneratorFormProps {
  onGenerated?: (data: unknown) => void;
}

export function GeneratorForm({ onGenerated }: GeneratorFormProps) {
  const [url, setUrl] = useState("");
  const [maxUrls, setMaxUrls] = useState(50);
  const [includePaths, setIncludePaths] = useState("");
  const [excludePaths, setExcludePaths] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          maxUrls,
          includePaths: includePaths
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          excludePaths: excludePaths
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Generation failed");
        setIsLoading(false);
        return;
      }

      if (onGenerated) {
        onGenerated(data);
      }
      setIsLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div
          className="p-3"
          style={{
            borderRadius: "var(--radius)",
            backgroundColor: "rgba(231, 76, 60, 0.1)",
            border: "1px solid rgba(231, 76, 60, 0.3)",
            color: "var(--color-error)",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="gen-url"
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Website URL
        </label>
        <input
          id="gen-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          className="w-full px-4 py-3 text-sm input-focus-ring"
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: error ? "var(--color-error)" : "var(--color-border)",
            borderRadius: "var(--radius)",
            color: "var(--color-text)",
            backgroundColor: "var(--color-bg-secondary)",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="gen-max-urls"
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Max URLs to crawl
        </label>
        <input
          id="gen-max-urls"
          type="number"
          min={1}
          max={200}
          value={maxUrls}
          onChange={(e) => setMaxUrls(Number(e.target.value))}
          className="w-full px-4 py-3 text-sm input-focus-ring"
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--color-border)",
            borderRadius: "var(--radius)",
            color: "var(--color-text)",
            backgroundColor: "var(--color-bg-secondary)",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="gen-include"
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Include paths{" "}
          <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>
            (comma-separated)
          </span>
        </label>
        <input
          id="gen-include"
          type="text"
          value={includePaths}
          onChange={(e) => setIncludePaths(e.target.value)}
          placeholder="/docs,/blog,/guides"
          className="w-full px-4 py-3 text-sm input-focus-ring"
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--color-border)",
            borderRadius: "var(--radius)",
            color: "var(--color-text)",
            backgroundColor: "var(--color-bg-secondary)",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="gen-exclude"
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Exclude paths{" "}
          <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>
            (comma-separated)
          </span>
        </label>
        <input
          id="gen-exclude"
          type="text"
          value={excludePaths}
          onChange={(e) => setExcludePaths(e.target.value)}
          placeholder="/login,/admin,/tmp"
          className="w-full px-4 py-3 text-sm input-focus-ring"
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--color-border)",
            borderRadius: "var(--radius)",
            color: "var(--color-text)",
            backgroundColor: "var(--color-bg-secondary)",
          }}
        />
      </div>

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
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Generate llms.txt
          </>
        )}
      </button>
    </form>
  );
}
