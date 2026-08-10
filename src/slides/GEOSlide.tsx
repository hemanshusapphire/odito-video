import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useSlideTiming } from "../hooks/useSlideTiming";

// ─── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg:                      "#000000",
  primary:                 "#d0bcff",
  primaryContainer:        "#a078ff",
  secondary:               "#4cd7f6",
  error:                   "#ffb4ab",
  successGreen:            "#18A853",
  onSurface:               "#dbe2fb",
  outline:                 "#958ea0",
  surfaceContainerHigh:    "#23293c",
  surfaceContainerHighest: "#2e3448",
  surfaceBlack:            "#000000",
  glassBg:                 "rgba(15,22,40,0.5)",
  glassStroke:             "rgba(255,255,255,0.1)",
  glassStrokeTop:          "rgba(255,255,255,0.2)",
} as const;

// ─── Types (unchanged) ────────────────────────────────────────────────────────

interface GeoCardData {
  score: number;
  total_passed: number;
  total_failed: number;
}

interface GeoData {
  score: number;
  cards: Record<string, GeoCardData>;
  entityTrustScore: string;
  issueDistribution: { critical: number; high: number; medium: number; low: number; total: number };
}

interface Props {
  data: { geo: GeoData | null };
  narration?: string;
  brandColor?: string;
  agencyName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreStatusLabel(score: number): string {
  if (score >= 70) return "EXCELLENT";
  if (score >= 55) return "GOOD";
  if (score >= 40) return "FAIR";
  if (score >= 25) return "LOW";
  return "CRITICAL";
}

function cardTrendText(score: number): string {
  if (score >= 60) return "STABLE";
  if (score >= 35) return "MODERATE";
  if (score > 0)   return "LOW";
  return "CRITICAL";
}

function cardTrendColor(score: number): string {
  if (score >= 60) return C.outline;
  if (score >= 35) return C.outline;
  return C.error;
}

interface NodeStatus {
  label: string;
  borderColor: string;
  borderWidth: number;
  labelColor: string;
  hasRing: boolean;
}

function nodeStatus(score: number): NodeStatus {
  if (score >= 40) return { label: "MODERATE", borderColor: `${C.primary}66`, borderWidth: 1, labelColor: C.outline,    hasRing: false };
  if (score >= 8)  return { label: "WEAK",     borderColor: `${C.error}66`,   borderWidth: 1, labelColor: C.outline,    hasRing: false };
  return {           label: "CRITICAL",  borderColor: C.error,           borderWidth: 2, labelColor: C.error,      hasRing: true  };
}

function validationStatusText(score: number): string {
  if (score >= 70) return "COMPLETE";
  if (score >= 40) return "PARTIAL";
  return "INCOMPLETE";
}

function validationStatusColor(score: number): string {
  if (score >= 70) return C.successGreen;
  if (score >= 40) return C.primary;
  return C.error;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const StarsIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const TreeIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2" />
    <circle cx="5"  cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
    <line x1="12" y1="7"  x2="12" y2="12" />
    <line x1="12" y1="12" x2="5"  y2="17" />
    <line x1="12" y1="12" x2="19" y2="17" />
  </svg>
);

const FactCheckIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <polyline points="9 11 11 13 15 9" />
    <line x1="9" y1="16" x2="15" y2="16" />
  </svg>
);

const DataObjectIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9"  y1="20" x2="15" y2="20" />
    <line x1="12" y1="4"  x2="12" y2="20" />
  </svg>
);

const HubIcon = ({ color }: { color: string }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="4"  r="1.5" />
    <circle cx="20" cy="12" r="1.5" />
    <circle cx="12" cy="20" r="1.5" />
    <circle cx="4"  cy="12" r="1.5" />
    <line x1="12" y1="6"  x2="12" y2="9" />
    <line x1="15" y1="12" x2="18" y2="12" />
    <line x1="12" y1="15" x2="12" y2="18" />
    <line x1="9"  y1="12" x2="6"  y2="12" />
  </svg>
);

// ─── Metric card config ───────────────────────────────────────────────────────

