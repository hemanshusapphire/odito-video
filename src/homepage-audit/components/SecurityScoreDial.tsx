import type { FC } from 'react';

const RADIUS       = 128;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 804.25
const CX = 155;
const CY = 155;
const MIN_DASH = 8; // always render a tiny glowing stub even at score=0

interface SecurityScoreDialProps {
  score: number;
  maxScore?: number;
  /** Animation progress 0→1 — drives arc fill and count-up */
  progress: number;
  /** Unique suffix to prevent SVG filter ID collisions */
  id?: string;
}

export const SecurityScoreDial: FC<SecurityScoreDialProps> = ({
  score,
  maxScore   = 100,
  progress,
  id         = 'sec',
}) => {
  const filledDash   = Math.max(MIN_DASH, progress * (score / maxScore) * CIRCUMFERENCE);
  const displayScore = Math.round(progress * score);

  const fGlow  = `sec-glow-${id}`;
  const fGlow2 = `sec-glow2-${id}`;
  const gradId = `sec-dialBg-${id}`;

  return (
    <div style={{ position: 'relative', width: 310, height: 310 }}>
      {/* Red radial glow overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 50%, rgba(180,20,20,0.18) 0%, rgba(120,10,10,0.10) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <svg viewBox="0 0 310 310" width="310" height="310">
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1e0808" stopOpacity="1" />
            <stop offset="100%" stopColor="#0e0505" stopOpacity="1" />
          </radialGradient>

          {/* Strong glow — used on arc and dot */}
          <filter id={fGlow} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Subtle glow — used on shield, score text */}
          <filter id={fGlow2} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer track background */}
        <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="#1e0a0a" strokeWidth="20" />

        {/* Tick dashes on track */}
        <circle cx={CX} cy={CY} r={RADIUS} fill="none"
          stroke="#3d1515" strokeWidth="20"
          strokeDasharray="2.5 6.02" />

        {/* Inner dark-red fill */}
        <circle cx={CX} cy={CY} r="116" fill={`url(#${gradId})`} />
        <circle cx={CX} cy={CY} r="116" fill="none" stroke="#2a0c0c" strokeWidth="1.5" />

        {/* Animated red arc */}
        <circle
          cx={CX} cy={CY} r={RADIUS}
          fill="none"
          stroke="#ef4444"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${filledDash} ${CIRCUMFERENCE}`}
          strokeDashoffset="0"
          transform={`rotate(-90 ${CX} ${CY})`}
          filter={`url(#${fGlow})`}
          opacity="0.95"
        />

        {/* Fixed anchor dot at 9 o'clock (left edge, x = CX - RADIUS) */}
        <circle cx={CX - RADIUS} cy={CY} r="7"
          fill="#ef4444"
          filter={`url(#${fGlow})`}
          opacity="0.9"
        />

        {/* Shield outline */}
        <path
          d="M155 68 L192 82 L192 118 C192 142 155 162 155 162 C155 162 118 142 118 118 L118 82 Z"
          fill="rgba(180,20,20,0.18)"
          stroke="#ef4444" strokeWidth="2.5"
          strokeLinejoin="round"
          filter={`url(#${fGlow2})`}
        />

        {/* Exclamation mark inside shield */}
        <line x1="155" y1="95" x2="155" y2="130"
          stroke="#ef4444" strokeWidth="5" strokeLinecap="round"
          filter={`url(#${fGlow2})`}
        />
        <circle cx="155" cy="148" r="4.5" fill="#ef4444" filter={`url(#${fGlow2})`} />

        {/* "SECURITY SCORE" label */}
        <text
          x="155" y="196"
          textAnchor="middle"
          fontFamily="'Inter','Segoe UI',system-ui,sans-serif"
          fontSize="11" fontWeight="700"
          style={{ letterSpacing: '3.5px' }}
          fill="#5e5d78"
        >
          SECURITY SCORE
        </text>

        {/* Animated score: large number + smaller % on same baseline */}
        <text
          x="155" y="258"
          textAnchor="middle"
          fontFamily="'Inter','Segoe UI',system-ui,sans-serif"
          fontWeight="900" fill="#d94040"
          filter={`url(#${fGlow2})`}
        >
          <tspan fontSize="68" style={{ letterSpacing: '-3px' }}>{displayScore}</tspan>
          <tspan fontSize="34" fontWeight="700">%</tspan>
        </text>
      </svg>
    </div>
  );
};
