import type { FC, ReactElement } from 'react';
import { AbsoluteFill, interpolate, Easing, useCurrentFrame } from 'remotion';
import { AuditStepNav } from './components/AuditStepNav';
import type { AuditStepItem } from './components/AuditStepNav';
import { ScoreSidebar } from './components/ScoreSidebar';
import { FindingsList } from './components/FindingsList';
import { FindingItem } from './components/FindingItem';
import { InsightBanner } from './components/InsightBanner';
import { AccessibilityMetricCard } from './components/AccessibilityMetricCard';

// ── Step nav — step 8 active, indigo theme ────────────────────────────────────

const ACCESSIBILITY_AUDIT_STEPS: AuditStepItem[] = [
  { number: 1,  label: 'Intro',          state: 'done'    },
  { number: 2,  label: 'Overall Score',  state: 'done'    },
  { number: 3,  label: 'On-Page SEO',    state: 'done'    },
  { number: 4,  label: 'Technical',      state: 'done'    },
  { number: 5,  label: 'Security',       state: 'done'    },
  { number: 6,  label: 'AI Visibility',  state: 'done'    },
  { number: 7,  label: 'Performance',    state: 'done'    },
  { number: 8,  label: 'Accessibility',  state: 'active'  },
  { number: 9,  label: 'Social',         state: 'pending' },
  { number: 10, label: 'Local SEO',      state: 'pending' },
];

// ── Data contract ─────────────────────────────────────────────────────────────

export interface AccessibilityIssue {
  iconType: string;
  name: string;
  description: string;
  count: number;
  affectedLabel?: string;
}

export interface AccessibilityData {
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  steps?: AuditStepItem[];

  // Sidebar
  score?: number;
  maxScore?: number;
  sidebarLabel?: string;
  sidebarSubtitle?: string;

  // Info box inside sidebar
  infoTitle?: string;
  infoText?: string;

  // Metric cards
  missingLabels?: number;
  missingLabelsDesc?: string;
  missingLabelsBarPct?: number;

  criticalViolations?: number;
  criticalViolationsDesc?: string;
  criticalViolationsBarPct?: number;

  // Issues list
  issuesHeader?: string;
  issues?: AccessibilityIssue[];

  // Banner
  bannerTitle?: string;
  bannerSubtitle?: string;
}

// ── Issue icon registry ───────────────────────────────────────────────────────

interface IssueIconEntry {
  iconEl: ReactElement;
  iconBg: string;
  iconBorderColor: string;
  countColor: string;
}

const ISSUE_ICONS: Record<string, IssueIconEntry> = {
  'alt-text': {
    iconEl: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#9b7df8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    iconBg: 'rgba(100,80,200,.18)',
    iconBorderColor: 'rgba(155,125,248,.35)',
    countColor: '#9b7df8',
  },
  'link-labels': {
    iconEl: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#7ab0f8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    iconBg: 'rgba(80,100,200,.18)',
    iconBorderColor: 'rgba(122,176,248,.35)',
    countColor: '#7ab0f8',
  },
  'form-fields': {
    iconEl: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#34c48a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
    iconBg: 'rgba(40,140,100,.18)',
    iconBorderColor: 'rgba(52,196,138,.35)',
    countColor: '#34c48a',
  },
};

const FALLBACK_ISSUE_ICON: IssueIconEntry = {
  iconEl: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#7c6cf8" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8"  x2="12"   y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  iconBg: 'rgba(124,108,248,.12)',
  iconBorderColor: 'rgba(124,108,248,.35)',
  countColor: '#7c6cf8',
};

// ── Default data ──────────────────────────────────────────────────────────────

const DEFAULT_ISSUES: AccessibilityIssue[] = [
  { iconType: 'alt-text',    name: 'Missing Image Alt Text', description: 'Images without alternative text',           count: 48, affectedLabel: 'Images' },
  { iconType: 'link-labels', name: 'Missing Link Labels',    description: 'Links without descriptive text',            count: 18, affectedLabel: 'Links'  },
  { iconType: 'form-fields', name: 'Form Field Issues',      description: 'Form fields missing labels or instructions', count: 10, affectedLabel: 'Fields' },
];

