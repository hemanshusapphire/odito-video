interface CrossIconProps {
  size?: number;
  color?: string;
}

export const CrossIcon: React.FC<CrossIconProps> = ({
  size = 24,
  color = "#EF4444",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="11" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
    <path
      d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
