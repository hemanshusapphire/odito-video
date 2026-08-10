import type { FC } from 'react';

interface AiVisibilitySummaryProps {
  /** Status pill label — e.g. "Low Visibility" */
  statusLabel?: string;
  /** Animated critical issue count (count-up computed in scene) */
  criticalCount?: number;
  /** Subtitle below the critical count */
  criticalSubtitle?: string;
  opacity?: number;
  translateY?: number;
}

export const AiVisibilitySummary: FC<AiVisibilitySummaryProps> = ({
  statusLabel     = 'Low Visibility',
  criticalCount   = 0,
  criticalSubtitle = 'These issues may be limiting your content\'s visibility in AI-generated answers.',
  opacity         = 1,
  translateY      = 0,
}) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    {/* Status pill */}
    <div style={{
      border: '1.5px solid #6d28d9',
      borderRadius: 20,
      padding: '8px 20px',
      fontSize: 13, fontWeight: 700, letterSpacing: '1px',
      color: '#a855f7',
      textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {statusLabel}
      {/* Chevron down */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>

    {/* Critical issues count box */}
    <div style={{
      width: '100%',
      background: '#150f28',
      border: '1px solid #2a1f50',
      borderRadius: 12,
      padding: 16,
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      {/* Alert icon circle */}
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: '#1e0a0a', border: '1.5px solid #7f1d1d',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9"  x2="12"   y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <div>
        <div style={{
          fontSize: 16, fontWeight: 700, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#ef4444', fontSize: 20, fontWeight: 900 }}>{criticalCount}</span>
          Critical AI Issues
        </div>
        <div style={{
          fontSize: 12.5, color: '#5a597a', marginTop: 5, lineHeight: 1.5,
        }}>
          {criticalSubtitle}
        </div>
      </div>
    </div>
  </div>
);
