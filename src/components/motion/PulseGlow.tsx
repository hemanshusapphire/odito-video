import { useCurrentFrame } from "remotion";

interface PulseGlowProps {
  color: string;
  size?: number;
  speed?: number;
  minOpacity?: number;
  maxOpacity?: number;
  style?: React.CSSProperties;
}

export const PulseGlow: React.FC<PulseGlowProps> = ({
  color,
  size = 400,
  speed = 0.08,
  minOpacity = 0.15,
  maxOpacity = 0.35,
  style,
}) => {
  const frame = useCurrentFrame();

  const opacity =
    minOpacity +
    (Math.sin(frame * speed) * 0.5 + 0.5) * (maxOpacity - minOpacity);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        opacity,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
};
