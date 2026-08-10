import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ScoreGauge } from "../components/common/ScoreGauge";
import { useSlideTiming } from "../hooks/useSlideTiming";

// ─── Brand palette (from HTML reference) ──────────────────────────────────
const PURPLE   = "#8B5CF6";
const CYAN     = "#06B6D4";
const EMERALD  = "#10B981";
const BLUE     = "#3B82F6";
const RED      = "#ef4444";

// ─── Helpers ──────────────────────────────────────────────────────────────

function scoreStatus(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: EMERALD };
  if (score >= 70) return { label: "Good",      color: EMERALD };
  if (score >= 50) return { label: "Average",   color: "#f59e0b" };
  return              { label: "Needs Work",   color: RED };
}

// ─── Sub-components ───────────────────────────────────────────────────────

interface ScoreCardProps {
  score: number;
  color: string;
  label: string;
  cardIndex: number;
  childOpacity: (i: number) => number;
  childY: (i: number) => number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  color,
  label,
  cardIndex,
  childOpacity,
  childY,
}) => {
  const { label: statusLabel, color: statusColor } = scoreStatus(score);

  // Each card fades in staggered after the header (header = index 0)
  const staggerIdx = cardIndex + 1;
  const gaugeStart = staggerIdx * 6 + 4;

  return (
    <div
      style={{
        opacity: childOpacity(staggerIdx),
        transform: `translateY(${childY(staggerIdx)}px)`,
        // Glassmorphism card
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.8)",
        borderRadius: 24,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        aspectRatio: "1 / 1",
      }}
    >
      {/* Ring gauge */}
      <div style={{ marginBottom: 24 }}>
        <ScoreGauge
          score={score}
          color={color}
          size={160}
          strokeWidth={8}
          startFrame={gaugeStart}
          animDuration={32}
        />
      </div>

      {/* Label */}
      <div
        style={{
          color: "#94a3b8",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          fontFamily: "sans-serif",
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      {/* Status badge */}
      <div
        style={{
          color: statusColor,
          fontSize: 14,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          fontFamily: "sans-serif",
        }}
      >
        {statusLabel}
      </div>
    </div>
  );
};

// ─── Main slide ────────────────────────────────────────────────────────────

interface ScoreSummaryData {
  scores: {
    technicalHealth: number;
    performance: number;
    seo: number;
    aiVisibility: number;
  };
}

interface Props {
  data: ScoreSummaryData;
  narration?: string;
  brandColor?: string;
  agencyName?: string;
}

export const ScoreSummarySlide: React.FC<Props> = ({
  data,
  agencyName = "AuditIQ",
}) => {
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const scores = data?.scores ?? {
    technicalHealth: 0,
    performance: 0,
    seo: 0,
    aiVisibility: 0,
  };

  // Derive insight text dynamically
  const avgScore = Math.round(
    (scores.technicalHealth + scores.performance + scores.seo + scores.aiVisibility) / 4
  );
  const overallLevel  = avgScore >= 80 ? "strong"     : avgScore >= 60 ? "moderate" : "developing";
  const levelColor    = avgScore >= 80 ? EMERALD       : avgScore >= 60 ? PURPLE     : "#f59e0b";

  const opportunities: string[] = [];
  if (scores.performance  < 70) opportunities.push("performance optimization");
  if (scores.aiVisibility < 70) opportunities.push("AI visibility enhancement");
  if (scores.seo          < 70) opportunities.push("SEO improvement");
  const opportunityText =
    opportunities.length > 0
      ? "key opportunities in " + opportunities.slice(0, 2).join(" and ")
      : "maintaining current performance standards";

  // Grid background animation — subtle grid opacity pulse
  const gridOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const CARD_CONFIGS = [
    { label: "Technical",   color: PURPLE,  score: scores.technicalHealth },
    { label: "Performance", color: CYAN,    score: scores.performance     },
    { label: "SEO",         color: EMERALD, score: scores.seo             },
    { label: "AI Visibility", color: BLUE,  score: scores.aiVisibility    },
  ];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 80% 20%, rgba(59,130,246,0.15) 0%, transparent 50%)," +
          "radial-gradient(circle at 20% 80%, rgba(139,92,246,0.10) 0%, transparent 50%)," +
          "#020617",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
          opacity: gridOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "64px",
          display: "flex",
          flexDirection: "column",
          opacity,
        }}
      >
        {/* ── Header ── */}
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: 48,
            opacity: childOpacity(0),
            transform: `translateY(${childY(0)}px)`,
          }}
        >
          {/* Logo row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              opacity: 0.8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: PURPLE,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                color: "#fff",
                fontFamily: "sans-serif",
              }}
            >
              {agencyName.slice(0, 2).toUpperCase()}
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: 21,
                color: "#fff",
                letterSpacing: "-0.04em",
                fontFamily: "sans-serif",
              }}
            >
              {agencyName}
            </span>
          </div>

          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: PURPLE,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
              marginBottom: 8,
            }}
          >
            <span>✦</span>
            <span>Performance Metrics</span>
            <span>✦</span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#fff",
              fontFamily: "sans-serif",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            Score Summary
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 20,
              color: "#94a3b8",
              fontWeight: 300,
              fontFamily: "sans-serif",
            }}
          >
            Key performance indicators at a glance for current digital footprint
          </div>
        </header>

        {/* ── Score grid ── */}
        <section
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 32,
            padding: "0 32px",
            alignItems: "center",
          }}
        >
          {CARD_CONFIGS.map((cfg, i) => (
            <ScoreCard
              key={cfg.label}
              score={cfg.score}
              color={cfg.color}
              label={cfg.label}
              cardIndex={i}
              childOpacity={childOpacity}
              childY={childY}
            />
          ))}
        </section>

        {/* ── Insight panel ── */}
        <footer
          style={{
            marginTop: 48,
            marginBottom: 16,
            opacity: childOpacity(5),
            transform: `translateY(${childY(5)}px)`,
          }}
        >
          <div
            style={{
              maxWidth: 896,
              margin: "0 auto",
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderLeft: `4px solid ${PURPLE}`,
              boxShadow: "0 8px 32px 0 rgba(0,0,0,0.8)",
              borderRadius: 16,
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            {/* Info icon */}
            <div
              style={{
                width: 48,
                height: 48,
                background: "rgba(139,92,246,0.2)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={PURPLE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>

            {/* Text */}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: PURPLE,
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  fontFamily: "sans-serif",
                  marginBottom: 6,
                }}
              >
                Audit Insight
              </div>
              <div style={{ fontSize: 18, color: "#cbd5e1", fontFamily: "sans-serif" }}>
                Overall performance is{" "}
                <span style={{ color: levelColor, fontWeight: 700 }}>{overallLevel}</span>
                {" "}with {opportunityText}.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AbsoluteFill>
  );
};
