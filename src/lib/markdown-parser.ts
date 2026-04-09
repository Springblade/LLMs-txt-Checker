import type { ParsedData, LinkData } from './types';

const H1_TITLE_REGEX = /^#\s+(.+)$/m;
const BLOCKQUOTE_REGEX = /^>\s*(.+)$/m;
const FILE_LINK_REGEX = /^\- \[([^\]]+)\]\(([^)]+)\)(?::\s*(.+))?$/gm;
const H2_PLUS_REGEX = /^#{2,}\s+.+$/gm;
const SEPARATOR_REGEX = /^[-*_]{3,}$/;

export function parseMarkdown(content: string): ParsedData {
  const lines = content.split('\n');

  const h1Match = content.match(H1_TITLE_REGEX);
  const title = h1Match ? h1Match[1] : undefined;

  const quoteMatch = content.match(BLOCKQUOTE_REGEX);
  const description = quoteMatch ? quoteMatch[1] : undefined;

  const hasQuoteBlock = BLOCKQUOTE_REGEX.test(content);

  const headingCount = (content.match(H2_PLUS_REGEX) ?? []).length;

  const links: LinkData[] = [];
  for (const match of content.matchAll(FILE_LINK_REGEX)) {
    const linkTitle = match[1];
    const linkUrl = match[2];
    const linkDescription = match[3];
    if (linkTitle !== undefined && linkUrl !== undefined) {
      links.push({
        title: linkTitle,
        url: linkUrl,
        ...(linkDescription !== undefined && { description: linkDescription }),
      });
    }
  }

  const descriptions: string[] = [];
  let foundQuoteBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') continue;
    if (SEPARATOR_REGEX.test(trimmed)) continue;
    if (/^#{1,3}\s/.test(trimmed)) continue;

    if (/^>\s/.test(trimmed)) {
      foundQuoteBlock = true;
      continue;
    }

    if (/^\- \[/.test(trimmed)) continue;

    if (trimmed.startsWith('#')) continue;

    if (!foundQuoteBlock) continue;

    descriptions.push(trimmed);
  }

  return {
    title,
    description,
    descriptions,
    links,
    hasQuoteBlock,
    headingCount,
  };
}
