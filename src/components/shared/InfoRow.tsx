import { SlideIn } from "../motion/SlideIn";
import { surface, border, text } from "../../lib/colors";

interface InfoRowProps {
  icon: string;
  text: string;
  delay?: number;
}

export const InfoRow: React.FC<InfoRowProps> = ({ icon, text: label, delay = 0 }) => (
  <SlideIn delay={delay} direction="left" distance={20}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: "14px 20px",
        fontFamily: "Inter, DM Sans, system-ui, sans-serif",
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 20, color: text }}>{label}</span>
    </div>
  </SlideIn>
);
