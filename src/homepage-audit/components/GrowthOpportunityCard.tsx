import type { FC, ReactElement } from 'react';

export type OpportunityImpact = 'high' | 'medium' | 'low';

const IMPACT_CONFIG: Record<OpportunityImpact, { label: string; text: string; bg: string; border: string }> = {
  high:   { label: 'HIGH IMPACT',   text: '#ef4444', bg: '#120606', border: '#7f1d1d' },
  medium: { label: 'MEDIUM IMPACT', text: '#f59e0b', bg: '#120d00', border: '#78350f' },
  low:    { label: 'LOW IMPACT',    text: '#22c55e', bg: '#071610', border: '#14532d' },
};

interface GrowthOpportunityCardProps {
  iconEl: ReactElement;
  iconBg: string;
  iconBorder: string;
  title: string;
  description: string;
  impact: OpportunityImpact;
  isLast?: boolean;
  opacity?: number;
  translateX?: number;
}

export const GrowthOpportunityCard: FC<GrowthOpportunityCardProps> = ({
  iconEl,
  iconBg,
  iconBorder,
  title,
  description,
  impact,
  isLast    = false,
  opacity   = 1,
  translateX = 0,
}) => {
  const imp = IMPACT_CONFIG[impact] ?? IMPACT_CONFIG.medium;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 0',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,.06)',
      opacity,
      transform: `translateX(${translateX}px)`,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: iconBg, border: `1px solid ${iconBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {iconEl}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f0eef8' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.4)' }}>{description}</div>
      </div>

      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
        color: imp.text, background: imp.bg,
        border: `1px solid ${imp.border}`,
        borderRadius: 5, padding: '4px 10px',
        flexShrink: 0,
      }}>
        {imp.label}
      </div>
    </div>
  );
};
