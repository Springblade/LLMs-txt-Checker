import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLMs.txt Checker",
  description: "Validate llms.txt files against the official standard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
