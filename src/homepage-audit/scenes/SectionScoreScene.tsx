import { AbsoluteFill } from "remotion";
import { SceneBackground } from "../../components/shared/SceneBackground";
import { ArcGauge } from "../../components/shared/ArcGauge";
import { StatCard } from "../../components/shared/StatCard";
import { CheckItem } from "../../components/shared/CheckItem";
import { SectionLabel } from "../../components/shared/SectionLabel";
import { FadeIn } from "../../components/motion/FadeIn";
import type { SectionScoreData, SceneProps } from "../../lib/types";

export const SectionScoreScene: React.FC<SceneProps<SectionScoreData>> = ({ data }) => {
  const label        = data?.sectionName    ?? "Audit";
  const score        = data?.score          ?? 0;
  const issueCount   = data?.issueCount     ?? 0;
  const checksCount  = data?.checksCount    ?? null;
  const criticalCount = data?.criticalCount ?? null;
  const accent       = data?.accentColor    ?? "#6C63FF";

  // Derive check rows from available data
  const checkRows: Array<{ label: string; passed: boolean }> = [
    ...(issueCount === 0
      ? [{ label: "All checks passed", passed: true }]
      : [{ label: `${issueCount} issue${issueCount !== 1 ? "s" : ""} detected`, passed: false }]),
    ...(criticalCount != null && criticalCount > 0
      ? [{ label: `${criticalCount} critical finding${criticalCount !== 1 ? "s" : ""}`, passed: false }]
      : []),
    ...(checksCount != null
      ? [{ label: `${checksCount} checks completed`, passed: true }]
      : []),
  ];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, DM Sans, system-ui, sans-serif" }}>
      <SceneBackground accentColor={accent} />

      {/* ── LEFT COLUMN (x 80–520) ── */}
      <div style={{ position: "absolute", left: 80, top: 80, width: 440 }}>
        <SectionLabel color={accent} delay={10}>{label}</SectionLabel>
      </div>
      <div style={{ position: "absolute", left: 80, top: 220, width: 440, display: "flex", justifyContent: "center" }}>
        <ArcGauge score={score} accentColor={accent} size={320} strokeWidth={14} delay={10} />
      </div>

      {/* ── CENTER COLUMN (x 580–880) ── */}
      <div style={{ position: "absolute", left: 580, top: 260, width: 300, display: "flex", flexDirection: "column", gap: 20 }}>
        <StatCard value={issueCount} label={issueCount === 1 ? "Issue Found" : "Issues Found"} accentColor={issueCount > 0 ? "#F59E0B" : "#22C55E"} delay={50} />
        {checksCount != null && (
          <StatCard value={checksCount} label="Checks Run" accentColor="rgba(255,255,255,0.35)" delay={75} />
        )}
        {criticalCount != null && criticalCount > 0 && (
          <StatCard value={criticalCount} label="Critical" accentColor="#EF4444" delay={100} />
        )}
      </div>

      {/* ── RIGHT COLUMN (x 920–1840) ── */}
      <div style={{ position: "absolute", left: 920, top: 0, right: 80, height: 1080, display: "flex", flexDirection: "column", justifyContent: "center" }}>

        {/* Large section title */}
        <FadeIn delay={20} translateY={16}>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#F0F0FF", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 12 }}>
            {label}
          </div>
        </FadeIn>

        <FadeIn delay={30} translateY={10}>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.4)", marginBottom: 28, letterSpacing: "0.02em" }}>
            Section Analysis
          </div>
        </FadeIn>

        {/* Accent divider */}
        <div style={{ height: 1, background: accent, opacity: 0.2, marginBottom: 28 }} />

        {/* Check rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {checkRows.slice(0, 6).map((row, i) => (
            <CheckItem key={i} label={row.label} passed={row.passed} delay={90 + i * 18} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
