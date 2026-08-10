import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { GlassCard } from "./GlassCard";

interface MetricCardProps {
  label: string;
  value: string | number;
  accentColor?: string;
  labelColor?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  accentColor = "#4cd7f6",
  labelColor,
  delay = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [delay, delay + 18], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <GlassCard
      accentColor={accentColor}
      style={{
        padding: "20px 22px",
        opacity,
        transform: `translateY(${y}px)`,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: labelColor || accentColor,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontFamily: "monospace, sans-serif",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "#ffffff",
          fontFamily: "sans-serif",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </GlassCard>
  );
};
