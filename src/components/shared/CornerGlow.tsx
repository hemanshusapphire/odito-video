interface CornerGlowProps {
  color?: string;
  intensity?: number;
}

export const CornerGlow: React.FC<CornerGlowProps> = ({
  color = "#6C63FF",
  intensity = 0.12,
}) => (
  <div
    style={{
      position: "absolute",
      bottom: -200,
      left: -200,
      width: 800,
      height: 800,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity: intensity,
      pointerEvents: "none",
    }}
  />
);
