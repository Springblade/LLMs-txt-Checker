"use client";

import { useMemo } from "react";

interface CodePreviewProps {
  content: string;
  lineCount: number;
}

const TOKENS = {
  bg: "#09090e",
} as const;

function highlightMarkdown(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // H1-H6: amber
    .replace(/^(\#{1,6}\s.*)$/gm, '<span style="color:#d4a04a;font-weight:600">$1</span>')
    // Blockquote: sage italic
    .replace(/^(\>.*)$/gm, '<span style="color:#6b8f71;font-style:italic">$1</span>')
    // Links: muted blue [text](url)
    .replace(/(\[.*?\])(\(.*?\))/g,
      '<span style="color:#7ab3d4">$1</span><span style="color:#9ec5db">$2</span>')
    // Inline code: peach
    .replace(
      /(`[^`]+`)/g,
      '<span style="color:#e8a87c;background:rgba(232,168,124,0.12);padding:1px 4px;border-radius:3px;font-family:\'JetBrains Mono\',monospace">$1</span>'
    )
    // List items: muted cream
    .replace(/^(- .*)$/gm, '<span style="color:#b8a48e">$1</span>')
    // Bold: cream bright
    .replace(/^(\*\*[^*]+\*\*)/gm, '<span style="color:#f0e6d3;font-weight:600">$1</span>');
}

export function CodePreview({ content, lineCount }: CodePreviewProps) {
  void lineCount; // kept for future use
  const highlighted = useMemo(() => highlightMarkdown(content), [content]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Code body only — no header bar */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          background: TOKENS.bg,
          padding: "20px 24px",
        }}
      >
        <pre
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12.5,
            lineHeight: 1.75,
            color: "#e8d5b7",
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}
