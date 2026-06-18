import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

/**
 * Homepage Audit — Scene 5: AI Visibility Summary
 * data: { aiScore, aiChecks: [{ name, message }] }
 */
export const AISummaryScene: React.FC<{ data: any; narration?: string }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const score = Math.max(0, Math.min(100, data?.aiScore ?? 0));
  const progress = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 40 });
  const animatedScore = Math.round(progress * score);
  const checks = (data?.aiChecks || []).slice(0, 3);

  const titleIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });

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
      <div
        style={{
          fontSize: 26,
          letterSpacing: "0.25em",
          color: theme.ai,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 24,
          opacity: titleIn,
        }}
      >
        AI Visibility
      </div>

      <div
        style={{
          fontSize: 110,
          fontWeight: 800,
          color: theme.ai,
          lineHeight: 1,
          textShadow: `0 0 60px ${theme.aiGlow}`,
        }}
      >
        {animatedScore}
      </div>
      <div style={{ fontSize: 24, color: theme.textMuted, marginTop: 10, marginBottom: 50 }}>
        AI Search Readiness
      </div>

      <div style={{ width: 1000, display: "flex", flexDirection: "column", gap: 16 }}>
        {checks.map((check: any, i: number) => {
          const rowIn = interpolate(frame, [30 + i * 8, 44 + i * 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                background: theme.bgGlass,
                border: `1px solid ${theme.borderHi}`,
                borderRadius: 14,
                padding: "18px 26px",
                opacity: rowIn,
                transform: `translateY(${(1 - rowIn) * 20}px)`,
              }}
            >
              <div style={{ fontSize: 24, color: theme.ai }}>▸</div>
              <div style={{ fontSize: 22, color: theme.text }}>
                {check.name || check.message || check.rule_id}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
