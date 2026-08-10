import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ScoreGauge } from "../components/common/ScoreGauge";
import { SlideNarration } from "../types";
import { useSlideTiming } from "../hooks/useSlideTiming";

// ─── Design tokens (from HTML color system) ────────────────────────────────

const C = {
  bg:                  "#000000",
  primary:             "#d0bcff",
  primaryContainer:    "#a078ff",
  secondary:           "#4cd7f6",
  error:               "#ffb4ab",
  errorGlow:           "rgba(239,68,68,0.3)",
  onSurface:           "#dbe2fb",
  onSurfaceVariant:    "#cbc3d7",
  successGreen:        "#18A853",
  surfaceContainerLow: "#141b2d",
  glassBg:             "rgba(15,22,40,0.7)",
  glassStroke:         "rgba(255,255,255,0.1)",
  glassStrokeTop:      "rgba(255,255,255,0.2)",
} as const;

// ─── Icons ─────────────────────────────────────────────────────────────────

const AlertIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={C.successGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ─── Types ─────────────────────────────────────────────────────────────────

interface CheckItem {
  name: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
  affected_pages?: number;
}

interface Props {
  data: {
    auditSnapshot: {
      technicalHighlights: {
        checks?: CheckItem[];
        criticalIssues?: CheckItem[];
        topRecommendations?: CheckItem[];
      };
      scores?: {
        seo?: number;
        technical?: number;
        technicalHealth?: number;
      };
      issueDistribution?: {
        high?: number;
      };
    };
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

// ─── Issue card sub-component ──────────────────────────────────────────────

interface IssueCardProps {
  item: CheckItem;
  index: number;
  accentColor: string;
  badgeLabel: string;
  glow?: string;
  baseDelay: number;
  frame: number;
}

const IssueCard: React.FC<IssueCardProps> = ({
  item, index, accentColor, badgeLabel, glow, baseDelay, frame,
}) => {
  const delay = baseDelay + index * 8;
  const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(frame, [delay, delay + 15], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardY}px)`,
        background: C.glassBg,
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: `1px solid ${C.glassStroke}`,
        borderTop: `1px solid ${C.glassStrokeTop}`,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 8,
        padding: "20px 24px",
        boxShadow: glow ? `0 0 20px -5px ${glow}` : undefined,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.01em" }}>
          {item.name}
        </span>
        <AlertIcon color={accentColor} />
      </div>

      <div style={{ fontSize: 15, color: C.onSurfaceVariant, fontFamily: "sans-serif", lineHeight: 1.5, marginBottom: 12 }}>
        {item.detail}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
        {badgeLabel}
      </div>
    </div>
  );
};

// ─── Main slide ────────────────────────────────────────────────────────────

export const TechnicalHighlightsSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  if (!data) {
    console.warn("TechnicalHighlightsSlide: Missing slide data");
    return null;
  }

  console.log("Technical Data:", {
    checks: data?.auditSnapshot?.technicalHighlights?.checks,
    criticalIssues: data?.auditSnapshot?.technicalHighlights?.criticalIssues,
    recommendations: data?.auditSnapshot?.technicalHighlights?.topRecommendations,
  });

  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const technical = data?.auditSnapshot?.technicalHighlights || {};
  const checks = technical.checks || [];
  const score = data?.auditSnapshot?.scores?.technicalHealth || 0;

  const criticalIssues = checks.filter((c) => c.status === "FAIL");
  const warnings = checks.filter((c) => c.status === "WARN");

  const gridOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg }}>

      {/* ── Grid overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: gridOpacity * 0.4,
          pointerEvents: "none",
        }}
      />

      {/* ── Ambient glows ── */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40%", height: "40%", borderRadius: "50%", background: "rgba(208,188,255,0.05)", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "40%", height: "40%", borderRadius: "50%", background: "rgba(76,215,246,0.05)", filter: "blur(120px)", pointerEvents: "none" }} />

      {/* ── Content ── */}
      <div style={{ position: "absolute", inset: 0, padding: "36px 64px 40px 64px", display: "flex", flexDirection: "column", opacity }}>

        {/* Agency brand strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
            opacity: childOpacity(0),
            transform: `translateY(${childY(0)}px)`,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: C.primary,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
              color: "#3c0091",
              fontFamily: "sans-serif",
            }}
          >
            {agencyName.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: C.primary, fontFamily: "sans-serif", letterSpacing: "-0.03em" }}>
            {agencyName}
          </span>
        </div>

        {/* ── Hero Score Panel ── */}
        <div
          style={{
            opacity: childOpacity(1),
            transform: `translateY(${childY(1)}px)`,
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(109,59,215,0.15) 0%, transparent 70%)",
            backgroundColor: C.glassBg,
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: `1px solid ${C.glassStroke}`,
            borderTop: `1px solid ${C.glassStrokeTop}`,
            borderRadius: 12,
            padding: "28px 48px",
            display: "flex",
            alignItems: "center",
            gap: 48,
            position: "relative",
            overflow: "hidden",
            marginBottom: 28,
            flexShrink: 0,
          }}
        >
          {/* Ring gauge */}
          <div style={{ flexShrink: 0 }}>
            <ScoreGauge
              score={score}
              color={C.primaryContainer}
              size={210}
              strokeWidth={11}
              startFrame={10}
              animDuration={35}
            />
          </div>

          {/* Health meta */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.secondary, textTransform: "uppercase" as const, letterSpacing: "0.1em", fontFamily: "sans-serif", marginBottom: 8 }}>
              TECHNICAL HEALTH
            </div>
            <div style={{ fontSize: 48, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 12 }}>
              Technical Health
            </div>
            <div style={{ fontSize: 18, color: C.onSurfaceVariant, fontFamily: "sans-serif", marginBottom: 20 }}>
              We have checked {checks.length} technical checks
            </div>

            {/* CORE WEB VITALS PASSED badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 100,
                background: C.surfaceContainerLow,
                border: `1px solid ${C.glassStroke}`,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.successGreen }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "0.05em" }}>
                CORE WEB VITALS PASSED
              </span>
            </div>
          </div>

          {/* Decorative watermark — query_stats approximation */}
          <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.08, pointerEvents: "none" }}>
            <svg width="280" height="280" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              <circle cx="17.5" cy="17.5" r="2.5" />
              <line x1="19.3" y1="19.3" x2="22" y2="22" />
            </svg>
          </div>
        </div>

        {/* ── Two-column findings grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, flex: 1, minHeight: 0 }}>

          {/* Critical Issues */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              opacity: childOpacity(2),
              transform: `translateY(${childY(2)}px)`,
            }}
          >
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.error }} />
              <span style={{ fontSize: 24, fontWeight: 600, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.01em" }}>
                Critical Issues ({criticalIssues.length})
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {criticalIssues.length === 0 ? (
                <div style={{ padding: "24px", background: "rgba(24,168,83,0.06)", border: "1px solid rgba(24,168,83,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 16, color: C.successGreen, fontFamily: "sans-serif", fontWeight: 600 }}>No critical issues found</span>
                </div>
              ) : (
                criticalIssues.slice(0, 3).map((item, i) => (
                  <IssueCard
                    key={i}
                    item={item}
                    index={i}
                    accentColor={C.error}
                    badgeLabel="HIGH SEVERITY"
                    glow={C.errorGlow}
                    baseDelay={25}
                    frame={frame}
                  />
                ))
              )}
            </div>
          </div>

          {/* Warnings */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              opacity: childOpacity(3),
              transform: `translateY(${childY(3)}px)`,
            }}
          >
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.secondary }} />
              <span style={{ fontSize: 24, fontWeight: 600, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.01em" }}>
                Warnings ({warnings.length})
              </span>
            </div>

            {/* Empty state or warning cards */}
            {warnings.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  background: "rgba(24,168,83,0.05)",
                  border: "1px solid rgba(24,168,83,0.2)",
                  borderRadius: 8,
                  padding: "48px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(24,168,83,0.2)", filter: "blur(24px)", borderRadius: "50%", transform: "scale(1.5)" }} />
                  <div style={{ position: "relative" }}>
                    <CheckCircleIcon />
                  </div>
                </div>
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ fontSize: 24, fontWeight: 600, color: C.successGreen, fontFamily: "sans-serif", letterSpacing: "-0.01em", marginBottom: 4 }}>
                    No warnings found
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.onSurfaceVariant, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                    Optimized &amp; Compliant
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {warnings.slice(0, 3).map((item, i) => (
                  <IssueCard
                    key={i}
                    item={item}
                    index={i}
                    accentColor={C.secondary}
                    badgeLabel="WARNING"
                    baseDelay={30}
                    frame={frame}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide number */}
      <div style={{ position: "absolute", bottom: 20, right: 60, fontSize: 14, color: "rgba(255,255,255,0.2)", fontFamily: "sans-serif" }}>
        07 / 11
      </div>
    </AbsoluteFill>
  );
};
