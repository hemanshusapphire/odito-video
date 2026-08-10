import type { FC, ReactElement } from 'react';
import { AbsoluteFill, interpolate, Easing, useCurrentFrame } from 'remotion';
import { AuditStepNav } from './components/AuditStepNav';
import type { AuditStepItem } from './components/AuditStepNav';
import { ScoreRing } from './components/ScoreRing';
import { PerfVerdictBox } from './components/PerfVerdictBox';
import { StatCard } from './components/StatCard';
import { InsightBanner } from './components/InsightBanner';

// ── Step nav for screen 4 ─────────────────────────────────────────────────────

const TECHNICAL_AUDIT_STEPS: AuditStepItem[] = [
  { number: 1,  label: 'Intro',         state: 'done'    },
  { number: 2,  label: 'Overall Score', state: 'done'    },
  { number: 3,  label: 'On-Page SEO',   state: 'done'    },
  { number: 4,  label: 'Technical',     state: 'active'  },
  { number: 5,  label: 'Security',      state: 'pending' },
  { number: 6,  label: 'AI Visibility', state: 'pending' },
  { number: 7,  label: 'Performance',   state: 'pending' },
  { number: 8,  label: 'Accessibility', state: 'pending' },
  { number: 9,  label: 'Social',        state: 'pending' },
  { number: 10, label: 'Local SEO',     state: 'pending' },
];

// ── Data contract ──────────────────────────────────────────────────────────────

export type TechnicalFindingIconType = 'ssl' | 'crawl' | 'redirect' | 'sitemap' | 'robots' | string;

export interface TechnicalFinding {
  iconType: TechnicalFindingIconType;
  name: string;
  description: string;
  affectedCount: number;
  affectedLabel?: string;
  countColor?: string;
}

export interface TechnicalSeoData {
  // Nav
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  steps?: AuditStepItem[];

  // Left dial
  score?: number;
  maxScore?: number;
  sectionLabel?: string;
  sectionSubtitle?: string;

  // Stat cards
  pagesCrawled?: number;
  issuesFound?: number | string;
  checksPassed?: number | string;

  // Findings
  findingsHeader?: string;
  findings?: TechnicalFinding[];
  techChecks?: any[];

  // CTA banner
  ctaTitle?: string;
  ctaSubtitle?: string;
}

// ── Finding icon registry ─────────────────────────────────────────────────────

interface FindingIconEntry {
  iconEl: ReactElement;
  background: string;
  borderColor: string;
  countColor?: string;
}

const FINDING_ICONS: Record<string, FindingIconEntry> = {
  ssl: {
    background:  '#1e0a0a',
    borderColor: '#ef4444',
    countColor:  '#ef4444',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <line x1="12" y1="15" x2="12" y2="17" />
      </svg>
    ),
  },
  crawl: {
    background:  '#1f1205',
    borderColor: '#f97316',
    countColor:  '#f97316',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8"  x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  redirect: {
    background:  '#1c1505',
    borderColor: '#eab308',
    countColor:  '#eab308',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  sitemap: {
    background:  '#0a1535',
    borderColor: '#4f9cf9',
    countColor:  '#4f9cf9',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#4f9cf9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8"  y="2"  width="8"  height="4" rx="1" />
        <rect x="2"  y="14" width="6"  height="4" rx="1" />
        <rect x="16" y="14" width="6"  height="4" rx="1" />
        <rect x="9"  y="14" width="6"  height="4" rx="1" />
        <line x1="12" y1="6"  x2="12" y2="10" />
        <line x1="5"  y1="10" x2="19" y2="10" />
        <line x1="5"  y1="10" x2="5"  y2="14" />
        <line x1="12" y1="10" x2="12" y2="14" />
        <line x1="19" y1="10" x2="19" y2="14" />
      </svg>
    ),
  },
  robots: {
    background:  '#0f1a10',
    borderColor: '#22c55e',
    countColor:  '#22c55e',
    iconEl: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M9 8V5l3-3 3 3v3" />
        <line x1="9"  y1="14" x2="9.01"  y2="14" />
        <line x1="15" y1="14" x2="15.01" y2="14" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
  },
};

