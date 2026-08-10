import type { FC, ReactElement } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export interface PerformanceMetric {
  label: string;
  value: string;
  rating?: MetricRating;
}

// ── Rating color tokens ───────────────────────────────────────────────────────

const RATING: Record<MetricRating, { text: string; bg: string; border: string; label: string }> = {
  good:                { text: '#22c55e', bg: '#071610', border: '#14532d', label: 'Good'    },
  'needs-improvement': { text: '#f59e0b', bg: '#120d00', border: '#78350f', label: 'Improve' },
  poor:                { text: '#ef4444', bg: '#120606', border: '#7f1d1d', label: 'Poor'    },
};

// ── Score color (Lighthouse convention) ──────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

// ── Device icons ──────────────────────────────────────────────────────────────

const DEVICE_ICON: Record<'mobile' | 'desktop', ReactElement> = {
  mobile: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  desktop: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <polyline points="8 21 12 17 16 21" />
    </svg>
  ),
};

// ── Component ─────────────────────────────────────────────────────────────────

interface PerformanceMetricsCardProps {
  device: 'mobile' | 'desktop';
  /** Already-animated score value (count-up computed in scene) */
  score: number;
  maxScore?: number;
  metrics: PerformanceMetric[];
  accentColor?: string;
  opacity?: number;
  translateY?: number;
  /** Per-row opacity values (stagger computed in scene) */
  metricOpacities?: number[];
  metricTranslateYs?: number[];
}

export const PerformanceMetricsCard: FC<PerformanceMetricsCardProps> = ({
  device,
  score,
  maxScore       = 100,
  metrics,
  accentColor    = '#f59e0b',
  opacity        = 1,
  translateY     = 0,
  metricOpacities,
  metricTranslateYs,
}) => {
  const color = scoreColor(score);

  return (
    <div style={{
      background: '#111220',
      border: '1px solid #1e1d34',
      borderRadius: 14,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      opacity,
      transform: `translateY(${translateY}px)`,
    }}>
      {/* Top accent stripe */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${accentColor}55 0%, ${accentColor} 100%)`,
        flexShrink: 0,
      }} />

      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* ── Card header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {/* Device badge */}
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}44`,
            color: accentColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {DEVICE_ICON[device]}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f0eef8', lineHeight: 1.2 }}>
              {device === 'mobile' ? 'Mobile' : 'Desktop'}
            </div>
            <div style={{
              fontSize: 10.5, color: '#5a597a',
              letterSpacing: '1.8px', textTransform: 'uppercase', marginTop: 2,
            }}>
              Performance
            </div>
          </div>

          {/* Score — top-right */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontSize: 38, fontWeight: 900, color,
              lineHeight: 1, letterSpacing: '-1.5px',
            }}>
              {score}
            </div>
            <div style={{ fontSize: 11, color: '#5a597a', marginTop: 1 }}>/ {maxScore}</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#1e1d34', marginBottom: 14 }} />

        {/* ── Metric rows ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {metrics.map((metric, i) => {
            const r       = metric.rating ? RATING[metric.rating] : null;
            const rowOp   = metricOpacities?.[i]   ?? 1;
            const rowY    = metricTranslateYs?.[i]  ?? 0;
            const isLast  = i === metrics.length - 1;

            return (
              <div key={metric.label} style={{
                display: 'flex', alignItems: 'center',
                padding: '8px 0',
                borderBottom: isLast ? 'none' : '1px solid #16152a',
                opacity: rowOp,
                transform: `translateY(${rowY}px)`,
              }}>
                {/* Label */}
                <div style={{
                  fontSize: 12.5, fontWeight: 500, color: '#7a789e',
                  minWidth: 90, flexShrink: 0,
                }}>
                  {metric.label}
                </div>

                {/* Value */}
                <div style={{
                  fontSize: 13.5, fontWeight: 700, color: '#f0eef8', flex: 1,
                }}>
                  {metric.value}
                </div>

                {/* Rating pill */}
                {r && (
                  <div style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    color: r.text,
                    background: r.bg,
                    border: `1px solid ${r.border}`,
                    borderRadius: 4,
                    padding: '2px 7px',
                    flexShrink: 0,
                  }}>
                    {r.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
