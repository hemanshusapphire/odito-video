import { AbsoluteFill, interpolate, Easing, useCurrentFrame } from 'remotion';
import type { FC } from 'react';
import type { SlideData } from '../lib/types';
import { AuditSummaryMetricCard } from './components/AuditSummaryMetricCard';
import { GrowthOpportunityCard }  from './components/GrowthOpportunityCard';
import type { OpportunityImpact } from './components/GrowthOpportunityCard';

// ── Data interfaces ────────────────────────────────────────────────────────────

export interface FinalCtaOpportunity {
  iconType:    string;
  title:       string;
  description: string;
  impact:      OpportunityImpact;
}

export interface FinalCtaBenefit {
  iconType:    string;
  title:       string;
  description: string;
}

export interface FinalCtaData {
  heroLabel?:              string;
  headline1?:              string;
  headline2?:              string;
  supportingText?:         string;
  issuesFound?:            number;
  issuesLabel?:            string;
  issuesDescription?:      string;
  opportunitiesFound?:     number;
  opportunitiesLabel?:     string;
  opportunitiesDescription?: string;
  opportunitiesHeader?:    string;
  opportunities?:          FinalCtaOpportunity[];
  ctaPreLabel?:            string;
  ctaTitle?:               string;
  ctaDescription?:         string;
  ctaButtonText?:          string;
  ctaSecureText?:          string;
  benefits?:               FinalCtaBenefit[];
  brandVisitText?:         string;
  brandName?:              string;
  brandTagline?:           string;
}

// ── Opportunity icon registry ──────────────────────────────────────────────────

const OPP_ICONS: Record<string, { iconEl: JSX.Element; iconBg: string; iconBorder: string }> = {
  security: {
    iconEl: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    iconBg: '#1a0606', iconBorder: '#4a1010',
  },
  'ai-visibility': {
    iconEl: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M19 3l.6 1.9L21 6l-1.4.6L19 8.5l-.6-1.9L17 6l1.4-.6L19 3z" />
        <path d="M5 16l.5 1.5L7 18l-1.5.5L5 20l-.5-1.5L3 18l1.5-.5L5 16z" />
      </svg>
    ),
    iconBg: '#1a0a2e', iconBorder: '#4a1a6e',
  },
  performance: {
    iconEl: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 5 18.66" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    iconBg: '#1a0d00', iconBorder: '#4a2a00',
  },
  accessibility: {
    iconEl: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="2" />
        <path d="M5 11l4-1.5 3 2 3-2 4 1.5" />
        <path d="M8 21l1.5-6 2.5 2 2.5-2L16 21" />
      </svg>
    ),
    iconBg: '#0a1e1e', iconBorder: '#0f4a4a',
  },
};

// ── Benefit icon registry ──────────────────────────────────────────────────────

const BENEFIT_ICONS: Record<string, JSX.Element> = {
  help: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  roadmap: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  results: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  progress: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  ),
};

// ── Decorative CTA dashboard art ───────────────────────────────────────────────