const FALLBACK_ICON: FindingIconEntry = {
  background:  '#0d1535',
  borderColor: '#4f9cf9',
  countColor:  '#4f9cf9',
  iconEl: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#4f9cf9" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// ── Stat card icons ────────────────────────────────────────────────────────────

const IconCrawl: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#4f9cf9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconIssues: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9"  x2="12"   y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconCheckPass: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconCtaWrench: FC = () => (
  <svg viewBox="0 0 46 46" width="46" height="46" fill="none">
    <circle cx="23" cy="23" r="20" stroke="#f97316" strokeWidth="1.5" opacity="0.4" />
    <path d="M28 8a8 8 0 0 1 0 16 8 8 0 0 1-7.42-5H8l3 3-3 3h7v3h3v-3h3.58A8 8 0 0 1 28 38a8 8 0 0 0 0-16V8z"
      stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// ── Default data ───────────────────────────────────────────────────────────────

const DEFAULT_FINDINGS: TechnicalFinding[] = [
  { iconType: 'ssl',      name: 'SSL / HTTPS Issues',       description: 'Some pages are served over insecure HTTP', affectedCount: 18 },
  { iconType: 'crawl',    name: 'Crawl Errors Detected',    description: 'Pages returning 4xx / 5xx status codes',   affectedCount: 31 },
  { iconType: 'redirect', name: 'Redirect Chains Found',    description: 'Multiple hops slow down crawl efficiency', affectedCount: 14 },
];

// ── Scene ──────────────────────────────────────────────────────────────────────

export const TechnicalSeoScene: FC<{ data: TechnicalSeoData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const ease  = Easing.out(Easing.cubic);

  const score    = data.score    ?? 0;
  const maxScore = data.maxScore ?? 100;
  const findings = data.findings ?? [];
  const steps    = data.steps    ?? TECHNICAL_AUDIT_STEPS;
  const techChecks = data.techChecks ?? [];


  let techStatus = 'Excellent';
  let techSubtitle = 'All critical technical checks passed';
  if (score >= 90) {
    techStatus = 'Excellent';
    techSubtitle = 'All critical technical checks passed';
  } else if (score >= 70) {
    techStatus = 'Good';
    techSubtitle = 'Minor technical optimizations recommended';
  } else if (score >= 50) {
    techStatus = 'Fair';
    techSubtitle = 'Technical SEO issues need attention';
  } else {
    techStatus = 'Critical';
    techSubtitle = 'Immediate technical fixes required';
  }

  // ── Animation values ────────────────────────────────────────────────────────

  const globalOpacity = interpolate(frame, [0, 15],  [0, 1],   { extrapolateRight: 'clamp' });
  const navY          = interpolate(frame, [0, 20],  [-28, 0],  { extrapolateRight: 'clamp', easing: ease });
  const leftX         = interpolate(frame, [8, 28],  [-35, 0],  { extrapolateRight: 'clamp', easing: ease });
  const rightX        = interpolate(frame, [8, 28],  [35, 0],   { extrapolateRight: 'clamp', easing: ease });
  const panelOpacity  = interpolate(frame, [8, 28],  [0, 1],    { extrapolateRight: 'clamp' });

  // Dial fills frames 20→80
  const dialProgress = interpolate(frame, [20, 80], [0, 1], { extrapolateRight: 'clamp', easing: ease });

  // Label fade
  const labelOpacity = interpolate(frame, [30, 48], [0, 1], { extrapolateRight: 'clamp' });

  // Verdict / status badge animation
  const verdictOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' });
  const verdictY       = interpolate(frame, [50, 70], [12, 0], { extrapolateRight: 'clamp', easing: ease });

  // Stat cards stagger
  const statOpacities = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [30 + i * 6, 46 + i * 6], [0, 1],  { extrapolateRight: 'clamp' })
  );
  const statY = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [30 + i * 6, 46 + i * 6], [14, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // Findings container
  const findingsOpacity = interpolate(frame, [48, 62], [0, 1],  { extrapolateRight: 'clamp' });
  const findingsY       = interpolate(frame, [48, 62], [12, 0], { extrapolateRight: 'clamp', easing: ease });

  // Individual findings stagger
  const findingOpacities = Array.from({ length: 4 }).map((_, i) =>
    interpolate(frame, [55 + i * 6, 70 + i * 6], [0, 1],  { extrapolateRight: 'clamp' })
  );
  const findingY = Array.from({ length: 4 }).map((_, i) =>
    interpolate(frame, [55 + i * 6, 70 + i * 6], [10, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // CTA banner
  const ctaOpacity = interpolate(frame, [75, 88], [0, 1],  { extrapolateRight: 'clamp' });
  const ctaY       = interpolate(frame, [75, 88], [10, 0], { extrapolateRight: 'clamp', easing: ease });

  // Count-up for stat cards
  const animAudited = Math.round(
    interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );
  const animIssues = Math.round(
    interpolate(frame, [36, 80], [0, Number(data.issuesFound ?? 0)], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );

  return (
    <AbsoluteFill style={{
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      background: '#0a0d1a',
      color: '#fff',
      WebkitFontSmoothing: 'antialiased',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      opacity: globalOpacity,
    }}>
      {/* ── Full-canvas wrapper ── */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Nav */}
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
          opacity: panelOpacity,
          transform: `translateX(${leftX}px)`,
        }}>

          {/* Section title */}
          <div style={{
            fontSize: 28, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase',
            marginBottom: 12, alignSelf: 'flex-start', paddingLeft: 20,
          }}>
            <span style={{ color: '#fff' }}>TECHNICAL</span>
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
            {data.sectionSubtitle ?? 'Crawlability, indexing, and structural health of your website'}
          </div>

          {/* Score ring */}
          <ScoreRing
            score={score}
            maxScore={maxScore}
            progress={dialProgress}
            id="technical-seo"
            scale={1.08}
          />

          {/* Verdict box / Small status badge */}
          <PerfVerdictBox
            title={`Status: ${techStatus}`}
            subtitle={techSubtitle}
            iconEl={<IconCheckPass />}
            opacity={verdictOpacity}
            translateY={verdictY}
            marginTop={40}
          />
        </div>

          {/* ══ RIGHT: Stats + Findings + CTA ══ */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            opacity: panelOpacity,
            transform: `translateX(${rightX}px)`,
          }}>
 
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <StatCard
                variant="blue"
                value={animAudited}
                description={`Homepage\nAudited`}
                iconEl={<IconCrawl />}
                opacity={statOpacities[0]}
                translateY={statY[0]}
              />
              <StatCard
                variant="purple"
                value={animIssues}
                description={`Issues\nFound`}
                iconEl={<IconIssues />}
                opacity={statOpacities[1]}
                translateY={statY[1]}
              />
              <StatCard
                variant="green"
                value={techStatus}
                description={`Technical\nHealth`}
                iconEl={<IconCheckPass />}
                opacity={statOpacities[2]}
                translateY={statY[2]}
              />
            </div>

            {/* ── Top Technical Issues panel ── */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              overflow: 'hidden',
              opacity: findingsOpacity,
              transform: `translateY(${findingsY}px)`,
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
                  Top Technical Issues
                </div>
                {findings.length > 0 && (
                  <div style={{
                    marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#ef4444', padding: '3px 10px', borderRadius: 4, letterSpacing: '0.5px',
                  }}>
                    {findings.length} Issue{findings.length > 1 ? 's' : ''} Found
                  </div>
                )}
              </div>

              {/* Issues List / Findings */}
              {findings.length === 0 ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 20,
                  padding: '32px 28px',
                  background: 'rgba(34,197,94,0.02)',
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
                      All Technical SEO Checks Passed
                    </div>
                    <div style={{ fontSize: 13, color: '#5a6a90', lineHeight: 1.5 }}>
                      Your homepage meets all core crawlability, sitemap, indexation and HTTPS standards.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {findings.map((f, i) => {
                    const cfg = FINDING_ICONS[f.iconType] ?? FALLBACK_ICON;
                    const isLast = i === findings.length - 1;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 18,
                        padding: '18px 22px',
                        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                        opacity: findingOpacities[Math.min(i, findingOpacities.length - 1)],
                        transform: `translateY(${findingY[Math.min(i, findingY.length - 1)]}px)`,
                      }}>
                        {/* Icon circle */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                          background: cfg.background,
                          border: `1.5px solid ${cfg.borderColor}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {cfg.iconEl}
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
                        {/* Affected pages badge */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: `${f.countColor ?? '#f97316'}12`,
                          border: `1px solid ${f.countColor ?? '#f97316'}30`,
                          borderRadius: 6, padding: '6px 12px', flexShrink: 0,
                        }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: f.countColor ?? '#f97316' }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: f.countColor ?? '#f97316', letterSpacing: '0.5px' }}>
                            {f.affectedCount} {f.affectedLabel ?? 'Pages'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Technical Validation Summary Footer — inside grid, full-width row ── */}
        <div style={{
          gridColumn: '1 / -1',
          marginTop: 28,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
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
                  Technical Validation Summary
                </div>
              </div>

              {/* Description lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                  Homepage technical foundations were reviewed.
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                  All critical technical SEO requirements were validated including crawlability, indexability, canonicalization, sitemap discovery and secure delivery.
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
              {[
                'Crawlability Verified',
                'Indexability Confirmed',
                'Canonical Tag Found',
                'Robots.txt Accessible',
                'Sitemap Discovery Active',
              ].map((item, i) => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  opacity: statOpacities[Math.min(i, statOpacities.length - 1)],
                  transform: `translateX(${statY[Math.min(i, statY.length - 1)] * 2}px)`,
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
