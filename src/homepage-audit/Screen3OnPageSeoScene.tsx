import type { FC } from 'react';
import { AbsoluteFill, interpolate, spring, Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import { AuditStepNav, DEFAULT_AUDIT_STEPS } from './components/AuditStepNav';
import type { AuditStepItem } from './components/AuditStepNav';
import { ScoreRing } from './components/ScoreRing';
import { PerfVerdictBox } from './components/PerfVerdictBox';
import { StatCard } from './components/StatCard';

// ── Data contract ──────────────────────────────────────────────────────────────

export type OnPageFindingIconType = 'hreflang' | 'imagealt' | 'schema' | 'meta' | 'h1' | string;

export interface OnPageFinding {
  iconType: OnPageFindingIconType;
  name: string;
  description: string;
  affectedCount?: number;
  affectedLabel?: string;
}

export interface OnPageSeoData {
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  steps?: AuditStepItem[];

  score?: number;
  maxScore?: number;
  sectionLabel?: string;
  sectionSubtitle?: string;
  optimizationStatus?: string;

  // Stat cards
  totalIssues?: number | string;
  /** @deprecated kept for data-adapter compatibility — no longer rendered */
  pagesAnalyzed?: number;
  /** @deprecated kept for data-adapter compatibility — no longer rendered */
  impactOpportunity?: string;

  findingsHeader?: string;
  findings?: OnPageFinding[];

  /** @deprecated kept for data-adapter compatibility — no longer rendered */
  ctaTitle?: string;
  /** @deprecated kept for data-adapter compatibility — no longer rendered */
  ctaSubtitle?: string;
}

// ── Static content ─────────────────────────────────────────────────────────────

const OPTIMIZATION_ITEMS = [
  'Meta Structure Valid',
  'Heading Hierarchy Present',
  'Content Readability Good',
] as const;

const ANALYSIS_ITEMS = [
  'Homepage Content Evaluated',
  'Metadata Structure Validated',
  'Heading Hierarchy Reviewed',
  'Image Accessibility Checked',
  'International SEO Assessed',
] as const;

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconScore: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f9cf9" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconIssues: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconOptStatus: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

// ── Finding icon registry ──────────────────────────────────────────────────────

interface FindingIconCfg { color: string; bg: string; border: string; icon: FC; }

const FINDING_ICONS: Record<string, FindingIconCfg> = {
  hreflang: {
    color: '#f59e0b', bg: '#201408', border: '#d97706',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  imagealt: {
    color: '#ef4444', bg: '#1e0808', border: '#dc2626',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  schema: {
    color: '#c0392b', bg: '#1e0f0f', border: '#c0392b',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" />
        <line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="14" x2="17" y2="22" />
      </svg>
    ),
  },
  meta: {
    color: '#d97706', bg: '#201408', border: '#d97706',
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  h1: {
    color: '#ef4444', bg: '#250a0a', border: '#ef4444',
    icon: () => <span style={{ fontSize: 13, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>H1</span>,
  },
};

const FALLBACK_ICON: FindingIconCfg = {
  color: '#4f9cf9', bg: '#0d1535', border: '#4f9cf9',
  icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f9cf9" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// ── Default findings ───────────────────────────────────────────────────────────

const DEFAULT_FINDINGS: OnPageFinding[] = [
  { iconType: 'hreflang', name: 'Hreflang',  description: 'Missing international targeting signals' },
  { iconType: 'imagealt', name: 'Image Alt', description: 'Images missing descriptive alt attributes' },
];

// ── Scene ──────────────────────────────────────────────────────────────────────

export const OnPageSeoScene: FC<{ data: OnPageSeoData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = Easing.out(Easing.cubic);
  const cl   = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

  const score    = data.score    ?? 0;
  const maxScore = data.maxScore ?? 100;
  const issues   = Number(data.totalIssues ?? 0);

  let optStatus = data.optimizationStatus;
  if (!optStatus) {
    if (score >= 90) optStatus = 'Excellent';
    else if (score >= 70) optStatus = 'Strong';
    else if (score >= 50) optStatus = 'Fair';
    else optStatus = 'Needs Work';
  }

  const findings  = data.findings ?? [];
  const steps     = data.steps ?? DEFAULT_AUDIT_STEPS;

  // ── Animation timeline ─────────────────────────────────────────────────────
  // Scene is 168 local frames (5.6s @ 30fps)

  // Global fade + nav
  const globalOp = interpolate(frame, [0, 15],  [0, 1],   cl);
  const navY     = interpolate(frame, [0, 20],  [-28, 0], { ...cl, easing: ease });
  const panelOp  = interpolate(frame, [8, 28],  [0, 1],   cl);
  const leftX    = interpolate(frame, [8, 28],  [-35, 0], { ...cl, easing: ease });
  const rightX   = interpolate(frame, [8, 28],  [35, 0],  { ...cl, easing: ease });

  // Dial: 20 → 80
  const dialProgress = interpolate(frame, [20, 80], [0, 1], { ...cl, easing: ease });
  const labelOp      = interpolate(frame, [30, 46], [0, 1], cl);

  // Verdict / status badge animation
  const verdictOpacity = interpolate(frame, [50, 70], [0, 1], cl);
  const verdictY       = interpolate(frame, [50, 70], [12, 0], { ...cl, easing: ease });

  // Stat cards: stagger each 6f apart, start 30
  const statOp = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [30 + i * 6, 46 + i * 6], [0, 1], cl)
  );
  const statY = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [30 + i * 6, 46 + i * 6], [14, 0], { ...cl, easing: ease })
  );

  // Count-up for score + issues cards
  const animScore  = Math.round(interpolate(frame, [30, 80], [0, score],  cl));
  const animIssues = Math.round(interpolate(frame, [36, 80], [0, issues], cl));

  // Findings panel: 55 → 70
  const findOp = interpolate(frame, [55, 70], [0, 1],   cl);
  const findY  = interpolate(frame, [55, 70], [16, 0],  { ...cl, easing: ease });

  // Individual findings: stagger
  const findingOp = findings.map((_, i) =>
    interpolate(frame, [62 + i * 8, 78 + i * 8], [0, 1], cl)
  );
  const findingY = findings.map((_, i) =>
    interpolate(frame, [62 + i * 8, 78 + i * 8], [12, 0], { ...cl, easing: ease })
  );

  // Analysis Summary panel: 88 → 103
  const analysisOp = interpolate(frame, [88, 103], [0, 1],   cl);
  const analysisY  = interpolate(frame, [88, 103], [20, 0],  { ...cl, easing: ease });

  // Checklist items: 3f stagger, start 100
  const checkOp = ANALYSIS_ITEMS.map((_, i) =>
    interpolate(frame, [100 + i * 3, 112 + i * 3], [0, 1], cl)
  );
  const checkX = ANALYSIS_ITEMS.map((_, i) =>
    interpolate(frame, [100 + i * 3, 112 + i * 3], [16, 0], { ...cl, easing: ease })
  );

  return (
    <AbsoluteFill style={{
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      background: '#0a0d1a',
      color: '#fff',
      WebkitFontSmoothing: 'antialiased',
      display: 'flex',
      flexDirection: 'column',
      opacity: globalOp,
      overflow: 'hidden',
    }}>

      <AuditStepNav
        brandName={data.brandName}
        brandSuffix={data.brandSuffix}
        pageLabel={data.pageLabel}
        steps={steps}
        translateY={navY}
      />

      {/* Body grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '4fr 6fr',
        padding: '54px 60px 44px',
        alignItems: 'start',
        flex: 1,
        height: 'calc(100% - 66px)',
      }}>

        {/* ══ LEFT: Score dial ══ */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingRight: 24,
          opacity: panelOp,
          transform: `translateX(${leftX}px)`,
        }}>

          {/* Section title */}
          <div style={{
            fontSize: 28, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase',
            marginBottom: 12, alignSelf: 'flex-start', paddingLeft: 20,
          }}>
            <span style={{ color: '#fff' }}>ON-PAGE</span>
            <span style={{
              background: 'linear-gradient(90deg,#00c8ff,#7c3aed)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginLeft: 12,
            }}>SEO</span>
          </div>

          {/* Short description */}
          <div style={{
            fontSize: 13.5, color: '#6b7a9e',
            alignSelf: 'flex-start', paddingLeft: 20, marginBottom: 32,
            lineHeight: 1.55, maxWidth: 360,
          }}>
            {data.sectionSubtitle ?? 'How well your pages are optimized for search engines'}
          </div>
          {/* Score ring */}
          <ScoreRing
            score={score}
            maxScore={maxScore}
            progress={dialProgress}
            id="onpage-seo"
            scale={1.08}
          />

          {/* Verdict box / Small status badge */}
          <PerfVerdictBox
            title={optStatus ? `Status: ${optStatus}` : 'Good optimization'}
            subtitle="All key on-page checks passed"
            iconEl={<IconOptStatus />}
            opacity={verdictOpacity}
            translateY={verdictY}
            marginTop={40}
          />
        </div>

        {/* ══ RIGHT: Details column ══ */}
        <div style={{
          paddingLeft: 60,
          display: 'flex', flexDirection: 'column', gap: 28,
          opacity: panelOp,
          transform: `translateX(${rightX}px)`,
        }}>

          {/* ── Stat cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            <StatCard
              variant="blue"
              value={animScore}
              description={'Score\n/ 100'}
              iconEl={<IconScore />}
              opacity={statOp[0]}
              translateY={statY[0]}
            />
            <StatCard
              variant="purple"
              value={animIssues}
              description={'Issues\nFound'}
              iconEl={<IconIssues />}
              opacity={statOp[1]}
              translateY={statY[1]}
            />
            <StatCard
              variant="green"
              value={optStatus}
              description={'Optimization\nStatus'}
              iconEl={<IconOptStatus />}
              opacity={statOp[2]}
              translateY={statY[2]}
            />
          </div>

          {/* ── Findings panel (enhanced: larger type, more padding) ── */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            overflow: 'hidden',
            opacity: findOp,
            transform: `translateY(${findY}px)`,
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 22px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: findings.length === 0 ? '#22c55e' : '#ef4444',
                boxShadow: findings.length === 0 ? '0 0 6px rgba(34,197,94,0.6)' : '0 0 6px rgba(239,68,68,0.6)',
                flexShrink: 0,
              }} />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#cbd5e1' }}>
                {data.findingsHeader ?? 'Top Findings'}
              </div>
              <div style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                background: findings.length === 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: findings.length === 0 ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
                color: findings.length === 0 ? '#22c55e' : '#ef4444', padding: '3px 10px', borderRadius: 4, letterSpacing: '0.5px',
              }}>
                {findings.length} {findings.length === 1 ? 'Issue' : 'Issues'}
              </div>
            </div>

            {/* Finding rows */}
            <div>
              {findings.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '40px 22px', textAlign: 'center', gap: 14,
                }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
                      All On-Page SEO Checks Passed
                    </div>
                    <div style={{ fontSize: 13, color: '#5a6a90', lineHeight: 1.5 }}>
                      No critical optimization issues or structural deficiencies detected.
                    </div>
                  </div>
                </div>
              ) : (
                findings.map((f, i) => {
                  const cfg = FINDING_ICONS[f.iconType] ?? FALLBACK_ICON;
                  const IconComp = cfg.icon;
                  const isLast = i === findings.length - 1;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 18,
                      padding: '20px 22px',
                      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                      opacity: findingOp[i],
                      transform: `translateY(${findingY[i]}px)`,
                    }}>
                      {/* Icon circle */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: cfg.bg,
                        border: `1.5px solid ${cfg.border}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <IconComp />
                      </div>
                      {/* Text */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 5 }}>
                          {f.name}
                        </div>
                        <div style={{ fontSize: 13, color: '#5a6a90', lineHeight: 1.55 }}>
                          {f.description}
                        </div>
                      </div>
                      {/* Status badge */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 6, padding: '6px 12px', flexShrink: 0,
                      }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.5px' }}>Needs Fix</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Analysis Summary Footer — inside grid, full-width row ── */}
        <div style={{
          gridColumn: '1 / -1',
          marginTop: 28,
          opacity: analysisOp,
          transform: `translateY(${analysisY}px)`,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60% 40%',
            background: 'linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(9,16,34,0.99) 100%)',
            border: '1px solid rgba(34,197,94,0.18)',
            borderRadius: 14,
            padding: '38px 40px',
            boxShadow: '0 0 48px rgba(34,197,94,0.08), 0 0 96px rgba(124,58,237,0.05), inset 0 1px 0 rgba(255,255,255,0.06)',
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
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(16,185,129,0.3))',
                  border: '1px solid rgba(34,197,94,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }} fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '2.5px',
                  textTransform: 'uppercase', color: '#ffffff',
                }}>
                  On-Page SEO Analysis Summary
                </div>
              </div>

              {/* Description lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                  Your homepage content, metadata structure, and header tag hierarchy were successfully analyzed.
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                  Resolving the detected issues will improve your content relevance and search engine click-through rates.
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginTop: 2 }}>
                  Generated using{' '}
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>Odito AI</span>
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
              {ANALYSIS_ITEMS.map((item, i) => (
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
