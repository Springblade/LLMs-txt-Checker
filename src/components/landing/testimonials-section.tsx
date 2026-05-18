"use client";

const TESTIMONIALS = [
  {
    quote:
      "After adding llms.txt, our documentation started appearing in AI search results within weeks. Traffic from AI tools tripled.",
    name: "Sarah Chen",
    role: "Head of Developer Relations",
    company: "TechCorp",
    initials: "SC",
    accent: "#818cf8",
  },
  {
    quote:
      "Aivify caught 4 critical missing files on our docs site. The AI generation was accurate and saved hours of manual work.",
    name: "Marcus Webb",
    role: "Senior Developer",
    company: "CloudBase",
    initials: "MW",
    accent: "#22c55e",
  },
  {
    quote:
      "Finally, a tool that understands what AI crawlers actually need. The validation checklist alone is worth it.",
    name: "Priya Nair",
    role: "CTO",
    company: "DataFlow",
    initials: "PN",
    accent: "#eab308",
  },
];

function QuoteIcon({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={color}
      style={{ flexShrink: 0 }}
    >
      <path d="M11.3 8.1C10.42 6.72 10.04 5.88 9.25 5.25 8.37 4.55 7.3 4.4 6.25 4.7 5.73 4.86 5.35 5.15 5.04 5.6L4.35 6.9C4.72 7.45 5.16 7.84 5.68 8.07 6.23 8.3 6.78 8.36 7.35 8.24 8.4 7.98 9.08 7.24 9.37 6.02L11.3 8.1ZM19.3 8.1C18.42 6.72 18.04 5.88 17.25 5.25 16.37 4.55 15.3 4.4 14.25 4.7 13.73 4.86 13.35 5.15 13.04 5.6L12.35 6.9C12.72 7.45 13.16 7.84 13.68 8.07 14.23 8.3 14.78 8.36 15.35 8.24 16.4 7.98 17.08 7.24 17.37 6.02L19.3 8.1Z" />
    </svg>
  );
}

function StarsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      style={{
        padding: "80px 24px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <span
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--mm-brand)",
            marginBottom: 12,
          }}
        >
          What teams say
        </span>
        <h2
          style={{
            fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            fontWeight: 700,
            color: "var(--mm-text)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          AI teams trust Aivify
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "var(--mm-text-muted)",
            maxWidth: "44ch",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          From indie developers to enterprise teams, teams use Aivify to make
          their sites AI-discoverable.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            style={{
              padding: "28px 24px",
              background: "var(--mm-bg-secondary)",
              border: "1px solid var(--mm-border)",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              transition: "border-color 0.15s",
            }}
          >
            {/* Stars + Quote icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <StarsIcon key={i} />
                ))}
              </div>
              <QuoteIcon color={t.accent} />
            </div>

            {/* Quote */}
            <blockquote
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--mm-text-secondary)",
                flex: 1,
              }}
            >
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `${t.accent}20`,
                  border: `1px solid ${t.accent}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.accent,
                  fontFamily:
                    "'Outfit', ui-sans-serif, system-ui, sans-serif",
                  flexShrink: 0,
                }}
              >
                {t.initials}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--mm-text)",
                  }}
                >
                  {t.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--mm-text-muted)" }}>
                  {t.role} · {t.company}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
