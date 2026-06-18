import { text } from "../../lib/colors";

interface SubheadlineTextProps {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}

export const SubheadlineText: React.FC<SubheadlineTextProps> = ({
  children,
  color = text,
  style,
}) => (
  <div
    style={{
      fontSize: 32,
      fontWeight: 600,
      letterSpacing: "-0.01em",
      color,
      fontFamily: "Inter, DM Sans, system-ui, sans-serif",
      lineHeight: 1.2,
      opacity: 0.9,
      ...style,
    }}
  >
    {children}
  </div>
);
