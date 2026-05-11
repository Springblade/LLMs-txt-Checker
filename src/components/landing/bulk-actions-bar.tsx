"use client";

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

interface BulkActionsBarProps {
  selectedCount: number;
  totalMissing: number;
  onSelectAll: () => void;
  onClear: () => void;
  onGenerateAll: () => void;
  isGenerating: boolean;
}

export function BulkActionsBar({
  selectedCount,
  totalMissing,
  onSelectAll,
  onClear,
  onGenerateAll,
  isGenerating,
}: BulkActionsBarProps) {
  if (totalMissing === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--mm-bg-secondary)",
        border: "1px solid rgba(20,86,240,0.25)",
        borderRadius: 14,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(20,86,240,0.1)",
        animation: "mm-fade-in 0.3s ease-out",
        zIndex: 200,
        backdropFilter: "blur(12px)",
        minWidth: 420,
      }}
    >
      {/* Count */}
      <span style={{ fontSize: 13, color: "var(--mm-text-muted)", flex: 1, fontFamily: "'DM Sans', sans-serif" }}>
        <span style={{ fontWeight: 600, color: "var(--mm-brand)" }}>{selectedCount}</span> of{" "}
        {totalMissing} files selected
      </span>

      {/* Select/Clear */}
      <button
        onClick={selectedCount === totalMissing ? onClear : onSelectAll}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          color: "var(--mm-text-muted)",
          background: "transparent",
          border: "1px solid var(--mm-border)",
          borderRadius: 8,
          cursor: "pointer",
          transition: "color 0.2s, border-color 0.2s",
        }}
      >
        {selectedCount === totalMissing ? "Clear All" : "Select All Missing"}
      </button>

      {/* Generate CTA */}
      <button
        onClick={onGenerateAll}
        disabled={isGenerating || selectedCount === 0}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 20px",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          color: selectedCount === 0 ? "var(--mm-text-muted)" : "#fff",
          background: selectedCount === 0 ? "var(--mm-bg-tertiary)" : "var(--mm-brand)",
          border: "none",
          borderRadius: 8,
          cursor: selectedCount === 0 ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {isGenerating ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparkleIcon />
            Generate {selectedCount > 0 ? `${selectedCount} ` : ""}Files
          </>
        )}
      </button>
    </div>
  );
}
