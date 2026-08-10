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
  onSurface:               "#dbe2fb",
  onSurfaceVariant:        "#cbc3d7",
  surfaceContainerLow:     "#141b2d",
  surfaceContainerHighest: "#2e3448",
  glassBg:                 "rgba(15,22,40,0.6)",
  glassStroke:             "rgba(255,255,255,0.1)",
  glassStrokeTop:          "rgba(255,255,255,0.2)",
} as const;

// ─── Types (unchanged) ────────────────────────────────────────────────────────

interface Signal {
  rule_id: string;
  pages_failing: number;
  score: number;
  status: "pass" | "warning" | "fail";
}

interface AeoData {
  score: number;
  cards: Record<string, { score: number; total_passed: number; total_failed: number }>;
  signals: Signal[];
  issueDistribution: { critical: number; high: number; medium: number; low: number; total: number };
}

interface Props {
  data: { aeo: AeoData | null };
  narration?: string;
  brandColor?: string;
  agencyName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SIGNAL_LABELS: Record<string, string> = {
  "AEO-046": "Direct Answers",
  "AEO-047": "Question Matching",
  "AEO-048": "FAQ Schema",
  "AEO-049": "Related Schema",
  "AEO-055": "Speakable Content",
};

const CARD_META = [
  { key: "answer_readiness",  label: "Answer Readiness"  },
  { key: "question_coverage", label: "Question Coverage" },
  { key: "snippet_score",     label: "Snippet Score"     },
  { key: "faq_coverage",      label: "FAQ Coverage"      },
  { key: "voice_search",      label: "Voice Search"      },
] as const;

function performanceGrade(score: number): string {
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 25) return "C";
  if (score >= 10) return "D";
  return "F";
}

function signalBarColor(score: number): string {
  if (score >= 60) return C.secondary;
  if (score >= 20) return C.primary;
  return C.error;
}

function cardAccentColor(score: number): string {
  if (score >= 60) return C.secondary;
  if (score >= 40) return C.primary;
  if (score > 0)   return "rgba(255,255,255,0.6)";
  return `${C.error}99`;
}

function cardStatusText(score: number): string {
  if (score === 0)  return "Inactive";
  if (score >= 60)  return "Above Avg";
  if (score >= 40)  return `${score} / 100`;
  return "Low Index";
}

function cardBadgeLabel(score: number): string {
  if (score === 0)  return "FAILED";
  if (score >= 60)  return "STABLE";
  if (score >= 40)  return "NEUTRAL";
  return "WEAK";
}

function priorityMessage(cards: Record<string, { score: number }>): string {
  const entries = Object.entries(cards);
  if (!entries.length) return "REVIEW AEO SIGNALS FOR IMPROVEMENT OPPORTUNITIES.";
  const [key, { score: s }] = entries.reduce(
    (min, e) => e[1].score < min[1].score ? e : min,
    entries[0],
  );
  const labelMap: Record<string, string> = {
    answer_readiness:  "ANSWER READINESS",
    question_coverage: "QUESTION COVERAGE",
    snippet_score:     "SNIPPET",
    faq_coverage:      "FAQ COVERAGE",
    voice_search:      "VOICE SEARCH",
  };
  const label = labelMap[key] ?? key.toUpperCase();
  if (s <= 30) {
    return `HIGH PRIORITY: LOW ${label} SCORE DETECTED. IMMEDIATE CONTENT RESTRUCTURING REQUIRED FOR SNIPPET EXTRACTION.`;
  }
  return "MONITOR: REVIEW LOW-SCORING AEO SIGNALS FOR IMPROVEMENT OPPORTUNITIES.";
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const BrainIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z" />
  </svg>
);

const QuizIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LinesIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="10" x2="14" y2="10" />
    <line x1="4" y1="14" x2="20" y2="14" />
    <line x1="4" y1="18" x2="12" y2="18" />
  </svg>
);

const HelpIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const MicIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const BoltIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
    <path d="M13 2L4.09 12.96 11 13l-2 9L20 9.04 13 9l2-7z" />
  </svg>
);

const CARD_ICONS = {
  answer_readiness:  BrainIcon,
  question_coverage: QuizIcon,
  snippet_score:     LinesIcon,
  faq_coverage:      HelpIcon,
  voice_search:      MicIcon,
} as const;

// ─── Main slide ───────────────────────────────────────────────────────────────

