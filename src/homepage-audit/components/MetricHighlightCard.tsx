import type { FC, ReactElement } from 'react';

interface MetricHighlightCardProps {
  /** Left icon element (e.g. AaCircle, or any 58px visual) */
  iconEl: ReactElement;

  /** Uppercase label above the score */
  label: string;

  /** Already-animated score value (count-up happens in scene) */
  score: number | string;

  /** Denominator — renders as "/maxScore" */
  maxScore?: number;

  /** Body description text */
  description: string;

  /** Primary accent color for score number and label */
  accentColor?: string;

  /** Optional right-side chart element */
  chartEl?: ReactElement;

  opacity?: number;
  translateY?: number;
}

export const MetricHighlightCard: FC<MetricHighlightCardProps> = ({
  iconEl,
  label,
  score,
  maxScore     = 100,
  description,
  accentColor  = '#a855f7',
  chartEl,
  opacity      = 1,
  translateY   = 0,
}) => (
  <div style={{
    background: 'rgba(17,18,32,0.56)',
    border: '1px solid #1e1d38',
    borderRadius: 14,
    padding: '20px 22px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    overflow: 'hidden',
    position: 'relative',
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    {/* Icon slot */}
    <div style={{ flexShrink: 0 }}>{iconEl}</div>

    {/* Middle: label + score */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 120 }}>
      <div style={{
        fontSize: 12, fontWeight: 700, letterSpacing: '2px',
        textTransform: 'uppercase', color: '#8882b0',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 42, fontWeight: 900, color: accentColor,
        lineHeight: 1, letterSpacing: '-1px',
        display: 'flex', alignItems: 'baseline', gap: 4,
      }}>
        {score}
        <span style={{ fontSize: 18, fontWeight: 500, color: '#5a597a' }}>/{maxScore}</span>
      </div>
    </div>

    {/* Description */}
    <div style={{
      fontSize: 13, color: '#7a7898',
      lineHeight: 1.55, maxWidth: 260, flex: 1,
    }}>
      {description}
    </div>

    {/* Optional chart */}
    {chartEl && (
      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
        {chartEl}
      </div>
    )}
  </div>
);
