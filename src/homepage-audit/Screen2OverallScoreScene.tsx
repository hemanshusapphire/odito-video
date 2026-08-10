import type { FC, ReactElement } from 'react';
import { AbsoluteFill, interpolate, spring, Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import { AuditNav } from './components/AuditNav';
import { ScoreRing } from './components/ScoreRing';
import { KpiCard } from './components/KpiCard';
import { TotalIssuesCard } from './components/TotalIssuesCard';
import { InsightBanner } from './components/InsightBanner';
import { SectionDivider } from './components/SectionDivider';
import { PerfVerdictBox } from './components/PerfVerdictBox';

// ── Data interface ────────────────────────────────────────────────────────────

export interface OverallScoreData {
  // Nav
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  badgeText?: string;

  // Gauge left column
  gaugeTitleWhite?: string;
  gaugeTitleColored?: string;
  score?: number;
  maxScore?: number;
  verdictTitle?: string;
  verdictSubtitle?: string;

  // Score summary (right column)
  summaryLine1?: string;
  summaryLine2Suffix?: string;
  summaryLine3?: string;

  // Issues section
  issuesSectionLabel?: string;
  totalIssues?: number;
  totalIssuesLabel?: string;
  criticalIssues?: number;
  criticalLabel?: string;
  warningIssues?: number;
  warningsLabel?: string;
  passedChecks?: number;
  passedLabel?: string;

  // Insight strip
  insightText?: string;
}

// ── Local SVG icons ───────────────────────────────────────────────────────────

const IconCritical: FC = () => (
  <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8"  x2="12"   y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconWarning: FC = () => (
  <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9"  x2="12"   y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconPassed: FC = () => (
  <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconPerf: FC = () => (
  <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }} fill="none" stroke="#8b5cf6" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconDoc: FC = () => (
  <svg viewBox="0 0 24 24" style={{ width: 26, height: 26 }} fill="none" stroke="#3b82f6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

const IconTarget: FC = () => (
  <svg viewBox="0 0 36 36" style={{ width: 34, height: 34 }} fill="none">
    <circle cx="18" cy="18" r="14" stroke="#3b82f6" strokeWidth="1.5" opacity="0.4" />
    <circle cx="18" cy="18" r="9"  stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
    <circle cx="18" cy="18" r="4"  stroke="#3b82f6" strokeWidth="1.5" />
    <line x1="26" y1="10" x2="20" y2="16" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
    <polyline points="22,9 26,9 26,13" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Scene ─────────────────────────────────────────────────────────────────────

export const OverallScoreScene: FC<{ data: OverallScoreData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const ease  = Easing.out(Easing.cubic);

  const score    = data.score    ?? 0;
  const maxScore = data.maxScore ?? 100;

  let computedVerdictTitle = 'Good Health';
  let computedVerdictSubtitle = 'Room for minor improvements';
  if (score >= 90) {
    computedVerdictTitle = 'Excellent Health';
    computedVerdictSubtitle = 'Optimized and secure homepage';
  } else if (score >= 70) {
    computedVerdictTitle = 'Good Health';
    computedVerdictSubtitle = 'Room for minor improvements';
  } else if (score >= 50) {
    computedVerdictTitle = 'Fair Health';
    computedVerdictSubtitle = 'Requires optimizations and fixes';
  } else {
    computedVerdictTitle = 'Critical Status';
    computedVerdictSubtitle = 'Immediate attention required';
  }

  // ── Animation values ──────────────────────────────────────────────────────

  const globalOpacity = interpolate(frame, [0, 15],  [0, 1],  { extrapolateRight: 'clamp' });
  const navY          = interpolate(frame, [0, 20],  [-30, 0], { extrapolateRight: 'clamp', easing: ease });
  const leftX         = interpolate(frame, [8, 28],  [-40, 0], { extrapolateRight: 'clamp', easing: ease });
  const rightX        = interpolate(frame, [8, 28],  [40, 0],  { extrapolateRight: 'clamp', easing: ease });
  const panelOpacity  = interpolate(frame, [8, 28],  [0, 1],   { extrapolateRight: 'clamp' });

  // Ring fills from 0 → score
  const ringProgress  = interpolate(frame, [25, 85], [0, 1],  { extrapolateRight: 'clamp', easing: ease });

  // Right-column sections cascade in
  const summaryOpacity = interpolate(frame, [35, 52], [0, 1],  { extrapolateRight: 'clamp' });
  const summaryY       = interpolate(frame, [35, 52], [15, 0], { extrapolateRight: 'clamp', easing: ease });

  const dividerOpacity  = interpolate(frame, [48, 62], [0, 1],  { extrapolateRight: 'clamp' });
  const totalOpacity    = interpolate(frame, [52, 66], [0, 1],  { extrapolateRight: 'clamp' });
  const totalY          = interpolate(frame, [52, 66], [12, 0], { extrapolateRight: 'clamp', easing: ease });

  const miniOpacities = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [65 + i * 6, 80 + i * 6], [0, 1],  { extrapolateRight: 'clamp' })
  );
  const miniY = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [65 + i * 6, 80 + i * 6], [15, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  const bannerOpacity = interpolate(frame, [82, 95], [0, 1],  { extrapolateRight: 'clamp' });
  const bannerY       = interpolate(frame, [82, 95], [10, 0], { extrapolateRight: 'clamp', easing: ease });

  const verdictOpacity = interpolate(frame, [70, 85], [0, 1],  { extrapolateRight: 'clamp' });
  const verdictY       = interpolate(frame, [70, 85], [10, 0], { extrapolateRight: 'clamp', easing: ease });

  // ── Executive Summary footer (scene is 168f total) ────────────────────────
  // Panel: 4.2s → 4.7s = 126f → 141f
  // Checklist items: 3f stagger, 10f duration — all complete by frame 167
  const footerOp = interpolate(frame, [126, 141], [0, 1], { extrapolateRight: 'clamp' });
  const footerY  = interpolate(frame, [126, 141], [40, 0], { extrapolateRight: 'clamp', easing: ease });

  const CHECKLIST = [
    'Homepage Fully Analyzed',
    'Technical SEO Validated',
    'AI Visibility Evaluated',
    'Accessibility Standards Checked',
    'Security Configuration Reviewed',
    'Local Presence Verified',
  ] as const;
  const checkOp: number[] = CHECKLIST.map((_, i) =>
    interpolate(frame, [139 + i * 3, 149 + i * 3], [0, 1], { extrapolateRight: 'clamp' })
  );
  const checkX: number[] = CHECKLIST.map((_, i) =>
    interpolate(frame, [139 + i * 3, 149 + i * 3], [20, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // Count-up values (driven by ringProgress for visual sync)
  const animatedScore    = Math.round(ringProgress * score);
  const animatedTotal    = Math.round(interpolate(frame, [55, 90], [0, data.totalIssues    ?? 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const animatedCritical = Math.round(interpolate(frame, [65, 92], [0, data.criticalIssues ?? 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const animatedWarnings = Math.round(interpolate(frame, [70, 93], [0, data.warningIssues  ?? 0],  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const animatedPassed   = Math.round(interpolate(frame, [68, 94], [0, data.passedChecks   ?? 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{
      fontFamily: "'Inter', sans-serif",
      background: '#060b1c',
      color: '#fff',
      WebkitFontSmoothing: 'antialiased',
      overflow: 'hidden',
      opacity: globalOpacity,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    }}>

      {/* ── Nav ── */}
      <AuditNav
        data={{
          brandName:   data.brandName   ?? 'odito',
          brandSuffix: data.brandSuffix ?? 'ai',
          pageLabel:   data.pageLabel   ?? 'Website Audit',
          badgeText:   data.badgeText   ?? 'Scan Completed',
        }}
        translateY={navY}
      />

      {/* ── Main grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '520px 1fr',
        padding: '54px 60px 44px',
        alignItems: 'start',
        flex: 1,
        height: 'calc(100% - 66px)',
      }}>

        {/* ══ LEFT: Gauge column ══ */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          opacity: panelOpacity,
          transform: `translateX(${leftX}px)`,
        }}>

          {/* Section title */}
          <div style={{
            fontSize: 28, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase',
            marginBottom: 48, alignSelf: 'flex-start', paddingLeft: 20,
          }}>
            <span style={{ color: '#fff' }}>{data.gaugeTitleWhite ?? 'OVERALL'}</span>
            <span style={{
              background: 'linear-gradient(90deg,#00c8ff,#7c3aed)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginLeft: 12,
            }}>{data.gaugeTitleColored ?? 'HEALTH SCORE'}</span>
          </div>

          {/* Score ring */}
          <ScoreRing
            score={score}
            maxScore={maxScore}
            progress={ringProgress}
            id="overall"
            scale={1.08}
          />

          {/* Verdict box */}
          <PerfVerdictBox
            title={data.verdictTitle ?? computedVerdictTitle}
            subtitle={data.verdictSubtitle ?? computedVerdictSubtitle}
            iconEl={<IconPerf />}
            opacity={verdictOpacity}
            translateY={verdictY}
            marginTop={54}
          />
        </div>

        {/* ══ RIGHT: Details column ══ */}
        <div style={{
          paddingLeft: 60,
          display: 'flex', flexDirection: 'column', gap: 28,
          opacity: panelOpacity,
          transform: `translateX(${rightX}px)`,
        }}>

          {/* Score summary */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 18,
            opacity: summaryOpacity, transform: `translateY(${summaryY}px)`,
          }}>
            <div style={{
              width: 58, height: 58, borderRadius: 14,
              background: 'rgba(37,99,235,0.12)', border: '1.5px solid rgba(37,99,235,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <IconDoc />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 500, color: '#b0bcd8', marginBottom: 4 }}>
                {data.summaryLine1 ?? "Your website's overall score is"}
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>
                <span style={{
                  fontSize: 40,
                  background: 'linear-gradient(90deg,#00c8ff,#22d3ee)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {animatedScore}
                </span>
                <span style={{ color: '#fff', fontSize: 36 }}>
                  {data.summaryLine2Suffix ?? ' out of 100'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#5a6a90', lineHeight: 1.55 }}>
                {data.summaryLine3 ?? 'This score is based on SEO, Performance, Security, Accessibility, and AI Visibility checks.'}
              </div>
            </div>
          </div>

          {/* Section divider */}
          <SectionDivider
            label={data.issuesSectionLabel ?? 'Issues Found'}
            opacity={dividerOpacity}
          />

          {/* Total issues */}
          <TotalIssuesCard
            value={animatedTotal}
            label={data.totalIssuesLabel ?? 'Total Issues'}
            opacity={totalOpacity}
            translateY={totalY}
          />

          {/* KPI mini cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <KpiCard
              value={animatedCritical}
              label={data.criticalLabel ?? 'Critical'}
              color="#ef4444"
              iconEl={<IconCritical />}
              opacity={miniOpacities[0]}
              translateY={miniY[0]}
            />
            <KpiCard
              value={animatedWarnings}
              label={data.warningsLabel ?? 'Warnings'}
              color="#f59e0b"
              iconEl={<IconWarning />}
              opacity={miniOpacities[1]}
              translateY={miniY[1]}
            />
            <KpiCard
              value={animatedPassed}
              label={data.passedLabel ?? 'Passed'}
              color="#22c55e"
              iconEl={<IconPassed />}
              opacity={miniOpacities[2]}
              translateY={miniY[2]}
            />
          </div>

          {/* Insight banner */}
          <InsightBanner
            text={data.insightText ?? "Addressing these issues can improve your website's visibility, user experience, and overall performance."}
            iconEl={<IconTarget />}
            opacity={bannerOpacity}
            translateY={bannerY}
          />
        </div>

        {/* ── Executive Summary Footer — inside grid, full-width row ── */}
        <div style={{
          gridColumn: '1 / -1',
          marginTop: 28,
          opacity: footerOp,
          transform: `translateY(${footerY}px)`,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            background: 'linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(9,16,34,0.99) 100%)',
            border: '1px solid rgba(59,130,246,0.18)',
            borderRadius: 14,
            padding: '38px 40px',
            boxShadow: '0 0 48px rgba(59,130,246,0.08), 0 0 96px rgba(124,58,237,0.05), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>

            {/* Left 60% — heading + description */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 14,
              paddingRight: 44,
              borderRight: '1px solid rgba(255,255,255,0.07)',
            }}>
              {/* Eyebrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(124,58,237,0.3))',
                  border: '1px solid rgba(59,130,246,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }} fill="none">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '2.5px',
                  textTransform: 'uppercase', color: '#ffffff',
                }}>
                  Audit Executive Summary
                </div>
              </div>

              {/* Description lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                  Your homepage was successfully analyzed across multiple visibility, quality, security and performance dimensions.
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                  The audit identified opportunities to improve search visibility, user experience and technical quality.
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginTop: 2 }}>
                  Generated using{' '}
                  <span style={{ color: '#60a5fa', fontWeight: 600 }}>Odito AI</span>
                  's multi-engine audit system.
                </div>
              </div>
            </div>

            {/* Right 40% — checklist */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 10,
              paddingLeft: 40,
            }}>
              {CHECKLIST.map((item, i) => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  opacity: checkOp[i],
                  transform: `translateX(${checkX[i]}px)`,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 10 10" style={{ width: 9, height: 9 }} fill="none">
                      <polyline points="2,5 4,7 8,3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
