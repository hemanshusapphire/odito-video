import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

/**
 * Homepage Audit — Scene 6: Final CTA
 * data: { overallScore, url }
 */
export const CTAScene: React.FC<{ data: any; narration?: string }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 22 });
  const ctaIn = interpolate(frame, [20, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 1 + Math.sin(frame / 8) * 0.02;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, ${theme.accentGlow}, ${theme.bg} 70%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Syne, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 30,
          color: theme.textMuted,
          marginBottom: 24,
          opacity: headlineIn,
        }}
      >
        This was a homepage-only snapshot.
      </div>

      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: theme.text,
          textAlign: "center",
          opacity: headlineIn,
          transform: `translateY(${(1 - headlineIn) * 24}px)`,
          maxWidth: 1300,
        }}
      >
        Unlock Your Full Audit
      </div>

      <div
        style={{
          marginTop: 50,
          padding: "26px 64px",
          background: theme.accent,
          borderRadius: 18,
          fontSize: 32,
          fontWeight: 700,
          color: "#ffffff",
          opacity: ctaIn,
          transform: `scale(${ctaIn * pulse})`,
          boxShadow: `0 0 60px ${theme.accentGlow}`,
        }}
      >
        Run Full Audit →
      </div>

      <div style={{ marginTop: 40, fontSize: 22, color: theme.textDim, opacity: ctaIn }}>
        {data?.url || ""}
      </div>
    </AbsoluteFill>
  );
};