const DashboardArt: FC = () => (
  <div style={{ position: 'relative', width: 165, height: 112, flexShrink: 0 }}>
    <div style={{
      position: 'absolute', top: -16, left: -16, right: -16, bottom: -16,
      background: 'radial-gradient(ellipse, rgba(99,102,241,.28) 0%, transparent 70%)',
    }} />
    <svg
      width="165" height="112" viewBox="0 0 165 112"
      style={{ filter: 'drop-shadow(0 0 10px rgba(99,102,241,.4))' }}
    >
      <defs>
        <radialGradient id="dashGlow11" cx="60%" cy="30%">
          <stop offset="0%" stopColor="rgba(168,85,247,.18)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="dashBar11a" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="dashBar11b" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="161" height="108" rx="8" fill="#0a0c1f" stroke="rgba(99,102,241,.4)" strokeWidth="1" />
      <rect x="14" y="60" width="15" height="38" rx="3" fill="url(#dashBar11a)" opacity=".8" />
      <rect x="34" y="42" width="15" height="56" rx="3" fill="url(#dashBar11a)" opacity=".65" />
      <rect x="54" y="50" width="15" height="48" rx="3" fill="url(#dashBar11b)" opacity=".7" />
      <rect x="74" y="32" width="15" height="66" rx="3" fill="url(#dashBar11a)" opacity=".9" />
      <rect x="94" y="46" width="15" height="52" rx="3" fill="url(#dashBar11b)" opacity=".6" />
      <rect x="114" y="28" width="15" height="70" rx="3" fill="url(#dashBar11a)" opacity=".75" />
      <rect x="134" y="38" width="15" height="60" rx="3" fill="url(#dashBar11b)" opacity=".7" />
      <polyline
        points="14,56 34,38 54,46 74,28 94,42 114,24 134,34 150,20"
        fill="none" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round"
      />
      <circle cx="74"  cy="28" r="4" fill="#a855f7" />
      <circle cx="150" cy="20" r="4" fill="#c084fc" />
      <rect x="14" y="10" width="42" height="8" rx="4" fill="rgba(168,85,247,.2)" />
      <rect x="62" y="10" width="30" height="8" rx="4" fill="rgba(99,102,241,.2)" />
      <rect x="98" y="10" width="44" height="8" rx="4" fill="rgba(99,102,241,.15)" />
      <rect x="2" y="2" width="161" height="108" rx="8" fill="url(#dashGlow11)" />
    </svg>
  </div>
);

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_OPPS: FinalCtaOpportunity[] = [
  { iconType: 'security',       title: 'Security',       description: 'Fix vulnerabilities and build trust',  impact: 'high'   },
  { iconType: 'ai-visibility',  title: 'AI Visibility',  description: 'Improve visibility in AI search',      impact: 'high'   },
  { iconType: 'performance',    title: 'Performance',    description: 'Improve speed and user experience',    impact: 'medium' },
  { iconType: 'accessibility',  title: 'Accessibility',  description: 'Make your website usable for all',     impact: 'medium' },
];

const DEFAULT_BENEFITS: FinalCtaBenefit[] = [
  { iconType: 'help',     title: 'Need Help Implementing?',  description: 'Book a free consultation with our experts and get guided step-by-step.' },
  { iconType: 'roadmap',  title: 'Personalized Roadmap',     description: 'Get a custom action plan tailored to your business goals and budget.' },
  { iconType: 'results',  title: 'Faster Results',           description: 'Fix issues the right way and see measurable growth in rankings and traffic.' },
  { iconType: 'progress', title: 'Track Your Progress',      description: 'Monitor improvements with monthly audits and a live performance dashboard.' },
];

// ── Scene ─────────────────────────────────────────────────────────────────────

