interface StarIconProps {
  size?: number;
  color?: string;
  /** 0–1 fill fraction for partial star rendering */
  fill?: number;
}

export const StarIcon: React.FC<StarIconProps> = ({
  size = 28,
  color = "#FBBF24",
  fill = 1,
}) => {
  const id = `star-clip-${Math.round(fill * 100)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={28 * fill} height="28" />
        </clipPath>
      </defs>
      {/* Empty star */}
      <path
        d="M14 2L17.09 9.26L25 10.27L19.5 15.64L20.95 23.5L14 19.77L7.05 23.5L8.5 15.64L3 10.27L10.91 9.26L14 2Z"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Filled portion */}
      <path
        d="M14 2L17.09 9.26L25 10.27L19.5 15.64L20.95 23.5L14 19.77L7.05 23.5L8.5 15.64L3 10.27L10.91 9.26L14 2Z"
        fill={color}
        strokeLinejoin="round"
        clipPath={`url(#${id})`}
      />
    </svg>
  );
};
