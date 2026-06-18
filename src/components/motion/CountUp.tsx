import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { smooth } from "../../lib/easing";
import type { SpringConfig } from "remotion";

interface CountUpProps {
  from?: number;
  to: number;
  delay?: number;
  decimals?: number;
  suffix?: string;
  springConfig?: SpringConfig;
  style?: React.CSSProperties;
}

export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  delay = 0,
  decimals = 0,
  suffix = "",
  springConfig = smooth,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: springConfig,
  });

  const value = from + progress * (to - from);
  const display = decimals === 0
    ? String(Math.round(value))
    : value.toFixed(decimals);

  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {display}{suffix}
    </span>
  );
};
