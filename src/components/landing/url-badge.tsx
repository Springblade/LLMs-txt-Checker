'use client';

interface UrlBadgeProps {
  url: string;
}

export function UrlBadge({ url }: UrlBadgeProps) {
  const displayUrl = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: 'var(--mm-bg-secondary)',
        border: '1px solid var(--mm-border)',
        borderRadius: 6,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--mm-success)',
          flexShrink: 0,
          boxShadow: '0 0 6px var(--mm-success)',
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          color: 'var(--mm-text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 240,
        }}
      >
        {displayUrl}
      </span>
    </div>
  );
}