export const FinalSummaryScene: FC<{ data: SlideData; narration?: string }> = ({ data }) => {
  const d     = data as FinalCtaData;
  const frame = useCurrentFrame();
  const ease  = Easing.out(Easing.cubic);
  const cl    = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

  const opportunities  = d.opportunities?.length  ? d.opportunities  : DEFAULT_OPPS;
  const benefits       = d.benefits?.length        ? d.benefits       : DEFAULT_BENEFITS;
  const issuesTarget   = d.issuesFound             ?? 295;
  const oppsTarget     = d.opportunitiesFound      ?? 82;

  // ── Hero ──
  const heroLabelOp  = interpolate(frame, [0,  14], [0, 1], { ...cl, easing: ease });
  const h1Op         = interpolate(frame, [5,  22], [0, 1], { ...cl, easing: ease });
  const h1Y          = interpolate(frame, [5,  22], [26, 0],{ ...cl, easing: ease });
  const h2Op         = interpolate(frame, [10, 28], [0, 1], { ...cl, easing: ease });
  const h2Y          = interpolate(frame, [10, 28], [26, 0],{ ...cl, easing: ease });
  const sparkleOp    = interpolate(frame, [18, 32], [0, 1], { ...cl, easing: ease });
  const supportOp    = interpolate(frame, [22, 38], [0, 1], { ...cl, easing: ease });

  // ── Metrics ──
  const metricsOp   = interpolate(frame, [30, 46], [0, 1],  { ...cl, easing: ease });
  const metricsY    = interpolate(frame, [30, 46], [16, 0], { ...cl, easing: ease });
  const issuesCount = Math.round(interpolate(frame, [30, 62], [0, issuesTarget], cl));
  const oppsCount   = Math.round(interpolate(frame, [34, 66], [0, oppsTarget],   cl));

  // ── Opportunities panel ──
  const oppPanelOp  = interpolate(frame, [2,  18], [0, 1],  { ...cl, easing: ease });
  const oppHeaderOp = interpolate(frame, [10, 24], [0, 1],  { ...cl, easing: ease });
  const oppRowOps   = opportunities.map((_, i) =>
    interpolate(frame, [38 + i * 6, 56 + i * 6], [0, 1],  { ...cl, easing: ease })
  );
  const oppRowXs    = opportunities.map((_, i) =>
    interpolate(frame, [38 + i * 6, 56 + i * 6], [16, 0], { ...cl, easing: ease })
  );

  // ── CTA card ──
  const ctaOp = interpolate(frame, [62, 80], [0, 1],  { ...cl, easing: ease });
  const ctaY  = interpolate(frame, [62, 80], [16, 0], { ...cl, easing: ease });

  // ── Benefits ──
  const benefitOps = benefits.map((_, i) =>
    interpolate(frame, [80 + i * 7, 97 + i * 7], [0, 1],  { ...cl, easing: ease })
  );
  const benefitYs  = benefits.map((_, i) =>
    interpolate(frame, [80 + i * 7, 97 + i * 7], [14, 0], { ...cl, easing: ease })
  );

  // ── Brand ──
  const brandOp = interpolate(frame, [102, 118], [0, 1],  { ...cl, easing: ease });
  const brandY  = interpolate(frame, [102, 118], [12, 0], { ...cl, easing: ease });

  return (
    <AbsoluteFill style={{ background: '#07081a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{
        position: 'absolute', inset: 0,
        padding: '28px 60px',
        display: 'flex', flexDirection: 'column', gap: 14,
        boxSizing: 'border-box',
      }}>

        {/* ── TOP SECTION: 2 columns ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '55fr 45fr', gap: 18,
          flex: '0 0 auto',
        }}>

          {/* LEFT: Hero + Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>

            {/* Label */}
            <div style={{
              fontSize: 12.5, fontWeight: 700, letterSpacing: '2.5px',
              color: '#a855f7', textTransform: 'uppercase',
              opacity: heroLabelOp,
            }}>
              {d.heroLabel ?? 'AUDIT COMPLETE'}
            </div>

            {/* Headline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{
                fontSize: 52, fontWeight: 900, color: '#ffffff', lineHeight: 1.05,
                opacity: h1Op, transform: `translateY(${h1Y}px)`,
              }}>
                {d.headline1 ?? 'YOUR WEBSITE HAS'}
              </div>
              <div style={{
                fontSize: 52, fontWeight: 900, lineHeight: 1.05,
                background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 45%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                opacity: h2Op, transform: `translateY(${h2Y}px)`,
              }}>
                {d.headline2 ?? 'HUGE POTENTIAL'}
              </div>
            </div>

            {/* Sparkle separator */}
            <div style={{ position: 'relative', height: 16, display: 'flex', alignItems: 'center', opacity: sparkleOp }}>
              <div style={{
                flex: 1, height: 1,
                background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,.45) 50%, transparent 100%)',
              }} />
              <div style={{
                position: 'absolute', left: '26%',
                width: 7, height: 7, background: '#a855f7',
                transform: 'rotate(45deg)',
                boxShadow: '0 0 10px rgba(168,85,247,.9), 0 0 22px rgba(168,85,247,.4)',
              }} />
            </div>

            {/* Supporting text */}
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.65, opacity: supportOp }}>
              {d.supportingText ?? "We've analyzed your website across 10 key areas and identified what matters most for your growth."}
            </div>

            {/* Stat cards */}
            <div style={{ display: 'flex', gap: 14, marginTop: 4, opacity: metricsOp, transform: `translateY(${metricsY}px)` }}>
              <AuditSummaryMetricCard
                iconEl={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                    <circle cx="12" cy="17.5" r="0.5" fill="#a855f7" />
                  </svg>
                }
                iconBg="#1a0a2e" iconBorder="#4a1a6e"
                displayValue={issuesCount}
                valueColor="#a855f7"
                label={d.issuesLabel ?? 'Issues Identified'}
                description={d.issuesDescription ?? 'Things that need attention'}
              />
              <AuditSummaryMetricCard
                iconEl={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                }
                iconBg="#071610" iconBorder="#14532d"
                displayValue={oppsCount}
                valueColor="#22c55e"
                label={d.opportunitiesLabel ?? 'Opportunities Found'}
                description={d.opportunitiesDescription ?? 'Ways to improve and grow'}
              />
            </div>
          </div>

          {/* RIGHT: Growth Opportunities panel */}
          <div style={{
            background: '#10121f',
            border: '1px solid #1e1d34',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex', flexDirection: 'column',
            opacity: oppPanelOp,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: oppHeaderOp, marginBottom: 8,
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '1.5px', color: '#7c6cf8', textTransform: 'uppercase' }}>
                {d.opportunitiesHeader ?? 'Top Growth Opportunities'}
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,.07)', marginBottom: 4 }} />
            {opportunities.map((opp, i) => {
              const icons = OPP_ICONS[opp.iconType] ?? OPP_ICONS.security;
              return (
                <GrowthOpportunityCard
                  key={i}
                  iconEl={icons.iconEl}
                  iconBg={icons.iconBg}
                  iconBorder={icons.iconBorder}
                  title={opp.title}
                  description={opp.description}
                  impact={opp.impact}
                  isLast={i === opportunities.length - 1}
                  opacity={oppRowOps[i]}
                  translateX={oppRowXs[i]}
                />
              );
            })}
          </div>
        </div>

        {/* ── CTA CARD (full-width, enlarged) ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0d0f2e 0%, #141542 50%, #0d0f2e 100%)',
          border: '1px solid rgba(99,102,241,.32)',
          borderRadius: 18,
          padding: '22px 32px',
          display: 'flex', alignItems: 'center', gap: 24,
          flex: '0 0 auto',
          opacity: ctaOp, transform: `translateY(${ctaY}px)`,
        }}>
          {/* Dashboard art */}
          <DashboardArt />

          {/* Pre-label + icon + text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(99,102,241,.14)', border: '1px solid rgba(99,102,241,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
                color: '#7c6cf8', textTransform: 'uppercase', marginBottom: 6,
              }}>
                {d.ctaPreLabel ?? 'Ready to Take the Next Step?'}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: 5 }}>
                {d.ctaTitle ?? 'Get Your Complete Audit Report'}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>
                {d.ctaDescription ?? 'Actionable insights, custom recommendations, and a roadmap to outrank your competitors.'}
              </div>
            </div>
          </div>

          {/* CTA button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              borderRadius: 12, padding: '15px 32px',
              fontSize: 14.5, fontWeight: 800, color: '#fff',
              letterSpacing: '0.5px', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 28px rgba(168,85,247,.45)',
              whiteSpace: 'nowrap',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {d.ctaButtonText ?? 'GET FULL REPORT'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'rgba(255,255,255,.35)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {d.ctaSecureText ?? 'Secure • Instant Access'}
            </div>
          </div>
        </div>

        {/* ── BOTTOM: 4-col Benefits grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, flex: 1, minHeight: 0 }}>
          {benefits.map((b, i) => {
            const iconEl = BENEFIT_ICONS[b.iconType] ?? BENEFIT_ICONS.help;
            return (
              <div key={i} style={{
                background: '#10121f',
                border: '1px solid #1e1d34',
                borderRadius: 14,
                padding: '20px 20px',
                display: 'flex', flexDirection: 'column', gap: 9,
                opacity: benefitOps[i],
                transform: `translateY(${benefitYs[i]}px)`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(168,85,247,.12)', border: '1px solid rgba(168,85,247,.24)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {iconEl}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0eef8' }}>{b.title}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.38)', lineHeight: 1.6 }}>{b.description}</div>
              </div>
            );
          })}
        </div>

      </div>
    </AbsoluteFill>
  );
};
