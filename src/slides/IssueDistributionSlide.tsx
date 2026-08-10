import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useSlideTiming } from "../hooks/useSlideTiming";

// ─── Color tokens (from HTML Tailwind config) ──────────────────────────────
const ERROR      = "#ffb4ab";
const YELLOW     = "#facc15";
const CYAN       = "#4cd7f6";
const ORANGE_6   = "#ea580c";
const YELLOW_6   = "#ca8a04";
const SUCCESS    = "#18A853";
const SURF_HIGH  = "#2e3448";   // surface-container-highest (bar track)
const ON_SURF    = "#dbe2fb";   // on-surface
const ON_SURF_V  = "#cbc3d7";   // on-surface-variant
const PRIMARY    = "#d0bcff";   // primary (purple for ambient glow)

// ─── Inline SVG icons ─────────────────────────────────────────────────────
const WarningIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={ERROR} style={{ flexShrink: 0 }}>
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const BoltIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={YELLOW} style={{ flexShrink: 0 }}>
    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={CYAN} style={{ flexShrink: 0 }}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const ExclIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={ERROR}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

// ─── SeverityBar ──────────────────────────────────────────────────────────
interface SeverityBarProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  countColor: string;
  percentage: number;
  barGradient: string;
  barGlow: string;
  delay: number;
}

