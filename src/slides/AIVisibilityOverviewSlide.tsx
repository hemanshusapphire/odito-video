import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AIPlatformOrbit } from "../components/common/AIPlatformOrbit";
import { useSlideTiming } from "../hooks/useSlideTiming";

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:                      "#000000",
  primary:                 "#d0bcff",
  secondary:               "#4cd7f6",
  tertiary:                "#bfc4ec",
  error:                   "#ffb4ab",
  successGreen:            "#18A853",
  onSurface:               "#dbe2fb",
  onSurfaceVariant:        "#cbc3d7",
  outline:                 "#958ea0",
  surfaceContainer:        "#181f32",
  surfaceContainerHighest: "#2e3448",
  glassBg:                 "rgba(15,22,40,0.7)",
  glassStroke:             "rgba(255,255,255,0.1)",
  glassStrokeTop:          "rgba(255,255,255,0.2)",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  data: {
    aiHubSnapshot: {
      overallScore: number;
      pagesScored: number;
      hubScores: { aiso: number; aeo: number; geo: number };
      issuesBySeverity: { critical: number; high: number; medium: number; low: number };
    } | null;
  };
  narration?: string;
  brandColor?: string;
  agencyName?: string;
}


// ─── Main slide ───────────────────────────────────────────────────────────────

