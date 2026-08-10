import type { FC } from 'react';

interface WaveChartProps {
  /** Unique suffix for SVG gradient / filter IDs — prevents collisions if rendered multiple times */
  id?: string;
  accentColor?: string;
  startColor?: string;
}

export const WaveChart: FC<WaveChartProps> = ({
  id          = 'wave',
  accentColor = '#a855f7',
  startColor  = '#6d28d9',
}) => {
  const gradLine = `wave-grad-line-${id}`;
  const gradFill = `wave-grad-fill-${id}`;

  return (
    <svg viewBox="0 0 160 60" width="160" height="60">
      <defs>
        <linearGradient id={gradLine} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={startColor}  stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={gradFill} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={startColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={startColor} stopOpacity="0"   />
        </linearGradient>
      </defs>

      {/* Wave line */}
      <path
        d="M0 45 C20 45 25 30 40 28 C55 26 60 38 80 32 C100 26 110 18 130 15 C145 12 155 8 160 5"
        fill="none"
        stroke={`url(#${gradLine})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Fill under wave */}
      <path
        d="M0 45 C20 45 25 30 40 28 C55 26 60 38 80 32 C100 26 110 18 130 15 C145 12 155 8 160 5 L160 60 L0 60 Z"
        fill={`url(#${gradFill})`}
      />

      {/* End-point dot */}
      <circle cx="160" cy="5" r="4" fill={accentColor} opacity="0.9" />
    </svg>
  );
};
