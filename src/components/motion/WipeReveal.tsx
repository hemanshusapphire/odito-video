import { interpolate, useCurrentFrame } from "remotion";

interface WipeRevealProps {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const WipeReveal: React.FC<WipeRevealProps> = ({
  delay = 0,
  duration = 20,
  children,
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rightMask = (1 - progress) * 100;

  return (
    <div
      style={{
        clipPath: `inset(0 ${rightMask}% 0 0)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
