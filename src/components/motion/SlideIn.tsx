import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { snappy } from "../../lib/easing";
import type { SpringConfig } from "remotion";

type Direction = "left" | "right" | "top" | "bottom";

interface SlideInProps {
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  springConfig?: SpringConfig;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const SlideIn: React.FC<SlideInProps> = ({
  delay = 0,
  direction = "left",
  distance = 32,
  springConfig = snappy,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: springConfig,
  });

  const offset = (1 - progress) * distance;

  const transform = (() => {
    switch (direction) {
      case "left":   return `translateX(${-offset}px)`;
      case "right":  return `translateX(${offset}px)`;
      case "top":    return `translateY(${-offset}px)`;
      case "bottom": return `translateY(${offset}px)`;
    }
  })();

  const opacity = Math.min(progress * 2, 1);

  return (
    <div style={{ opacity, transform, ...style }}>
      {children}
    </div>
  );
};
