import { interpolate, useCurrentFrame } from "remotion";
import { pass, fail, text } from "../../lib/colors";

interface CheckItemProps {
  label: string;
  passed: boolean;
  delay?: number;
}

export const CheckItem: React.FC<CheckItemProps> = ({ label, passed, delay = 0 }) => {
  const frame = useCurrentFrame();
  const color = passed ? pass : fail;

  const progress = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateX = interpolate(frame, [delay, delay + 20], [-30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shake for failed items — quick oscillation after entrance
  const shake = passed ? 0 : interpolate(
    frame,
    [delay + 2, delay + 5, delay + 8, delay + 11, delay + 14],
    [0, -5, 4, -2, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateX(${translateX + shake}px)`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        height: 56,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderLeft: `2px solid ${color}`,
        borderRadius: 10,
        padding: "0 20px",
        fontFamily: "Inter, DM Sans, system-ui, sans-serif",
      }}
    >
      {/* Status icon */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
        {passed ? (
          <path d="M6 10.5L9 13.5L14 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M7 7L13 13M13 7L7 13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        )}
      </svg>

      {/* Label */}
      <div style={{ flex: 1, fontSize: 18, color: text, fontWeight: 400 }}>
        {label}
      </div>

      {/* Badge */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color,
          background: passed ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${passed ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          borderRadius: 6,
          padding: "3px 10px",
          flexShrink: 0,
        }}
      >
        {passed ? "Passed" : "Failed"}
      </div>
    </div>
  );
};
