import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CountUp } from "../motion/CountUp";

interface StatCardProps {
  value: number | string;
  label: string;
  accentColor: string;
  delay?: number;
  icon?: React.ReactNode;
  decimals?: number;
  suffix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  accentColor,
  delay = 0,
  icon,
  decimals = 0,
  suffix = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 18, stiffness: 90, mass: 1, overshootClamping: false },
  });

  const scale = 0.9 + progress * 0.1;
  const opacity = Math.min(progress * 2, 1);
  const isNumber = typeof value === "number";

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        minWidth: 240,
        minHeight: 110,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 16,
        padding: "18px 28px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontFamily: "Inter, DM Sans, system-ui, sans-serif",
      }}
    >
      {icon && <div style={{ marginBottom: 6 }}>{icon}</div>}
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: accentColor,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {isNumber ? (
          <CountUp to={value as number} delay={delay} decimals={decimals} suffix={suffix} />
        ) : (
          <span>{value}{suffix}</span>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          marginTop: 8,
        }}
      >
        {label}
      </div>
    </div>
  );
};