// ── Theme ─────────────────────────────────────────────────────────────────────

const ACCENT = '#7c6cf8';

// ── Sidebar footer: info box ──────────────────────────────────────────────────

function AccessibilityInfoBox({ title, text, opacity }: { title: string; text: string; opacity: number }) {
  return (
    <div style={{
      background: 'rgba(40,80,180,.12)',
      border: '1px solid rgba(60,100,220,.25)',
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex', alignItems: 'flex-start', gap: 10,
      opacity,
    }}>
      {/* Info icon */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '1.5px solid rgba(80,130,240,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#7ab0f8" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <circle cx="12" cy="16" r="1" fill="#7ab0f8" stroke="none" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7ab0f8', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>{text}</div>
      </div>
    </div>
  );
}

// ── Banner icon ───────────────────────────────────────────────────────────────

const BannerIcon = (
  <div style={{
    width: 52, height: 52, borderRadius: '50%',
    border: '2px solid rgba(80,120,240,.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="#5a8af8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  </div>
);

// ── Scene ─────────────────────────────────────────────────────────────────────

export const AccessibilityScene: FC<{ data: AccessibilityData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const ease  = Easing.out(Easing.cubic);

  const score              = data.score              ?? 56;
  const maxScore           = data.maxScore           ?? 100;
  const steps              = data.steps              ?? ACCESSIBILITY_AUDIT_STEPS;
  const missingLabels      = data.missingLabels      ?? 76;
  const criticalViolations = data.criticalViolations ?? 2;
  const missingBarPct      = data.missingLabelsBarPct    ?? 76;
  const criticalBarPct     = data.criticalViolationsBarPct ?? 8;
  const issues             = data.issues             ?? DEFAULT_ISSUES;

  // ── Animation values ─────────────────────────────────────────────────────────

  const globalOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const navY          = interpolate(frame, [0, 20], [-28, 0], { extrapolateRight: 'clamp', easing: ease });

  const panelOpacity = interpolate(frame, [8, 28], [0, 1],   { extrapolateRight: 'clamp' });
  const leftX        = interpolate(frame, [8, 28], [-35, 0],  { extrapolateRight: 'clamp', easing: ease });
  const rightX       = interpolate(frame, [8, 28], [35, 0],   { extrapolateRight: 'clamp', easing: ease });

  // Dial + overall score count-up
  const dialProgress   = interpolate(frame, [20, 80], [0, 1],  { extrapolateRight: 'clamp', easing: ease });
  const animatedScore  = Math.round(interpolate(frame, [20, 80], [0, score], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const labelOpacity   = interpolate(frame, [30, 46], [0, 1],  { extrapolateRight: 'clamp' });

  // Sidebar info box
  const infoOpacity = interpolate(frame, [38, 52], [0, 1], { extrapolateRight: 'clamp' });

  // Metric card 1 (Missing Labels)
  const card1Opacity  = interpolate(frame, [36, 52], [0, 1],  { extrapolateRight: 'clamp' });
  const card1Y        = interpolate(frame, [36, 52], [16, 0], { extrapolateRight: 'clamp', easing: ease });
  const animatedMissing  = Math.round(interpolate(frame, [36, 80], [0, missingLabels],  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const animatedMissingBar = interpolate(frame, [40, 78], [0, missingBarPct], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Metric card 2 (Critical Violations)
  const card2Opacity  = interpolate(frame, [44, 60], [0, 1],  { extrapolateRight: 'clamp' });
  const card2Y        = interpolate(frame, [44, 60], [16, 0], { extrapolateRight: 'clamp', easing: ease });
  const animatedCrit  = Math.round(interpolate(frame, [44, 80], [0, criticalViolations], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const animatedCritBar = interpolate(frame, [48, 78], [0, criticalBarPct], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // FindingsList container
  const listOpacity = interpolate(frame, [52, 66], [0, 1],  { extrapolateRight: 'clamp' });
  const listY       = interpolate(frame, [52, 66], [12, 0], { extrapolateRight: 'clamp', easing: ease });

  // FindingItem stagger
  const issueOpacities = issues.map((_, i) =>
    interpolate(frame, [58 + i * 7, 72 + i * 7], [0, 1], { extrapolateRight: 'clamp' })
  );
  const issueYs = issues.map((_, i) =>
    interpolate(frame, [58 + i * 7, 72 + i * 7], [10, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // Count-up for issue counts
  const animatedIssueCounts = issues.map((issue, i) =>
    Math.round(interpolate(frame, [58 + i * 7, 80 + i * 7], [0, issue.count], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  );

  // Banner
  const bannerOpacity = interpolate(frame, [84, 96], [0, 1],  { extrapolateRight: 'clamp' });
  const bannerY       = interpolate(frame, [84, 96], [12, 0], { extrapolateRight: 'clamp', easing: ease });

  // Accessibility Impact panel
  const impactOps = ([0, 1, 2, 3] as const).map(i =>
    interpolate(frame, [94 + i * 5, 108 + i * 5], [0, 1], { extrapolateRight: 'clamp' })
  );
  const impactYs = ([0, 1, 2, 3] as const).map(i =>
    interpolate(frame, [94 + i * 5, 108 + i * 5], [12, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // ── Sidebar footer ───────────────────────────────────────────────────────────

  const footerEl = (
    <AccessibilityInfoBox
      title={data.infoTitle ?? 'Your site has room for accessibility improvement.'}
      text={data.infoText  ?? 'Addressing these issues can improve usability for all visitors.'}
      opacity={infoOpacity}
    />
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AbsoluteFill style={{
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      background: '#0a0b12',
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

        {/* Top nav */}
        <AuditStepNav
          brandName={data.brandName}
          brandSuffix={data.brandSuffix}
          pageLabel={data.pageLabel}
          steps={steps}
          translateY={navY}
          activeColor={ACCENT}
        />

        {/* ── Main 2-col (content-sized, no stretch) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 3fr',
          flex: '0 0 auto',
          marginBottom: 24,
        }}>

          {/* ══ LEFT: ScoreSidebar ══ */}
          <div style={{
            padding: '24px 24px 20px 40px',
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid #161422',
            opacity: panelOpacity,
            transform: `translateX(${leftX}px)`,
          }}>
            <ScoreSidebar
              score={animatedScore}
              maxScore={maxScore}
              progress={dialProgress}
              dialId="accessibility"
              gradStart="#4338ca"
              gradMid={ACCENT}
              gradEnd="#a5b4fc"
              label={data.sidebarLabel ?? 'Accessibility'}
              subtitle={data.sidebarSubtitle ?? 'How accessible your website is for all users and assistive technologies'}
              labelOpacity={labelOpacity}
              footerContent={footerEl}
              size={300}
            />
          </div>

          {/* ══ RIGHT: metric cards + issues list ══ */}
          <div style={{
            padding: '24px 28px 16px 24px',
            display: 'flex', flexDirection: 'column', gap: 12,
            opacity: panelOpacity,
            transform: `translateX(${rightX}px)`,
          }}>

            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <AccessibilityMetricCard
                iconEl={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="#f5a623" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9"  x2="12"   y2="13" />
                    <circle cx="12" cy="17" r="1" fill="#f5a623" stroke="none" />
                  </svg>
                }
                value={animatedMissing}
                label="Missing Labels"
                description={data.missingLabelsDesc ?? 'Form elements, images, and links missing accessible labels.'}
                accentColor="#f5a623"
                iconBg="rgba(245,166,35,.08)"
                iconBorder="rgba(245,166,35,.45)"
                barWidth={animatedMissingBar}
                opacity={card1Opacity}
                translateY={card1Y}
              />
              <AccessibilityMetricCard
                iconEl={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="#e04444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8"  x2="12"   y2="12" />
                    <circle cx="12" cy="16" r="1" fill="#e04444" stroke="none" />
                  </svg>
                }
                value={animatedCrit}
                label="Critical Violations"
                description={data.criticalViolationsDesc ?? 'Issues that significantly impact accessibility and usability.'}
                accentColor="#e04444"
                iconBg="rgba(220,50,50,.1)"
                iconBorder="rgba(220,50,50,.5)"
                barWidth={animatedCritBar}
                opacity={card2Opacity}
                translateY={card2Y}
              />
            </div>

            {/* Issues list */}
            <FindingsList
              header={data.issuesHeader ?? 'Top Accessibility Issues'}
              opacity={listOpacity}
              translateY={listY}
            >
              {issues.map((issue, i) => {
                const icon = ISSUE_ICONS[issue.iconType] ?? FALLBACK_ISSUE_ICON;
                return (
                  <FindingItem
                    key={i}
                    iconEl={icon.iconEl}
                    iconBackground={icon.iconBg}
                    iconBorderColor={icon.iconBorderColor}
                    name={issue.name}
                    description={issue.description}
                    affectedCount={animatedIssueCounts[i]}
                    affectedLabel={issue.affectedLabel ?? 'Issues'}
                    countColor={icon.countColor}
                    isLast={i === issues.length - 1}
                    opacity={issueOpacities[i]}
                    translateY={issueYs[i]}
                  />
                );
              })}
            </FindingsList>
          </div>
        </div>

        {/* ── Insight banner ── */}
        <div style={{ padding: '0 28px', opacity: bannerOpacity, transform: `translateY(${bannerY}px)`, marginBottom: 24 }}>
          <InsightBanner
            iconEl={BannerIcon}
            title={data.bannerTitle ?? 'Improve accessibility, improve experience.'}
            subtitle={data.bannerSubtitle ?? 'Making your website accessible benefits all users and supports better search visibility.'}
            background="linear-gradient(130deg, #0e1028 0%, #141230 100%)"
            borderColor="rgba(80,100,240,.2)"
            opacity={1}
            translateY={0}
            padding="26px 30px"
          />
        </div>

        {/* ── Accessibility Impact panel ── */}
        <div style={{ padding: '16px 28px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: 12, fontWeight: 900, letterSpacing: '3px',
            textTransform: 'uppercase', color: ACCENT,
            marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
            opacity: impactOps[0],
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: ACCENT,
              boxShadow: `0 0 8px ${ACCENT}, 0 0 16px ${ACCENT}`,
            }} />
            Accessibility Impact
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, paddingBottom: 25 }}>
            {([
              {
                title: 'WCAG Compliance Risk',
                desc: 'Fails WCAG 2.1 AA standards, creating legal compliance liabilities.',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                ),
                badge: 'High Risk', badgeColor: '#ef4444',
              },
              {
                title: 'SEO Impact',
                desc: 'Accessibility affects search rankings. Better structures boost SEO visibility.',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                ),
                badge: 'Medium Risk', badgeColor: '#f59e0b',
              },
              {
                title: 'User Reach',
                desc: 'Over 15% of visitors require assistive tech. Inaccessible sites lose customers.',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                badge: '~1 in 5 Users', badgeColor: ACCENT,
              },
              {
                title: 'Legal Exposure',
                desc: 'ADA and EAA regulations mandate compliance. Violations risk litigation.',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ),
                badge: 'Action Required', badgeColor: '#ef4444',
              },
            ] as const).map((item, i) => (
              <div key={i} style={{
                background: 'linear-gradient(135deg, #0c0e22 0%, #0a0c1e 100%)',
                border: `1px solid ${ACCENT}22`,
                borderRadius: 12,
                padding: '20px 14px',
                display: 'flex', flexDirection: 'column', gap: 8,
                opacity: impactOps[i],
                transform: `translateY(${impactYs[i]}px)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: `${ACCENT}18`, border: `1px solid ${ACCENT}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.icon}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 900, letterSpacing: '0.8px',
                    color: item.badgeColor, background: `${item.badgeColor}22`,
                    border: `1.5px solid ${item.badgeColor}50`,
                    borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap',
                  }}>{item.badge}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e0dcf8', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 11.5, color: '#5a6680', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
