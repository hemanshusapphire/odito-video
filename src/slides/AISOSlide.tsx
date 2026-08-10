import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useSlideTiming } from "../hooks/useSlideTiming";

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:                      "#000000",
  primary:                 "#d0bcff",
  primaryContainer:        "#a078ff",
  secondary:               "#4cd7f6",
  error:                   "#ffb4ab",
  successGreen:            "#18A853",
  onSurface:               "#dbe2fb",
  onSurfaceVariant:        "#cbc3d7",
  outline:                 "#958ea0",
  surfaceContainer:        "#181f32",
  surfaceContainerLow:     "#141b2d",
  surfaceContainerHighest: "#2e3448",
  glassBg:                 "rgba(15,22,40,0.7)",
  glassStroke:             "rgba(255,255,255,0.1)",
  glassStrokeTop:          "rgba(255,255,255,0.2)",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardData {
  score: number;
  total_passed: number;
  total_failed: number;
}

interface AisoData {
  score: number;
  cards: {
    crawlability?: CardData;
    citability?: CardData;
    authority?: CardData;
    coverage?: CardData;
  };
  bots: Record<string, string>;
  issueDistribution: { critical: number; high: number; medium: number; low: number; total: number };
}

interface Props {
  data: { aiso: AisoData | null };
  narration?: string;
  brandColor?: string;
  agencyName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return C.successGreen;
  if (score >= 40) return "#facc15";
  return C.error;
}

function botStatusColor(status: string): string {
  if (status === "pass" || status === "optimized") return C.successGreen;
  if (status === "warning") return "#facc15";
  return C.error;
}

function botStatusLabel(status: string): string {
  if (status === "optimized") return "OPTIMIZED";
  if (status === "pass") return "PASS";
  if (status === "warning") return "WARNING";
  return "FAIL";
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

const SensorsIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" />
    <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
  </svg>
);

const QuoteIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={color} opacity={0.8}>
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
  </svg>
);

const ShieldIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const GlobeIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

const WarningIcon = ({ color }: { color: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ─── Platform data ────────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: "ChatGPT",    file: "chatgpt.png" },
  { name: "Claude",     file: "claude.png" },
  { name: "Gemini",     file: "gemini.png" },
  { name: "Perplexity", file: "perplexity-ai.png" },
  { name: "Bing",       file: "bing.png" },
];

// ─── Metric card meta ─────────────────────────────────────────────────────────

const CARD_META: Array<{
  key: keyof AisoData["cards"];
  label: string;
  IconEl: React.FC<{ color: string }>;
}> = [
  { key: "crawlability", label: "CRAWLABILITY", IconEl: SensorsIcon },
  { key: "citability",   label: "CITABILITY",   IconEl: QuoteIcon   },
  { key: "authority",    label: "AUTHORITY",    IconEl: ShieldIcon  },
  { key: "coverage",     label: "COVERAGE",     IconEl: GlobeIcon   },
];

// ─── Main slide ───────────────────────────────────────────────────────────────

