import type { FC, ReactElement } from 'react';

interface AccessibilityMetricCardProps {
  iconEl: ReactElement;
  /** Already-animated count value (count-up computed in scene) */
  value: number | string;
  label: string;
  description: string;
  accentColor: string;
  iconBg?: string;
  iconBorder?: string;
  /** Animated bar fill 0-100 (computed in scene via interpolate) */
  barWidth: number;
  opacity?: number;
  translateY?: number;
}

export const AccessibilityMetricCard: FC<AccessibilityMetricCardProps> = ({
  iconEl,
  value,
  label,
  description,
  accentColor,
  iconBg     = 'rgba(124,108,248,.1)',
  iconBorder = 'rgba(124,108,248,.45)',
  barWidth   = 0,
  opacity    = 1,
  translateY = 0,
}) => (
  <div style={{
    background: '#111220',
    border: '1px solid #1e1d34',
    borderRadius: 12,
    padding: '20px 18px 18px',
    display: 'flex',
    flexDirection: 'column',
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    {/* Icon + large number */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: iconBg,
        border: `2px solid ${iconBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {iconEl}
      </div>
      <div style={{
        fontSize: 52, fontWeight: 700, lineHeight: 1,
        color: accentColor, letterSpacing: '-2px',
      }}>
        {value}
      </div>
    </div>

    {/* Label */}
    <div style={{ fontSize: 15, fontWeight: 600, color: '#f0eef8', marginBottom: 5 }}>
      {label}
    </div>

    {/* Description */}
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.45, flex: 1 }}>
      {description}
    </div>

    {/* Dynamic progress bar */}
    <div style={{
      height: 4, borderRadius: 4, marginTop: 16,
      background: 'rgba(255,255,255,.06)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${Math.min(100, Math.max(0, barWidth))}%`,
        borderRadius: 4,
        background: accentColor,
      }} />
    </div>
  </div>
);
