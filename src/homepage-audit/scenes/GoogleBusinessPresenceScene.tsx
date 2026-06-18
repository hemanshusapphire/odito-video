import { AbsoluteFill } from "remotion";
import { SceneBackground } from "../../components/shared/SceneBackground";
import { GBPCard } from "../../components/shared/GBPCard";
import { SectionLabel } from "../../components/shared/SectionLabel";
import { HeadlineText } from "../../components/shared/HeadlineText";
import { MutedLabel } from "../../components/shared/MutedLabel";
import { FadeIn } from "../../components/motion/FadeIn";
import { ScaleIn } from "../../components/motion/ScaleIn";
import { MapPinIcon } from "../../components/assets/MapPinIcon";
import { CheckItem } from "../../components/shared/CheckItem";
import { sections, textMuted } from "../../lib/colors";
import type { GBPData, SceneProps } from "../../lib/types";

const ACCENT = sections.gbp.accent;

export const GoogleBusinessPresenceScene: React.FC<SceneProps<GBPData>> = ({ data }) => {
  const found = data?.found === true;
  return found
    ? <GBPFoundScene data={data as GBPData} />
    : <GBPNotFoundScene />;
};

const GBPFoundScene: React.FC<{ data: GBPData }> = ({ data }) => {
  const checks = [
    { label: "Google Entity Presence", passed: data.found === true },
    { label: "Listing Verification Status", passed: data.status === "verified" },
    { label: "Business Category Identified", passed: !!data.category },
    { label: "Customer Rating Performance", passed: !!data.rating && data.rating >= 4.0 },
    { label: "NAP (Name, Address, Phone) Consistency", passed: !!data.address && !!data.phone },
    { label: "Website Connection", passed: !!data.website },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, DM Sans, system-ui, sans-serif" }}>
      <SceneBackground accentColor={ACCENT} />

      {/* ── LEFT COLUMN (x 80–680) ── */}
      <div style={{ position: "absolute", left: 80, top: 80 }}>
        <SectionLabel color={ACCENT} delay={10}>Google Business Presence</SectionLabel>
      </div>

      <div style={{ position: "absolute", left: 80, top: 200, width: 580, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <ScaleIn delay={10}>
          <MapPinIcon size={80} color={ACCENT} />
        </ScaleIn>
        <GBPCard
          businessName={data.businessName ?? "Your Business"}
          category={data.category}
          rating={data.rating ?? 0}
          reviewCount={data.reviewCount ?? 0}
          address={data.address}
          phone={data.phone}
          website={data.website}
          delay={22}
        />
      </div>

      {/* ── RIGHT COLUMN (x 720–1840) ── */}
      <div style={{ position: "absolute", left: 720, top: 0, right: 80, height: 1080, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <FadeIn delay={15} translateY={16}>
          <div style={{ fontSize: 32, fontWeight: 700, color: ACCENT, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 16 }}>
            Google Business Audit Insights
          </div>
        </FadeIn>

        <div style={{ height: 1, background: ACCENT, opacity: 0.25, marginBottom: 20 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {checks.map((check, i) => (
            <CheckItem
              key={i}
              label={check.label}
              passed={check.passed}
              delay={30 + i * 12}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const GBPNotFoundScene: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: "Inter, DM Sans, system-ui, sans-serif" }}>
    <SceneBackground />

    <div style={{ position: "absolute", left: 80, top: 80 }}>
      <SectionLabel color={textMuted} delay={10}>Google Business Presence</SectionLabel>
    </div>

    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
      <ScaleIn delay={12}>
        <div style={{ fontSize: 80 }}>🔍</div>
      </ScaleIn>
      <FadeIn delay={28} translateY={16}>
        <HeadlineText>Google Business Profile Not Found</HeadlineText>
      </FadeIn>
      <FadeIn delay={40} translateY={12}>
        <MutedLabel style={{ fontSize: 22, letterSpacing: "0.02em", textTransform: "none", opacity: 0.6, textAlign: "center", maxWidth: 760 }}>
          This business does not appear to have a verified Google Business Profile.
        </MutedLabel>
      </FadeIn>
    </AbsoluteFill>
  </AbsoluteFill>
);
