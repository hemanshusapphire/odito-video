import type { FC, ReactElement } from 'react';

interface AuditSummaryMetricCardProps {
  iconEl: ReactElement;
  iconBg: string;
  iconBorder: string;
  displayValue: number;
  valueColor: string;
  label: string;
  description: string;
  opacity?: number;
  translateY?: number;
}

export const AuditSummaryMetricCard: FC<AuditSummaryMetricCardProps> = ({
  iconEl,
  iconBg,
  iconBorder,
  displayValue,
  valueColor,
  label,
  description,
  opacity    = 1,
  translateY = 0,
}) => (
  <div style={{
    flex: 1,
    background: '#10121f',
    border: '1px solid #1e1d34',
    borderRadius: 14,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: '50%',
      background: iconBg, border: `1px solid ${iconBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {iconEl}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{
        fontSize: 42, fontWeight: 900, lineHeight: 1,
        letterSpacing: '-1px', color: valueColor,
      }}>
        {displayValue.toLocaleString()}
      </div>
      <div style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.9px',
        textTransform: 'uppercase', color: 'rgba(255,255,255,.45)',
        marginTop: 3,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>
        {description}
      </div>
    </div>
  </div>
);
