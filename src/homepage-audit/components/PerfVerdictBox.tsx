import type { FC, ReactElement } from 'react';

interface PerfVerdictBoxProps {
  title: string;
  subtitle: string;
  iconEl: ReactElement;
  opacity?: number;
  translateY?: number;
  /** Override default top margin (default 36) for different layouts */
  marginTop?: number;
  /** Override default width (default 280) */
  width?: number;
}

export const PerfVerdictBox: FC<PerfVerdictBoxProps> = ({
  title,
  subtitle,
  iconEl,
  opacity = 1,
  translateY = 0,
  marginTop = 36,
  width = 280,
}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    background: '#0c1230', border: '1px solid #1a2448', borderRadius: 12,
    padding: '14px 22px',
    marginTop,
    width,
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    <div style={{ display: 'flex', flexShrink: 0 }}>{iconEl}</div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#5a6a90', fontWeight: 400 }}>{subtitle}</div>
    </div>
  </div>
);
