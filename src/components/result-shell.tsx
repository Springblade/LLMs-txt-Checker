"use client";

import SiteHeader from "@/components/site-header";
import AppFooter from "@/components/app-footer";
import type { ReactNode } from "react";

export interface ResultShellProps {
  title?: string;
  breadcrumb?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  backLabel?: string;
  showGitHub?: boolean;
  children: ReactNode;
}

export default function ResultShell({
  title,
  breadcrumb,
  showBackButton,
  onBack,
  backLabel = "Back",
  showGitHub = true,
  children,
}: ResultShellProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <SiteHeader
        title={title}
        breadcrumb={breadcrumb}
        showBackButton={showBackButton}
        onBack={onBack}
        backLabel={backLabel}
        showGitHub={showGitHub}
      />
      <main
        style={{
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
