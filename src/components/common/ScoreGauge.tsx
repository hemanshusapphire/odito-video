import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

// viewBox is 100×100; radius 40 centered at 50,50
const R = 40;
const CIRC = 2 * Math.PI * R; // ≈ 251.33

interface ScoreGaugeProps {
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  startFrame?: number;
  animDuration?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  color,
  size = 160,
  strokeWidth = 8,
  startFrame = 0,
  animDuration = 35,
}) => {
  const frame = useCurrentFrame();
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const targetOffset = CIRC * (1 - clamped / 100);

  const offset = interpolate(
    frame,
    [startFrame, startFrame + animDuration],
    [CIRC, targetOffset],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const displayScore = Math.round(
    interpolate(frame, [startFrame, startFrame + animDuration], [0, clamped], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Ring — rotated so arc starts at 12 o'clock */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: "rotate(-90deg)",
          filter: `drop-shadow(0 0 8px ${color})`,
          overflow: "visible",
        }}
      >
        {/* Track */}
        <circle
          cx={50}
          cy={50}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx={50}
          cy={50}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
        />
      </svg>

      {/* Center labels — not rotated */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: Math.round(size * 0.225),
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          {displayScore}
        </span>
        <span
          style={{
            fontSize: Math.round(size * 0.065),
            color: "#64748b",
            fontFamily: "sans-serif",
            textTransform: "uppercase" as const,
            letterSpacing: "0.15em",
            marginTop: 4,
          }}
        >
          / 100
        </span>
      </div>
    </div>
  );
};
