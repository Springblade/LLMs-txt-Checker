"use client";

interface FileResult {
  name: string;
  found: boolean;
  url: string;
  content: string;
  errors: Array<{ rule: string; message: string; line?: number }>;
  warnings: Array<{ rule: string; message: string; line?: number }>;
  checklist: Array<{
    id: string;
    label: string;
    status: "passed" | "failed" | "warning" | "skipped";
    value?: number;
  }>;
}

type CardState = "ok" | "errors" | "warnings" | "notFound";

function getCardState(file: FileResult): CardState {
  if (!file.found) return "notFound";
  if (file.errors.length > 0) return "errors";
  if (file.warnings.length > 0) return "warnings";
  return "ok";
}

const FILE_DESCRIPTIONS: Partial<Record<string, string>> = {
  "llms.txt": "For main AI discovery file",
  "llm.txt": "For redirect compatibility",
  "ai.txt": "For AI policies and terms",
  "faq-ai.txt": "For AI-friendly FAQ responses",
  "brand.txt": "For AI brand guidelines",
  "developer-ai.txt": "For developer documentation",
  "llms.html": "For HTML-based AI discovery",
  "robots-ai.txt": "For AI crawler access control",
  "identity.json": "For machine-readable identity",
  "ai.json": "For AI interaction guidelines",
};

function getFileDescription(name: string): string {
  return FILE_DESCRIPTIONS[name] ?? "AI discovery file";
}

