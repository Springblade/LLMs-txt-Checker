'use client';

export function IconSidebar() {
  return (
    <div
      style={{
        width: 48,
        flexShrink: 0,
        borderRight: '1px solid var(--mm-border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--mm-bg)',
        height: '100%',
        alignItems: 'center',
        paddingTop: 12,
      }}
    >
      {/* File/results icon — always active */}
      <div
        title="Results"
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'var(--mm-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 0 10px var(--mm-brand)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
    </div>
  );
}
