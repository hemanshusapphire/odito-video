import React from "react";

interface ChartBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  height?: number;
  width?: number;
  showValue?: boolean;
  style?: React.CSSProperties;
}

export const ChartBar: React.FC<ChartBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  color = "#3b82f6",
  height = 180,
  width = 60,
  showValue = true,
  style,
}) => {
  const pct = Math.max(0, Math.min(1, (value ?? 0) / (max || 100)));
  const fillHeight = pct * height;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        ...style,
      }}
    >
      {showValue && (
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#f0f4ff",
          }}
        >
          {typeof value === "number" ? Math.round(value) : value}
        </div>
      )}
      <div
        style={{
          width,
          height,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 6,
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            width: "100%",
            height: fillHeight,
            background: color,
            borderRadius: "4px 4px 0 0",
            transition: "height 0.6s ease",
          }}
        />
      </div>
      {label && (
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 12,
            color: "#6b7a9e",
            fontWeight: 500,
            textAlign: "center",
            maxWidth: width + 16,
          }}
        >
          {label}
        </div>
      )}
      {sublabel && (
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 10,
            color: "#3a4468",
            textAlign: "center",
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
};
