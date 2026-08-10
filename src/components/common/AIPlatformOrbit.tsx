import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PlatformNode } from "./PlatformNode";

interface AIPlatformOrbitProps {
  /** Center element rendered inside the orbit (ScoreRing, score circle, etc.) */
  children?: React.ReactNode;
  /** Frame at which the first platform (ChatGPT) pops in. Default 24. */
  startFrame?: number;
  /** Square wrapper size in px. Default 760. */
  wrapperSize?: number;
  /** Orbit radius from center in px. Default 290. */
  radius?: number;
  /** Platform logo image size in px. Default 96. */
  nodeSize?: number;
}

// Clock positions (degrees clockwise from 12 o'clock), stagger order, and float phase offsets
const ORBIT_PLATFORMS = [
  { name: "ChatGPT",    deg: 300, stagger: 0,  phase: 0.0 }, // 10 o'clock
  { name: "Bing",       deg: 0,   stagger: 8,  phase: 0.8 }, // 12 o'clock
  { name: "Claude",     deg: 60,  stagger: 16, phase: 1.6 }, // 2  o'clock
  { name: "Gemini",     deg: 120, stagger: 24, phase: 2.4 }, // 4  o'clock
  { name: "Perplexity", deg: 240, stagger: 32, phase: 3.2 }, // 8  o'clock
];

export const AIPlatformOrbit: React.FC<AIPlatformOrbitProps> = ({
  children,
  startFrame = 24,
  wrapperSize = 760,
  radius = 290,
  nodeSize = 96,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cx = wrapperSize / 2;
  const cy = wrapperSize / 2;
  // Slow float cycle: ~3.75 s per oscillation at 24 fps
  const t = frame / 30;

  return (
    <div
      style={{
        position: "relative",
        width: wrapperSize,
        height: wrapperSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}

      {ORBIT_PLATFORMS.map(({ name, deg, stagger, phase }) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const x = cx + radius * Math.cos(rad);
        const y = cy + radius * Math.sin(rad);
        const popStart = startFrame + stagger;

        // Sequential spring pop — 0 → ~1.05 → 1.0 (subtle overshoot)
        const scale = spring({
          frame: frame - popStart,
          fps,
          config: { damping: 13, stiffness: 210, mass: 0.5 },
        });

        // Fade in alongside the pop
        const opacity = interpolate(frame, [popStart, popStart + 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Continuous float: ±8 px vertical, unique phase per platform
        const floatY = Math.sin(t * (Math.PI / 3) + phase) * 8;

        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, calc(-50% + ${floatY}px)) scale(${scale})`,
              opacity,
            }}
          >
            <PlatformNode name={name} size={nodeSize} />
          </div>
        );
      })}
    </div>
  );
};
