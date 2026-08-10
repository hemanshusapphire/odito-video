import type { FC, ReactElement } from 'react';

export type StatCardVariant = 'blue' | 'purple' | 'green';

const VARIANT = {
  blue: {
    valueColor:   '#4f9cf9',
    barGradient:  'linear-gradient(90deg,#4f9cf9,#7ab8ff)',
    iconBg:       '#0d1e3a',
    iconBorder:   '#1d3360',
  },
  purple: {
    valueColor:   '#a855f7',
    barGradient:  'linear-gradient(90deg,#a855f7,#c084fc)',
    iconBg:       '#1c0f3a',
    iconBorder:   '#3a1f6a',
  },
  green: {
    valueColor:   '#10b981',
    barGradient:  'linear-gradient(90deg,#10b981,#34d399)',
    iconBg:       '#05201a',
    iconBorder:   '#0d3d2a',
  },
} as const;

interface StatCardProps {
  variant: StatCardVariant;
  value: number | string;
  /** Two-line description — use a newline or pass as-is for single line */
  description: string;
  iconEl: ReactElement;
  opacity?: number;
  translateY?: number;
}

export const StatCard: FC<StatCardProps> = ({
  variant,
  value,
  description,
  iconEl,
  opacity    = 1,
  translateY = 0,
}) => {
  const v = VARIANT[variant];
  return (
    <div style={{
      background: '#111526',
      border: '1px solid #1a2240',
      borderRadius: 12,
      padding: '18px 16px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
      opacity,
      transform: `translateY(${translateY}px)`,
    }}>
      {/* Bottom accent bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: v.barGradient,
      }} />

      {/* Icon box */}
      <div style={{
        width: 38, height: 38, borderRadius: 9,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: v.iconBg,
        border: `1px solid ${v.iconBorder}`,
        flexShrink: 0,
      }}>
        {iconEl}
      </div>

      {/* Value */}
      <div style={{
        fontSize: 34, fontWeight: 900, lineHeight: 1,
        letterSpacing: '-1px',
        color: v.valueColor,
      }}>
        {value}
      </div>

      {/* Description */}
      <div style={{ fontSize: 13, color: '#6b7a9e', lineHeight: 1.35 }}>
        {description}
      </div>
    </div>
  );
};
