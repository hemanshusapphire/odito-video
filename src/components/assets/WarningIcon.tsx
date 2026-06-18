interface WarningIconProps {
  size?: number;
  color?: string;
}

export const WarningIcon: React.FC<WarningIconProps> = ({
  size = 24,
  color = "#F59E0B",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3L22 20H2L12 3Z"
      fill={color}
      fillOpacity="0.15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M12 10V14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="17" r="1" fill={color} />
  </svg>
);
