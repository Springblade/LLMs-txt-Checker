"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "What is llms.txt and why do I need it?",
    answer:
      "llms.txt is a machine-readable file that helps AI agents and crawlers understand your website's structure, purpose, and key content. Similar to how robots.txt guides search engine crawlers, llms.txt provides AI-specific metadata that improves how your site is represented in AI-powered search and research tools.",
  },
  {
    question: "What file types does Aivify support?",
    answer:
      "Aivify supports a growing list of AI discovery files including llms.txt, llm.txt, ai.txt, faq-ai.txt, brand.txt, developer-ai.txt, llms.html, robots-ai.txt, identity.json, and ai.json. Each serves a different purpose — from general site discovery to developer documentation and brand identity.",
  },
  {
    question: "How does the AI generation work?",
    answer:
      "When you request a file that doesn't exist on your site, Aivify crawls your website, analyzes the content, and uses AI to generate a high-quality, standards-compliant file tailored to your specific site. The generated content is validated against best practices before being presented to you.",
  },
  {
    question: "Is Aivify free to use?",
    answer:
      "Yes. Aivify is free to scan any public website and view results. The AI generation feature uses API credits which have a free tier. You doesn't need to create an account to get started.",
  },
  {
    question: "How accurate is the validation?",
    answer:
      "The validation checklist runs against 10+ industry-standard rules covering content quality, accessibility, format compliance, and completeness. Each rule is based on best practices documented by the llms.txt specification community and real-world AI crawler behavior.",
  },
  {
    question: "Can I use Aivify for client projects?",
    answer:
      "Absolutely. Aivify works great for auditing client websites, agency work, or any professional context. The generated files can be downloaded and deployed as-is, or used as a starting point for further customization.",
  },
];

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

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      style={{
        padding: "0 24px 100px",
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 48 }}>
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
          FAQ
        </span>
        <h2
          style={{
            fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            fontWeight: 700,
            color: "var(--mm-text)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}
        >
          Common questions
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FAQS.map((faq, i) => {
          const open = openIndex === i;
          return (
            <div
              key={i}
              style={{
                border: "1px solid var(--mm-border)",
                borderRadius: 10,
                overflow: "hidden",
                background: open
                  ? "var(--mm-bg-secondary)"
                  : "var(--mm-bg)",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "18px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--mm-text)",
                    fontFamily:
                      "'Outfit', ui-sans-serif, system-ui, sans-serif",
                    lineHeight: 1.4,
                  }}
                >
                  {faq.question}
                </span>
                <ChevronIcon open={open} />
              </button>

              <div
                style={{
                  maxHeight: open ? 400 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.25s ease",
                }}
              >
                <div
                  style={{
                    padding: "0 20px 20px",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "var(--mm-text-muted)",
                    borderTop: open
                      ? "1px solid var(--mm-border)"
                      : "none",
                    paddingTop: open ? 16 : 0,
                  }}
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
