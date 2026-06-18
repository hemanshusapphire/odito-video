import { SlideIn } from "../motion/SlideIn";
import { WarningIcon } from "../assets/WarningIcon";
import { CriticalIcon } from "../assets/CriticalIcon";
import { surface, border, severity as severityColors, text } from "../../lib/colors";
import type { IssueSeverity } from "../../lib/types";

interface IssueRowProps {
  title: string;
  severity?: IssueSeverity;
  index?: number;
  delay?: number;
}

export const IssueRow: React.FC<IssueRowProps> = ({
  title,
  severity = "warning",
  index = 0,
  delay = 0,
}) => {
  const color = severityColors[severity];
  const Icon  = severity === "critical" ? CriticalIcon : WarningIcon;

  return (
    <SlideIn delay={delay} direction="left" distance={28}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          background: surface,
          border: `1px solid ${border}`,
          borderLeft: `3px solid ${color}`,
          borderRadius: 16,
          padding: "20px 28px",
          fontFamily: "Inter, DM Sans, system-ui, sans-serif",
        }}
      >
        {/* Number badge */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: color + "20",
            border: `1px solid ${color}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            color,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>

        <Icon size={24} color={color} />

        <div style={{ flex: 1, fontSize: 22, color: text, lineHeight: 1.3 }}>
          {title}
        </div>

        {/* Severity chip */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color,
            background: color + "15",
            border: `1px solid ${color}30`,
            borderRadius: 8,
            padding: "4px 12px",
            flexShrink: 0,
          }}
        >
          {severity}
        </div>
      </div>
    </SlideIn>
  );
};
