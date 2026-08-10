import type { FC, ReactElement } from 'react';

// ── Icon registry — kept inside component, not exposed to scenes ───────────────

const ICONS: Record<string, ReactElement> = {
  'llms-txt': (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  ),
  schema: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  faq: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="12" y2="14" />
    </svg>
  ),
  clarity: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="9"  x2="10" y2="9"  />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  ),
};

const FALLBACK_ICON: ReactElement = (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
    stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8"  x2="12"   y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

interface AiIssueCardProps {
  iconType: string;
  name: string;
  description: string;
  impact?: string;
  badge?: string;
  opacity?: number;
  translateY?: number;
}

export const AiIssueCard: FC<AiIssueCardProps> = ({
  iconType,
  name,
  description,
  impact      = 'High Impact',
  badge       = 'Critical',
  opacity     = 1,
  translateY  = 0,
}) => (
  <div style={{
    background: '#11121e',
    border: '1px solid #1e1d34',
    borderRadius: 12,
    padding: '14px 16px 18px',
    display: 'flex', flexDirection: 'column', gap: 12,
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    {/* Badge */}
    <span style={{
      alignSelf: 'flex-start',
      background: '#2a1010', border: '1px solid #7f1d1d',
      color: '#ef4444', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px',
      textTransform: 'uppercase', padding: '3px 9px', borderRadius: 4,
    }}>
      {badge}
    </span>

    {/* Icon (raw, no circle wrapper) */}
    <div>{ICONS[iconType] ?? FALLBACK_ICON}</div>

    {/* Name */}
    <div style={{ fontSize: 15, fontWeight: 700, color: '#f0eef8', lineHeight: 1.3 }}>
      {name}
    </div>

    {/* Description */}
    <div style={{ fontSize: 12, color: '#5a597a', lineHeight: 1.5, flex: 1 }}>
      {description}
    </div>

    {/* Impact */}
    <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginTop: 'auto' }}>
      {impact}
    </div>
  </div>
);
