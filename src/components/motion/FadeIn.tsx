import { interpolate, useCurrentFrame } from "remotion";

interface FadeInProps {
  delay?: number;
  duration?: number;
  translateY?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  delay = 0,
  duration = 20,
  translateY = 16,
  children,
  style,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = interpolate(frame, [delay, delay + duration], [translateY, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: translateY !== 0 ? `translateY(${y}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
