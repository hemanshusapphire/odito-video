import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useSlideTiming } from "../hooks/useSlideTiming";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "high" | "medium" | "low";

interface SeverityConfig {
  label: string;
  title: string;
  subtitle: (n: number) => string;
  primaryColor: string;
  containerColor: string;
  glowColor: string;
  impactLabel: string;
  effortLabel: string;
  quickWin: string;
}

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<Severity, SeverityConfig> = {
  high: {
    label: "HIGH PRIORITY",
    title: "High Issues",
    subtitle: (n) => `${n} high-priority issues detected`,
    primaryColor: "#ffb4ab",
    containerColor: "rgba(147,0,10,0.4)",
    glowColor: "rgba(239,68,68,0.15)",
    impactLabel: "HIGH IMPACT",
    effortLabel: "Medium Effort",
    quickWin:
      "Addressing these high-priority issues could significantly improve SEO performance.",
  },
  medium: {
    label: "MEDIUM PRIORITY",
    title: "Medium Issues",
    subtitle: (n) => `${n} medium-priority issues detected`,
    primaryColor: "#facc15",
    containerColor: "rgba(133,77,14,0.4)",
    glowColor: "rgba(250,204,21,0.15)",
    impactLabel: "MEDIUM IMPACT",
    effortLabel: "Low Effort",
    quickWin:
      "Resolving medium-priority issues will strengthen content quality and search visibility.",
  },
  low: {
    label: "LOW PRIORITY",
    title: "Low Issues",
    subtitle: (n) => `${n} low-priority issues detected`,
    primaryColor: "#4cd7f6",
    containerColor: "rgba(0,100,140,0.4)",
    glowColor: "rgba(76,215,246,0.15)",
    impactLabel: "LOW IMPACT",
    effortLabel: "Low Effort",
    quickWin:
      "Low-priority improvements help refine overall optimization and user experience.",
  },
};

// ─── Issue card ───────────────────────────────────────────────────────────────

interface Issue {
  issue: string;
  severity: string;
  pages: number;
  count: number;
  recommendation: string;
}

interface IssueCardProps {
  issue: Issue;
  index: number;
  config: SeverityConfig;
  frame: number;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, index, config, frame }) => {
  const delay = 20 + index * 8;
  const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(frame, [delay, delay + 15], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isFirst = index === 0;

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardY}px)`,
        background: "rgba(15,22,40,0.4)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: isFirst
          ? `0 4px 30px rgba(0,0,0,0.5), 0 0 32px ${config.glowColor}`
          : "0 4px 30px rgba(0,0,0,0.5)",
        borderRadius: 16,
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        minHeight: 360,
      }}
    >
      {/* Numbered badge */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: isFirst ? config.containerColor : "rgba(255,255,255,0.05)",
          border: isFirst
            ? `1px solid ${config.primaryColor}`
            : "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 700,
          color: isFirst ? config.primaryColor : "rgba(255,255,255,0.4)",
          fontFamily: "sans-serif",
          marginBottom: 24,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>

      {/* Issue title */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#dbe2fb",
          fontFamily: "sans-serif",
          lineHeight: 1.35,
          marginBottom: 14,
          flex: 1,
        }}
      >
        {issue.issue}
      </div>

      {/* Recommendation */}
      <div
        style={{
          fontSize: 14,
          color: "rgba(203,195,215,0.6)",
          fontFamily: "sans-serif",
          lineHeight: 1.55,
          marginBottom: 24,
        }}
      >
        {issue.recommendation}
      </div>

      {/* Bottom badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
        <div
          style={{
            padding: "4px 12px",
            background: isFirst ? config.containerColor : "rgba(255,255,255,0.06)",
            border: `1px solid ${isFirst ? config.primaryColor : "rgba(255,255,255,0.1)"}`,
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            color: isFirst ? config.primaryColor : "rgba(255,255,255,0.4)",
            fontFamily: "sans-serif",
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
          }}
        >
          {config.impactLabel}
        </div>
        <div
          style={{
            padding: "4px 12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "sans-serif",
          }}
        >
          {config.effortLabel}
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface TopIssuesData {
  issues: Issue[];
  count?: number;
  totalHigh?: number;
  totalMedium?: number;
  totalLow?: number;
}

interface Props {
  severity: Severity;
  data: TopIssuesData;
  narration?: string;
  brandColor?: string;
  agencyName?: string;
}

export const TopIssuesScene: React.FC<Props> = ({ severity, data }) => {
  if (!data) {
    console.warn("TopIssuesScene: Missing slide data");
    return null;
  }

  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const config = SEVERITY_CONFIG[severity];
  const issues = Array.isArray(data?.issues) ? data.issues : [];

  const totalCount =
    severity === "high"
      ? (data?.totalHigh ?? issues.length)
      : severity === "medium"
      ? (data?.totalMedium ?? issues.length)
      : (data?.totalLow ?? issues.length);

  const quickWin =
    issues.length === 0
      ? "No issues detected for this severity level."
      : config.quickWin;

  const gridOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#020617" }}>

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: gridOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Radial glow — top-center, severity colour */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "48px 64px",
          display: "flex",
          flexDirection: "column",
          opacity,
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            opacity: childOpacity(0),
            transform: `translateY(${childY(0)}px)`,
            marginBottom: 36,
          }}
        >
          {/* Priority label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={config.primaryColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: config.primaryColor,
                textTransform: "uppercase" as const,
                letterSpacing: "0.25em",
                fontFamily: "sans-serif",
              }}
            >
              {config.label}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#dbe2fb",
              fontFamily: "sans-serif",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 10,
            }}
          >
            {config.title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
              marginBottom: 6,
            }}
          >
            {config.subtitle(totalCount)}
          </div>

          {/* Caption */}
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.22)",
              fontFamily: "monospace",
              letterSpacing: "0.05em",
            }}
          >
            Top Issues (out of {totalCount})
          </div>
        </div>

        {/* ── 3-column card grid ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 32,
            opacity: childOpacity(1),
            marginBottom: 28,
            alignItems: "stretch",
          }}
        >
          {issues.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "rgba(255,255,255,0.25)",
                fontFamily: "sans-serif",
                background: "rgba(15,22,40,0.3)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 16,
              }}
            >
              No issues found for this severity level
            </div>
          ) : (
            issues.slice(0, 3).map((item, i) => (
              <IssueCard
                key={i}
                issue={item}
                index={i}
                config={config}
                frame={frame}
              />
            ))
          )}
        </div>

        {/* ── Quick win strip ── */}
        <div
          style={{
            opacity: childOpacity(2),
            transform: `translateY(${childY(2)}px)`,
            background: "rgba(15,22,40,0.4)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",
            padding: "18px 28px 18px 32px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Left colour accent */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              background: `linear-gradient(to bottom, ${config.primaryColor}, transparent)`,
            }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: config.primaryColor,
              fontFamily: "sans-serif",
              flexShrink: 0,
            }}
          >
            Quick Win:
          </span>
          <span
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.55)",
              fontFamily: "sans-serif",
              lineHeight: 1.4,
            }}
          >
            {quickWin}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
