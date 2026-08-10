import type { FC, ReactElement } from 'react';

interface InsightBannerProps {
  iconEl: ReactElement;
  opacity?: number;
  translateY?: number;

  // Single-text mode (Screen 2 style)
  text?: string;

  // Title + subtitle mode (Screen 3+ CTA style)
  title?: string;
  subtitle?: string;
  showArrow?: boolean;

  // Visual overrides
  background?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: string;

  // Optional right-side decorative element
  rightEl?: ReactElement;
}

export const InsightBanner: FC<InsightBannerProps> = ({
  iconEl,
  opacity      = 1,
  translateY   = 0,
  text,
  title,
  subtitle,
  showArrow    = false,
  background   = '#0c1230',
  borderColor  = '#1a2448',
  borderRadius = 14,
  padding      = '18px 22px',
  rightEl,
}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 16,
    background, border: `1px solid ${borderColor}`,
    borderRadius, padding,
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    {/* Icon */}
    <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {iconEl}
    </div>

    {/* Body — single text OR title+subtitle */}
    {title || subtitle ? (
      <div style={{ flex: 1 }}>
        {title    && <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{title}</div>}
        {subtitle && <div style={{ fontSize: 12.5, color: '#6b7a9e', marginTop: 4 }}>{subtitle}</div>}
      </div>
    ) : (
      <div style={{ flex: 1, fontSize: 13.5, color: '#8090b8', lineHeight: 1.6 }}>{text}</div>
    )}

    {/* Optional arrow indicator */}
    {showArrow && (
      <div style={{ fontSize: 22, color: '#6b7a9e', marginLeft: 'auto', flexShrink: 0 }}>›</div>
    )}

    {/* Optional right decorative element */}
    {rightEl && (
      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
        {rightEl}
      </div>
    )}
  </div>
);
