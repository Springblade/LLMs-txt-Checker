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
  const lines = content.split('\n');
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    // Separator — skip
    if (/^[-*_]{3,}$/.test(trimmed)) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      continue;
    }

    // H1
    const h1Match = trimmed.match(/^# (.+)$/);
    if (h1Match) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<h1 class="text-2xl font-bold text-zinc-900 mb-4">${escapeHtml(h1Match[1] ?? "")}</h1>`);
      continue;
    }

    // H2
    const h2Match = trimmed.match(/^## (.+)$/);
    if (h2Match) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<h2 class="text-lg font-semibold text-zinc-800 mt-6 mb-3">${escapeHtml(h2Match[1] ?? "")}</h2>`);
      continue;
    }

    // H3+
    const h3Match = trimmed.match(/^(#{3,}) (.+)$/);
    if (h3Match) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      const level = h3Match[1]?.length ?? 3;
      const sizeClass = level === 3 ? 'text-base' : 'text-sm';
      result.push(`<h${level} class="${sizeClass} font-medium text-zinc-700 mt-4 mb-2">${escapeHtml(h3Match[2] ?? "")}</h${level}>`);
      continue;
    }

    // Blockquote
    const bqMatch = trimmed.match(/^> (.+)$/);
    if (bqMatch) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<blockquote class="border-l-4 border-zinc-300 pl-4 py-1 my-4 text-zinc-600 italic bg-zinc-50 rounded-r-md">${escapeHtml(bqMatch[1] ?? "")}</blockquote>`);
      continue;
    }

    // List item with optional description
    const linkMatch = trimmed.match(/^\- \[([^\]]+)\]\(([^)]+)\)(?::\s*(.+))?$/);
    if (linkMatch) {
      if (!inList) {
        result.push('<ul class="list-disc pl-5 my-3 space-y-1">');
        inList = true;
      }
      const title = linkMatch[1] ?? '';
      const url = linkMatch[2] ?? '';
      const description = linkMatch[3] ?? '';
      if (description) {
        result.push(`<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-zinc-600 hover:underline font-medium">${escapeHtml(title)}</a><span class="text-[var(--color-text-secondary)] text-sm ml-2">— ${escapeHtml(description)}</span></li>`);
      } else {
        result.push(`<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-zinc-600 hover:underline">${escapeHtml(title)}</a></li>`);
      }
      continue;
    }

    // Close list on non-list line
    if (inList) {
      result.push('</ul>');
      inList = false;
    }

    // Empty line
    if (trimmed === '') {
      continue;
    }

    // Paragraph — just text
    result.push(`<p class="text-zinc-700 leading-relaxed my-2">${escapeHtml(trimmed)}</p>`);
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('\n');
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <div className="p-6 text-center text-[var(--color-text-muted)] text-sm">
        No content available
      </div>
    );
  }

  const html = renderMarkdown(content);

  return (
    <div className="p-4 space-y-1 min-h-[200px]">
      <style>{`
        .markdown-body h1:first-child { margin-top: 0; }
        .markdown-body a:hover { opacity: 0.8; }
      `}</style>
      <div
        className="markdown-body text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
