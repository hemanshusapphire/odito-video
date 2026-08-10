import type { FC, ReactElement } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChecklistStatus = 'connected' | 'warning' | 'missing';

export interface ChecklistItem {
  iconType: string;
  label: string;
  status: ChecklistStatus;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ChecklistStatus, {
  label: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  statusIcon: ReactElement;
}> = {
  connected: {
    label: 'Connected',
    textColor: '#22c55e',
    badgeBg: '#071610',
    badgeBorder: '#14532d',
    statusIcon: (
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: '1.5px solid #22c55e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="11" height="11" viewBox="0 0 12 12">
          <polyline points="2,6 5,9 10,3" fill="none" stroke="#22c55e"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
  },
  warning: {
    label: 'Missing',
    textColor: '#f59e0b',
    badgeBg: '#120d00',
    badgeBorder: '#78350f',
    statusIcon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9"  x2="12"   y2="13" />
        <circle cx="12" cy="17" r="1" fill="#f59e0b" stroke="none" />
      </svg>
    ),
  },
  missing: {
    label: 'Not Found',
    textColor: '#ef4444',
    badgeBg: '#120606',
    badgeBorder: '#7f1d1d',
    statusIcon: (
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: '1.5px solid #ef4444',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="10" height="10" viewBox="0 0 12 12">
          <line x1="2" y1="2" x2="10" y2="10" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="2" x2="2"  y2="10" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
};

// ── Checklist icon registry ───────────────────────────────────────────────────

const CHECKLIST_ICONS: Record<string, { iconEl: ReactElement; bg: string; border: string }> = {
  verified: {
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    bg: '#071610', border: '#14532d',
  },
  phone: {
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#7c6cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.19h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.86-.95a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2.03z" />
      </svg>
    ),
    bg: '#12103a', border: '#2a2568',
  },
  website: {
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#7ab0f8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    bg: '#0a1428', border: '#1a2a50',
  },
  address: {
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#7c6cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    bg: '#12103a', border: '#2a2568',
  },
  photos: {
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    bg: '#120d00', border: '#78350f',
  },
  services: {
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    bg: '#120d00', border: '#78350f',
  },
  posts: {
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    ),
    bg: '#1a0606', border: '#7f1d1d',
  },
};

const FALLBACK_ICON = {
  iconEl: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#7c6cf8" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  bg: '#12103a', border: '#2a2568',
};

// ── Component ─────────────────────────────────────────────────────────────────

interface LocalBusinessChecklistCardProps {
  header?: string;
  items: ChecklistItem[];
  itemOpacities?: number[];
  itemTranslateYs?: number[];
  opacity?: number;
  translateX?: number;
}

export const LocalBusinessChecklistCard: FC<LocalBusinessChecklistCardProps> = ({
  header        = 'Business Presence Checklist',
  items,
  itemOpacities,
  itemTranslateYs,
  opacity       = 1,
  translateX    = 0,
}) => (
  <div style={{
    background: '#10121f',
    border: '1px solid #1e1d34',
    borderRadius: 16,
    padding: '20px 20px 10px',
    opacity,
    transform: `translateX(${translateX}px)`,
  }}>
    <div style={{ fontSize: 14, fontWeight: 600, color: '#f0eef8', marginBottom: 16 }}>
      {header}
    </div>

    {items.map((item, i) => {
      const icon   = CHECKLIST_ICONS[item.iconType] ?? FALLBACK_ICON;
      const status = STATUS_CONFIG[item.status]      ?? STATUS_CONFIG.missing;
      const rowOp  = itemOpacities?.[i]   ?? 1;
      const rowY   = itemTranslateYs?.[i] ?? 0;
      const isLast = i === items.length - 1;

      return (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '12px 0',
          borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,.06)',
          opacity: rowOp,
          transform: `translateY(${rowY}px)`,
        }}>
          {/* Row icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 9,
            background: icon.bg, border: `1px solid ${icon.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon.iconEl}
          </div>

          {/* Label */}
          <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: '#d4d2e8' }}>
            {item.label}
          </div>

          {/* Status badge */}
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.4px',
            color: status.textColor,
            background: status.badgeBg,
            border: `1px solid ${status.badgeBorder}`,
            borderRadius: 4, padding: '3px 9px',
            flexShrink: 0,
          }}>
            {status.label}
          </div>

          {/* Status icon */}
          <div style={{ flexShrink: 0 }}>{status.statusIcon}</div>
        </div>
      );
    })}
  </div>
);
