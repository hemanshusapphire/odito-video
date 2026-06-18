import { pass, fail } from "../../lib/colors";

interface PlatformDotProps {
  connected: boolean;
  size?: number;
}

export const PlatformDot: React.FC<PlatformDotProps> = ({
  connected,
  size = 10,
}) => {
  const color = connected ? pass : fail;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 6px ${color}80`,
      }}
    />
  );
};
