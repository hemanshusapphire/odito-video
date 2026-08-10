import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ScoreRing } from "../components/common/ScoreRing";
import { MetricCard } from "../components/common/MetricCard";
import { AIPlatformOrbit } from "../components/common/AIPlatformOrbit";
import { FooterBranding } from "../components/common/FooterBranding";

const CYAN = "#4cd7f6";
const PURPLE = "#d0bcff";
const PURPLE_MED = "#a078ff";
const ERROR = "#ffb4ab";


interface CoverData {
  projectName?: string;
  url?: string;
  pagesCrawled?: number;
  scores?: { overall?: number; [key: string]: number | undefined };
  issueDistribution?: {
    total?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
  auditDate?: string;
  description?: string;
}

interface Props {
  data: CoverData;
  narration?: string;
  brandColor?: string;
  agencyName?: string;
}

export const CoverSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  if (!data) return null;

  const frame = useCurrentFrame();

  const projectName = data.projectName || "Your Website";
  const url = data.url || "";
  const pagesCrawled = data.pagesCrawled ?? 0;
  const overallScore = data.scores?.overall ?? 0;
  const issueDistribution = data.issueDistribution || {};
  const totalIssues = issueDistribution.total ?? 0;
  const highIssues = issueDistribution.high ?? 0;
  const mediumIssues = issueDistribution.medium ?? 0;
  const auditDate =
    data.auditDate ||
    new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const description =
    data.description ||
    "A comprehensive AI visibility & SEO performance audit of your digital presence.";

  // Global fade
  const mainOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Grid appears gradually
  const gridAlpha = interpolate(frame, [0, 40], [0, 0.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered section entrance helpers
  function fadeAt(start: number, dur = 18): number {
    return interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  function slideAt(start: number, dist = 16, dur = 18): string {
    const y = interpolate(frame, [start, start + dur], [dist, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return `translateY(${y}px)`;
  }

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #000000 0%, #0c1325 100%)",
        overflow: "hidden",
      }}
    >
      {/* ── Background: grid + radial glows ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,${gridAlpha}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,${gridAlpha}) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -300,
          left: -200,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(119,48,237,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: -250,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(160,120,255,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Main two-column layout ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 60,
          right: 60,
          bottom: 100,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          opacity: mainOpacity,
        }}
      >
        {/* ════ LEFT COLUMN (55%) ════ */}
        <div
          style={{
            flex: "0 0 55%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingRight: 56,
          }}
        >
          {/* Section label */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: CYAN,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              fontFamily: "monospace, sans-serif",
              marginBottom: 20,
              opacity: fadeAt(4),
              transform: slideAt(4),
            }}
          >
            AI Visibility &amp; SEO Audit Report
          </div>

          {/* Project name */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#ffffff",
              fontFamily: "sans-serif",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              marginBottom: 14,
              opacity: fadeAt(8),
              transform: slideAt(8, 22),
            }}
          >
            {projectName}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 19,
              color: "rgba(255,255,255,0.42)",
              fontFamily: "sans-serif",
              marginBottom: 30,
              lineHeight: 1.55,
              maxWidth: 530,
              opacity: fadeAt(12),
              transform: slideAt(12),
            }}
          >
            {description}
          </div>

          {/* Meta strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 36,
              opacity: fadeAt(16),
              transform: slideAt(16),
            }}
          >
            {[
              { label: "Audit Depth", value: `${pagesCrawled} Pages` },
              { label: "Detected Anomalies", value: String(totalIssues) },
              { label: "Chronology", value: auditDate },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && (
                  <div
                    style={{
                      width: 1,
                      height: 36,
                      background: "rgba(255,255,255,0.1)",
                      margin: "0 26px",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      fontFamily: "monospace, sans-serif",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.82)",
                      fontFamily: "sans-serif",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* 2×2 Metric card grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <MetricCard
              label="Pages Audited"
              value={pagesCrawled}
              accentColor={CYAN}
              delay={20}
            />
            <MetricCard
              label="Issues Found"
              value={totalIssues}
              accentColor={PURPLE}
              delay={24}
            />
            <MetricCard
              label="Critical Issues"
              value={highIssues}
              accentColor={ERROR}
              labelColor={ERROR}
              delay={28}
            />
            <MetricCard
              label="Opportunities"
              value={mediumIssues}
              accentColor={PURPLE_MED}
              delay={32}
            />
          </div>
        </div>

        {/* ════ RIGHT COLUMN (45%) ════ */}
        <div
          style={{
            flex: "0 0 45%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <AIPlatformOrbit startFrame={24}>
            <ScoreRing
              score={overallScore}
              size={320}
              strokeWidth={10}
              trackColor="#1e2a3a"
              progressColors={["#7730ed", "#d0bcff"]}
              glowColor="rgba(160, 120, 255, 0.35)"
              startFrame={15}
              animDuration={50}
              label="OVERALL SCORE"
              labelColor="rgba(208, 188, 255, 0.65)"
              scoreFontSize={88}
              uid="cover"
            />
          </AIPlatformOrbit>
        </div>
      </div>

      {/* ── Footer ── */}
      <FooterBranding auditDate={auditDate} url={url} />
    </AbsoluteFill>
  );
};