const FILE_TEMPLATE_PATHS: Record<string, string> = {
  "llms.txt": "/ai-discovery-templates/text-based/llms.txt",
  "llm.txt": "/ai-discovery-templates/text-based/llm.txt",
  "ai.txt": "/ai-discovery-templates/text-based/ai.txt",
  "faq-ai.txt": "/ai-discovery-templates/text-based/faq-ai.txt",
  "brand.txt": "/ai-discovery-templates/text-based/brand.txt",
  "developer-ai.txt": "/ai-discovery-templates/text-based/developer-ai.txt",
  "llms.html": "/ai-discovery-templates/html/llms.html",
  "robots-ai.txt": "/ai-discovery-templates/text-based/robots-ai.txt",
  "identity.json": "/ai-discovery-templates/json/identity.json",
  "ai.json": "/ai-discovery-templates/json/ai.json",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function handleDownload(fileType: string) {
  const path = FILE_TEMPLATE_PATHS[fileType];
  if (!path) return;
  try {
    const res = await fetch(path);
    if (!res.ok) return;
    const text = await res.text();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileType;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("[DownloadTemplate]", e);
  }
}

// ── Gradient top bar per severity ───────────────────────────────────────────

function BlockAccentBar({ state }: { state: CardState }) {
  const configs = {
    ok: {
      gradient: "linear-gradient(90deg, #b85a00 0%, #d97706 50%, #ffd900 100%)",
      height: "3px",
    },
    warnings: {
      gradient: "linear-gradient(90deg, #b8600a 0%, #ffa110 50%, #ffd900 100%)",
      height: "3px",
    },
    errors: {
      gradient: "linear-gradient(90deg, #c0392b 0%, #fa520f 50%, #ffa110 100%)",
      height: "3px",
    },
    notFound: {
      gradient: "linear-gradient(90deg, #e8d5a0 0%, #ffeeba 50%, #fff0c2 100%)",
      height: "3px",
    },
  };
  const cfg = configs[state];
  return (
    <div
      style={{
        height: cfg.height,
        background: cfg.gradient,
        borderRadius: "0",
        marginBottom: "0",
      }}
    />
  );
}

// ── Warning / Error / NotFound box ──────────────────────────────────────────

function ImpactBox({ type }: { type: "errors" | "warnings" | "notFound" }) {
  const configs = {
    errors: {
      cssClass: "impact-box-errors",
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M15 9l-6 6M9 9l6 6" />
        </svg>
      ),
      title: "This file has syntax errors.",
      subtitle: "Impacts SEO and AI model parsing of your content.",
    },
    warnings: {
      cssClass: "impact-box-warnings",
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      ),
      title: "This file is missing recommended sections.",
      subtitle: "Impacts SEO and AI model discovery of your content.",
    },
    notFound: {
      cssClass: "impact-box-warnings",
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      ),
      title: "This file was not found on the server.",
      subtitle: "Impacts SEO and AI model discovery of your content.",
    },
  };

  const cfg = configs[type];

  return (
    <div className={`mx-4 mb-3 px-3 py-2 ${cfg.cssClass}`}>
      <div className="flex items-start gap-2">
        <span className="mt-0.5">{cfg.icon}</span>
        <div>
          <p className="text-xs font-medium leading-relaxed">{cfg.title}</p>
          <p className="text-xs leading-relaxed opacity-80">{cfg.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

// ── Download Template button ──────────────────────────────────────────────────

function DownloadButton({ fileType }: { fileType: string }) {
  return (
    <div className="px-4 pb-3">
      <button
        type="button"
        onClick={() => void handleDownload(fileType)}
        className="btn-orange w-full py-2.5 text-xs font-medium btn-primary"
        style={{
          borderRadius: "var(--radius)",
          letterSpacing: "0.05em",
          fontWeight: 400,
        }}
      >
        DOWNLOAD TEMPLATE
      </button>
    </div>
  );
}

// ── Tech Specs Grid ───────────────────────────────────────────────────────────

interface TechSpec {
  file: string;
  status: "exists" | "not_found";
  length: string;
  contentType: string;
  lastModified: string;
  ttl: string;
  businessName: string;
  brandName: string;
}

function TechSpecsGrid({ spec }: { spec: TechSpec }) {
  const items = [
    { label: "FILE", value: spec.file },
    {
      label: "STATUS",
      value: spec.status === "exists" ? "exists" : "not_found",
      isBadge: true,
    },
    { label: "LENGTH", value: spec.length },
    { label: "LAST-MODIFIED", value: spec.lastModified },
    { label: "BUSINESS NAME", value: spec.businessName },
    { label: "BRAND NAME", value: spec.brandName },
  ];

  return (
    <div className="mx-4 mb-3 grid grid-cols-3 gap-x-4 gap-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <p
            className="text-xs uppercase tracking-wider"
            style={{
              color: "var(--color-text-muted)",
              letterSpacing: "0.06em",
              fontSize: "0.65rem",
            }}
          >
            {item.label}
          </p>
          {item.isBadge ? (
            item.value === "exists" ? (
              <span
                className="inline-block mt-1 px-2 py-0.5 text-xs font-medium badge-success"
                style={{ borderRadius: "var(--radius)" }}
              >
                exists
              </span>
            ) : (
              <span
                className="inline-block mt-1 px-2 py-0.5 text-xs font-medium badge-error"
                style={{ borderRadius: "var(--radius)" }}
              >
                not_found
              </span>
            )
          ) : (
            <p
              className="text-sm font-medium mt-0.5"
              style={{
                color:
                  item.value === "N/A"
                    ? "var(--color-text-muted)"
                    : "var(--color-text)",
              }}
            >
              {item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Card ─────────────────────────────────────────────────────────────────

export default function AnalyzeFileCard({ file }: { file: FileResult }) {
  const state = getCardState(file);
  const description = getFileDescription(file.name);
  const showDownload = state === "notFound";

  const techSpec: TechSpec = {
    file: file.name,
    status: file.found ? "exists" : "not_found",
    length:
      file.found && file.content
        ? formatSize(new TextEncoder().encode(file.content).length)
        : "N/A",
    contentType: "N/A",
    lastModified: "N/A",
    ttl: "N/A",
    businessName: "N/A",
    brandName: "N/A",
  };

  return (
    <div
      className={`card-interactive card-stagger`}
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        boxShadow: "var(--shadow-golden-sm)",
      }}
    >
      {/* Gradient top accent bar */}
      <BlockAccentBar state={state} />

      {/* File name + description */}
      <div className="px-4 pt-3">
        <p
          className="font-mono text-sm font-semibold leading-tight"
          style={{ color: "var(--color-text)" }}
        >
          {file.name}
        </p>
        <p
          className="text-xs mt-0.5 leading-tight"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description}
        </p>
      </div>

      {/* Content area */}
      <div className="mt-2">
        {/* Impact boxes */}
        {state === "notFound" && <ImpactBox type="notFound" />}
        {state === "errors" && <ImpactBox type="errors" />}
        {state === "warnings" && <ImpactBox type="warnings" />}

        {/* Download button */}
        {showDownload && <DownloadButton fileType={file.name} />}

        {/* Tech specs */}
        <TechSpecsGrid spec={techSpec} />

        {/* Status badge for not_found */}
        {state === "notFound" && (
          <div className="mx-4 mb-3">
            <span
              className="inline-block badge-error text-xs px-2 py-0.5 font-medium"
              style={{ borderRadius: "var(--radius)" }}
            >
              not_found
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