export const AISOSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  if (!data) return null;

  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const aiso      = data.aiso;
  const score     = aiso?.score     ?? 0;
  const cards     = aiso?.cards     ?? {};
  const bots      = aiso?.bots      ?? {};
  const highCount = aiso?.issueDistribution?.high ?? 0;

  // Derive LLMS.TXT status from bots
  const botValues      = Object.values(bots);
  const llmsDetected   = botValues.length > 0 && botValues.every(s => s === "pass" || s === "optimized");

  // Score ring
  const RING_R    = 108;
  const RING_CIRC = 2 * Math.PI * RING_R;
  const ringOffset = interpolate(frame, [8, 45], [RING_CIRC, RING_CIRC * (1 - score / 100)], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayScore = Math.round(interpolate(frame, [8, 45], [0, score], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Grid
  const gridOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Network status bar
  const netBarWidth = interpolate(frame, [30, 60], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg }}>

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        opacity: gridOpacity * 0.4,
        pointerEvents: "none",
      }} />

      {/* Purple ambient glow */}
      <div style={{ position: "absolute", top: "-12%", right: "-8%", width: "45%", height: "50%", borderRadius: "50%", background: "rgba(109,59,215,0.08)", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "35%", height: "40%", borderRadius: "50%", background: "rgba(76,215,246,0.04)", filter: "blur(120px)", pointerEvents: "none" }} />

      {/* ── Full wrapper ── */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", opacity }}>

        {/* ── Main content: two columns ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "row", padding: "36px 40px 16px 40px", gap: 28, minHeight: 0 }}>

          {/* ── LEFT COLUMN (66%) ── */}
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Hero: score ring + title */}
            <div style={{
              display: "flex", alignItems: "center", gap: 48,
              opacity: childOpacity(0),
              transform: `translateY(${childY(0)}px)`,
            }}>
              {/* Score ring */}
              <div style={{ position: "relative", width: 224, height: 224, flexShrink: 0 }}>
                {/* Bloom */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(208,188,255,0.08)", filter: "blur(60px)", borderRadius: "50%", pointerEvents: "none" }} />
                <svg
                  width="224" height="224"
                  viewBox="0 0 224 224"
                  style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
                >
                  <defs>
                    <linearGradient id="aisoRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={C.primary} />
                      <stop offset="100%" stopColor="#6d3bd7" />
                    </linearGradient>
                  </defs>
                  <circle cx="112" cy="112" r={RING_R} fill="transparent" stroke="rgba(208,188,255,0.1)" strokeWidth="12" />
                  <circle cx="112" cy="112" r={RING_R} fill="transparent"
                    stroke="url(#aisoRingGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                {/* Score number centered */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 90, fontWeight: 700, color: C.primary, fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1, filter: "drop-shadow(0 0 20px rgba(208,188,255,0.4))" }}>
                    {displayScore}
                  </span>
                </div>
              </div>

              {/* Title block */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.secondary, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.3em" }}>
                  AI Search Optimization
                </span>
                <div style={{ fontSize: 52, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                  AISO Score
                </div>
                <p style={{ fontSize: 18, color: C.outline, fontFamily: "sans-serif", margin: 0, lineHeight: 1.5 }}>
                  AI Crawlability, Citability &amp; Content Discoverability
                </p>
              </div>
            </div>

            {/* ── 4 Metric cards bento ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              opacity: childOpacity(1),
              transform: `translateY(${childY(1)}px)`,
            }}>
              {CARD_META.map(({ key, label, IconEl }, i) => {
                const card  = cards[key] as CardData | undefined;
                const s     = card?.score ?? 0;
                const color = scoreColor(s);
                const isMax = s === 100;
                const cardOp = interpolate(frame, [15 + i * 8, 30 + i * 8], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    key={key}
                    style={{
                      opacity: cardOp,
                      background: C.glassBg,
                      backdropFilter: "blur(40px)",
                      WebkitBackdropFilter: "blur(40px)",
                      border: `1px solid ${C.glassStroke}`,
                      borderTop: `1px solid ${C.glassStrokeTop}`,
                      borderRadius: 10,
                      padding: "22px 20px",
                      height: 150,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(208,188,255,0.3), transparent)" }} />
                    {/* Top row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.outline, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                        {label}
                      </span>
                      <IconEl color={`${C.secondary}80`} />
                    </div>
                    {/* Score + sub */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                      <span style={{ fontSize: 48, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>
                        {s}
                      </span>
                      {isMax && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.outline, fontFamily: "monospace", marginBottom: 8 }}>MAX</span>
                      )}
                      {!isMax && s > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: color, fontFamily: "monospace", marginBottom: 8 }}>
                          {s >= 70 ? "GOOD" : s >= 40 ? "FAIR" : "LOW"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── LLMS.TXT Status card ── */}
            <div style={{
              display: "flex", alignItems: "center", gap: 28,
              background: C.glassBg,
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: `1px solid ${C.glassStroke}`,
              borderTop: `1px solid ${C.glassStrokeTop}`,
              borderLeft: `4px solid ${llmsDetected ? C.successGreen : "rgba(255,180,171,0.5)"}`,
              borderRadius: 14,
              padding: "24px 28px",
              boxShadow: `0 0 20px rgba(255,180,171,0.1)`,
              opacity: childOpacity(2),
              transform: `translateY(${childY(2)}px)`,
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(208,188,255,0.3), transparent)" }} />
              {/* Icon */}
              <div style={{ width: 60, height: 60, borderRadius: 10, background: "rgba(255,180,171,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <WarningIcon color={C.error} />
              </div>
              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 600, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.01em" }}>
                    LLMS.TXT Status
                  </span>
                  <div style={{
                    background: llmsDetected ? "rgba(24,168,83,0.2)" : "rgba(255,180,171,0.15)",
                    color: llmsDetected ? C.successGreen : C.error,
                    padding: "5px 16px",
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                  }}>
                    {llmsDetected ? "DETECTED" : "NOT DETECTED"}
                  </div>
                </div>
                <p style={{ fontSize: 15, color: C.outline, fontFamily: "sans-serif", margin: 0, lineHeight: 1.6 }}>
                  {llmsDetected
                    ? "AI crawlers can discover your llms.txt instructions. Your site is properly configured for AI model context retrieval."
                    : "AI crawlers are currently unable to discover additional AI-specific crawling instructions. Implementation of a structured llms.txt protocol is recommended to improve model context retrieval."}
                </p>
              </div>
            </div>

            {/* ── AI Crawler Instructions card (always shown, state-aware) ── */}
            {(() => {
              const accentColor   = llmsDetected ? C.successGreen : "#F59E0B";
              const accentBg      = llmsDetected ? "rgba(24,168,83,0.08)"   : "rgba(245,158,11,0.08)";
              const accentGlow    = llmsDetected ? "rgba(24,168,83,0.08)"   : "rgba(245,158,11,0.06)";
              const shimmerColor  = llmsDetected ? "rgba(24,168,83,0.3)"    : "rgba(245,158,11,0.3)";
              const badgeBg       = llmsDetected ? "rgba(24,168,83,0.15)"   : "rgba(245,158,11,0.15)";
              const badgeLabel    = llmsDetected ? "✓ LLMS.TXT DETECTED"    : "✕ LLMS.TXT NOT DETECTED";
              const description   = llmsDetected
                ? "AI crawlers can discover custom instructions for content access and context retrieval."
                : "AI crawlers cannot discover any dedicated AI-specific crawling instructions.";
              const items = llmsDetected
                ? [
                    "Better AI content discovery",
                    "Improved context understanding",
                    "Higher AI visibility potential",
                    "More controlled AI crawler behavior",
                  ]
                : [
                    "Reduced AI content discoverability",
                    "Lower context retrieval efficiency",
                    "Missed AI visibility opportunities",
                    "Less control over AI crawler behavior",
                  ];

              return (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 28,
                  background: C.glassBg,
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: `1px solid ${C.glassStroke}`,
                  borderTop: `1px solid ${C.glassStrokeTop}`,
                  borderLeft: `4px solid ${accentColor}`,
                  borderRadius: 14,
                  padding: "24px 28px",
                  boxShadow: `0 0 20px ${accentGlow}`,
                  opacity: childOpacity(3),
                  transform: `translateY(${childY(3)}px)`,
                  position: "relative",
                  overflow: "hidden",
                  flexShrink: 0,
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)` }} />
                  {/* Icon */}
                  <div style={{ width: 60, height: 60, borderRadius: 10, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {llmsDetected ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4" />
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                      </svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    )}
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 22, fontWeight: 600, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.01em" }}>
                        AI Crawler Instructions
                      </span>
                      <div style={{ background: badgeBg, color: accentColor, padding: "5px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                        {badgeLabel}
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: C.outline, fontFamily: "sans-serif", margin: "0 0 14px 0", lineHeight: 1.55 }}>
                      {description}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
                      {items.map(item => (
                        <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: C.onSurfaceVariant, fontFamily: "sans-serif" }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                    {!llmsDetected && (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid rgba(245,158,11,0.15)`, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: accentColor, fontFamily: "sans-serif", fontWeight: 600 }}>
                          Recommendation: Create and publish a valid llms.txt file.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── RIGHT COLUMN (33%) ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", opacity: childOpacity(1), transform: `translateY(${childY(1)}px)` }}>
            <div style={{
              flex: 1,
              background: C.glassBg,
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: `1px solid ${C.glassStroke}`,
              borderTop: `1px solid ${C.glassStrokeTop}`,
              borderRadius: 16,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(208,188,255,0.4), transparent)" }} />

              {/* Panel header */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.secondary, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.25em", display: "block", marginBottom: 6 }}>
                  NETWORK MAPPING
                </span>
                <div style={{ fontSize: 22, fontWeight: 600, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.01em" }}>
                  AI Platform Ecosystem
                </div>
              </div>

              {/* Platform logos stacked */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {PLATFORMS.map((platform, i) => {
                  const logoOp = interpolate(frame, [20 + i * 8, 36 + i * 8], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  const logoY = interpolate(frame, [20 + i * 8, 36 + i * 8], [12, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  return (
                    <div
                      key={platform.name}
                      style={{
                        flex: 1,
                        opacity: logoOp,
                        transform: `translateY(${logoY}px)`,
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        padding: "0 20px",
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${C.glassStroke}`,
                        borderRadius: 10,
                        boxShadow: `0 0 16px rgba(76,215,246,0.06)`,
                      }}
                    >
                      {/* Logo image */}
                      <div style={{ width: 76, height: 76, borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        <Img
                          src={staticFile(`ai-platforms/${platform.file}`)}
                          style={{ width: 60, height: 60, objectFit: "contain" }}
                        />
                      </div>

                      {/* Name */}
                      <span style={{ fontSize: 26, fontWeight: 600, color: C.onSurface, fontFamily: "sans-serif", flex: 1, letterSpacing: "-0.01em" }}>
                        {platform.name}
                      </span>

                      {/* Status indicator */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(24,168,83,0.12)", border: "1px solid rgba(24,168,83,0.3)", borderRadius: 6, padding: "4px 10px", flexShrink: 0 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.successGreen, boxShadow: `0 0 6px ${C.successGreen}` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Network status footer */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.glassStroke}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.outline, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
                    Network Status
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.successGreen, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    ACCESSIBLE [100%]
                  </span>
                </div>
                <div style={{ width: "100%", height: 4, background: C.surfaceContainerHighest, borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${netBarWidth}%`, background: C.successGreen, borderRadius: 100, boxShadow: `0 0 8px ${C.successGreen}` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 40px",
          borderTop: `1px solid ${C.glassStroke}`,
          flexShrink: 0,
          opacity: 0.55,
        }}>
          <div style={{ display: "flex", gap: 32 }}>
            {[
              `AUDIT_ID: 99x-AISO-077`,
              `TIMESTAMP: 2024-10-27-04:22:10Z`,
              `ENGINE: NEURAL_PATH_V4.2`,
            ].map(item => (
              <span key={item} style={{ fontSize: 10, color: C.onSurface, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                {item}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            STRICTLY CONFIDENTIAL // PROJECT ALPHA
          </span>
        </div>

      </div>
    </AbsoluteFill>
  );
};
