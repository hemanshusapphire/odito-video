import { WipeReveal } from "../motion/WipeReveal";

interface SectionLabelProps {
  children: React.ReactNode;
  color?: string;
  delay?: number;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  children,
  color = "#6C63FF",
  delay = 0,
}) => (
  <WipeReveal delay={delay} duration={20}>
    <div
      style={{
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color,
        opacity: 0.6,
        fontFamily: "Inter, DM Sans, system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  </WipeReveal>
);
