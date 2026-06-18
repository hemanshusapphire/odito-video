import { AbsoluteFill } from "remotion";
import { SceneBackground } from "../../components/shared/SceneBackground";
import { ArcGauge } from "../../components/shared/ArcGauge";
import { IssueRow } from "../../components/shared/IssueRow";
import { SectionLabel } from "../../components/shared/SectionLabel";
import { FadeIn } from "../../components/motion/FadeIn";
import { OditoWordmark } from "../../components/assets/OditoWordmark";
import { sections } from "../../lib/colors";
import { bouncy } from "../../lib/easing";
import { issueTitle, issueSeverity } from "../../lib/utils";
import type { FinalSummaryData, SceneProps } from "../../lib/types";

const ACCENT = sections.summary.accent;

function scoreGrade(score: number): { letter: string; color: string } {
  if (score >= 90) return { letter: "A", color: "#22C55E" };
  if (score >= 80) return { letter: "B", color: "#84CC16" };
  if (score >= 70) return { letter: "C", color: "#F59E0B" };
  if (score >= 60) return { letter: "D", color: "#F97316" };
  return { letter: "F", color: "#EF4444" };
}

export const FinalSummaryScene: React.FC<SceneProps<FinalSummaryData>> = ({ data }) => {
  const overallScore = data?.overallScore ?? 0;
  const rawIssues    = (data?.topIssues ?? []).slice(0, 8);
  const grade        = scoreGrade(overallScore);

  const issues = rawIssues.map((issue, i) => ({
    title:    issueTitle(issue),
    severity: issueSeverity(issue),
    index:    i,
  }));

  const leftIssues  = issues.slice(0, 4);
  const rightIssues = issues.slice(4, 8);

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, DM Sans, system-ui, sans-serif" }}>
      <SceneBackground accentColor={ACCENT} glowIntensity={0.20} />

      {/* ── LEFT COLUMN (x 80–580) ── */}
      <div style={{ position: "absolute", left: 80, top: 80 }}>
        <SectionLabel color={ACCENT} delay={10}>Final Summary</SectionLabel>
      </div>

      <div style={{ position: "absolute", left: 80, top: 180, width: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Grade badge */}
        <FadeIn delay={8} translateY={0}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${grade.color}`, display: "flex", alignItems: "center", justifyContent: "center", background: `${grade.color}18` }}>
            <span style={{ fontSize: 52, fontWeight: 900, color: grade.color, lineHeight: 1 }}>{grade.letter}</span>
          </div>
        </FadeIn>

        {/* Arc gauge */}
        <ArcGauge
          score={overallScore}
          accentColor={ACCENT}
          size={360}
          strokeWidth={20}
          delay={15}
          springConfig={bouncy}
        />

        {/* Odito logo + CTA */}
        <FadeIn delay={120} translateY={12}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <OditoWordmark size={32} accentColor={ACCENT} />
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center" }}>
              Full report in your dashboard
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ── RIGHT COLUMN (x 640–1840) ── */}
      <div style={{ position: "absolute", left: 640, top: 0, right: 80, height: 1080, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <FadeIn delay={12} translateY={12}>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#F0F0FF", letterSpacing: "-0.01em", marginBottom: 8 }}>
            Key Opportunities Identified
          </div>
        </FadeIn>

        <FadeIn delay={22} translateY={6}>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
            Resolve these to improve your score
          </div>
        </FadeIn>

        <div style={{ height: 1, background: ACCENT, opacity: 0.2, marginBottom: 24 }} />

        {/* 2-column issue grid */}
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            {leftIssues.map((issue) => (
              <IssueRow
                key={issue.index}
                title={issue.title}
                severity={issue.severity}
                index={issue.index}
                delay={55 + issue.index * 14}
              />
            ))}
          </div>
          {rightIssues.length > 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              {rightIssues.map((issue) => (
                <IssueRow
                  key={issue.index}
                  title={issue.title}
                  severity={issue.severity}
                  index={issue.index}
                  delay={55 + issue.index * 14}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
