interface CheckmarkIconProps {
  size?: number;
  color?: string;
}

export const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({
  size = 24,
  color = "#22C55E",
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
      d="M7.5 12.5L10.5 15.5L16.5 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
