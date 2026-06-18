interface DrawArcProps {
  progress: number;
  color: string;
  trackColor?: string;
  size: number;
  strokeWidth?: number;
  radius?: number;
  glow?: boolean;
  bloomOpacity?: number;
  trackOpacity?: number;
}

export const DrawArc: React.FC<DrawArcProps> = ({
  progress,
  color,
  trackColor = "rgba(255,255,255,0.06)",
  size,
  strokeWidth = 20,
  radius: radiusProp,
  glow = true,
  bloomOpacity,
  trackOpacity = 1,
}) => {
  const center = size / 2;
  const radius = radiusProp ?? center - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const dashOffset = circumference - clampedProgress * circumference;

  // Bloom mode — render a single wide soft arc, no track, no glow
  if (bloomOpacity !== undefined) {
    return (
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle
          cx={center} cy={center} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          opacity={bloomOpacity}
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
      {/* Track ring */}
      {trackOpacity !== 0 && (
        <circle
          cx={center} cy={center} r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={trackOpacity}
        />
      )}
      {/* Accent tint track — 8% opacity */}
      <circle
        cx={center} cy={center} r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={0.08}
      />
      {/* Animated fill arc */}
      <circle
        cx={center} cy={center} r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={glow ? { filter: `drop-shadow(0 0 16px ${color}60)` } : undefined}
      />
    </svg>
  );
};
