import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useSlideTiming } from "../hooks/useSlideTiming";

// ─── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg:               "#000000",
  primary:          "#d0bcff",
  secondary:        "#4cd7f6",
  error:            "#ffb4ab",
  successGreen:     "#18A853",
  onSurface:        "#dbe2fb",
  onSurfaceVariant: "#cbc3d7",
  glassBg:          "rgba(15,22,40,0.7)",
  glassStroke:      "rgba(255,255,255,0.1)",
  glassStrokeTop:   "rgba(255,255,255,0.2)",
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface KeywordEntry {
  keyword: string;
  rank: number | null;
  status: string;
}

interface Props {
  data: {
    totalKeywords: number;
    topRankings: KeywordEntry[];
    opportunities: KeywordEntry[];
    notRanking: KeywordEntry[];
  };
  narration?: string;
  brandColor?: string;
  agencyName?: string;
}

// ─── Keyword row ───────────────────────────────────────────────────────────────

interface KeywordRowProps {
  entry: KeywordEntry;
  index: number;
  baseDelay: number;
  frame: number;
  accentColor: string;
  showRank: boolean;
}

const KeywordRow: React.FC<KeywordRowProps> = ({
  entry, index, baseDelay, frame, accentColor, showRank,
}) => {
  const delay = baseDelay + index * 8;
  const rowOpacity = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rowY = interpolate(frame, [delay, delay + 14], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: rowOpacity,
        transform: `translateY(${rowY}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: C.glassBg,
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: `1px solid ${C.glassStroke}`,
        borderTop: `1px solid ${C.glassStrokeTop}`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 8,
        marginBottom: 6,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: C.onSurface,
          fontFamily: "sans-serif",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap" as const,
        }}
      >
        {entry.keyword}
      </span>
      {showRank && entry.rank !== null ? (
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: accentColor,
            fontFamily: "sans-serif",
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          #{entry.rank}
        </span>
      ) : (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: C.error,
            fontFamily: "sans-serif",
            textTransform: "uppercase" as const,
            letterSpacing: "0.08em",
            flexShrink: 0,
            marginLeft: 12,
            padding: "3px 10px",
            background: "rgba(147,0,10,0.3)",
            border: `1px solid ${C.error}`,
            borderRadius: 20,
          }}
        >
          NOT IN TOP 100
        </span>
      )}
    </div>
  );
};

// ─── Main slide ────────────────────────────────────────────────────────────────

export const KeywordSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const totalKeywords = data?.totalKeywords ?? 0;
  const topRankings   = data?.topRankings   ?? [];
  const opportunities = data?.opportunities ?? [];
  const notRanking    = data?.notRanking    ?? [];

  const gridOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const maxCount = Math.max(topRankings.length, opportunities.length, notRanking.length, 1);

  const statCards = [
    { label: "Top Rankings",  count: topRankings.length,  color: C.successGreen, dotColor: C.successGreen },
    { label: "Opportunities", count: opportunities.length, color: C.secondary,    dotColor: C.secondary    },
    { label: "Not Ranking",   count: notRanking.length,   color: C.error,        dotColor: C.error        },
  ];

  const sectionsVisible = [
    topRankings.length > 0,
    opportunities.length > 0,
    notRanking.length > 0,
  ].filter(Boolean).length;

  const kwGridCols =
    sectionsVisible <= 1 ? "1fr" :
    sectionsVisible === 2 ? "1fr 1fr" :
    "repeat(3, 1fr)";

  return (
    <AbsoluteFill style={{ background: C.bg }}>

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: gridOpacity * 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Indigo glow — top left */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          background: "rgba(99,102,241,0.07)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      {/* Cyan glow — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: "40%",
          height: "40%",
          borderRadius: "50%",
          background: "rgba(76,215,246,0.06)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Full-slide content wrapper ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          opacity,
        }}
      >

        {/* ── Top nav bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 56px",
            background: C.glassBg,
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderBottom: `1px solid ${C.glassStroke}`,
            flexShrink: 0,
            opacity: childOpacity(0),
            transform: `translateY(${childY(0)}px)`,
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                fontSize: 11,
                color: "#3c0091",
                fontFamily: "sans-serif",
              }}
            >
              {agencyName.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: C.primary, fontFamily: "sans-serif", letterSpacing: "-0.02em" }}>
              {agencyName}
            </span>
          </div>

          {/* Nav items */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.primary, fontFamily: "sans-serif" }}>Dashboard</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif" }}>Analytics</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif" }}>Audit History</span>
          </div>

          {/* Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
        </div>

        {/* ── Main content area ── */}
        <div
          style={{
            flex: 1,
            padding: "28px 56px 20px 56px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            minHeight: 0,
            overflow: "hidden",
          }}
        >

          {/* ── Hero ── */}
          <div
            style={{
              opacity: childOpacity(1),
              transform: `translateY(${childY(1)}px)`,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.secondary,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.22em",
                  fontFamily: "sans-serif",
                }}
              >
                KEYWORD PERFORMANCE ANALYSIS
              </span>
            </div>

            <span
              style={{
                fontSize: 60,
                fontWeight: 800,
                color: C.onSurface,
                fontFamily: "sans-serif",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                display: "block",
              }}
            >
              {totalKeywords} Keywords
            </span>

            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.28)",
                fontFamily: "monospace",
                letterSpacing: "0.06em",
                marginTop: 6,
              }}
            >
              tracked across search results
            </div>
          </div>

          {/* ── 3 Stat cards ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              flexShrink: 0,
              opacity: childOpacity(2),
              transform: `translateY(${childY(2)}px)`,
            }}
          >
            {statCards.map((card, i) => {
              const barPct = interpolate(
                frame,
                [18 + i * 6, 42 + i * 6],
                [0, maxCount > 0 ? (card.count / maxCount) * 100 : 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  key={card.label}
                  style={{
                    background: C.glassBg,
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    border: `1px solid ${C.glassStroke}`,
                    borderTop: `1px solid ${C.glassStrokeTop}`,
                    borderRadius: 12,
                    padding: "18px 22px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: card.dotColor }} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: C.onSurfaceVariant,
                        fontFamily: "sans-serif",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {card.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 42,
                      fontWeight: 800,
                      color: card.color,
                      fontFamily: "sans-serif",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      marginBottom: 12,
                    }}
                  >
                    {card.count}
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${barPct}%`,
                        background: `linear-gradient(to right, ${card.color}, ${card.color}88)`,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Keyword sections (dynamic) ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: kwGridCols,
              gap: 20,
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              alignContent: "start",
            }}
          >

            {/* Top Rankings */}
            {topRankings.length > 0 && (
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                    opacity: childOpacity(3),
                    transform: `translateY(${childY(3)}px)`,
                  }}
                >
                  <div style={{ width: 3, height: 14, background: C.successGreen, borderRadius: 2 }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.successGreen,
                      fontFamily: "sans-serif",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.12em",
                    }}
                  >
                    Top Rankings
                  </span>
                </div>
                {topRankings.slice(0, 4).map((entry, i) => (
                  <KeywordRow
                    key={`top-${i}`}
                    entry={entry}
                    index={i}
                    baseDelay={30}
                    frame={frame}
                    accentColor={C.successGreen}
                    showRank={true}
                  />
                ))}
              </div>
            )}

            {/* Opportunities */}
            {opportunities.length > 0 && (
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                    opacity: childOpacity(3),
                    transform: `translateY(${childY(3)}px)`,
                  }}
                >
                  <div style={{ width: 3, height: 14, background: C.secondary, borderRadius: 2 }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.secondary,
                      fontFamily: "sans-serif",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.12em",
                    }}
                  >
                    Opportunities
                  </span>
                </div>
                {opportunities.slice(0, 4).map((entry, i) => (
                  <KeywordRow
                    key={`opp-${i}`}
                    entry={entry}
                    index={i}
                    baseDelay={36}
                    frame={frame}
                    accentColor={C.secondary}
                    showRank={true}
                  />
                ))}
              </div>
            )}

            {/* Not Ranking */}
            {notRanking.length > 0 && (
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                    opacity: childOpacity(3),
                    transform: `translateY(${childY(3)}px)`,
                  }}
                >
                  <div style={{ width: 3, height: 14, background: C.error, borderRadius: 2 }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.error,
                      fontFamily: "sans-serif",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.12em",
                    }}
                  >
                    Not Ranking
                  </span>
                </div>
                {notRanking.slice(0, 4).map((entry, i) => (
                  <KeywordRow
                    key={`nr-${i}`}
                    entry={entry}
                    index={i}
                    baseDelay={42}
                    frame={frame}
                    accentColor={C.error}
                    showRank={false}
                  />
                ))}
              </div>
            )}

            {/* Empty fallback */}
            {sectionsVisible === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "rgba(255,255,255,0.2)",
                  fontFamily: "sans-serif",
                  background: C.glassBg,
                  border: `1px solid ${C.glassStroke}`,
                  borderRadius: 12,
                  padding: "40px",
                }}
              >
                No keyword data available
              </div>
            )}
          </div>

          {/* ── Insight banner ── */}
          <div
            style={{
              opacity: childOpacity(4),
              transform: `translateY(${childY(4)}px)`,
              background: `linear-gradient(135deg, ${C.glassBg} 0%, rgba(99,102,241,0.1) 100%)`,
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: `1px solid ${C.glassStroke}`,
              borderTop: `1px solid ${C.glassStrokeTop}`,
              borderRadius: 12,
              padding: "16px 22px",
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexShrink: 0,
            }}
          >
            {/* Lightbulb box */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "rgba(208,188,255,0.1)",
                border: "1px solid rgba(208,188,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21h6" />
                <path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.2 4.16-3 5.2V17H9v-2.8C7.2 13.16 6 11.22 6 9a6 6 0 0 1 6-6z" />
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", marginBottom: 3 }}>
                Focus on opportunities first
              </div>
              <div style={{ fontSize: 12, color: C.onSurfaceVariant, fontFamily: "sans-serif", lineHeight: 1.5 }}>
                Keywords ranked 11–30 require minimal effort to reach page 1 and can significantly increase organic traffic.
              </div>
            </div>

            {/* Decorative trending icon */}
            <div style={{ opacity: 0.1, flexShrink: 0 }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
          </div>

        </div>

        {/* ── Footer strip ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 56px",
            background: "rgba(15,22,40,0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: `1px solid ${C.glassStroke}`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", fontFamily: "sans-serif" }}>
            {agencyName} | CONFIDENTIAL © 2024
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", fontFamily: "monospace", letterSpacing: "0.05em" }}>
            v2.4.0-PRO / SECURITY PROTOCOL / LEGAL
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", fontFamily: "sans-serif" }}>
            11 / 11
          </span>
        </div>

      </div>
    </AbsoluteFill>
  );
};
