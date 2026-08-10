import React from "react";

interface LogoHeaderProps {
  brandColor?: string;
  agencyName?: string;
  logoUrl?: string;
  subtitle?: string;
  style?: React.CSSProperties;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
  subtitle,
  style,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 32px",
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        ...style,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: brandColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 16,
          color: "#fff",
        }}
      >
        {agencyName.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#f0f4ff",
            letterSpacing: "-0.02em",
          }}
        >
          {agencyName}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 12,
              color: "#6b7a9e",
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
