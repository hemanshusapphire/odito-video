import { AbsoluteFill } from "remotion";
import { SceneBackground } from "../../components/shared/SceneBackground";
import { ArcGauge } from "../../components/shared/ArcGauge";
import { ScoreRing } from "../../components/shared/ScoreRing";
import { CheckItem } from "../../components/shared/CheckItem";
import { StatCard } from "../../components/shared/StatCard";
import { SectionLabel } from "../../components/shared/SectionLabel";
import { FadeIn } from "../../components/motion/FadeIn";
import { AIBrainGraphic } from "../../components/assets/AIBrainGraphic";
import { sections } from "../../lib/colors";
import type { AIVisibilityData, SceneProps } from "../../lib/types";

const ACCENT = sections.ai.accent;

export const AIVisibilityScene: React.FC<SceneProps<AIVisibilityData>> = ({ data }) => {
  const score         = data?.score         ?? 0;
  const llmScore      = data?.llmScore      ?? 0;
  const issueCount    = data?.issueCount    ?? 0;
  const criticalCount = data?.criticalCount ?? 0;
  const checks        = (data?.aiChecks ?? []).slice(0, 8);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, DM Sans, system-ui, sans-serif" }}>
      <SceneBackground accentColor={ACCENT} />

      {/* ── LEFT COLUMN (x 80–480) ── */}
      <div style={{ position: "absolute", left: 80, top: 80 }}>
        <SectionLabel color={ACCENT} delay={10}>AI Visibility &amp; GEO</SectionLabel>
      </div>
      <div style={{ position: "absolute", left: 80, top: 200, width: 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {/* Brain graphic behind gauge */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 0 }}>
            <FadeIn delay={10} duration={40} translateY={0}>
              <AIBrainGraphic size={320} color={ACCENT} opacity={0.15} />
            </FadeIn>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <ArcGauge score={score} accentColor={ACCENT} size={340} delay={10} />
          </div>
        </div>
        <FadeIn delay={30} translateY={8}>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Overall AI Score
          </div>
        </FadeIn>
      </div>

      {/* ── CENTER COLUMN (x 520–840) ── */}
      <div style={{ position: "absolute", left: 520, top: 240, width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <ScoreRing value={llmScore} label="AI Readability" color={ACCENT} size={180} delay={50} />
        {issueCount > 0 && (
          <StatCard value={issueCount} label="Opportunities" accentColor="#F59E0B" delay={75} />
        )}
        {criticalCount > 0 && (
          <StatCard value={criticalCount} label="Critical" accentColor="#EF4444" delay={100} />
        )}
      </div>

      {/* ── RIGHT COLUMN (x 880–1840) ── */}
      <div style={{ position: "absolute", left: 880, top: 0, right: 80, height: 1080, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <FadeIn delay={20} translateY={12}>
          <div style={{ fontSize: 32, fontWeight: 700, color: ACCENT, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 16 }}>
            AI Check Results
          </div>
        </FadeIn>
        <div style={{ height: 1, background: ACCENT, opacity: 0.25, marginBottom: 20 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {checks.length > 0
            ? checks.map((c, i) => (
                <CheckItem
                  key={i}
                  label={c.name ?? c.message ?? c.rule_id ?? "AI check"}
                  passed={c.passed}
                  delay={90 + i * 18}
                />
              ))
            : <CheckItem label="No AI checks available" passed={true} delay={90} />
          }
        </div>
      </div>
    </AbsoluteFill>
  );
};
