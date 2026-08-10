import type { FC, ReactElement } from 'react';

export type ImpactLevel = 'High' | 'Medium' | 'Low';

const IMPACT: Record<ImpactLevel, { text: string; bg: string; border: string; label: string }> = {
  High:   { text: '#ef4444', bg: '#120606', border: '#7f1d1d', label: 'High Impact'   },
  Medium: { text: '#f59e0b', bg: '#120d00', border: '#78350f', label: 'Medium Impact' },
  Low:    { text: '#22c55e', bg: '#071610', border: '#14532d', label: 'Low Impact'    },
};

interface LocalSeoOpportunityCardProps {
  iconEl: ReactElement;
  iconBg: string;
  title: string;
  description: string;
  impact: ImpactLevel;
  opacity?: number;
  translateY?: number;
}

export const LocalSeoOpportunityCard: FC<LocalSeoOpportunityCardProps> = ({
  iconEl,
  iconBg,
  title,
  description,
  impact,
  opacity    = 1,
  translateY = 0,
}) => {
  const imp = IMPACT[impact] ?? IMPACT.High;
  return (
    <div style={{
      background: '#13142a',
      border: '1px solid #1e1d38',
      borderRadius: 14,
      padding: '20px 18px 18px',
      display: 'flex', flexDirection: 'column', gap: 12,
      opacity,
      transform: `translateY(${translateY}px)`,
    }}>
      {/* Icon circle */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {iconEl}
      </div>

      {/* Title */}
      <div style={{ fontSize: 15, fontWeight: 700, color: '#f0eef8' }}>{title}</div>

      {/* Description */}
      <div style={{
        fontSize: 12.5, color: 'rgba(255,255,255,.4)', lineHeight: 1.55, flex: 1,
      }}>
        {description}
      </div>

      {/* Impact badge */}
      <div style={{
        alignSelf: 'flex-start',
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.4px',
        color: imp.text, background: imp.bg,
        border: `1px solid ${imp.border}`,
        borderRadius: 4, padding: '3px 9px',
      }}>
        {imp.label}
      </div>
    </div>
  );
};
