import { text } from "../../lib/colors";

interface HeadlineTextProps {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}

export const HeadlineText: React.FC<HeadlineTextProps> = ({
  children,
  color = text,
  style,
}) => (
  <div
    style={{
      fontSize: 52,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color,
      fontFamily: "Inter, DM Sans, system-ui, sans-serif",
      lineHeight: 1.1,
      ...style,
    }}
  >
    {children}
  </div>
);
