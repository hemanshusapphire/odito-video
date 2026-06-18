interface DotGridProps {
  offsetY?: number;
}

export const DotGrid: React.FC<DotGridProps> = ({ offsetY = 0 }) => (
  <svg
    width="1920"
    height="1100"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      transform: `translateY(${offsetY}px)`,
    }}
  >
    <defs>
      <pattern id="dotgrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.025)" />
      </pattern>
    </defs>
    <rect width="1920" height="1100" fill="url(#dotgrid)" />
  </svg>
);
