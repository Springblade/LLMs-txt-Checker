"use client";

export function ResultsSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* Left nav rail skeleton */}
      <div
        style={{
          width: 48,
          flexShrink: 0,
          borderRight: "1px solid var(--mm-border)",
          background: "var(--mm-bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "var(--mm-bg-tertiary)",
          }}
        />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Tab bar skeleton */}
        <div
          style={{
            height: 88,
            borderBottom: "1px solid var(--mm-border)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {/* Tier strip skeleton */}
          <div
            style={{
              height: 44,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              gap: 8,
              borderBottom: "1px solid var(--mm-border)",
            }}
          >
            {[120, 140, 120, 80].map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: 12,
                  borderRadius: 4,
                  background: "var(--mm-bg-secondary)",
                }}
              />
            ))}
          </div>
          {/* Tab row skeleton */}
          <div
            style={{
              height: 44,
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              gap: 12,
            }}
          >
            {[100, 90, 120, 100, 110, 95, 105, 88, 100].map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: 10,
                  borderRadius: 4,
                  background: "var(--mm-bg-secondary)",
                  flexShrink: 0,
                  animation: "shimmer 1.5s infinite",
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Body: code preview + right panel */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Code preview skeleton */}
          <div
            style={{
              flex: 1,
              padding: "32px 24px",
              overflow: "hidden",
            }}
          >
            {/* Line number gutter */}
            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ width: 32, flexShrink: 0 }}>
                {Array.from({ length: 18 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 14,
                      borderRadius: 2,
                      background: "var(--mm-bg-secondary)",
                      marginBottom: 8,
                      animation: "shimmer 1.5s infinite",
                      animationDelay: `${i * 60}ms`,
                      width: `${20 + (i % 3) * 8}%`,
                    }}
                  />
                ))}
              </div>
              {/* Code lines */}
              <div style={{ flex: 1 }}>
                {Array.from({ length: 18 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 14,
                      borderRadius: 2,
                      background: "var(--mm-bg-secondary)",
                      marginBottom: 8,
                      animation: "shimmer 1.5s infinite",
                      animationDelay: `${i * 60}ms`,
                      width: `${55 + (i % 4) * 10}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right panel skeleton */}
          <div
            style={{
              width: 288,
              flexShrink: 0,
              borderLeft: "1px solid var(--mm-border)",
              background: "var(--mm-bg)",
              display: "flex",
              flexDirection: "column",
              padding: 14,
              gap: 12,
            }}
          >
            {/* Stats bar */}
            <div
              style={{
                display: "flex",
                border: "1px solid var(--mm-border)",
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 4,
              }}
            >
              {[60, 70, 60].map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 52,
                    borderRight: i < 2 ? "1px solid var(--mm-border)" : "none",
                    background: "var(--mm-bg-secondary)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 16,
                      borderRadius: 3,
                      background: "var(--mm-bg-tertiary)",
                    }}
                  />
                  <div
                    style={{
                      width: 32,
                      height: 8,
                      borderRadius: 2,
                      background: "var(--mm-bg-tertiary)",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Action buttons */}
            {[80, 80, 80].map((_, i) => (
              <div
                key={i}
                style={{
                  height: 36,
                  borderRadius: 7,
                  background: "var(--mm-bg-secondary)",
                  border: "1px solid var(--mm-border)",
                }}
              />
            ))}

            {/* Validation section */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    height: 52,
                    borderRadius: 6,
                    background: "var(--mm-bg-secondary)",
                    animation: "shimmer 1.5s infinite",
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
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
