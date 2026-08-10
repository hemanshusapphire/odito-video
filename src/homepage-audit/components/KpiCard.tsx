import type { FC, ReactElement } from 'react';

interface KpiCardProps {
  value: number | string;
  label: string;
  color: string;
  iconEl: ReactElement;
  opacity?: number;
  translateY?: number;
}

export const KpiCard: FC<KpiCardProps> = ({
  value,
  label,
  color,
  iconEl,
  opacity = 1,
  translateY = 0,
}) => (
  <div style={{
    background: '#0c1230', border: '1px solid #1a2448', borderRadius: 12,
    padding: '16px 18px',
    display: 'flex', flexDirection: 'column', gap: 8,
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{
        fontSize: 38, fontWeight: 900, lineHeight: 1,
        letterSpacing: '-1px', color,
      }}>
        {value}
      </div>
      <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {iconEl}
      </div>
    </div>
    <div style={{ fontSize: 13, color: '#8090b8', fontWeight: 500 }}>{label}</div>
  </div>
);
