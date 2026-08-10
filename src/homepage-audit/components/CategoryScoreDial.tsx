import type { FC } from 'react';

interface CategoryScoreDialProps {
  score: number;
  maxScore?: number;
  /** Animation progress 0→1 — drives arc fill and number count-up */
  progress: number;
  /** Unique suffix to prevent SVG filter ID collisions across scenes */
  id?: string;
  /** Gradient stop colors */
  gradStart?: string;
  gradMid?: string;
  gradEnd?: string;
  /** Rendered size in px — scales the entire dial proportionally. Default 220. */
  size?: number;
}

const BASE       = 220;  // original viewBox size
const RADIUS     = 92;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 578.05

export const CategoryScoreDial: FC<CategoryScoreDialProps> = ({
  score,
  maxScore    = 100,
  progress,
  id          = 'cat',
  gradStart   = '#4f9cf9',
  gradMid     = '#a855f7',
  gradEnd     = '#10b981',
  size        = BASE,
}) => {
  const filledDash   = progress * (score / maxScore) * CIRCUMFERENCE;
  const displayScore = Math.round(progress * score);
  const scale        = size / BASE;

  const gradId = `cat-grad-${id}`;
  const glowId = `cat-glow-${id}`;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Radial atmosphere */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 60%, rgba(79,156,249,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <svg
        viewBox={`0 0 ${BASE} ${BASE}`}
        width={size}
        height={size}
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={gradStart} />
            <stop offset="45%"  stopColor={gradMid} />
            <stop offset="100%" stopColor={gradEnd} />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer track */}
        <circle cx="110" cy="110" r={RADIUS}
          fill="none" stroke="#141c30" strokeWidth="16"
        />

        {/* Inner atmosphere fill */}
        <circle cx="110" cy="110" r="76" fill="#0b0f1e" />
        <circle cx="110" cy="110" r="76" fill="none" stroke="#131c30" strokeWidth="1.5" />

        {/* Subtle dotted ring */}
        <circle cx="110" cy="110" r="84"
          fill="none" stroke="#1a2440" strokeWidth="1"
          strokeDasharray="2 8"
        />

        {/* Animated gradient arc */}
        <circle
          cx="110" cy="110" r={RADIUS}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filledDash} ${CIRCUMFERENCE}`}
          strokeDashoffset="0"
          filter={`url(#${glowId})`}
          transform="rotate(-90 110 110)"
        />

        {/* Bright tail dot that tracks the arc end */}
        <circle
          cx="110" cy="110" r={RADIUS}
          fill="none"
          stroke="#00ffcc"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`3 ${CIRCUMFERENCE - 3}`}
          strokeDashoffset={-(Math.max(0, filledDash - 3))}
          transform="rotate(-90 110 110)"
          opacity={progress > 0.01 ? 0.9 : 0}
        />

        {/* Score number — scale font inversely so it stays visually correct */}
        <text
          x="110" y="124"
          textAnchor="middle"
          fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
          fontSize={Math.round(68 / scale)}
          fontWeight="900"
          fill="#ffffff"
          letterSpacing="-2"
        >
          {displayScore}
        </text>

        {/* /maxScore label */}
        <text
          x="110" y="148"
          textAnchor="middle"
          fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
          fontSize={Math.round(18 / scale)}
          fill="#6b7a9e"
        >
          /{maxScore}
        </text>
      </svg>
    </div>
  );
};
