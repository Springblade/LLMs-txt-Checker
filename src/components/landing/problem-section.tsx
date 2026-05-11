"use client";

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5Z" />
    <path d="M16 8V5c0-1.1.9-2 2-2" />
    <path d="M18 11h1.5a2 2 0 0 1 0 4H18" />
    <circle cx="18" cy="19" r="2" />
  </svg>
);

interface BulletItemProps {
  color: string;
  text: string;
}

function BulletItem({ color, text }: BulletItemProps) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        fontSize: 15,
        color: "var(--mm-text-muted)",
        lineHeight: 1.5,
        listStyle: "none",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          marginTop: 7,
          flexShrink: 0,
        }}
      />
      {text}
    </li>
  );
}

export function ProblemSection() {
  return (
    <section
      style={{
        padding: "80px 24px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        className="mm-fade-in"
        style={{
          textAlign: "center",
          marginBottom: 64,
          animationDelay: "0.2s",
        }}
      >
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            fontWeight: 600,
            marginBottom: "1rem",
            color: "var(--mm-text)",
          }}
        >
          AI agents don&apos;t browse. They read.
        </h2>
        <p
          style={{
            color: "var(--mm-text-muted)",
            fontSize: "1rem",
            maxWidth: "30ch",
            margin: "0 auto",
          }}
        >
          Your human visitors see a beautiful website. AI agents see nothing
          without the right files.
        </p>
      </div>

      {/* Two columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
        }}
      >
        {/* Human */}
        <div
          className="mm-fade-in card-stagger"
          style={{
            padding: 40,
            background: "var(--mm-bg-secondary)",
            border: "1px solid var(--mm-border)",
            borderRadius: 16,
            animationDelay: "0.3s",
          }}
        >
          <h3
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "var(--mm-text)",
            }}
          >
            <span style={{ color: "#22c55e" }}>
              <EyeIcon />
            </span>
            Human Browsing
          </h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <BulletItem color="#22c55e" text="Sees visual hierarchy and design cues" />
            <BulletItem color="#22c55e" text="Navigates intuitively through pages" />
            <BulletItem color="#22c55e" text="Understands context from images and layout" />
            <BulletItem color="#22c55e" text="Forms opinions from aesthetics and UX" />
            <BulletItem color="#22c55e" text="Can ask follow-up questions instantly" />
          </ul>
        </div>

        {/* AI Agent */}
        <div
          className="mm-fade-in card-stagger"
          style={{
            padding: 40,
            background: "var(--mm-bg-secondary)",
            border: "1px solid var(--mm-border)",
            borderRadius: 16,
            animationDelay: "0.4s",
          }}
        >
          <h3
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "var(--mm-text)",
            }}
          >
            <span style={{ color: "var(--mm-pink)" }}>
              <BrainIcon />
            </span>
            AI Agent Reading
          </h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <BulletItem color="var(--mm-pink)" text="Only sees raw HTML and text content" />
            <BulletItem color="var(--mm-pink)" text="Needs explicit file paths and sitemaps" />
            <BulletItem color="var(--mm-pink)" text="Requires structured metadata for context" />
            <BulletItem color="var(--mm-pink)" text="Relies on llms.txt, ai.txt, and similar files" />
            <BulletItem color="var(--mm-pink)" text="Must trust documentation you provide" />
          </ul>
        </div>
      </div>
    </section>
  );
}
