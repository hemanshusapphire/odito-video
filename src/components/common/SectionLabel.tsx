import React from "react";

interface SectionLabelProps {
  text: string;
  color?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  text,
  color = "#4cd7f6",
}) => {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color,
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        fontFamily: "monospace, sans-serif",
      }}
    >
      {text}
    </div>
  );
};
