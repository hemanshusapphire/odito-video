interface MapPinIconProps {
  size?: number;
  color?: string;
}

export const MapPinIcon: React.FC<MapPinIconProps> = ({
  size = 64,
  color = "#22C55E",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Pin body */}
    <path
      d="M32 4C21.5 4 13 12.5 13 23C13 35.5 32 60 32 60C32 60 51 35.5 51 23C51 12.5 42.5 4 32 4Z"
      fill={color}
      fillOpacity="0.2"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Inner circle */}
    <circle
      cx="32"
      cy="23"
      r="7"
      fill={color}
      style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
    />
  </svg>
);
