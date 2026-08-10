import type { FC } from 'react';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  /** Animation progress 0→1 — drives arc fill and count-up */
  progress: number;
  /** Unique suffix to avoid SVG filter ID collisions across scenes */
  id?: string;
  /** Uniform scale factor; default 1 = 340×340px */
  scale?: number;
  /** Theme palette; default is the blue/purple SEO theme */
  theme?: 'default' | 'security';
}

const RADIUS       = 138;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 867.08
const TICK_DEGREES  = Array.from({ length: 72 }, (_, i) => i * 5);

export const ScoreRing: FC<ScoreRingProps> = ({
  score,
  maxScore = 100,
  progress,
  id = 'score',
  scale = 1,
  theme = 'default',
}) => {
  const size       = 340 * scale;
  const filledDash = progress * (score / maxScore) * CIRCUMFERENCE;

  const gradId  = `rg-grad-${id}`;
  const glowId  = `rg-glow-${id}`;
  const dotGlId = `rg-dot-${id}`;

  const isSecurity = theme === 'security';
  const backdropGlow = isSecurity
    ? 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(220,38,38,0.25) 0%, rgba(127,29,29,0.12) 50%, transparent 75%)'
    : 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,80,200,0.25) 0%, rgba(0,40,120,0.12) 50%, transparent 75%)';

  const decoring1 = isSecurity ? 'rgba(127,29,29,0.4)' : 'rgba(30,50,100,0.4)';
  const decoring2 = isSecurity ? 'rgba(153,27,27,0.3)' : 'rgba(20,40,90,0.3)';
  const tickStroke = isSecurity ? 'rgba(185,28,28,0.6)' : 'rgba(40,70,140,0.6)';
  const trackStroke = isSecurity ? '#1c0d0d' : '#0d1535';
  const dotFill = isSecurity ? '#f97316' : '#00e8ff';

  return (
    <div style={{
      position: 'relative', width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Radial glow backdrop */}
      <div style={{
        position: 'absolute',
        top: -60 * scale, left: -60 * scale, right: -60 * scale, bottom: -60 * scale,
        background: backdropGlow,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* SVG ring */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 340 340"
      >
        <defs>
          {isSecurity ? (
            <linearGradient id={gradId} x1="1" y1="0.5" x2="0" y2="0.5">
              <stop offset="0%"   stopColor="#7f1d1d" />
              <stop offset="50%"  stopColor="#dc2626" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          ) : (
            <linearGradient id={gradId} x1="1" y1="0.5" x2="0" y2="0.5">
              <stop offset="0%"   stopColor="#00f0c0" />
              <stop offset="30%"  stopColor="#00d4ff" />
              <stop offset="60%"  stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          )}

          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          <filter id={dotGlId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer decoration rings */}
        <circle cx="170" cy="170" r="158" fill="none" stroke={decoring1} strokeWidth="1" />
        <circle cx="170" cy="170" r="148" fill="none" stroke={decoring2} strokeWidth="0.5" />

        {/* Tick marks every 5° */}
        {TICK_DEGREES.map(deg => (
          <line
            key={deg}
            x1="170" y1="10" x2="170" y2="17"
            stroke={tickStroke} strokeWidth="1.2" strokeLinecap="round"
            transform={`rotate(${deg} 170 170)`}
          />
        ))}

        {/* Background track */}
        <circle cx="170" cy="170" r={RADIUS} fill="none" stroke={trackStroke} strokeWidth="18" />

        {/* Animated gradient arc */}
        <circle
          cx="170" cy="170" r={RADIUS}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${filledDash} ${CIRCUMFERENCE - filledDash}`}
          strokeDashoffset="217"
          filter={`url(#${glowId})`}
          transform="rotate(-90 170 170)"
        />

        {/* Glowing accent dot at ring top */}
        <circle cx="170" cy="32" r="9" fill={dotFill} filter={`url(#${dotGlId})`} />
        <circle cx="170" cy="32" r="5" fill="#fff" />
      </svg>

      {/* Score number centered over ring */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          fontSize: Math.round(110 * scale),
          fontWeight: 900,
          color: '#fff',
          lineHeight: 1,
          letterSpacing: `${-4 * scale}px`,
          textShadow: '0 0 40px rgba(255,255,255,0.15)',
        }}>
          {Math.round(progress * score)}
        </div>
        <div style={{
          fontSize: Math.round(26 * scale),
          fontWeight: 600,
          color: '#5a6a90',
          letterSpacing: '2px',
          marginTop: Math.round(-4 * scale),
        }}>
          / {maxScore}
        </div>
      </div>
    </div>
  );
};
