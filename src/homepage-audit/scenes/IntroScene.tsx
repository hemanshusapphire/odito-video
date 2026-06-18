import { AbsoluteFill } from "remotion";
import { SceneBackground } from "../../components/shared/SceneBackground";
import { ArcGauge } from "../../components/shared/ArcGauge";
import { StatCard } from "../../components/shared/StatCard";
import { SectionLabel } from "../../components/shared/SectionLabel";
import { UrlText } from "../../components/shared/UrlText";
import { FadeIn } from "../../components/motion/FadeIn";
import { SlideIn } from "../../components/motion/SlideIn";
import { OditoWordmark } from "../../components/assets/OditoWordmark";
import { scoreColor } from "../../lib/colors";
import type { IntroData, SceneProps } from "../../lib/types";

export const IntroScene: React.FC<SceneProps<IntroData>> = ({ data }) => {
  const score       = data?.overallScore   ?? 0;
  const totalIssues = data?.totalIssues    ?? 0;
  const critical    = data?.criticalIssues ?? 0;
  const warnings    = data?.warningIssues  ?? 0;
  const url         = data?.url ?? data?.projectName ?? "your website";
  const accent      = scoreColor(score);

  // ── Layout constants ────────────────────────────────────────────────────────
  // LEFT  (x 80–540):  logo + label + gauge
  // RIGHT (x 620–1840): url + stat cards
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, DM Sans, system-ui, sans-serif" }}>
      <SceneBackground accentColor={accent} glowIntensity={0.12} />

      {/* LEFT COLUMN */}
      <div style={{ position: "absolute", left: 80, top: 0, width: 460, height: 1080, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 32 }}>
        <FadeIn delay={10} duration={16} translateY={0}>
          <OditoWordmark size={40} accentColor="#6C63FF" />
        </FadeIn>
        <SectionLabel color="#6C63FF" delay={10}>Homepage Audit Report</SectionLabel>
        <ArcGauge score={score} accentColor={accent} size={340} delay={10} />
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ position: "absolute", left: 620, top: 0, right: 80, height: 1080, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>

        {/* URL */}
        <SlideIn delay={20} direction="bottom" distance={24}>
          <UrlText url={url} />
        </SlideIn>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <StatCard value={totalIssues} label="Total Issues"  accentColor="rgba(255,255,255,0.45)" delay={50} />
          <StatCard value={critical}    label="Critical"      accentColor="#EF4444"               delay={75} />
          <StatCard value={warnings}    label="Warnings"      accentColor="#F59E0B"               delay={100} />
        </div>

        {/* Score label */}
        <FadeIn delay={60} translateY={8}>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
            Overall audit score — {score >= 70 ? "Good" : score >= 50 ? "Needs Work" : "Critical"}
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};
