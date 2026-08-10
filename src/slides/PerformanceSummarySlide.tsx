import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { useSlideTiming } from "../hooks/useSlideTiming";

// ─── Design tokens (from HTML color system) ────────────────────────────────

const C = {
  bg:                "#000000",
  primary:           "#d0bcff",
  primaryContainer:  "#a078ff",
  secondary:         "#4cd7f6",   // PageSpeed ring
  successGreen:      "#18A853",   // Mobile ring
  tertiary:          "#bfc4ec",   // Desktop ring
  error:             "#ffb4ab",
  errorContainer:    "#93000a",
  onSurface:         "#dbe2fb",
  onSurfaceVariant:  "#cbc3d7",
  outline:           "#958ea0",
  surfaceVariant:    "#2e3448",
  glassBg:           "rgba(15,22,40,0.7)",
  glassStroke:       "rgba(255,255,255,0.1)",
  glassStrokeTop:    "rgba(255,255,255,0.2)",
} as const;

// ─── Business logic (preserved) ───────────────────────────────────────────

function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 50) return "C";
  return "D";
}

function getColor(score: number): string {
  if (score >= 75) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

// ─── Presentation helpers ──────────────────────────────────────────────────

function gradeUIColor(color: string): string {
  if (color === "green") return C.successGreen;
  if (color === "yellow") return "#facc15";
  return C.error;
}

function gradeGlow(color: string): string {
  if (color === "green") return "rgba(24,168,83,0.15)";
  if (color === "yellow") return "rgba(250,204,21,0.1)";
  return "rgba(255,180,171,0.15)";
}

function getGradeLabel(grade: string): string {
  if (grade === "A") return "Excellent";
  if (grade === "B") return "Good";
  if (grade === "C") return "Fair";
  return "Needs Improvement";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

function getScoreLabelColor(score: number): string {
  if (score >= 75) return C.successGreen;
  if (score >= 50) return "#bfc4ec";
  return C.error;
}

// ─── SVG ring gauge (path-based, 100-unit circumference) ──────────────────

const RING_PATH =
  "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

interface RingGaugeProps {
  score: number;
  color: string;
  size: number;
  startFrame: number;
}

const RingGauge: React.FC<RingGaugeProps> = ({ score, color, size, startFrame }) => {
  const frame = useCurrentFrame();
  const clamped = Math.max(0, Math.min(100, score ?? 0));

  const dashOffset = interpolate(
    frame,
    [startFrame, startFrame + 36],
    [100, 100 - clamped],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const displayScore = Math.round(
    interpolate(frame, [startFrame, startFrame + 36], [0, clamped], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const numSize = Math.round(size * 0.21);
  const subSize = Math.round(size * 0.07);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 36 36" width={size} height={size}>
        {/* Track */}
        <path d={RING_PATH} fill="none" stroke={C.surfaceVariant} strokeWidth="2" />
        {/* Progress ring */}
        <path
          d={RING_PATH}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="100 100"
          strokeDashoffset={dashOffset}
          transform="rotate(-90 18 18)"
        />
      </svg>
      {/* Center labels */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: numSize, fontWeight: 700, color, fontFamily: "sans-serif", lineHeight: 1 }}>
          {displayScore}
        </span>
        <span
          style={{
            fontSize: subSize,
            color: C.outline,
            fontFamily: "monospace",
            textTransform: "uppercase" as const,
            letterSpacing: "0.15em",
            marginTop: -2,
          }}
        >
          / 100
        </span>
      </div>
    </div>
  );
};

// ─── Icons ─────────────────────────────────────────────────────────────────

const BoltIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={C.error}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const InsightsIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const RocketIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m3.29 15 1.42 1.41" />
    <path d="m6 4 3 3" />
    <path d="M10 2c-1.5 1.5-4 5-4 9" />
    <path d="M14 2c1.5 1.5 4 5 4 9" />
    <path d="m18 4-3 3" />
    <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
  </svg>
);

// ─── Props ─────────────────────────────────────────────────────────────────

interface Props {
  data: {
    pageSpeed: number;
    mobileScore: number;
    desktopScore: number;
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

// ─── Main slide ─────────────────────────────────────────────────────────────

export const PerformanceSummarySlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  console.log("Performance Data:", data);

  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  // ── Data bindings (preserved) ──
  const overall = data?.pageSpeed ?? 0;
  const mobile = data?.mobileScore ?? 0;
  const desktop = data?.desktopScore ?? 0;

  const grade = getGrade(overall);
  const color = getColor(overall);
  const uiColor = gradeUIColor(color);
  const panelGlow = gradeGlow(color);

  // Dynamic insight text (preserved)
  const insightText =
    mobile < desktop
      ? "Mobile performance needs optimization - 60% of traffic is mobile"
      : "Consistent performance across devices provides good user experience";

  // Background grid
  const gridOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing red dot
  const dotPulse = interpolate(frame % 60, [0, 30, 60], [1, 0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg }}>

      {/* ── Atmosphere ── */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "80px 80px", opacity: gridOpacity * 0.3, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", background: "rgba(85,22,190,0.2)", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: "rgba(147,0,10,0.1)", filter: "blur(120px)", pointerEvents: "none" }} />

      {/* ── Floating decorative side element ── */}
      <div
        style={{
          position: "absolute",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: childOpacity(3) * 0.5,
        }}
      >
        <div style={{ width: 1, height: 120, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)" }} />
        <div
          style={{
            writingMode: "vertical-rl" as any,
            fontSize: 10,
            color: C.outline,
            fontFamily: "monospace",
            letterSpacing: "0.4em",
            whiteSpace: "nowrap",
          }}
        >
          PERFORMANCE_INDEX_0432
        </div>
        <div style={{ width: 1, height: 120, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)" }} />
      </div>

      {/* ── Main layout (flex-col justify-between) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "40px 96px 32px 96px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity,
        }}
      >

        {/* ── Header ── */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: childOpacity(0),
            transform: `translateY(${childY(0)}px)`,
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: C.primary,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 16,
                color: "#3c0091",
                fontFamily: "sans-serif",
                boxShadow: "0 0 20px rgba(208,188,255,0.4)",
              }}
            >
              {agencyName.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontWeight: 600, fontSize: 22, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.04em" }}>
              {agencyName}
            </span>
          </div>

          {/* Status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.outline, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.error, opacity: dotPulse, boxShadow: `0 0 8px ${C.error}` }} />
            System Audit // Active Report
          </div>
        </header>

        {/* ── Center content ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, flex: 1, justifyContent: "center" }}>

          {/* Title cluster */}
          <div
            style={{
              textAlign: "center",
              opacity: childOpacity(1),
              transform: `translateY(${childY(1)}px)`,
            }}
          >
            {/* Performance Metrics badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                background: "rgba(147,0,10,0.2)",
                border: "1px solid rgba(255,180,171,0.2)",
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 700,
                color: C.error,
                fontFamily: "monospace",
                textTransform: "uppercase" as const,
                letterSpacing: "0.2em",
                marginBottom: 16,
              }}
            >
              <BoltIcon />
              Performance Metrics
            </div>

            {/* Title */}
            <div style={{ fontSize: 56, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>
              Performance Summary
            </div>

            {/* Subtitle */}
            <div style={{ fontSize: 18, color: C.onSurfaceVariant, fontFamily: "sans-serif", opacity: 0.7 }}>
              Speed and user experience across devices
            </div>
          </div>

          {/* Grade panel */}
          <div
            style={{
              opacity: childOpacity(2),
              transform: `translateY(${childY(2)}px)`,
            }}
          >
            <div
              style={{
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: `1px solid ${C.glassStroke}`,
                borderRadius: 32,
                padding: "28px 48px",
                display: "flex",
                alignItems: "center",
                gap: 32,
                boxShadow: `0 0 40px ${panelGlow}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Gradient shimmer overlay (glass-panel::after) */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)", pointerEvents: "none" }} />

              {/* Grade letter */}
              <div
                style={{
                  fontSize: 120,
                  fontWeight: 800,
                  color: uiColor,
                  fontFamily: "sans-serif",
                  lineHeight: 1,
                  filter: `drop-shadow(0 0 15px ${uiColor}80)`,
                  position: "relative",
                }}
              >
                {grade}
              </div>

              {/* Grade meta */}
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.01em", marginBottom: 8 }}>
                  Overall Performance
                </div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    background: `${uiColor}1a`,
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    color: uiColor,
                    fontFamily: "monospace",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.15em",
                  }}
                >
                  {getGradeLabel(grade)}
                </div>
              </div>
            </div>
          </div>

          {/* 3-ring gauge row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 64,
              width: "100%",
              maxWidth: 900,
              opacity: childOpacity(3),
              transform: `translateY(${childY(3)}px)`,
            }}
          >
            {[
              { score: overall,  label: "PageSpeed", color: C.secondary,    startFrame: 18 },
              { score: mobile,   label: "Mobile",    color: C.successGreen,  startFrame: 26 },
              { score: desktop,  label: "Desktop",   color: C.tertiary,      startFrame: 34 },
            ].map(({ score: s, label, color: ringColor, startFrame }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <RingGauge score={s} color={ringColor} size={160} startFrame={startFrame} />
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: C.onSurface, fontFamily: "sans-serif", marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: getScoreLabelColor(s), fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                    {getScoreLabel(s)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom section (insights + footer) ── */}
        <div
          style={{
            opacity: childOpacity(4),
            transform: `translateY(${childY(4)}px)`,
          }}
        >
          {/* Insights row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            {/* Key Insights */}
            <div
              style={{
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: `1px solid ${C.glassStroke}`,
                borderRadius: 8,
                padding: "24px 28px",
                display: "flex",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: "rgba(160,120,255,0.1)",
                  border: "1px solid rgba(160,120,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <InsightsIcon color={C.primaryContainer} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 8, opacity: 0.6 }}>
                  Key Insights
                </div>
                <div style={{ fontSize: 17, color: C.onSurfaceVariant, fontFamily: "sans-serif", lineHeight: 1.5 }}>
                  {insightText}
                </div>
              </div>
            </div>

            {/* Quick Wins */}
            <div
              style={{
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: `1px solid ${C.glassStroke}`,
                borderRadius: 8,
                padding: "24px 28px",
                display: "flex",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: "rgba(3,181,211,0.1)",
                  border: "1px solid rgba(3,181,211,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <RocketIcon color="#03b5d3" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 8, opacity: 0.6 }}>
                  Quick Wins
                </div>
                <div style={{ fontSize: 17, color: C.onSurfaceVariant, fontFamily: "sans-serif", lineHeight: 1.5 }}>
                  Optimize images and enable compression to improve PageSpeed by 10-15 points
                </div>
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <div
            style={{
              borderTop: `1px solid ${C.glassStroke}`,
              paddingTop: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: 0.5,
            }}
          >
            <div style={{ fontSize: 10, color: C.outline, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
              © 2024 {agencyName.toUpperCase()} // AI AUDIT DIVISION
            </div>
            <div style={{ display: "flex", gap: 28, fontSize: 10, color: C.outline, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
              <span>Confidentiality Terms</span>
              <span>Data Provenance</span>
              <span>System Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide number */}
      <div style={{ position: "absolute", bottom: 8, right: 96, fontSize: 13, color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>
        09 / 11
      </div>
    </AbsoluteFill>
  );
};
