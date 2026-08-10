import type { FC, ReactElement } from 'react';
import { AbsoluteFill, interpolate, Easing, useCurrentFrame } from 'remotion';
import { AuditStepNav } from './components/AuditStepNav';
import type { AuditStepItem } from './components/AuditStepNav';
import { ScoreRing } from './components/ScoreRing';
import { CriticalIssueCard } from './components/CriticalIssueCard';

// ── Step nav — step 5 active, red theme ───────────────────────────────────────

const SECURITY_AUDIT_STEPS: AuditStepItem[] = [
  { number: 1,  label: 'Intro',          state: 'done'    },
  { number: 2,  label: 'Overall Score',  state: 'done'    },
  { number: 3,  label: 'On-Page SEO',    state: 'done'    },
  { number: 4,  label: 'Technical',      state: 'done'    },
  { number: 5,  label: 'Security Audit', state: 'active'  },
  { number: 6,  label: 'AI Visibility',  state: 'pending' },
  { number: 7,  label: 'Performance',    state: 'pending' },
  { number: 8,  label: 'Accessibility',  state: 'pending' },
  { number: 9,  label: 'Social',         state: 'pending' },
  { number: 10, label: 'Local SEO',      state: 'pending' },
];

// ── Data contract ──────────────────────────────────────────────────────────────

export type SecurityIssueIconType = 'csp' | 'hsts' | 'xframe' | 'ssl' | 'cors' | string;

export interface SecurityIssue {
  iconType: SecurityIssueIconType;
  name: string;
  status?: string;
  statusColor?: string;
}

export interface SecuritySceneData {
  // Nav
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  steps?: AuditStepItem[];

  // Left panel
  score?: number;
  maxScore?: number;

  // Right stat cards
  securityIssues?: number;
  criticalCount?: number;

  // Critical issues grid
  criticalHeader?: string;
  issues?: SecurityIssue[];

  // Bottom banner
  bannerTitle?: string;
  bannerSubtitle?: string;
}

// ── Issue icon registry ────────────────────────────────────────────────────────

interface IssueIconEntry { iconEl: ReactElement }