const SeverityBar: React.FC<SeverityBarProps> = ({
  icon,
  label,
  count,
  countColor,
  percentage,
  barGradient,
  barGlow,
  delay,
}) => {
  const frame = useCurrentFrame();

  const rowOpacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rowY = interpolate(frame, [delay, delay + 12], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barWidthPct = interpolate(frame, [delay + 8, delay + 30], [0, percentage], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayCount = Math.round(
    interpolate(frame, [delay, delay + 26], [0, count], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div style={{ opacity: rowOpacity, transform: `translateY(${rowY}px)` }}>
      {/* Row header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 14,
        }}
      >
        {/* Left: icon + label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon}
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: ON_SURF,
              fontFamily: "sans-serif",
            }}
          >
            {label}
          </span>
        </div>

        {/* Right: animated count + percentage */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: countColor,
              fontFamily: "sans-serif",
              lineHeight: 1,
            }}
          >
            {displayCount}
          </div>
          <div
            style={{
              fontSize: 11,
              color: ON_SURF_V,
              fontFamily: "monospace",
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
              marginTop: 4,
            }}
          >
            {percentage.toFixed(1)}% OF TOTAL
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 12,
          width: "100%",
          background: SURF_HIGH,
          borderRadius: 999,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${barWidthPct}%`,
            background: barGradient,
            borderRadius: 999,
            boxShadow: barGlow,
          }}
        />
      </div>
    </div>
  );
};

// ─── Main slide ────────────────────────────────────────────────────────────

interface Props {
  data: {
    issueDistribution: {
      total: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  narration?: string;
  brandColor?: string;
  agencyName?: string;
}

export const IssueDistributionSlide: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const dist   = data?.issueDistribution ?? { total: 0, high: 0, medium: 0, low: 0 };
  const high   = dist.high   ?? 0;
  const medium = dist.medium ?? 0;
  const low    = dist.low    ?? 0;
  const total  = dist.total  || high + medium + low;

  const highPct   = total > 0 ? (high   / total) * 100 : 0;
  const mediumPct = total > 0 ? (medium / total) * 100 : 0;
  const lowPct    = total > 0 ? (low    / total) * 100 : 0;

  // Hero counter: 0 → total
  const displayTotal = Math.round(
    interpolate(frame, [8, 38], [0, total], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Bottom recommendation strip text
  const recommendation =
    high > 0
      ? "Focus on high-priority fixes"
      : medium > 0
      ? "Focus on medium-priority improvements"
      : "No significant issues detected";

  return (
    <AbsoluteFill style={{ background: "#000000", opacity }}>

      {/* Blueprint grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* Ambient glow – primary purple, top-left */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: PRIMARY,
          filter: "blur(120px)",
          opacity: 0.13,
          pointerEvents: "none",
        }}
      />

      {/* Ambient glow – cyan, bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: CYAN,
          filter: "blur(120px)",
          opacity: 0.13,
          pointerEvents: "none",
        }}
      />

      {/* ── Glass panel ── */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 48,
          right: 48,
          bottom: 48,
          background: "rgba(15, 22, 40, 0.4)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8,
          overflow: "hidden",
          display: "flex",
          alignItems: "stretch",
          gap: 80,
          padding: 72,
        }}
      >
        {/* Decorative vertical line at 25% */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "25%",
            width: 1,
            height: "100%",
            background: "rgba(255,255,255,0.1)",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />
        {/* Decorative horizontal line at 33% */}
        <div
          style={{
            position: "absolute",
            top: "33%",
            left: 0,
            width: "100%",
            height: 1,
            background: "rgba(255,255,255,0.1)",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />

        {/* ════ LEFT COLUMN ════ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Issue Breakdown badge */}
          <div
            style={{
              opacity: childOpacity(0),
              transform: `translateY(${childY(0)}px)`,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                background: "rgba(147,0,10,0.2)",
                border: "1px solid rgba(255,180,171,0.3)",
                borderRadius: 999,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: ERROR,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: ERROR,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  fontFamily: "sans-serif",
                }}
              >
                ISSUE BREAKDOWN
              </span>
            </div>
          </div>

          {/* Hero number with gradient text */}
          <div
            style={{
              opacity: childOpacity(0),
              transform: `translateY(${childY(0)}px)`,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: 200,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                fontFamily: "sans-serif",
                background:
                  "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.6) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {displayTotal}
            </div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              opacity: childOpacity(0),
              transform: `translateY(${childY(0)}px)`,
              marginBottom: 36,
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 600,
                color: ON_SURF_V,
                opacity: 0.6,
                fontFamily: "sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Total Intelligence Gaps Found
            </div>
          </div>

          {/* Priority Focus card */}
          <div
            style={{
              opacity: childOpacity(3),
              transform: `translateY(${childY(3)}px)`,
            }}
          >
            <div
              style={{
                background: "rgba(147,0,10,0.1)",
                border: "1px solid rgba(255,180,171,0.2)",
                borderRadius: 8,
                padding: "28px 28px",
                boxShadow: "0 0 30px rgba(255,75,75,0.15)",
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
              }}
            >
              {/* Icon container */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#93000a",
                  border: "1px solid rgba(255,180,171,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ExclIcon />
              </div>

              {/* Text block */}
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: ERROR,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.1em",
                    fontFamily: "sans-serif",
                    marginBottom: 8,
                  }}
                >
                  Priority Strategic Focus
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: ON_SURF,
                    fontFamily: "sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  Focus on{" "}
                  <strong style={{ color: ERROR }}>
                    {high} high-priority issue{high !== 1 ? "s" : ""}
                  </strong>{" "}
                  first to maximize audit impact and security posture.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN ════ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Section header */}
          <div
            style={{
              opacity: childOpacity(1),
              transform: `translateY(${childY(1)}px)`,
              marginBottom: 36,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: CYAN,
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
                fontFamily: "monospace",
                opacity: 0.5,
                marginBottom: 8,
              }}
            >
              Operational Risks
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                color: ON_SURF,
                fontFamily: "sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Severity Breakdown
            </div>
          </div>

          {/* Severity bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 48,
              flex: 1,
            }}
          >
            <SeverityBar
              icon={<WarningIcon />}
              label="Critical High"
              count={high}
              countColor={ERROR}
              percentage={highPct}
              barGradient={`linear-gradient(to right, ${ORANGE_6}, ${ERROR})`}
              barGlow="0 0 15px rgba(255,75,75,0.4)"
              delay={18}
            />
            <SeverityBar
              icon={<BoltIcon />}
              label="Elevated Medium"
              count={medium}
              countColor={YELLOW}
              percentage={mediumPct}
              barGradient={`linear-gradient(to right, ${YELLOW_6}, ${YELLOW})`}
              barGlow="0 0 15px rgba(250,204,21,0.3)"
              delay={30}
            />
            <SeverityBar
              icon={<InfoIcon />}
              label="Standard Low"
              count={low}
              countColor={CYAN}
              percentage={lowPct}
              barGradient={`rgba(76,215,246,0.3)`}
              barGlow="none"
              delay={42}
            />
          </div>

          {/* ── Strategy footer strip ── */}
          <div
            style={{
              opacity: childOpacity(6),
              marginTop: 36,
              paddingTop: 28,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Status dot + label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: SUCCESS,
                  boxShadow: `0 0 8px ${SUCCESS}`,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: SUCCESS,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                  fontFamily: "monospace",
                }}
              >
                AI AUDIT STATUS: COMPLETE
              </span>
            </div>

            {/* Recommendation pill */}
            <div
              style={{
                padding: "8px 24px",
                background: "rgba(15,22,40,0.4)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                color: ON_SURF_V,
                textTransform: "uppercase" as const,
                letterSpacing: "0.1em",
                fontFamily: "sans-serif",
              }}
            >
              {recommendation}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
