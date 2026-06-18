import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { smooth } from "../../lib/easing";
import { DrawArc } from "../motion/DrawArc";
import { CountUp } from "../motion/CountUp";
import { PulseGlow } from "../motion/PulseGlow";
import type { SpringConfig } from "remotion";

interface ScoreRingProps {
  value: number;
  max?: number;
  label: string;
  color: string;
  size?: number;
  strokeWidth?: number;
  delay?: number;
  springConfig?: SpringConfig;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  value,
  max = 100,
  label,
  color,
  size = 180,
  strokeWidth = 12,
  delay = 0,
  springConfig = smooth,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: springConfig,
  });

  const clampedProgress = Math.min(Math.max(progress, 0), 1) * (value / max);

  const isPulsing = clampedProgress > 0.95;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        fontFamily: "Inter, DM Sans, system-ui, sans-serif",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        {isPulsing && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <PulseGlow color={color} size={size * 0.65} minOpacity={0.08} maxOpacity={0.25} />
          </div>
        )}
        <DrawArc
          progress={clampedProgress}
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          glow
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: size > 150 ? 48 : 32,
              fontWeight: 800,
              color,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <CountUp to={value} delay={delay} springConfig={springConfig} />
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
            / {max}
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {label}
      </div>
    </div>
  );
};
