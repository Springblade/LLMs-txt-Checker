"use client";

export default function AppFooter() {
  return (
    <footer className="footer-sunset mt-auto">
      <div
        className="max-w-[1280px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p
          className="footer-text text-sm"
          style={{ color: "rgba(255, 255, 255, 0.85)" }}
        >
          © 2026 Aivify
        </p>
        <div className="flex items-center gap-6">
          <a
            href="/privacy"
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: "rgba(255, 255, 255, 0.78)" }}
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: "rgba(255, 255, 255, 0.78)" }}
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
