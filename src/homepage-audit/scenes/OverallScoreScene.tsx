import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

/**
 * Homepage Audit — Scene 2: Overall Score (animated reveal)
 * data: { score }
 */
export const OverallScoreScene: React.FC<{ data: any; narration?: string }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const target = Math.max(0, Math.min(100, data?.score ?? 0));
  const progress = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 45 });
  const animatedScore = Math.round(progress * target);

  const scoreColor =
    target > 70 ? theme.scoreGood : target >= 50 ? theme.scoreMid : theme.scoreHigh;

  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedScore / 100) * circumference;

  const labelIn = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Syne, sans-serif",
      }}
    >
      <div style={{ fontSize: 24, letterSpacing: "0.25em", color: theme.textMuted, textTransform: "uppercase", marginBottom: 40 }}>
        Overall Score
      </div>

      <div style={{ position: "relative", width: 420, height: 420 }}>
        <svg width="420" height="420" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="210" cy="210" r={radius} stroke={theme.bgCardHi} strokeWidth="22" fill="none" />
          <circle
            cx="210"
            cy="210"
            r={radius}
            stroke={scoreColor}
            strokeWidth="22"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 130, fontWeight: 800, color: theme.text, lineHeight: 1 }}>{animatedScore}</div>
          <div style={{ fontSize: 28, color: theme.textMuted, marginTop: 8 }}>/ 100</div>
        </div>
      </div>

      <div style={{ marginTop: 36, fontSize: 30, fontWeight: 600, color: scoreColor, opacity: labelIn }}>
        {target > 70 ? "Strong Foundation" : target >= 50 ? "Room to Improve" : "Needs Attention"}
      </div>
    </AbsoluteFill>
  );
};
