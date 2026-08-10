import React from "react";

interface GaugeScoreProps {
  score: number;
  size?: number;
  label?: string;
  color?: string;
  showLabel?: boolean;
  style?: React.CSSProperties;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export const GaugeScore: React.FC<GaugeScoreProps> = ({
  score,
  size = 120,
  label,
  color,
  showLabel = true,
  style,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score ?? 0));
  const resolvedColor = color ?? scoreColor(clampedScore);
  const r = (size / 2) * 0.78;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * r;
  const dashOffset = circumference * (1 - clampedScore / 100);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        ...style,
      }}
    >
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={size * 0.07}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={size * 0.07}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill="#f0f4ff"
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {Math.round(clampedScore)}
        </text>
        <text
          x={cx}
          y={cy + size * 0.12}
          textAnchor="middle"
          fill="#6b7a9e"
          fontSize={size * 0.1}
          fontFamily="Inter, system-ui, sans-serif"
        >
          / 100
        </text>
      </svg>
      {showLabel && label && (
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: size * 0.11,
            color: "#6b7a9e",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
