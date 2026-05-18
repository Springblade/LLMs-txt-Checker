"use client";

import { useState } from "react";

const TIERS = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for trying out Aivify on a single project.",
    features: [
      { text: "2 AI generations per project", included: true },
      { text: "Scan unlimited URLs", included: true },
      { text: "10 file type validations", included: true },
      { text: "Download generated files", included: true },
      { text: "Bulk generation", included: false },
      { text: "Priority support", included: false },
      { text: "Unlimited projects", included: false },
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 9,
    period: "per month",
    description: "For developers and small teams shipping AI-ready sites.",
    features: [
      { text: "20 AI generations per project", included: true },
      { text: "Scan unlimited URLs", included: true },
      { text: "10 file type validations", included: true },
      { text: "Download generated files", included: true },
      { text: "Bulk generation", included: true },
      { text: "Priority support", included: true },
      { text: "Up to 10 projects", included: true },
    ],
    cta: "Start Pro trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: 29,
    period: "per month",
    description: "For agencies and teams managing multiple client sites.",
    features: [
      { text: "100 AI generations per project", included: true },
      { text: "Scan unlimited URLs", included: true },
      { text: "10 file type validations", included: true },
      { text: "Download generated files", included: true },
      { text: "Bulk generation", included: true },
      { text: "Priority support", included: true },
      { text: "Unlimited projects", included: true },
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

const BILLING_FAQS = [
  {
    question: "What counts as a generation?",
    answer:
      "A generation is counted each time you click 'Generate with AI' to create one file type for one project URL. Regenerating the same file or generating a different file both count as separate generations.",
  },
  {
    question: "Can I reset my usage?",
    answer:
      "Yes. Usage resets at the start of each billing cycle on Pro and Team plans. You can also start fresh by scanning a new project URL — each project has its own generation counter.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer:
      "Pro comes with a 14-day free trial — no credit card required. You get full access to all Pro features during the trial period.",
  },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
        flexShrink: 0,
        color: "var(--mm-text-muted)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PricingCard({ tier }: { tier: typeof TIERS[number] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        minWidth: 240,
        background: tier.highlighted ? "#111118" : "#18181f",
        border: `1px solid ${tier.highlighted ? (hovered ? "#a5b4fc" : "#818cf8") : "#27272a"}`,
        borderRadius: 16,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        transform: tier.highlighted && hovered ? "translateY(-4px)" : tier.highlighted ? "translateY(-2px)" : "none",
        boxShadow: tier.highlighted
          ? `0 0 32px ${hovered ? "rgba(129,140,248,0.2)" : "rgba(129,140,248,0.1)"}`
          : "none",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        position: "relative",
        zIndex: 1,
      }}
    >
      {tier.highlighted && (
        <div
          style={{
            position: "absolute",
            top: -1,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(129,140,248,0.15)",
            border: "1px solid #818cf8",
            padding: "3px 14px",
            borderRadius: 20,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#818cf8",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          Most Popular
        </div>
      )}

      {/* Header */}
      <div>
        <div
          style={{
            fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "#e4e4e7",
            marginBottom: 6,
            marginTop: tier.highlighted ? 12 : 0,
          }}
        >
          {tier.name}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span
            style={{
              fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: "#e4e4e7",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            ${tier.price}
          </span>
          <span style={{ fontSize: 13, color: "#52525b" }}>{tier.period}</span>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#71717a",
            lineHeight: 1.5,
            marginTop: 8,
          }}
        >
          {tier.description}
        </p>
      </div>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {tier.features.map((f) => (
          <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: f.included ? "#22c55e" : "#3f3f46", flexShrink: 0 }}>
              {f.included ? <CheckIcon /> : <XIcon />}
            </span>
            <span
              style={{
                fontSize: 13,
                color: f.included ? "#a1a1aa" : "#3f3f46",
                lineHeight: 1.4,
              }}
            >
              {f.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        style={{
          width: "100%",
          padding: "11px 20px",
          background: tier.highlighted ? "#818cf8" : "transparent",
          color: tier.highlighted ? "#fff" : "#71717a",
          border: `1px solid ${tier.highlighted ? "#818cf8" : "#27272a"}`,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          if (tier.highlighted) {
            e.currentTarget.style.background = "#6d72f9";
          } else {
            e.currentTarget.style.borderColor = "#3f3f46";
            e.currentTarget.style.color = "#e4e4e7";
          }
        }}
        onMouseLeave={(e) => {
          if (tier.highlighted) {
            e.currentTarget.style.background = "#818cf8";
          } else {
            e.currentTarget.style.borderColor = "#27272a";
            e.currentTarget.style.color = "#71717a";
          }
        }}
      >
        {tier.cta}
      </button>
    </div>
  );
}

export function PricingSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <section
      id="pricing"
      style={{
        padding: "80px 24px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Section header */}
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
          Pricing
        </span>
        <h2
          style={{
            fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            color: "var(--mm-text)",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Simple, transparent pricing
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "var(--mm-text-muted)",
            maxWidth: "44ch",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Start free. Upgrade when you need more. No hidden fees, no surprises.
        </p>
      </div>

      {/* Pricing cards */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        {TIERS.map((tier) => (
          <PricingCard key={tier.name} tier={tier} />
        ))}
      </div>

      {/* Billing FAQ */}
      <div style={{ marginTop: 64, maxWidth: 640, margin: "64px auto 0" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h3
            style={{
              fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--mm-text)",
              marginBottom: 4,
            }}
          >
            Billing questions
          </h3>
          <p style={{ fontSize: 13, color: "#71717a" }}>
            Common questions about plans, usage, and billing.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {BILLING_FAQS.map((faq, i) => {
            const open = openFaqIndex === i;
            return (
              <div
                key={i}
                style={{
                  border: "1px solid var(--mm-border)",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: open ? "var(--mm-bg-secondary)" : "var(--mm-bg)",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <button
                  onClick={() => setOpenFaqIndex(open ? null : i)}
                  aria-expanded={open}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "16px 20px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--mm-text)",
                      lineHeight: 1.4,
                    }}
                  >
                    {faq.question}
                  </span>
                  <ChevronIcon open={open} />
                </button>

                <div
                  style={{
                    maxHeight: open ? 200 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.25s ease",
                  }}
                >
                  <div
                    style={{
                      padding: open ? "0 20px 18px" : "0 20px 0",
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "var(--mm-text-muted)",
                      borderTop: open ? "1px solid var(--mm-border)" : "none",
                      paddingTop: open ? 14 : 0,
                    }}
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
