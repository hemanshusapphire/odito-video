import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

/**
 * Homepage Audit — Scene 3: Category Scores
 * data: { aiVisibility, technicalHealth, performance, accessibility, seo }
 */
export const CategoryScoresScene: React.FC<{ data: any; narration?: string }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const categories = [
    { name: "AI Visibility", value: data?.aiVisibility ?? 0, color: theme.ai },
    { name: "Technical", value: data?.technicalHealth ?? 0, color: theme.accent },
    { name: "Performance", value: data?.performance ?? 0, color: theme.warn },
    { name: "Accessibility", value: data?.accessibility ?? 0, color: theme.good },
  ];

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
          fontSize: 44,
          fontWeight: 800,
          color: theme.text,
          marginBottom: 60,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 20}px)`,
        }}
      >
        Category Scores
      </div>

      <div style={{ width: 1100, display: "flex", flexDirection: "column", gap: 30 }}>
        {categories.map((cat, i) => {
          const delay = 10 + i * 8;
          const barProgress = interpolate(frame, [delay, delay + 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const value = Math.max(0, Math.min(100, cat.value));
          const displayValue = Math.round(barProgress * value);

          return (
            <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ width: 260, fontSize: 26, color: theme.text, fontWeight: 600, textAlign: "right" }}>
                {cat.name}
              </div>
              <div style={{ flex: 1, height: 26, background: theme.bgCardHi, borderRadius: 13, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${barProgress * value}%`,
                    background: cat.color,
                    borderRadius: 13,
                  }}
                />
              </div>
              <div style={{ width: 80, fontSize: 30, fontWeight: 700, color: cat.color }}>{displayValue}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
