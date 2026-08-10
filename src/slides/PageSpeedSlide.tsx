import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { useSlideTiming } from "../hooks/useSlideTiming";

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:                "#000000",
  primary:           "#d0bcff",
  secondary:         "#4cd7f6",
  error:             "#ffb4ab",
  onSurface:         "#dbe2fb",
  onSurfaceVariant:  "#cbc3d7",
  outline:           "#958ea0",
  glassBg:           "rgba(15,22,40,0.4)",
  glassStroke:       "rgba(255,255,255,0.1)",
  surfaceContainer:  "rgba(24,31,50,0.7)",
  mobileRing:        "#f43f5e",
  mobileGlow:        "rgba(244,63,94,0.15)",
  desktopRing:       "#f59e0b",
  desktopGlow:       "rgba(245,158,11,0.15)",
} as const;

// 2π × 45 ≈ 282.74 → 283 to match HTML
const DASHARRAY = 283;

// ─── Icons ────────────────────────────────────────────────────────────────────

const SmartphoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" />
  </svg>
);

const DesktopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const DotIcon = ({ color }: { color: string }) => (
  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
);

// ─── Gauge ring ───────────────────────────────────────────────────────────────

interface GaugeRingProps {
  score: number;
  ringColor: string;
  glowColor: string;
  filterId: string;
  size: number;
  startFrame: number;
}