const ISSUE_ICONS: Record<string, IssueIconEntry> = {
  csp: {
    iconEl: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8"  y1="13" x2="16" y2="13" />
        <line x1="8"  y1="17" x2="11" y2="17" />
        <line x1="14" y1="17" x2="16" y2="17" />
      </svg>
    ),
  },
  hsts: {
    iconEl: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  xframe: {
    iconEl: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2"  y="2"  width="20" height="20" rx="2" />
        <rect x="7"  y="7"  width="10" height="10" rx="1" />
        <line x1="2"  y1="9"  x2="7"  y2="9"  />
        <line x1="2"  y1="15" x2="7"  y2="15" />
        <line x1="17" y1="9"  x2="22" y2="9"  />
        <line x1="17" y1="15" x2="22" y2="15" />
        <line x1="9"  y1="2"  x2="9"  y2="7"  />
        <line x1="15" y1="2"  x2="15" y2="7"  />
        <line x1="9"  y1="17" x2="9"  y2="22" />
        <line x1="15" y1="17" x2="15" y2="22" />
      </svg>
    ),
  },
  ssl: {
    iconEl: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8"  x2="12"   y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  cors: {
    iconEl: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8"  x2="12"   y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

const FALLBACK_ISSUE_ICON: IssueIconEntry = {
  iconEl: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8"  x2="12"   y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// ── Stat card icons ────────────────────────────────────────────────────────────

const IconScoreAlert: FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8"  x2="12"   y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconShieldCheck: FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconWarning: FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9"  x2="12"   y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ── Inline sub-components (stat card, banner) ──────────────────────────────────

interface StatCardSecProps {
  iconEl: ReactElement;
  iconBg: string;
  iconBorder: string;
  value: string | number;
  label: string;
  isPercent?: boolean;
  opacity: number;
  translateY: number;
}
const StatCardSec: FC<StatCardSecProps> = ({
  iconEl, iconBg, iconBorder, value, label, isPercent = false, opacity, translateY
}) => (
  <div style={{
    background: '#13111f', border: '1px solid #1f1c30', borderRadius: 12,
    padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 16,
    opacity, transform: `translateY(${translateY}px)`,
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: '50%',
      background: iconBg, border: `2px solid ${iconBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {iconEl}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>
        {value}
        {isPercent && <span style={{ fontSize: 22, fontWeight: 700 }}>%</span>}
      </div>
      <div style={{ fontSize: 13, color: '#5e5d78' }}>{label}</div>
    </div>
  </div>
);

// ── Default data ───────────────────────────────────────────────────────────────

const DEFAULT_ISSUES: SecurityIssue[] = [
  { iconType: 'csp',    name: 'Content Security\nPolicy (CSP)', status: 'Missing' },
  { iconType: 'hsts',   name: 'HSTS',                           status: 'Missing' },
  { iconType: 'xframe', name: 'X-Frame-Options',                status: 'Missing' },
];

// ── Scene ──────────────────────────────────────────────────────────────────────

export const SecurityScene: FC<{ data: SecuritySceneData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const ease  = Easing.out(Easing.cubic);

  const score          = data.score          ?? 0;
  const maxScore       = data.maxScore       ?? 100;
  const securityIssues = data.securityIssues ?? 0;
  const criticalCount  = data.criticalCount  ?? 0;
  const issues         = data.issues         ?? [];
  const steps          = data.steps          ?? SECURITY_AUDIT_STEPS;

  // ── Animations ──────────────────────────────────────────────────────────────

  const globalOpacity = interpolate(frame, [0, 15],  [0, 1],   { extrapolateRight: 'clamp' });
  const ease0         = Easing.out(Easing.cubic);
  const navY          = interpolate(frame, [0, 20],  [-28, 0],  { extrapolateRight: 'clamp', easing: ease0 });
  const leftX         = interpolate(frame, [8, 28],  [-35, 0],  { extrapolateRight: 'clamp', easing: ease });
  const rightX        = interpolate(frame, [8, 28],  [35, 0],   { extrapolateRight: 'clamp', easing: ease });
  const panelOpacity  = interpolate(frame, [8, 28],  [0, 1],    { extrapolateRight: 'clamp' });

  // Dial + score count-up: frames 20→80
  const dialProgress  = interpolate(frame, [20, 80], [0, 1],   { extrapolateRight: 'clamp', easing: ease });
  const animatedScore = Math.round(interpolate(frame, [20, 80], [0, score], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  // Stat cards stagger
  const statOpacity = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [28 + i * 6, 44 + i * 6], [0, 1], { extrapolateRight: 'clamp' })
  );
  const statY = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [28 + i * 6, 44 + i * 6], [14, 0], { extrapolateRight: 'clamp', easing: ease })
  );
  const animatedIssues = Math.round(interpolate(frame, [34, 78], [0, securityIssues], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const animatedCrit   = Math.round(interpolate(frame, [40, 80], [0, criticalCount],  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  // Divider + critical header
  const dividerOpacity = interpolate(frame, [48, 60], [0, 1], { extrapolateRight: 'clamp' });
  const headerOpacity  = interpolate(frame, [52, 64], [0, 1], { extrapolateRight: 'clamp' });
  const headerY        = interpolate(frame, [52, 64], [8, 0],  { extrapolateRight: 'clamp', easing: ease });

  // Critical issue cards stagger
  const issueOpacity = (issues.length > 0 ? issues : Array(3).fill(null)).map((_, i) =>
    interpolate(frame, [60 + i * 8, 76 + i * 8], [0, 1], { extrapolateRight: 'clamp' })
  );
  const issueY = (issues.length > 0 ? issues : Array(3).fill(null)).map((_, i) =>
    interpolate(frame, [60 + i * 8, 76 + i * 8], [16, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // Bottom banner
  const bannerOpacity = interpolate(frame, [78, 90], [0, 1], { extrapolateRight: 'clamp' });
  const bannerY       = interpolate(frame, [78, 90], [12, 0], { extrapolateRight: 'clamp', easing: ease });

  // Security recommendations strip
  const recOps = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [88 + i * 5, 102 + i * 5], [0, 1], { extrapolateRight: 'clamp' })
  );
  const recYs = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [88 + i * 5, 102 + i * 5], [14, 0], { extrapolateRight: 'clamp', easing: ease })
  );

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

        {/* Topbar */}
        <AuditStepNav
          brandName={data.brandName}
          brandSuffix={data.brandSuffix}
          pageLabel={data.pageLabel}
          steps={steps}
          translateY={navY}
          activeColor="#ef4444"
        />

        {/* ── Main 2-col ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 3fr',
          flex: 1,
          height: 'calc(100% - 66px)',
        }}>

          {/* ══ LEFT: section heading + big dial ══ */}
          <div style={{
            padding: '28px 24px 28px 40px',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            opacity: panelOpacity,
            transform: `translateX(${leftX}px)`,
          }}>
            {/* Section heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              {/* Shield badge */}
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: '#1e0808', border: '1.5px solid #7f1d1d',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="8"  x2="12"   y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div style={{
                fontSize: 24, fontWeight: 900, letterSpacing: '2.5px',
                textTransform: 'uppercase', color: '#fff',
              }}>
                Security Audit
              </div>
            </div>

            {/* Big dial */}
            <div style={{ margin: '10px auto 0' }}>
              <ScoreRing
                score={score}
                maxScore={maxScore}
                progress={dialProgress}
                id="security-audit"
                scale={1.08}
                theme="security"
              />
            </div>
          </div>

          {/* ══ RIGHT: stats + critical issues ══ */}
          <div style={{
            padding: '28px 28px 20px 10px',
            display: 'flex', flexDirection: 'column', gap: 14,
            opacity: panelOpacity,
            transform: `translateX(${rightX}px)`,
          }}>

            {/* Stat cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <StatCardSec
                iconEl={<IconScoreAlert />}
                iconBg="#190808" iconBorder="#7f1d1d"
                value={animatedScore} label="Security Score" isPercent
                opacity={statOpacity[0]} translateY={statY[0]}
              />
              <StatCardSec
                iconEl={<IconShieldCheck />}
                iconBg="#1a1108" iconBorder="#92400e"
                value={animatedIssues} label="Security Issues"
                opacity={statOpacity[1]} translateY={statY[1]}
              />
              <StatCardSec
                iconEl={<IconWarning />}
                iconBg="#1a0808" iconBorder="#b91c1c"
                value={animatedCrit} label="Critical Issues"
                opacity={statOpacity[2]} translateY={statY[2]}
              />
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#1c1a2c', opacity: dividerOpacity }} />

            {/* Critical issues header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 11.5, fontWeight: 700, letterSpacing: '2.5px',
              textTransform: 'uppercase', color: '#d4d2e8',
              opacity: headerOpacity,
              transform: `translateY(${headerY}px)`,
            }}>
              <div style={{
                width: 9, height: 9, borderRadius: '50%',
                background: '#ef4444', flexShrink: 0,
              }} />
              {data.criticalHeader ?? 'Critical Issues'}
            </div>

            {/* Critical issue cards grid */}
            {issues.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: '#081711', border: '1px solid #14532d', borderRadius: 12,
                padding: '30px 22px', textAlign: 'center', gap: 14,
                opacity: headerOpacity,
                transform: `translateY(${headerY}px)`,
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
                    All Security Checks Passed Successfully
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7a9e', lineHeight: 1.5 }}>
                    Your homepage has correct HTTPS, CSP, HSTS, and X-Frame-Options configurations.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {issues.map((issue, i) => {
                  const icon = ISSUE_ICONS[issue.iconType] ?? FALLBACK_ISSUE_ICON;
                  return (
                    <CriticalIssueCard
                      key={i}
                      iconEl={icon.iconEl}
                      name={issue.name}
                      status={issue.status ?? 'Missing'}
                      statusColor={issue.statusColor ?? '#ef4444'}
                      opacity={issueOpacity[i]}
                      translateY={issueY[i]}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom banner ── */}
        <div style={{
          margin: '0 28px 0',
          opacity: bannerOpacity,
          transform: `translateY(${bannerY}px)`,
        }}>
          {(() => {
            const hasIssues = issues.length > 0;
            const bannerBg = hasIssues
              ? 'linear-gradient(135deg, #1c0a0a 0%, #160818 60%, #100a18 100%)'
              : 'linear-gradient(135deg, #022c22 0%, #064e3b 60%, #065f46 100%)';
            const bannerBorder = hasIssues ? '1px solid #3a1212' : '1px solid #047857';
            const radialColor = hasIssues ? 'rgba(200,20,20,0.10)' : 'rgba(16,185,129,0.10)';
            const themeColor = hasIssues ? '#ef4444' : '#22c55e';
            const themeBg = hasIssues ? '#280b0b' : '#064e3b';
            const themeBorder = hasIssues ? '#7f1d1d' : '#047857';

            return (
              <div style={{
                position: 'relative', overflow: 'hidden',
                background: bannerBg,
                border: bannerBorder,
                borderRadius: 14,
                padding: '20px 28px',
                display: 'flex', alignItems: 'center', gap: 20,
              }}>
                <div style={{
                  position: 'absolute', right: 0, top: 0, bottom: 0, width: 340,
                  background: `radial-gradient(ellipse at right center, ${radialColor} 0%, transparent 65%)`,
                  pointerEvents: 'none',
                }} />
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: themeBg, border: `1.5px solid ${themeBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, position: 'relative', zIndex: 1,
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke={themeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    {hasIssues ? (
                      <>
                        <line x1="12" y1="8"  x2="12"   y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </>
                    ) : (
                      <polyline points="9 12 11 14 15 10" />
                    )}
                  </svg>
                </div>
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: themeColor, marginBottom: 5 }}>
                    {data.bannerTitle ?? (hasIssues
                      ? 'Your website has security gaps that need immediate attention.'
                      : 'Your website meets all core security standards.')}
                  </div>
                  <div style={{ fontSize: 13.5, color: hasIssues ? '#8a7e8e' : '#cbd5e1', lineHeight: 1.55 }}>
                    {data.bannerSubtitle ?? (hasIssues
                      ? 'Missing security protections can expose your website to threats and reduce trust signals for users and search engines.'
                      : 'All critical security headers, SSL certificates, and CORS policies are properly configured.')}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.2, position: 'relative', zIndex: 1 }}>
                  <svg width="90" height="90" viewBox="0 0 110 110" fill="none">
                    <rect x="18" y="52" width="74" height="50" rx="7" stroke={themeColor} strokeWidth="3" />
                    <path d="M34 52V37a21 21 0 0 1 42 0v15" stroke={themeColor} strokeWidth="3" strokeLinecap="round" />
                    <circle cx="55" cy="78" r="8" fill={themeColor} opacity="0.5" />
                    <line x1="55" y1="86" x2="55" y2="95" stroke={themeColor} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                  </svg>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Security Recommendations strip ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
          margin: '12px 28px 20px',
        }}>
          {([
            {
              title: 'Install Security Headers',
              desc: 'Add CSP, HSTS, and X-Frame-Options headers to block common attack vectors.',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                </svg>
              ),
            },
            {
              title: 'Enable HTTPS Everywhere',
              desc: 'Force HTTPS on all pages and set up automatic HTTP-to-HTTPS redirects.',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
            },
            {
              title: 'Set Up CORS Policy',
              desc: 'Define allowed cross-origin resource sharing to prevent unauthorized access.',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
            },
          ] as const).map((rec, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, #180a0a 0%, #120810 100%)',
              border: '1px solid #2a1212',
              borderRadius: 12,
              padding: '16px 18px',
              display: 'flex', flexDirection: 'column', gap: 8,
              opacity: recOps[i],
              transform: `translateY(${recYs[i]}px)`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: '#280a0a', border: '1px solid #4a1515',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {rec.icon}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#f8d0d0' }}>{rec.title}</div>
              <div style={{ fontSize: 12, color: '#7a6070', lineHeight: 1.55 }}>{rec.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </AbsoluteFill>
  );
};
