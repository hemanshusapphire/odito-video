import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../theme";

/**
 * Homepage Audit — Scene 4: Top Issues
 * data: { issueDistribution: { total, critical, warnings, passed }, topIssues: { critical[], warnings[] } }
 */
export const TopIssuesScene: React.FC<{ data: any; narration?: string }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dist = data?.issueDistribution || {};
  const issues = [
    ...((data?.topIssues?.critical || []).map((m: string) => ({ message: m, severity: "critical" }))),
    ...((data?.topIssues?.warnings || []).map((m: string) => ({ message: m, severity: "warning" }))),
  ].slice(0, 4);

  const titleIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });

  const stats = [
    { label: "Critical", value: dist.critical ?? 0, color: theme.fail },
    { label: "Warnings", value: dist.warnings ?? 0, color: theme.warn },
    { label: "Passed", value: dist.passed ?? 0, color: theme.pass },
  ];

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
          marginBottom: 40,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 20}px)`,
        }}
      >
        Top Issues
      </div>

      {/* Stat chips */}
      <div style={{ display: "flex", gap: 24, marginBottom: 48 }}>
        {stats.map((s, i) => {
          const chipIn = interpolate(frame, [8 + i * 5, 20 + i * 5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={s.label}
              style={{
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                borderRadius: 16,
                padding: "20px 40px",
                textAlign: "center",
                opacity: chipIn,
                transform: `scale(${0.9 + chipIn * 0.1})`,
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 18, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Issue list */}
      <div style={{ width: 1100, display: "flex", flexDirection: "column", gap: 16 }}>
        {issues.map((issue, i) => {
          const rowIn = interpolate(frame, [25 + i * 7, 38 + i * 7], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const dotColor = issue.severity === "critical" ? theme.fail : theme.warn;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                borderRadius: 14,
                padding: "20px 28px",
                opacity: rowIn,
                transform: `translateX(${(1 - rowIn) * -30}px)`,
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
              <div style={{ fontSize: 24, color: theme.text }}>{issue.message}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
