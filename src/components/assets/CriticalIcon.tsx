interface CriticalIconProps {
  size?: number;
  color?: string;
}

export const CriticalIcon: React.FC<CriticalIconProps> = ({
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
      d="M12 7V13"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="12" cy="16.5" r="1.5" fill={color} />
  </svg>
);
