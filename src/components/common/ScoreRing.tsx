import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColors?: [string, string];
  glowColor?: string;
  startFrame?: number;
  animDuration?: number;
  label?: string;
  labelColor?: string;
  scoreFontSize?: number;
  uid?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 240,
  strokeWidth = 8,
  trackColor = "#2e3448",
  progressColors = ["#7730ed", "#d0bcff"],
  glowColor = "rgba(160, 120, 255, 0.4)",
  startFrame = 10,
  animDuration = 40,
  label,
  labelColor = "rgba(255,255,255,0.5)",
  scoreFontSize,
  uid = "ring",
}) => {
  const frame = useCurrentFrame();

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  const clampedScore = Math.max(0, Math.min(100, score));
  const targetOffset = circumference * (1 - clampedScore / 100);

  const animatedOffset = interpolate(
    frame,
    [startFrame, startFrame + animDuration],
    [circumference, targetOffset],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const fadeIn = interpolate(frame, [startFrame - 5, startFrame + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const gradId = `grad-${uid}`;
  const filterId = `glow-filter-${uid}`;

  const numericFontSize = scoreFontSize ?? Math.round(size * 0.28);
  const labelFontSize = Math.round(size * 0.065);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeIn,
      }}
    >
      {/* Glow backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: `0 0 80px 20px ${glowColor}`,
          filter: "blur(24px)",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />

      {/* SVG Ring */}
      <svg
        width={size}
        height={size}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: "rotate(-90deg)",
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={progressColors[0]} />
            <stop offset="100%" stopColor={progressColors[1]} />
          </linearGradient>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          filter={`url(#${filterId})`}
        />
      </svg>

      {/* Center content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          pointerEvents: "none",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: numericFontSize,
            fontWeight: 900,
            color: "#ffffff",
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {Math.round(clampedScore)}
        </div>
        {label && (
          <div
            style={{
              fontSize: labelFontSize,
              fontWeight: 700,
              color: labelColor,
              fontFamily: "monospace, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
};
