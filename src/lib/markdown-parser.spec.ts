import { describe, it, expect } from 'vitest';
import { parseMarkdown } from './markdown-parser';

describe('parseMarkdown', () => {
  it('extracts H1 title from markdown', () => {
    const result = parseMarkdown('# Hello World\n\nSome content');
    expect(result.title).toBe('Hello World');
  });

  it('extracts first blockquote as description', () => {
    const result = parseMarkdown('# Title\n\n> This is the description\n\n> Another quote');
    expect(result.description).toBe('This is the description');
  });

  it('extracts file links with title and url', () => {
    const result = parseMarkdown(
      '# Title\n\n- [Getting Started](./getting-started.md)\n- [API Reference](./api.md)',
    );
    expect(result.links).toHaveLength(2);
    expect(result.links[0]).toEqual({ title: 'Getting Started', url: './getting-started.md' });
    expect(result.links[1]).toEqual({ title: 'API Reference', url: './api.md' });
  });

  it('detects presence of quote block', () => {
    const withQuote = parseMarkdown('# Title\n\n> A quote\n\n- [Link](./file.md)');
    expect(withQuote.hasQuoteBlock).toBe(true);

    const withoutQuote = parseMarkdown('# Title\n\n- [Link](./file.md)');
    expect(withoutQuote.hasQuoteBlock).toBe(false);
  });

  it('handles empty content gracefully', () => {
    const result = parseMarkdown('');
    expect(result.title).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.links).toEqual([]);
    expect(result.hasQuoteBlock).toBe(false);
  });

  it('handles content with no links', () => {
    const result = parseMarkdown('# Title\n\n> Description text\n\nSome content without links');
    expect(result.links).toEqual([]);
    expect(result.hasQuoteBlock).toBe(true);
  });

  it('extracts title at any position in content', () => {
    const result = parseMarkdown('Some text before\n\n# My Title\n\nContent after');
    expect(result.title).toBe('My Title');
  });

  it('extracts first blockquote regardless of position', () => {
    const result = parseMarkdown('# Title\n\n# Not a quote\n\n> First quote\n\n> Second quote');
    expect(result.description).toBe('First quote');
  });
});
