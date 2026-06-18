import { AbsoluteFill } from "remotion";
import { SceneBackground } from "../../components/shared/SceneBackground";
import { CoverageRing } from "../../components/shared/CoverageRing";
import { StatCard } from "../../components/shared/StatCard";
import { PlatformBadge } from "../../components/shared/PlatformBadge";
import { SectionLabel } from "../../components/shared/SectionLabel";
import { FadeIn } from "../../components/motion/FadeIn";
import { sections, pass, fail } from "../../lib/colors";
import type { SocialSignalsData, SceneProps } from "../../lib/types";

const ACCENT = sections.social.accent;

export const SocialSignalsScene: React.FC<SceneProps<SocialSignalsData>> = ({ data }) => {
  const connected = data?.connectedCount ?? 0;
  const missing   = data?.missingCount   ?? 0;
  const platforms = data?.platforms      ?? [];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, DM Sans, system-ui, sans-serif" }}>
      <SceneBackground accentColor={ACCENT} />

      {/* ── LEFT COLUMN (x 80–540) ── */}
      <div style={{ position: "absolute", left: 80, top: 80 }}>
        <SectionLabel color={ACCENT} delay={10}>Social Signals</SectionLabel>
      </div>

      <div style={{ position: "absolute", left: 80, top: 200, width: 460, display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <CoverageRing connected={connected} total={connected + missing} delay={10} size={300} />

        <div style={{ display: "flex", gap: 24 }}>
          <StatCard value={connected} label="Connected" accentColor={pass} delay={35} />
          <StatCard value={missing}   label="Missing"   accentColor={fail} delay={50} />
        </div>
      </div>

      {/* ── RIGHT COLUMN (x 580–1840) ── */}
      {platforms.length > 0 && (
        <div style={{ position: "absolute", left: 580, top: 0, right: 80, height: 1080, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
          <FadeIn delay={20} translateY={12}>
            <div style={{ fontSize: 28, fontWeight: 700, color: ACCENT, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12 }}>
              Platform Connections
            </div>
          </FadeIn>
          <div style={{ height: 1, background: ACCENT, opacity: 0.2, marginBottom: 8 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {platforms.slice(0, 10).map((p, i) => (
              <FadeIn key={i} delay={65 + i * 12} translateY={10}>
                <PlatformBadge name={p.name} connected={p.connected} />
              </FadeIn>
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
