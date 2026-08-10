import type { FC } from 'react';

interface TotalIssuesCardProps {
  value: number | string;
  label?: string;
  opacity?: number;
  translateY?: number;
}

export const TotalIssuesCard: FC<TotalIssuesCardProps> = ({
  value,
  label = 'Total Issues',
  opacity = 1,
  translateY = 0,
}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 18,
    background: '#0c1230', border: '1px solid #1a2448', borderRadius: 14,
    padding: '20px 24px',
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: '50%',
      background: 'rgba(220,38,38,0.1)',
      border: '2px solid rgba(220,38,38,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }} fill="none" stroke="#ef4444" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8"  x2="12"   y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <div>
      <div style={{ fontSize: 52, fontWeight: 900, color: '#ef4444', lineHeight: 1, letterSpacing: '-2px' }}>
        {value}
      </div>
      <div style={{ fontSize: 14, color: '#8090b8', marginTop: 2, fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);
