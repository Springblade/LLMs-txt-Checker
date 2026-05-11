"use client";

export function ResultsSkeleton() {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "64px 24px 120px",
      }}
    >
      {/* Score section skeleton */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 48,
        }}
      >
        {/* Ring skeleton */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "var(--mm-bg-tertiary)",
            border: "10px solid var(--mm-bg-tertiary)",
            marginBottom: 16,
            position: "relative",
            overflow: "hidden",
          }}
        />

        {/* Stat pills */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {[1, 2, 3, 4].map((_w, i) => (
            <div
              key={i}
              style={{
                width: 80,
                height: 68,
                borderRadius: 10,
                background: "var(--mm-bg-secondary)",
                border: "1px solid var(--mm-border)",
                animation: "shimmer 1.5s infinite",
              }}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, var(--mm-border) 20%, var(--mm-border) 80%, transparent 100%)`,
          marginBottom: 48,
        }}
      />

      {/* File card skeletons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            height: 20,
            width: 160,
            borderRadius: 4,
            background: "var(--mm-bg-secondary)",
            marginBottom: 4,
          }}
        />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              padding: "20px 24px",
              background: "var(--mm-bg-secondary)",
              border: "1px solid var(--mm-border)",
              borderRadius: 14,
              height: 80,
              animation: "shimmer 1.5s infinite",
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
