import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { smooth } from "../../lib/easing";
import { DrawArc } from "../motion/DrawArc";
import { pass, warn, fail } from "../../lib/colors";

interface CoverageRingProps {
  connected: number;
  total: number;
  delay?: number;
  size?: number;
  strokeWidth?: number;
}

export const CoverageRing: React.FC<CoverageRingProps> = ({
  connected,
  total,
  delay = 0,
  size = 280,
  strokeWidth = 16,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const coveragePct = total > 0 ? connected / total : 0;
  const progress = spring({ frame: Math.max(0, frame - delay), fps, config: smooth });
  const arcProgress = Math.min(progress, 1) * coveragePct;

  const color = connected >= 4 ? pass : connected >= 2 ? warn : fail;
  const displayPct = Math.round(Math.min(progress, 1) * coveragePct * 100);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <DrawArc
        progress={arcProgress}
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
          fontFamily: "Inter, DM Sans, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 70,
            fontWeight: 800,
            color,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {displayPct}
        </div>
        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
          % covered
        </div>
      </div>
    </div>
  );
};
