interface OditoWordmarkProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export const OditoWordmark: React.FC<OditoWordmarkProps> = ({
  size = 40,
  color = "#F0F0FF",
  accentColor = "#6C63FF",
}) => {
  const ratio = 4.2;
  const width = size * ratio;

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 168 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* "O" */}
      <text
        x="0"
        y="32"
        fontFamily="Inter, DM Sans, system-ui, sans-serif"
        fontWeight="800"
        fontSize="36"
        fill={accentColor}
      >
        O
      </text>
      {/* "dito" */}
      <text
        x="26"
        y="32"
        fontFamily="Inter, DM Sans, system-ui, sans-serif"
        fontWeight="800"
        fontSize="36"
        fill={color}
      >
        dito
      </text>
      {/* "AI" superscript dot */}
      <circle cx="155" cy="6" r="4" fill={accentColor} />
      <circle cx="163" cy="6" r="4" fill={accentColor} opacity="0.5" />
    </svg>
  );
};