export const AIVisibilityOverviewSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  if (!data) return null;

  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const hub           = data.aiHubSnapshot;
  const overallScore  = hub?.overallScore ?? 0;
  const pagesScored   = hub?.pagesScored  ?? 0;
  const aisoScore     = hub?.hubScores?.aiso ?? 0;
  const aeoScore      = hub?.hubScores?.aeo  ?? 0;
  const geoScore      = hub?.hubScores?.geo  ?? 0;
  const criticalCount = hub?.issuesBySeverity?.critical ?? 0;
  const highCount     = hub?.issuesBySeverity?.high     ?? 0;
  const mediumCount   = hub?.issuesBySeverity?.medium   ?? 0;
  const lowCount      = hub?.issuesBySeverity?.low      ?? 0;

  const gridOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Orbital ring slow rotation
  const ringRotation = frame * 1.2;

  // Hub score progress bars
  const aisoBar = interpolate(frame, [18, 48], [0, aisoScore], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const aeoBar  = interpolate(frame, [24, 54], [0, aeoScore],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const geoBar  = interpolate(frame, [30, 60], [0, geoScore],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Sequential hub card reveals
  const hubCardOps = [0, 1, 2].map(i =>
    interpolate(frame, [14 + i * 8, 30 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );

  // Issue bar percentages
  const totalIssues = criticalCount + highCount + mediumCount + lowCount;
  const safe = (n: number) => totalIssues > 0 ? (n / totalIssues) * 100 : 0;

  const hubLabels     = ["AISO", "AEO", "GEO"];
  const hubColors     = [C.primary, C.secondary, C.tertiary];
  const hubScoreVals  = [aisoScore, aeoScore, geoScore];
  const hubBarWidths  = [aisoBar, aeoBar, geoBar];

  return (
    <AbsoluteFill style={{ background: C.bg }}>

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        opacity: gridOpacity * 0.4,
        pointerEvents: "none",
      }} />

      {/* Ambient indigo — top right */}
      <div style={{ position: "absolute", top: "-12%", right: "-8%", width: "45%", height: "50%", borderRadius: "50%", background: "rgba(109,59,215,0.08)", filter: "blur(120px)", pointerEvents: "none" }} />

      {/* Ambient cyan — bottom left */}
      <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "35%", height: "40%", borderRadius: "50%", background: "rgba(76,215,246,0.05)", filter: "blur(120px)", pointerEvents: "none" }} />

      {/* ── Full wrapper ── */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", opacity }}>

        {/* ── Main two-column area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "row", padding: "40px 56px 16px 56px", gap: 48, minHeight: 0 }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ flex: 1.1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>

            {/* Hero text */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: childOpacity(0), transform: `translateY(${childY(0)}px)` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.secondary, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>
                AI Search Visibility Report
              </span>
              <div style={{ fontSize: 52, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1.08 }}>
                AI Visibility Overview
              </div>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: C.onSurfaceVariant, fontFamily: "sans-serif", maxWidth: 480, margin: 0 }}>
                Measure how visible, understandable and trustworthy your website appears across modern AI search systems including ChatGPT, Claude, Gemini, Perplexity and Bing.
              </p>
            </div>

            {/* AISO / AEO / GEO cards */}
            <div style={{ display: "flex", flexDirection: "row", gap: 14 }}>
              {hubLabels.map((label, i) => (
                <div key={i} style={{
                  flex: 1,
                  opacity: hubCardOps[i],
                  background: C.glassBg,
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: `1px solid ${C.glassStroke}`,
                  borderTop: `1px solid ${C.glassStrokeTop}`,
                  borderRadius: 10,
                  padding: "22px 20px",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(208,188,255,0.35), transparent)" }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: C.outline, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                    {label}
                  </span>
                  <div style={{ fontSize: 52, fontWeight: 700, color: hubColors[i], fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 14 }}>
                    {hubScoreVals[i]}
                  </div>
                  <div style={{ width: "100%", height: 4, background: C.surfaceContainerHighest, borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${hubBarWidths[i]}%`, background: hubColors[i], borderRadius: 100, boxShadow: `0 0 8px ${hubColors[i]}99` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ flex: 0.9, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>

            {/* Decorative SVG lines */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.28, pointerEvents: "none" }} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
              <path d="M 680 60 Q 400 180 400 300" fill="none" stroke={C.primary} strokeWidth="1" />
              <path d="M 720 480 Q 560 400 400 300" fill="none" stroke={C.error} strokeWidth="1" />
              <path d="M 400 540 Q 400 420 400 300" fill="none" stroke={C.secondary} strokeWidth="1" />
              <path d="M 30 300 Q 200 300 400 300" fill="none" stroke={C.error} strokeWidth="1" />
            </svg>

            <AIPlatformOrbit startFrame={18} wrapperSize={900} radius={342} nodeSize={110}>
              {/* Central score */}
              <div style={{ position: "relative", zIndex: 2, opacity: childOpacity(1) }}>

                {/* Animated orbiting ring */}
                <div style={{ position: "absolute", top: -36, left: -36, right: -36, bottom: -36, pointerEvents: "none" }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: `rotate(${ringRotation}deg)` }}>
                    <defs>
                      <linearGradient id="ovRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={C.primary} />
                        <stop offset="100%" stopColor={C.secondary} />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(208,188,255,0.08)" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="48" fill="none" stroke="url(#ovRingGrad)" strokeWidth="2" strokeDasharray="60 240" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Glass circle */}
                <div style={{
                  width: 310, height: 310, borderRadius: "50%",
                  background: "rgba(208,188,255,0.04)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: "2px solid rgba(208,188,255,0.15)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  boxShadow: "inset 0 0 60px rgba(208,188,255,0.03)",
                }}>
                  <div style={{ fontSize: 108, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {overallScore}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: C.outline, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em", textAlign: "center" as const, maxWidth: 150, lineHeight: 1.5, marginTop: 8 }}>
                    Overall AI Visibility Score
                  </div>
                </div>

                {/* Pages pill */}
                <div style={{ position: "absolute", bottom: -44, left: "50%", transform: "translateX(-50%)", background: C.surfaceContainer, border: `1px solid ${C.glassStroke}`, borderRadius: 100, padding: "6px 20px", fontSize: 12, fontWeight: 500, color: C.secondary, fontFamily: "monospace", letterSpacing: "0.08em", whiteSpace: "nowrap" as const }}>
                  {pagesScored} Pages Evaluated
                </div>
              </div>
            </AIPlatformOrbit>
          </div>
        </div>

        {/* ── Bottom insights strip ── */}
        <div style={{ padding: "0 56px 12px 56px", flexShrink: 0, opacity: childOpacity(3), transform: `translateY(${childY(3)}px)`, position: "relative", zIndex: 10 }}>
          <div style={{
            background: C.glassBg,
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: `1px solid ${C.glassStroke}`,
            borderTop: `1px solid ${C.glassStrokeTop}`,
            borderRadius: 12,
            padding: "18px 28px",
            display: "flex", flexDirection: "row", alignItems: "center", gap: 24,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(208,188,255,0.4), transparent)" }} />

            {/* Issue legend */}
            <div style={{ flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: C.outline, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" as const, display: "block", marginBottom: 10 }}>
                Executive Insights
              </span>
              <div style={{ display: "flex", flexDirection: "row", gap: 20 }}>
                {[
                  { label: "Critical", count: criticalCount, color: C.error },
                  { label: "High",     count: highCount,     color: "#fb923c" },
                  { label: "Medium",   count: mediumCount,   color: "#facc15" },
                  { label: "Low",      count: lowCount,      color: C.secondary },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: C.onSurface, letterSpacing: "0.04em" }}>
                      {item.label}: {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Segmented bar + italic text */}
            <div style={{ flex: 1 }}>
              <div style={{ width: "100%", height: 8, background: C.surfaceContainerHighest, borderRadius: 100, overflow: "hidden", display: "flex", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${safe(criticalCount)}%`, background: C.error }} />
                <div style={{ height: "100%", width: `${safe(highCount)}%`, background: "#fb923c" }} />
                <div style={{ height: "100%", width: `${safe(mediumCount)}%`, background: "#facc15" }} />
                <div style={{ height: "100%", width: `${safe(lowCount)}%`, background: C.secondary }} />
              </div>
              <p style={{ fontSize: 11, fontFamily: "monospace", color: C.outline, letterSpacing: "0.04em", fontStyle: "italic" as const, margin: 0, lineHeight: 1.5 }}>
                AI visibility opportunities identified across entity recognition, answer readiness and AI search discoverability.
              </p>
            </div>

            {/* Separator */}
            <div style={{ width: 1, height: 48, background: C.glassStroke, flexShrink: 0 }} />

            {/* Confidence interval */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.secondary, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 4 }}>
                Confidence Interval
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", letterSpacing: "-0.02em" }}>94%</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.successGreen, fontFamily: "sans-serif", textTransform: "uppercase" as const }}>Optimal</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 56px", borderTop: `1px solid ${C.glassStroke}`, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", fontFamily: "monospace", letterSpacing: "0.06em" }}>
            © 2024 NEURAL ARCHITECT. ALL RIGHTS RESERVED. CONFIDENTIAL ENTERPRISE DATA.
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            {["Terms of Intelligence", "Privacy Protocol", "Data Sovereignty"].map(item => (
              <span key={item} style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", fontFamily: "monospace" }}>{item}</span>
            ))}
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
