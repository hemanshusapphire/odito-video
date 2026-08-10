import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  accentColor?: string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, accentColor, style }) => {
  return (
    <div
      style={{
        background: "rgba(15, 22, 40, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderLeft: accentColor
          ? `3px solid ${accentColor}`
          : "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
