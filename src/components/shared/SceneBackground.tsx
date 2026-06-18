import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { background } from "../../lib/colors";
import { DotGrid } from "./DotGrid";
import { CornerGlow } from "./CornerGlow";
import { TopVignette } from "./TopVignette";

interface SceneBackgroundProps {
  accentColor?: string;
  glowIntensity?: number;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  accentColor,
  glowIntensity = 0.12,
}) => {
  const frame = useCurrentFrame();

  // Subtle grid drift — -20px over 300 frames
  const gridOffsetY = interpolate(frame, [0, 300], [0, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background, zIndex: 0 }}>
      <DotGrid offsetY={gridOffsetY} />
      {accentColor && <CornerGlow color={accentColor} intensity={glowIntensity} />}
      <TopVignette />
    </AbsoluteFill>
  );
};
