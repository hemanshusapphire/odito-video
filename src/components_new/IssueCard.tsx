import React from "react";

interface IssueCardProps {
  title: string;
  severity?: "critical" | "warning" | "info" | "passed";
  detail?: string;
  affectedCount?: number;
  style?: React.CSSProperties;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  passed: "#10b981",
};

export const IssueCard: React.FC<IssueCardProps> = ({
  title,
  severity = "info",
  detail,
  affectedCount,
  style,
}) => {
  const color = SEVERITY_COLOR[severity] ?? SEVERITY_COLOR.info;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "#f0f4ff",
          }}
        >
          {title}
        </div>
        {affectedCount !== undefined && (
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 12,
              color,
              fontWeight: 600,
            }}
          >
            {affectedCount} affected
          </div>
        )}
      </div>
      {detail && (
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 12,
            color: "#6b7a9e",
          }}
        >
          {detail}
        </div>
      )}
    </div>
  );
};

// ScoreCard is used by KeywordSlide
interface ScoreCardProps {
  label: string;
  value: string | number;
  color?: string;
  sublabel?: string;
  style?: React.CSSProperties;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  label,
  value,
  color = "#3b82f6",
  sublabel,
  style,
}) => {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        minWidth: 120,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 36,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: "#6b7a9e",
          textAlign: "center",
        }}
      >
        {label}
      </div>
      {sublabel && (
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
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
