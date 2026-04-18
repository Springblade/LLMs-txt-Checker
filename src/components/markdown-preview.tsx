"use client";

interface MarkdownPreviewProps {
  content: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMarkdown(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    // Separator — skip
    if (/^[-*_]{3,}$/.test(trimmed)) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      continue;
    }

    // H1
    const h1Match = trimmed.match(/^# (.+)$/);
    if (h1Match) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push(
        `<h1 class="font-display" style="font-size:var(--font-size-h2);color:var(--color-text);letter-spacing:-0.01em;margin-bottom:1rem;margin-top:0;font-weight:400;line-height:1.1">${escapeHtml(
          h1Match[1] ?? ""
        )}</h1>`
      );
      continue;
    }

    // H2
    const h2Match = trimmed.match(/^## (.+)$/);
    if (h2Match) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push(
        `<h2 style="font-size:var(--font-size-h3);color:var(--color-text);margin-bottom:0.75rem;margin-top:1.5rem;font-weight:500;line-height:1.3">${escapeHtml(
          h2Match[1] ?? ""
        )}</h2>`
      );
      continue;
    }

    // H3+
    const h3Match = trimmed.match(/^(#{3,}) (.+)$/);
    if (h3Match) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      const level = h3Match[1]?.length ?? 3;
      const sizeClass =
        level === 3
          ? "var(--font-size-body)"
          : "var(--font-size-small)";
      result.push(
        `<h${level} style="font-size:${sizeClass};color:var(--color-text);margin-bottom:0.5rem;margin-top:1rem;font-weight:500;line-height:1.4">${escapeHtml(
          h3Match[2] ?? ""
        )}</h${level}>`
      );
      continue;
    }

    // Blockquote
    const bqMatch = trimmed.match(/^> (.+)$/);
    if (bqMatch) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push(
        `<blockquote style="border-left:3px solid var(--color-border-strong);padding-left:1rem;margin:1rem 0;color:var(--color-text-secondary);font-style:italic;background:var(--color-bg-secondary);padding:0.75rem 1rem;border-radius:0 var(--radius) var(--radius) 0">${escapeHtml(
          bqMatch[1] ?? ""
        )}</blockquote>`
      );
      continue;
    }

    // List item with optional description
    const linkMatch = trimmed.match(/^\- \[([^\]]+)\]\(([^)]+)\)(?::\s*(.+))?$/);
    if (linkMatch) {
      if (!inList) {
        result.push(
          '<ul style="list-style:disc;padding-left:1.25rem;margin:0.75rem 0;display:flex;flex-direction:column;gap:0.25rem">'
        );
        inList = true;
      }
      const title = linkMatch[1] ?? "";
      const url = linkMatch[2] ?? "";
      const description = linkMatch[3] ?? "";
      if (description) {
        result.push(
          `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color:var(--color-text);font-weight:500;text-decoration:none" class="hover-arrow">${escapeHtml(
            title
          )}</a><span style="color:var(--color-text-secondary);font-size:0.875rem;margin-left:0.5rem">— ${escapeHtml(
            description
          )}</span></li>`
        );
      } else {
        result.push(
          `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary);text-decoration:none" class="hover-arrow">${escapeHtml(
            title
          )}</a></li>`
        );
      }
      continue;
    }

    // Close list on non-list line
    if (inList) {
      result.push("</ul>");
      inList = false;
    }

    // Empty line
    if (trimmed === "") {
      continue;
    }

    // Paragraph
    result.push(
      `<p style="color:var(--color-text);line-height:1.7;margin:0.375rem 0">${escapeHtml(
        trimmed
      )}</p>`
    );
  }

  if (inList) {
    result.push("</ul>");
  }

  return result.join("\n");
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <div
        className="px-5 py-12 text-center"
        style={{ color: "var(--color-text-muted)" }}
      >
        No content available
      </div>
    );
  }

  const html = renderMarkdown(content);

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
        boxShadow: "var(--shadow-golden-sm)",
        minHeight: "200px",
      }}
    >
      <style>{`
        .markdown-body a {
          color: var(--color-primary);
          text-decoration: none;
          transition: opacity 0.15s ease;
        }
        .markdown-body a:hover {
          opacity: 0.75;
        }
        .markdown-body h1:first-child,
        .markdown-body h2:first-child,
        .markdown-body h3:first-child {
          margin-top: 0 !important;
        }
        .markdown-body ul {
          list-style: disc;
          padding-left: 1.25rem;
          margin: 0.75rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .markdown-body li {
          line-height: 1.6;
        }
      `}</style>
      <div
        className="markdown-body text-sm"
        style={{ lineHeight: 1.6 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