export const AEOSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  if (!data) return null;

  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const aeo     = data.aeo;
  const score   = aeo?.score   ?? 0;
  const cards   = aeo?.cards   ?? {};
  const signals = aeo?.signals ?? [];

  // Spinning dashed ring: 12s at 30fps = 360 frames per full rotation
  const ringRotation = (frame / 360) * 360;

  // Satellite float animations (matching CSS bounce-slow)
  const float6s  =  Math.sin((frame / 180) * Math.PI * 2) * 8;  // 6s, 30fps
  const float7sR = -Math.sin((frame / 210) * Math.PI * 2) * 8;  // 7s reversed

  const grade = performanceGrade(score);

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>

      {/* ── Background ── */}
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)," +
          "linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
        opacity: 0.2,
        pointerEvents: "none",
      }} />
      {/* Purple/indigo ambient glows matching the reference */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 72% 38%, rgba(80,40,200,0.35) 0%, transparent 55%), radial-gradient(ellipse at 25% 70%, rgba(50,20,140,0.25) 0%, transparent 50%)", pointerEvents: "none" }} />

      {/* ── Main wrapper ── */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: 24, opacity }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 8 }}>

          {/* Left: label + title + description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.2em" }}>
              Answer Engine Optimization
            </span>
            <div style={{ fontSize: 48, fontWeight: 700, color: "white", fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              AEO Score
            </div>
            <p style={{ fontSize: 16, color: `${C.onSurfaceVariant}b3`, fontFamily: "sans-serif", margin: 0, lineHeight: 1.5, maxWidth: 520, marginTop: 8 }}>
              Measures how effectively AI assistants extract, understand and deliver your<br />content as direct answers.
            </p>
          </div>

          {/* Right: spinning dashed score ring */}
          <div style={{ position: "relative", width: 208, height: 208, flexShrink: 0 }}>
            {/* Purple bloom */}
            <div style={{ position: "absolute", inset: 0, background: `${C.primary}33`, borderRadius: "50%", filter: "blur(60px)", zIndex: 0, pointerEvents: "none" }} />
            {/* Spinning ring */}
            <svg
              width="208" height="208"
              viewBox="0 0 100 100"
              style={{ position: "absolute", inset: 0, transform: `rotate(${ringRotation}deg)`, transformOrigin: "50% 50%", zIndex: 1 }}
            >
              <defs>
                <linearGradient id="aeoRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={C.primary} />
                  <stop offset="100%" stopColor={C.secondary} />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="none" stroke="url(#aeoRingGrad)" strokeDasharray="10 4" strokeWidth="1.5" />
            </svg>
            {/* Inner glass circle with score */}
            <div style={{
              position: "absolute",
              inset: 8,
              borderRadius: "50%",
              border: `1px solid ${C.glassStroke}`,
              background: `${C.surfaceContainerLow}66`,
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              zIndex: 2,
            }}>
              <span style={{ fontSize: 72, fontWeight: 800, color: "white", fontFamily: "sans-serif", letterSpacing: "-0.06em", lineHeight: 1 }}>
                {score}
              </span>
              <span style={{ fontSize: 12, color: `${C.primary}99`, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.2em", marginTop: 4 }}>
                / 100
              </span>
            </div>
          </div>
        </div>

        {/* ── MIDDLE SECTION ── */}
        <div style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "8fr 4fr",
          gap: 16,
          margin: "8px 0",
          alignItems: "center",
          minHeight: 0,
          opacity: childOpacity(0),
          transform: `translateY(${childY(0)}px)`,
        }}>

          {/* Left: node visualization */}
          <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>

            {/* SVG connectors */}
            <svg
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2, pointerEvents: "none" }}
              viewBox="0 0 800 600"
              preserveAspectRatio="xMidYMid meet"
            >
              <g opacity="0.3">
                <line x1="400" y1="300" x2="250" y2="140" stroke={C.primary} strokeDasharray="4 4" strokeWidth="1" />
                <line x1="400" y1="300" x2="580" y2="160" stroke={C.primary} strokeDasharray="4 4" strokeWidth="1.5" />
                <line x1="400" y1="300" x2="550" y2="440" stroke={C.primary} strokeDasharray="4 4" strokeWidth="1" />
                <line x1="400" y1="300" x2="280" y2="460" stroke={C.primary} strokeDasharray="2 6" strokeWidth="1" />
                <line x1="400" y1="300" x2="150" y2="350" stroke={C.primary} strokeDasharray="2 6" strokeWidth="1" />
              </g>
            </svg>

            {/* Center: AEO Core */}
            <div style={{ position: "relative", zIndex: 3 }}>
              <div style={{
                width: 144, height: 144, borderRadius: "50%",
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: `1px solid rgba(208,188,255,0.4)`,
                boxShadow: "0 0 30px rgba(208,188,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: 10, color: `${C.primary}b3`, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.2em", display: "block", marginBottom: 4 }}>
                    AEO Core
                  </span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: "white", fontFamily: "sans-serif", letterSpacing: "-0.02em" }}>
                    AEO
                  </span>
                </div>
              </div>
              <div style={{ position: "absolute", inset: 0, background: `${C.primary}33`, filter: "blur(60px)", borderRadius: "50%", zIndex: -1 }} />
            </div>

            {/* Satellite: Question Coverage — top-right, largest, cyan */}
            <div style={{ position: "absolute", top: "12%", right: "15%", zIndex: 3, textAlign: "center", transform: `translateY(${float6s}px)` }}>
              <div style={{
                width: 112, height: 112, borderRadius: "50%",
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: `1px solid rgba(76,215,246,0.4)`,
                boxShadow: "0 0 30px rgba(76,215,246,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: C.secondary, fontFamily: "sans-serif" }}>
                  {cards["question_coverage"]?.score ?? 0}
                </span>
              </div>
              <p style={{ fontSize: 10, color: C.onSurfaceVariant, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginTop: 12, marginBottom: 0 }}>
                Question Coverage
              </p>
            </div>

            {/* Satellite: Answer Readiness — top-left, reversed bounce */}
            <div style={{ position: "absolute", top: "8%", left: "20%", zIndex: 3, textAlign: "center", transform: `translateY(${float7sR}px)` }}>
              <div style={{
                width: 96, height: 96, borderRadius: "50%",
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: `1px solid rgba(208,188,255,0.3)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: C.primary, fontFamily: "sans-serif" }}>
                  {cards["answer_readiness"]?.score ?? 0}
                </span>
              </div>
              <p style={{ fontSize: 10, color: C.onSurfaceVariant, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginTop: 12, marginBottom: 0 }}>
                Answer Readiness
              </p>
            </div>

            {/* Satellite: Snippet Score — bottom-right */}
            <div style={{ position: "absolute", bottom: "15%", right: "20%", zIndex: 3, textAlign: "center" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: `1px solid rgba(255,255,255,0.1)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "sans-serif" }}>
                  {cards["snippet_score"]?.score ?? 0}
                </span>
              </div>
              <p style={{ fontSize: 10, color: C.onSurfaceVariant, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginTop: 12, marginBottom: 0 }}>
                Snippet Score
              </p>
            </div>

            {/* Satellite: FAQ Coverage — bottom-left, dim */}
            <div style={{ position: "absolute", bottom: "18%", left: "25%", zIndex: 3, textAlign: "center", opacity: 0.4 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: `1px solid rgba(255,255,255,0.05)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>
                  {cards["faq_coverage"]?.score ?? 0}
                </span>
              </div>
              <p style={{ fontSize: 10, color: C.onSurfaceVariant, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginTop: 12, marginBottom: 0 }}>
                FAQ Coverage
              </p>
            </div>

            {/* Satellite: Voice Search — mid-left, dim, smallest */}
            <div style={{ position: "absolute", top: "45%", left: "10%", zIndex: 3, textAlign: "center", opacity: 0.4 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: `1px solid rgba(255,255,255,0.05)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>
                  {cards["voice_search"]?.score ?? 0}
                </span>
              </div>
              <p style={{ fontSize: 10, color: C.onSurfaceVariant, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginTop: 12, marginBottom: 0 }}>
                Voice Search
              </p>
            </div>
          </div>

          {/* Right: Answer Signal Health */}
          <div style={{ height: "100%", display: "flex", alignItems: "center" }}>
            <div style={{
              width: "100%",
              background: C.glassBg,
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: `1px solid rgba(255,255,255,0.05)`,
              borderTop: `1px solid ${C.glassStrokeTop}`,
              borderRadius: 40,
              padding: 32,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Watermark icon */}
              <div style={{ position: "absolute", top: 0, right: 0, padding: 24, opacity: 0.05, pointerEvents: "none" }}>
                <svg width="72" height="72" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>

              <h3 style={{ fontSize: 11, fontWeight: 700, color: C.primary, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.2em", marginTop: 0, marginBottom: 32 }}>
                Answer Signal Health
              </h3>

              {/* Performance Grade + bar */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 48 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: C.onSurfaceVariant, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                    Performance Grade
                  </span>
                  <span style={{ fontSize: 96, fontWeight: 700, color: C.primaryContainer, fontFamily: "sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {grade}
                  </span>
                </div>
                <div style={{ flex: 1, height: 8, background: C.surfaceContainerHighest, borderRadius: 100, overflow: "hidden", marginBottom: 20 }}>
                  <div style={{
                    height: "100%",
                    width: `${score}%`,
                    background: `linear-gradient(90deg, ${C.error}, ${C.primary}, ${C.secondary})`,
                  }} />
                </div>
              </div>

              {/* Signal bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {signals.slice(0, 5).map((sig, i) => {
                  const barWidth = interpolate(frame, [20 + i * 6, 45 + i * 6], [0, sig.score], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  const color = signalBarColor(sig.score);
                  const label = SIGNAL_LABELS[sig.rule_id] ?? sig.rule_id;
                  return (
                    <div key={sig.rule_id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: C.onSurfaceVariant, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                          {label}
                        </span>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color, fontWeight: 700 }}>
                          {sig.score}
                        </span>
                      </div>
                      <div style={{ height: 4, width: "100%", background: C.surfaceContainerHighest, borderRadius: 100 }}>
                        <div style={{ height: "100%", width: `${barWidth}%`, background: color, borderRadius: 100 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alert box */}
              <div style={{ marginTop: 40, padding: 16, borderRadius: 16, border: `1px solid ${C.glassStroke}`, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <BoltIcon color={C.primary} />
                </div>
                <p style={{ fontSize: 10, color: `${C.onSurfaceVariant}b3`, fontFamily: "monospace", textTransform: "uppercase" as const, lineHeight: 1.6, margin: 0, letterSpacing: "0.05em" }}>
                  {priorityMessage(cards)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER: 5 metric cards ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          paddingBottom: 24,
          opacity: childOpacity(1),
          transform: `translateY(${childY(1)}px)`,
        }}>
          {CARD_META.map(({ key, label }) => {
            const s      = cards[key]?.score ?? 0;
            const isLow  = s === 0;
            const color  = cardAccentColor(s);
            const IconEl = CARD_ICONS[key];
            const iconColor = isLow
              ? `${C.error}66`
              : s >= 60
              ? `${C.secondary}99`
              : `${C.primary}99`;
            const badgeLabel = cardBadgeLabel(s);
            const badgeBg    = isLow ? `${C.error}1a` : s >= 60 ? `${C.secondary}1a` : s >= 40 ? `${C.primary}1a` : "rgba(255,255,255,0.05)";
            const badgeColor = isLow ? `${C.error}99` : s >= 60 ? C.secondary : s >= 40 ? C.primary : "rgba(255,255,255,0.6)";
            const badgeBorder = isLow ? `${C.error}33` : s >= 60 ? `${C.secondary}33` : s >= 40 ? `${C.primary}33` : "rgba(255,255,255,0.1)";

            return (
              <div key={key} style={{
                opacity: isLow ? 0.6 : 1,
                background: C.glassBg,
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: isLow ? `1px solid rgba(255,180,171,0.2)` : `1px solid ${C.glassStroke}`,
                borderRadius: 16,
                padding: 24,
              }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: C.onSurfaceVariant, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                    {label}
                  </span>
                  <IconEl color={iconColor} />
                </div>

                {/* Score */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: isLow ? `${C.error}99` : "white", fontFamily: "sans-serif" }}>
                    {s}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: `${C.onSurfaceVariant}66` }}>SCORE</span>
                </div>

                {/* Status */}
                <div style={{ borderTop: `1px solid ${C.glassStroke}`, paddingTop: 16 }}>
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: `${C.onSurfaceVariant}99`, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>
                    Status
                  </span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "-0.02em" }}>
                      {cardStatusText(s)}
                    </span>
                    <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 100, background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}`, fontFamily: "monospace" }}>
                      {badgeLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </AbsoluteFill>
  );
};
