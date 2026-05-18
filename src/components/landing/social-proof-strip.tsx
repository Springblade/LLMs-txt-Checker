"use client";

const BRANDS = [
  { name: "TechCorp", initials: "TC" },
  { name: "DataFlow", initials: "DF" },
  { name: "CloudBase", initials: "CB" },
  { name: "ScaleUp", initials: "SU" },
  { name: "NextGen", initials: "NG" },
];

export function SocialProofStrip() {
  return (
    <section
      style={{
        padding: "0 24px 80px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--mm-text-muted)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Trusted by AI teams at
        </span>

        {BRANDS.map((brand) => (
          <div
            key={brand.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: 0.45,
              transition: "opacity 0.15s",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--mm-bg-secondary)",
                border: "1px solid var(--mm-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "var(--mm-text-muted)",
                fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {brand.initials}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--mm-text-muted)",
                fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
              }}
            >
              {brand.name}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 40,
          padding: "20px 32px",
          background: "var(--mm-bg-secondary)",
          border: "1px solid var(--mm-border)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        {[
          { value: "12,000+", label: "Sites scanned" },
          { value: "98%", label: "Uptime" },
          { value: "< 8s", label: "Avg scan time" },
          { value: "Free", label: "No account needed" },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--mm-brand)",
                fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--mm-text-muted)",
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
