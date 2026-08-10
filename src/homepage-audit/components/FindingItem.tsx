import type { FC, ReactElement } from 'react';

interface FindingItemProps {
  iconEl: ReactElement;
  iconBackground: string;
  iconBorderColor: string;
  name: string;
  description: string;
  affectedCount: number | string;
  affectedLabel?: string;
  /** Color of the count number (default red) */
  countColor?: string;
  isLast?: boolean;
  opacity?: number;
  translateY?: number;
}

export const FindingItem: FC<FindingItemProps> = ({
  iconEl,
  iconBackground,
  iconBorderColor,
  name,
  description,
  affectedCount,
  affectedLabel = 'Pages Affected',
  countColor    = '#ef4444',
  isLast        = false,
  opacity       = 1,
  translateY    = 0,
}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '13px 0',
    borderBottom: isLast ? 'none' : '1px solid #151d34',
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    {/* Icon circle */}
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: iconBackground,
      border: `1.5px solid ${iconBorderColor}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {iconEl}
    </div>

    {/* Text body */}
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#e8eaf0' }}>{name}</div>
      <div style={{ fontSize: 12, color: '#6b7a9e', marginTop: 3 }}>{description}</div>
    </div>

    {/* Vertical divider */}
    <div style={{ width: 1, height: 44, background: '#1a2240', flexShrink: 0 }} />

    {/* Count */}
    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
      <span style={{ fontSize: 26, fontWeight: 900, color: countColor, display: 'block', lineHeight: 1 }}>
        {affectedCount}
      </span>
      <span style={{ fontSize: 11, color: '#6b7a9e', marginTop: 2, display: 'block' }}>
        {affectedLabel}
      </span>
    </div>
  </div>
);
