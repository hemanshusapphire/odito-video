import { AbsoluteFill } from "remotion";
import { SceneBackground } from "../../components/shared/SceneBackground";
import { ArcGauge } from "../../components/shared/ArcGauge";
import { ScoreRing } from "../../components/shared/ScoreRing";
import { StatCard } from "../../components/shared/StatCard";
import { SectionLabel } from "../../components/shared/SectionLabel";
import { FadeIn } from "../../components/motion/FadeIn";
import { sections, scoreColor } from "../../lib/colors";
import type { PerformanceData, SceneProps } from "../../lib/types";

const ACCENT = sections.performance.accent;

export const PerformanceScene: React.FC<SceneProps<PerformanceData>> = ({ data }) => {
  const overall      = data?.score        ?? 0;
  const mobileScore  = data?.mobileScore  ?? 0;
  const desktopScore = data?.desktopScore ?? 0;
  const responseTime = data?.responseTime ?? "N/A";
  const issueCount   = data?.issueCount   ?? 0;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, DM Sans, system-ui, sans-serif" }}>
      <SceneBackground accentColor={ACCENT} />

      {/* Section label top-left */}
      <div style={{ position: "absolute", left: 80, top: 80 }}>
        <SectionLabel color={ACCENT} delay={10}>Performance</SectionLabel>
      </div>

      {/* Center stage — primary gauge */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <ArcGauge score={overall} accentColor={scoreColor(overall)} size={380} strokeWidth={22} delay={10} />
        <FadeIn delay={60} translateY={8}>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Performance Score
          </div>
        </FadeIn>
      </div>

      {/* Divider */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 620, height: 1, background: "rgba(255,255,255,0.08)" }} />

      {/* Bottom strip — spread across full width */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 650, bottom: 60, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        <FadeIn delay={40} translateY={20}>
          <ScoreRing value={mobileScore} label="Mobile" color={scoreColor(mobileScore)} size={220} delay={40} />
        </FadeIn>

        <FadeIn delay={55} translateY={20}>
          <ScoreRing value={desktopScore} label="Desktop" color={scoreColor(desktopScore)} size={220} delay={55} />
        </FadeIn>

        <FadeIn delay={70} translateY={20}>
          <StatCard value={responseTime} label="Response Time" accentColor={ACCENT} delay={70} />
        </FadeIn>

        {issueCount > 0 && (
          <FadeIn delay={85} translateY={20}>
            <StatCard value={issueCount} label="Issues" accentColor="#EF4444" delay={85} />
          </FadeIn>
        )}
      </div>
    </AbsoluteFill>
  );
};
