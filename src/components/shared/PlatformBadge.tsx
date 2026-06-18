import { SlideIn } from "../motion/SlideIn";
import { PlatformDot } from "../assets/PlatformDot";
import { surface, border, pass, fail, text } from "../../lib/colors";

interface PlatformBadgeProps {
  name: string;
  connected: boolean;
  delay?: number;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  name,
  connected,
  delay = 0,
}) => {
  const statusColor = connected ? pass : fail;
  const statusText  = connected ? "Connected" : "Missing";

  return (
    <SlideIn delay={delay} direction="right" distance={32}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: surface,
          border: `1px solid ${connected ? pass + "30" : border}`,
          borderRadius: 14,
          padding: "16px 24px",
          minWidth: 340,
          fontFamily: "Inter, DM Sans, system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 22, color: text, fontWeight: 600 }}>
          {name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PlatformDot connected={connected} size={10} />
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: statusColor,
            }}
          >
            {statusText}
          </div>
        </div>
      </div>
    </SlideIn>
  );
};
