"use client";

import { useEffect, useRef } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  usedCount: number;
  limit: number;
}

function ZapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function UpgradeModal({ isOpen, onClose, usedCount, limit }: UpgradeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Focus trap: focus dialog on open, return focus on close
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const handleSeePlans = () => {
    onClose();
    const pricingEl = document.getElementById("pricing");
    if (pricingEl) {
      pricingEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = "/#pricing";
    }
  };

  if (!isOpen) return null;

  const fillPercent = Math.min((usedCount / limit) * 100, 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
          cursor: "pointer",
        }}
      />

      {/* Card */}
      <div
        ref={dialogRef}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
          background: "#111118",
          border: "1px solid #27272a",
          borderRadius: 16,
          padding: "32px 28px 28px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Close button */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#71717a",
            padding: 4,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#e4e4e7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#71717a"; }}
        >
          <CloseIcon />
        </button>

        {/* Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "rgba(129, 140, 248, 0.12)",
            border: "1px solid rgba(129, 140, 248, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#818cf8",
            marginBottom: 20,
          }}
        >
          <ZapIcon />
        </div>

        {/* Title */}
        <h2
          id="upgrade-modal-title"
          style={{
            fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#e4e4e7",
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Free generations exhausted
        </h2>

        {/* Usage bar */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, color: "#71717a" }}>Generations used</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>
              {usedCount} / {limit}
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: "#18181f",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${fillPercent}%`,
                background: usedCount >= limit ? "#ef4444" : "#818cf8",
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Body */}
        <p
          style={{
            fontSize: 14,
            color: "#71717a",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          You&apos;ve used all {limit} free generations for this project. Upgrade to Pro to keep
          generating files and unlock bulk generation, priority support, and more.
        </p>

        {/* CTA */}
        <button
          onClick={handleSeePlans}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 20px",
            background: "#818cf8",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "background 0.15s",
            marginBottom: 12,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#6d72f9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#818cf8"; }}
        >
          See pricing plans
          <ArrowRightIcon />
        </button>

        {/* Secondary */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px 20px",
            background: "transparent",
            color: "#71717a",
            border: "1px solid #27272a",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3f3f46";
            e.currentTarget.style.color = "#e4e4e7";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#27272a";
            e.currentTarget.style.color = "#71717a";
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