const GaugeRing: React.FC<GaugeRingProps> = ({
  score, ringColor, glowColor, filterId, size, startFrame,
}) => {
  const frame = useCurrentFrame();
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const targetOffset = DASHARRAY * (1 - clamped / 100);

  const dashOffset = interpolate(
    frame,
    [startFrame, startFrame + 36],
    [DASHARRAY, targetOffset],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const displayScore = Math.round(
    interpolate(frame, [startFrame, startFrame + 36], [0, clamped], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={ringColor} floodOpacity="0.5" />
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
          strokeDasharray={DASHARRAY}
          strokeDashoffset="0"
        />
        {/* Progress */}
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={ringColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={DASHARRAY}
          strokeDashoffset={dashOffset}
          filter={`url(#${filterId})`}
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
        <span style={{ fontSize: 52, fontWeight: 700, color: "#ffffff", fontFamily: "sans-serif", lineHeight: 1, marginBottom: -8 }}>
          {displayScore}
        </span>
        <span style={{ fontSize: 12, color: "rgba(203,195,215,0.5)", fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
          / 100
        </span>
      </div>
    </div>
  );
};

// ─── Metric row ───────────────────────────────────────────────────────────────

interface MetricRowProps {
  label: string;
  value: string;
  valueColor: string;
  delay: number;
  frame: number;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, valueColor, delay, frame }) => {
  const rowOpacity = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rowY = interpolate(frame, [delay, delay + 14], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: rowOpacity,
        transform: `translateY(${rowY}px)`,
        background: C.glassBg,
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: `1px solid ${C.glassStroke}`,
        borderRadius: 6,
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top shimmer line (::before equivalent) */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
        }}
      />
      <span style={{ fontSize: 13, fontWeight: 500, color: C.onSurface, fontFamily: "monospace", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, color: valueColor, fontFamily: "monospace", letterSpacing: "0.05em" }}>
        {value}
      </span>
    </div>
  );
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  data: {
    mobile: {
      lcp: string;
      tbt: string;
      fcp: string;
      cls: string;
      score: number;
    };
    desktop: {
      lcp: string;
      tbt: string;
      fcp: string;
      cls: string;
      score: number;
    };
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

// ─── Main slide ───────────────────────────────────────────────────────────────

export const PageSpeedSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  console.log("Core Web Vitals Data:", data);

  const frame = useCurrentFrame();
  const { opacity } = useSlideTiming();

  // ── Data bindings (preserved) ──
  const mobileData = data?.mobile || {};
  const desktopData = data?.desktop || {};

  const mobileCwv = [
    { id: "lcp", label: "LCP", value: mobileData.lcp || "N/A" },
    { id: "tbt", label: "TBT", value: mobileData.tbt || "N/A" },
    { id: "fcp", label: "FCP", value: mobileData.fcp || "N/A" },
    { id: "cls", label: "CLS", value: mobileData.cls || "N/A" },
  ];

  const desktopCwv = [
    { id: "lcp", label: "LCP", value: desktopData.lcp || "N/A" },
    { id: "tbt", label: "TBT", value: desktopData.tbt || "N/A" },
    { id: "fcp", label: "FCP", value: desktopData.fcp || "N/A" },
    { id: "cls", label: "CLS", value: desktopData.cls || "N/A" },
  ];

  const mobileScore = mobileData.score || 0;
  const desktopScore = desktopData.score || 0;

  // ── Animations ──
  const gridOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const navOpacity = interpolate(frame, [2, 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const mobileHeaderOpacity = interpolate(frame, [6, 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const mobileHeaderY = interpolate(frame, [6, 18], [16, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const desktopHeaderOpacity = interpolate(frame, [12, 24], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const desktopHeaderY = interpolate(frame, [12, 24], [16, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const mobileGaugeOpacity = interpolate(frame, [10, 22], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const desktopGaugeOpacity = interpolate(frame, [22, 34], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const mobileMetricsOpacity = interpolate(frame, [30, 40], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const desktopMetricsOpacity = interpolate(frame, [38, 48], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Mobile row delays: 34, 42, 50, 58  |  Desktop: 42, 50, 58, 66
  const mobileRowDelays = [34, 42, 50, 58];
  const desktopRowDelays = [42, 50, 58, 66];

  // Mobile metric value colors: LCP/TBT/FCP = error, CLS = secondary (matches HTML)
  const mobileValueColors = [C.error, C.error, C.error, C.secondary];
  // Desktop: all secondary
  const desktopValueColors = [C.secondary, C.secondary, C.secondary, C.secondary];

  return (
    <AbsoluteFill style={{ background: C.bg }}>

      {/* ── Grid background ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: gridOpacity,
          pointerEvents: "none",
        }}
      />

      {/* ── Ambient lights ── */}
      <div style={{ position: "absolute", top: "25%", left: "25%", width: 600, height: 600, background: "rgba(63,0,145,0.2)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "25%", right: "25%", width: 600, height: 600, background: "rgba(109,59,215,0.1)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />

      {/* ── Top navigation ── */}
      <header
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 64,
          borderBottom: `1px solid ${C.glassStroke}`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          opacity: navOpacity,
          zIndex: 10,
        }}
      >
        {/* Brand */}
        <span style={{ fontSize: 22, fontWeight: 700, color: C.primary, fontFamily: "sans-serif", letterSpacing: "-0.02em" }}>
          {agencyName.toUpperCase()}
        </span>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {["AUDIT DASHBOARD", "PERFORMANCE", "INSIGHTS"].map((item, i) => (
            <span
              key={item}
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                color: i === 0 ? C.primary : C.onSurfaceVariant,
                fontFamily: "sans-serif",
                textTransform: "uppercase" as const,
              }}
            >
              {item}
            </span>
          ))}
        </nav>

        {/* Icons */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", color: C.onSurfaceVariant }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </div>
      </header>

      {/* ── Main content ── */}
      <main
        style={{
          position: "absolute",
          top: 64,
          left: 0,
          right: 0,
          bottom: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          opacity,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1440,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            position: "relative",
          }}
        >
          {/* Vertical separator */}
          <div
            style={{
              position: "absolute",
              top: 0, bottom: 0,
              left: "50%",
              width: 1,
              background: C.glassStroke,
            }}
          />

          {/* ── Mobile column ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* Column header */}
            <div
              style={{
                marginBottom: 48,
                textAlign: "center",
                opacity: mobileHeaderOpacity,
                transform: `translateY(${mobileHeaderY}px)`,
                color: C.error,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "monospace",
                textTransform: "uppercase" as const,
                letterSpacing: "0.3em",
              }}
            >
              <SmartphoneIcon />
              Mobile Performance
            </div>

            {/* Gauge */}
            <div style={{ marginBottom: 60, opacity: mobileGaugeOpacity }}>
              <GaugeRing
                score={mobileScore}
                ringColor={C.mobileRing}
                glowColor={C.mobileGlow}
                filterId="glow-mobile"
                size={300}
                startFrame={14}
              />
            </div>

            {/* Core Web Vitals */}
            <div style={{ width: "100%", maxWidth: 460, opacity: mobileMetricsOpacity }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.onSurfaceVariant, textTransform: "uppercase" as const, letterSpacing: "0.2em", fontFamily: "sans-serif", marginBottom: 12, opacity: 0.6 }}>
                Core Web Vitals
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mobileCwv.map((v, i) => (
                  <MetricRow
                    key={v.id}
                    label={v.label}
                    value={v.value}
                    valueColor={mobileValueColors[i]}
                    delay={mobileRowDelays[i]}
                    frame={frame}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Desktop column ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* Column header */}
            <div
              style={{
                marginBottom: 48,
                textAlign: "center",
                opacity: desktopHeaderOpacity,
                transform: `translateY(${desktopHeaderY}px)`,
                color: C.secondary,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "monospace",
                textTransform: "uppercase" as const,
                letterSpacing: "0.3em",
              }}
            >
              <DesktopIcon />
              Desktop Performance
            </div>

            {/* Gauge */}
            <div style={{ marginBottom: 60, opacity: desktopGaugeOpacity }}>
              <GaugeRing
                score={desktopScore}
                ringColor={C.desktopRing}
                glowColor={C.desktopGlow}
                filterId="glow-desktop"
                size={300}
                startFrame={26}
              />
            </div>

            {/* Core Web Vitals */}
            <div style={{ width: "100%", maxWidth: 460, opacity: desktopMetricsOpacity }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.onSurfaceVariant, textTransform: "uppercase" as const, letterSpacing: "0.2em", fontFamily: "sans-serif", marginBottom: 12, opacity: 0.6 }}>
                Core Web Vitals
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {desktopCwv.map((v, i) => (
                  <MetricRow
                    key={v.id}
                    label={v.label}
                    value={v.value}
                    valueColor={desktopValueColors[i]}
                    delay={desktopRowDelays[i]}
                    frame={frame}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Bottom branding pill ── */}
      <div
        style={{
          position: "absolute",
          bottom: 64,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: interpolate(frame, [50, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: C.glassBg,
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: `1px solid ${C.glassStroke}`,
            borderRadius: 100,
            padding: "8px 24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden",
            whiteSpace: "nowrap" as const,
          }}
        >
          {/* Top shimmer */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />
          <DotIcon color={C.secondary} />
          <span style={{ fontSize: 12, fontWeight: 500, color: C.onSurface, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            Real-Time Comparison Engine
          </span>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 48,
          borderTop: `1px solid ${C.glassStroke}`,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          background: C.surfaceContainer,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          opacity: navOpacity,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: C.onSurface, fontFamily: "sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
          © 2024 {agencyName.toUpperCase()} | CONFIDENTIAL
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {["v2.4.0-PRO", "SECURITY PROTOCOL", "LEGAL"].map((item) => (
            <span key={item} style={{ fontSize: 12, fontWeight: 500, color: C.onSurfaceVariant, fontFamily: "monospace", letterSpacing: "0.05em" }}>
              {item}
            </span>
          ))}
        </div>
      </footer>

      {/* Slide number */}
      <div style={{ position: "absolute", bottom: 14, right: 24, fontSize: 11, color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>
        10 / 11
      </div>
    </AbsoluteFill>
  );
};
