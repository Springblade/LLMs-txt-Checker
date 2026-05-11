"use client";

interface Step {
  num: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const steps: Step[] = [
  {
    num: "01",
    icon: <SearchIcon />,
    title: "Scan Your Site",
    desc: "Enter any URL. Aivify checks for existing AI discovery files and reports exactly what is found.",
    delay: 0.6,
  },
  {
    num: "02",
    icon: <FileIcon />,
    title: "Review Results",
    desc: "See a clear breakdown of present and missing files, grouped by importance tier.",
    delay: 0.7,
  },
  {
    num: "03",
    icon: <SparkleIcon />,
    title: "Generate Missing",
    desc: "Select the files you need. Our AI analyzes your site and generates production-ready files.",
    delay: 0.8,
  },
];

export function WorkflowSection() {
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
          animationDelay: "0.5s",
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
          Three steps to full AI coverage
        </h2>
        <p
          style={{
            color: "var(--mm-text-muted)",
            fontSize: "1rem",
            maxWidth: "36ch",
            margin: "0 auto",
          }}
        >
          From scan to complete — in under two minutes.
        </p>
      </div>

      {/* Step cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 32,
        }}
      >
        {steps.map((step) => (
          <div
            key={step.num}
            className="mm-fade-in card-stagger"
            style={{
              padding: 32,
              background: "var(--mm-bg-secondary)",
              border: "1px solid var(--mm-border)",
              borderRadius: 16,
              animationDelay: `${step.delay}s`,
            }}
          >
            {/* Step label */}
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--mm-brand)",
                marginBottom: 20,
                letterSpacing: "0.05em",
              }}
            >
              STEP {step.num}
            </div>

            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "var(--mm-bg-tertiary)",
                border: "1px solid var(--mm-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                color: "var(--mm-brand-light)",
                animation: `float 3s ease-in-out ${step.delay}s infinite`,
              }}
            >
              {step.icon}
            </div>

            {/* Content */}
            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: 12,
                color: "var(--mm-text)",
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                color: "var(--mm-text-muted)",
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
