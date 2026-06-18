import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { smooth } from "../../lib/easing";
import type { SpringConfig } from "remotion";

interface ScaleInProps {
  delay?: number;
  fromScale?: number;
  springConfig?: SpringConfig;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  delay = 0,
  fromScale = 0.85,
  springConfig = smooth,
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

  const scale = fromScale + progress * (1 - fromScale);
  const opacity = Math.min(progress * 2, 1);

  return (
    <div style={{ opacity, transform: `scale(${scale})`, ...style }}>
      {children}
    </div>
  );
};
