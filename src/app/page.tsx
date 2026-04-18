"use client";

import { SmartForm } from "@/components/smart-form";
import SiteHeader from "@/components/site-header";
import AppFooter from "@/components/app-footer";

export default function HomePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <SiteHeader />

      {/* Hero */}
      <section
        style={{
          backgroundColor: "var(--color-bg)",
          paddingTop: "4rem",
          paddingBottom: "3rem",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: "var(--color-text)",
              marginBottom: "1rem",
            }}
          >
            Generate llms.txt
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              maxWidth: "55ch",
              marginBottom: "1.5rem",
            }}
          >
            AI will check if your website already has an llms.txt file. If not,
            it generates one and validates the quality — automatically.
          </p>

          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "0",
            }}
          >
            {[
              {
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                label: "Free",
              },
              {
                icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
                label: "No card required",
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                label: "Generates in seconds",
              },
            ].map(({ icon, label }) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.8125rem",
                  color: "var(--color-text-muted)",
                  fontWeight: 500,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={icon} />
                </svg>
                {label}
              </span>
            ))}
          </div>

          <div
            style={{
              height: "1px",
              backgroundColor: "var(--color-border)",
              opacity: 0.5,
              marginTop: "2rem",
            }}
            aria-hidden="true"
          />
        </div>
      </section>

      {/* Form */}
      <section
        style={{
          backgroundColor: "var(--color-bg)",
          paddingBottom: "4rem",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              maxWidth: "52rem",
              boxShadow: "var(--shadow-golden-lg)",
            }}
          >
            <SmartForm />
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
