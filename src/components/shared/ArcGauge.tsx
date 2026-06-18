import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { arcDraw } from "../../lib/easing";
import { DrawArc } from "../motion/DrawArc";
import { CountUp } from "../motion/CountUp";
import { PulseGlow } from "../motion/PulseGlow";
import type { SpringConfig } from "remotion";

interface ArcGaugeProps {
  score: number;
  accentColor: string;
  size?: number;
  strokeWidth?: number;
  delay?: number;
  springConfig?: SpringConfig;
  showPulse?: boolean;
}

export const ArcGauge: React.FC<ArcGaugeProps> = ({
  score,
  accentColor,
  size = 380,
  strokeWidth = 14,
  delay = 0,
  springConfig = arcDraw,
  showPulse = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: springConfig,
  });

  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const isPulsing = clampedProgress > 0.95;

  // CountUp starts 10 frames after the arc delay so number settles after arc
  const countUpDelay = delay + 10;

  const fontSize = size > 300 ? 96 : 56;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Pulse glow when arc completes */}
      {showPulse && isPulsing && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <PulseGlow color={accentColor} size={size * 0.7} minOpacity={0.08} maxOpacity={0.22} />
        </div>
      )}

      {/* Bloom arc — soft glow layer behind the main arc, no CSS filter needed */}
      <div style={{ position: "absolute", inset: 0 }}>
        <DrawArc
          progress={clampedProgress}
          color={accentColor}
          size={size}
          strokeWidth={28}
          bloomOpacity={0.06}
          glow={false}
          trackOpacity={0}
        />
      </div>

      {/* Main arc */}
      <div style={{ position: "absolute", inset: 0 }}>
        <DrawArc
          progress={clampedProgress}
          color={accentColor}
          size={size}
          strokeWidth={strokeWidth}
          glow
        />
      </div>

      {/* Center score */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, DM Sans, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize,
            fontWeight: 800,
            color: accentColor,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <CountUp to={score} delay={countUpDelay} springConfig={springConfig} />
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.4)",
            marginTop: 8,
            letterSpacing: "0.04em",
          }}
        >
          / 100
        </div>
      </div>
    </div>
  );
};