const METRIC_CARDS = [
  { key: "entity_authority",      label: "ENTITY AUTHORITY",      IconEl: StarsIcon      },
  { key: "knowledge_graph_score", label: "KNOWLEDGE GRAPH SCORE", IconEl: TreeIcon       },
  { key: "brand_corroboration",   label: "BRAND CORROBORATION",   IconEl: FactCheckIcon  },
  { key: "schema_coverage",       label: "SCHEMA COVERAGE",       IconEl: DataObjectIcon },
] as const;

// Bottom card left-border colors matching the reference
const BOTTOM_CARD_BORDER = {
  entity_authority:      `${C.primary}80`,
  knowledge_graph_score: `${C.primary}80`,
  brand_corroboration:   C.error,
  schema_coverage:       C.secondary,
} as const;

// ─── Main slide ───────────────────────────────────────────────────────────────

export const GEOSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  if (!data) return null;

  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const geo   = data.geo;
  const score = geo?.score            ?? 0;
  const grade = geo?.entityTrustScore ?? "C";
  const cards = geo?.cards            ?? {};

  const ea  = cards.entity_authority      ?? { score: 0, total_passed: 0, total_failed: 0 };
  const kg  = cards.knowledge_graph_score ?? { score: 0, total_passed: 0, total_failed: 0 };
  const bc  = cards.brand_corroboration   ?? { score: 0, total_passed: 0, total_failed: 0 };
  const sc  = cards.schema_coverage       ?? { score: 0, total_passed: 0, total_failed: 0 };

  const cardValues: Record<string, GeoCardData> = {
    entity_authority:      ea,
    knowledge_graph_score: kg,
    brand_corroboration:   bc,
    schema_coverage:       sc,
  };

  // Score ring: dasharray=628 matches HTML exactly
  const RING_TOTAL  = 628;
  const targetOffset = RING_TOTAL - (RING_TOTAL * score / 100);
  const ringDashOffset = interpolate(frame, [8, 55], [RING_TOTAL, targetOffset], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Validation bar animation
  const validBarW = interpolate(frame, [20, 55], [0, score], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hub node pulse (4s = 120 frames at 30fps): opacity 0.6→1→0.6
  const hubOpacity = 0.8 - 0.2 * Math.cos((frame / 120) * 2 * Math.PI);
  const hubScale   = 1.025 - 0.025 * Math.cos((frame / 120) * 2 * Math.PI);

  // Grid bg opacity
  const gridOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Peripheral nodes
  const eaNode = nodeStatus(ea.score);
  const kgNode = nodeStatus(kg.score);
  const bcNode = nodeStatus(bc.score);
  const scNode = nodeStatus(sc.score);

  const validColor = validationStatusColor(score);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>

      {/* ── Background ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)," +
          "linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
        opacity: gridOpacity * 0.4,
        pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 30%, rgba(30,15,100,0.4) 0%, transparent 55%), radial-gradient(ellipse at 25% 65%, rgba(5,50,70,0.3) 0%, transparent 50%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 30%, rgba(0,0,0,0.15) 100%)", pointerEvents: "none" }} />

      {/* ── Main layout ── */}
      <div style={{ position: "absolute", inset: 0, padding: 40, display: "flex", flexDirection: "column", justifyContent: "space-between", opacity }}>

        {/* ── TOP SECTION ── */}
        <section style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 48 }}>

          {/* Hero text */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.secondary, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.3em", marginBottom: 16 }}>
              Generative Engine Optimization
            </span>
            <div style={{ fontSize: 64, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
              GEO Score
            </div>
            <p style={{ fontSize: 16, color: C.outline, fontFamily: "sans-serif", margin: 0, lineHeight: 1.6, maxWidth: 480 }}>
              Measures how well AI systems recognize, validate and trust your<br />brand entity across generative search experiences.
            </p>
          </div>

          {/* Score ring */}
          <div style={{ position: "relative", width: 256, height: 256, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {/* Purple bloom */}
            <div style={{ position: "absolute", inset: 0, background: `${C.primary}0d`, filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />
            {/* Rotating SVG */}
            <svg
              width="256" height="256"
              viewBox="0 0 256 256"
              style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)", transformOrigin: "128px 128px" }}
            >
              <defs>
                <linearGradient id="geoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={C.primary} />
                  <stop offset="100%" stopColor={C.secondary} />
                </linearGradient>
              </defs>
              {/* Track */}
              <circle cx="128" cy="128" r="110" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              {/* Animated arc */}
              <circle
                cx="128" cy="128" r="110"
                fill="transparent"
                stroke="url(#geoGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={RING_TOTAL}
                strokeDashoffset={ringDashOffset}
                style={{ filter: "drop-shadow(0 0 20px rgba(208,188,255,0.4)) drop-shadow(0 0 40px rgba(76,215,246,0.2))" }}
              />
            </svg>
            {/* Score display */}
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 100, fontWeight: 700, color: C.primary, fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1, textShadow: "0 0 20px rgba(208,188,255,0.4)" }}>
                {score}
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.outline, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.4em", marginTop: 8 }}>
                {scoreStatusLabel(score)}
              </span>
            </div>
          </div>
        </section>

        {/* ── CENTER SECTION ── */}
        <section style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "7fr 5fr",
          gap: 48,
          alignItems: "center",
          paddingTop: 48,
          paddingBottom: 48,
          opacity: childOpacity(0),
          transform: `translateY(${childY(0)}px)`,
        }}>

          {/* Left: 2×2 metric cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, height: "100%" }}>
            {METRIC_CARDS.map(({ key, label, IconEl }) => {
              const card  = cardValues[key];
              const s     = card.score;
              const trend = cardTrendText(s);
              const trendColor = cardTrendColor(s);
              const iconColor = key === "brand_corroboration"
                ? `${C.outline}80`
                : key === "schema_coverage" || key === "knowledge_graph_score"
                ? `${C.secondary}80`
                : `${C.primary}80`;

              return (
                <div key={key} style={{
                  background: C.glassBg,
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: `1px solid ${C.glassStroke}`,
                  borderRadius: 16,
                  padding: 32,
                  height: 176,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}>
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.outline, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                      {label}
                    </span>
                    <IconEl color={iconColor} />
                  </div>
                  {/* Score + trend */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                    <span style={{ fontSize: 48, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {s}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: trendColor, fontFamily: "monospace", marginBottom: 8 }}>
                      {trend}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Entity Trust Ecosystem */}
          <div style={{
            background: C.glassBg,
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: `1px solid ${C.glassStroke}`,
            borderTop: `1px solid ${C.glassStrokeTop}`,
            borderRadius: 16,
            padding: 40,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(76,215,246,0.3), transparent)" }} />

            {/* Panel header */}
            <div style={{ marginBottom: 40, position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.secondary, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.2em", display: "block", marginBottom: 8 }}>
                Entity Relations
              </span>
              <div style={{ fontSize: 28, fontWeight: 600, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.02em" }}>
                Entity Trust Ecosystem
              </div>
            </div>

            {/* Visualization area */}
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

              {/* Connection SVG */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2, pointerEvents: "none" }}>
                <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="white" strokeDasharray="4" />
                <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="white" strokeDasharray="4" />
                <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="white" strokeDasharray="4" />
                <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="white" strokeDasharray="4" />
              </svg>

              {/* Center hub node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, position: "relative" }}>
                <div style={{
                  width: 112, height: 112,
                  borderRadius: 16,
                  background: C.surfaceContainerHigh,
                  border: `2px solid ${C.secondary}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 30px rgba(76,215,246,0.3)",
                  opacity: hubOpacity,
                  transform: `scale(${hubScale})`,
                }}>
                  <HubIcon color={C.secondary} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.secondary, fontFamily: "monospace", letterSpacing: "0.2em", marginTop: 16, textTransform: "uppercase" as const }}>
                  {agencyName.toUpperCase()}
                </span>
                <div style={{ marginTop: 16, padding: "8px 20px", background: `${C.secondary}1a`, border: `1px solid ${C.secondary}4d`, borderRadius: 100 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: C.secondary, fontFamily: "sans-serif" }}>
                    GRADE {grade}
                  </span>
                </div>
              </div>

              {/* Peripheral nodes */}
              {/* Top-left: entity_authority */}
              <div style={{ position: "absolute", top: "10%", left: "10%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: `${eaNode.borderWidth}px solid ${eaNode.borderColor}`, background: `${C.surfaceBlack}99`, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: eaNode.hasRing ? `0 0 0 8px ${C.error}1a` : undefined }} />
                <span style={{ fontSize: 10, fontFamily: "monospace", color: eaNode.labelColor, textTransform: "uppercase" as const, marginTop: 8, opacity: eaNode.hasRing ? 1 : 0.5, fontWeight: eaNode.hasRing ? 700 : 400 }}>
                  {eaNode.label}
                </span>
              </div>

              {/* Top-right: knowledge_graph */}
              <div style={{ position: "absolute", top: "10%", right: "10%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: `${kgNode.borderWidth}px solid ${kgNode.borderColor}`, background: `${C.surfaceBlack}99`, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: kgNode.hasRing ? `0 0 0 8px ${C.error}1a` : undefined }} />
                <span style={{ fontSize: 10, fontFamily: "monospace", color: kgNode.labelColor, textTransform: "uppercase" as const, marginTop: 8, opacity: kgNode.hasRing ? 1 : 0.5, fontWeight: kgNode.hasRing ? 700 : 400 }}>
                  {kgNode.label}
                </span>
              </div>

              {/* Bottom-left: brand_corroboration */}
              <div style={{ position: "absolute", bottom: "10%", left: "10%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: `${bcNode.borderWidth}px solid ${bcNode.borderColor}`, background: `${C.surfaceBlack}99`, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: bcNode.hasRing ? `0 0 0 8px ${C.error}1a` : undefined }} />
                <span style={{ fontSize: 10, fontFamily: "monospace", color: bcNode.labelColor, textTransform: "uppercase" as const, marginTop: 8, opacity: bcNode.hasRing ? 1 : 0.5, fontWeight: bcNode.hasRing ? 700 : 400 }}>
                  {bcNode.label}
                </span>
              </div>

              {/* Bottom-right: schema_coverage */}
              <div style={{ position: "absolute", bottom: "10%", right: "10%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: `${scNode.borderWidth}px solid ${scNode.borderColor}`, background: `${C.surfaceBlack}99`, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: scNode.hasRing ? `0 0 0 8px ${C.error}1a` : undefined }} />
                <span style={{ fontSize: 10, fontFamily: "monospace", color: scNode.labelColor, textTransform: "uppercase" as const, marginTop: 8, opacity: scNode.hasRing ? 1 : 0.5, fontWeight: scNode.hasRing ? 700 : 400 }}>
                  {scNode.label}
                </span>
              </div>
            </div>

            {/* Validation status footer */}
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${C.glassStroke}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.outline, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                  Validation Status
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, color: validColor, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                  {validationStatusText(score)} [{score}%]
                </span>
              </div>
              <div style={{ width: "100%", height: 6, background: C.surfaceContainerHighest, borderRadius: 100, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${validBarW}%`,
                  background: validColor,
                  borderRadius: 100,
                  boxShadow: `0 0 12px ${validColor}99`,
                }} />
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM SECTION: 4 intelligence cards ── */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          paddingBottom: 48,
          opacity: childOpacity(1),
          transform: `translateY(${childY(1)}px)`,
        }}>
          {METRIC_CARDS.map(({ key, label }) => {
            const card        = cardValues[key];
            const s           = card.score;
            const leftBorder  = BOTTOM_CARD_BORDER[key];
            const scoreColor  = key === "brand_corroboration" ? C.error : key === "schema_coverage" ? C.secondary : C.primary;

            return (
              <div key={key} style={{
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: `1px solid ${C.glassStroke}`,
                borderLeft: `4px solid ${leftBorder}`,
                borderRadius: 12,
                padding: 20,
                height: 112,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                {/* Top: label + score */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: C.outline, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: scoreColor, fontFamily: "sans-serif" }}>
                    {s}
                  </span>
                </div>

                {/* Bottom: passed + failed */}
                <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.successGreen, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: C.onSurface, opacity: 0.6 }}>
                      P: {card.total_passed}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.error, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: C.onSurface, opacity: 0.6 }}>
                      F: {card.total_failed}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

      </div>
    </AbsoluteFill>
  );
};
