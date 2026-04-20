"use client";

export default function AppFooter() {
  return (
    <footer
      className="footer-dark"
      style={{ marginTop: "auto" }}
    >
      <div
        style={{
          maxWidth: "1280px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingTop: "1.5rem",
          paddingBottom: "1.5rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <p style={{ fontSize: "0.875rem", margin: 0 }}>
          © 2026 Aivify
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <a
            href="/privacy"
            style={{ fontSize: "0.875rem" }}
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            style={{ fontSize: "0.875rem" }}
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
