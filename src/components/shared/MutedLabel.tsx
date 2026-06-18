import { textMuted } from "../../lib/colors";

interface MutedLabelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const MutedLabel: React.FC<MutedLabelProps> = ({ children, style }) => (
  <div
    style={{
      fontSize: 28,
      fontWeight: 500,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: textMuted,
      fontFamily: "Inter, DM Sans, system-ui, sans-serif",
      opacity: 0.6,
      ...style,
    }}
  >
    {children}
  </div>
);
