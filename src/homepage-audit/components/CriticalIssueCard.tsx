import type { FC, ReactElement } from 'react';

interface CriticalIssueCardProps {
  /** Badge label — default "Critical" */
  badge?: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeColor?: string;
  /** Icon element rendered inside the 54px circle */
  iconEl: ReactElement;
  /** Name — use \n for line breaks */
  name: string;
  /** Status text below name — e.g. "Missing", "Weak" */
  status?: string;
  statusColor?: string;
  opacity?: number;
  translateY?: number;
}

export const CriticalIssueCard: FC<CriticalIssueCardProps> = ({
  badge        = 'Critical',
  badgeBg      = '#250c0c',
  badgeBorder  = '#7f1d1d',
  badgeColor   = '#ef4444',
  iconEl,
  name,
  status       = 'Missing',
  statusColor  = '#ef4444',
  opacity      = 1,
  translateY   = 0,
}) => (
  <div style={{
    background: '#130a0a',
    border: '1px solid #2a1010',
    borderRadius: 12,
    padding: '16px 18px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    {/* Badge */}
    <span style={{
      alignSelf: 'flex-start',
      background: badgeBg,
      border: `1px solid ${badgeBorder}`,
      color: badgeColor,
      fontSize: 9.5,
      fontWeight: 700,
      letterSpacing: '1.8px',
      textTransform: 'uppercase',
      padding: '4px 10px',
      borderRadius: 5,
    }}>
      {badge}
    </span>

    {/* Icon circle */}
    <div style={{
      width: 54, height: 54, borderRadius: '50%',
      background: '#1e0808',
      border: '1.5px solid #7f1d1d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {iconEl}
    </div>

    {/* Name + status */}
    <div>
      <div style={{
        fontSize: 16, fontWeight: 700, color: '#f0eef8',
        lineHeight: 1.35, whiteSpace: 'pre-line',
      }}>
        {name}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: statusColor, marginTop: 4 }}>
        {status}
      </div>
    </div>
  </div>
);
