import type { FC, ReactElement } from 'react';
import { AbsoluteFill, interpolate, Easing, useCurrentFrame, Img, staticFile } from 'remotion';
import { AuditStepNav } from './components/AuditStepNav';
import type { AuditStepItem } from './components/AuditStepNav';
import { ScoreRing } from './components/ScoreRing';
import { PerfVerdictBox } from './components/PerfVerdictBox';
import { StatCard } from './components/StatCard';
import { AI_PLATFORM_ASSETS } from './assets/aiPlatforms';

AI_PLATFORM_ASSETS.copilot = {
  imagePath: 'ai-platforms/icons8-bing-48.png',
  logoBg: '#071833',
  logoBorder: '#0b2e66',
};


// ── Step nav — step 6 active, purple theme ────────────────────────────────────

const AI_VISIBILITY_STEPS: AuditStepItem[] = [
  { number: 1,  label: 'Intro',          state: 'done'    },
  { number: 2,  label: 'Overall Score',  state: 'done'    },
  { number: 3,  label: 'On-Page SEO',    state: 'done'    },
  { number: 4,  label: 'Technical',      state: 'done'    },
  { number: 5,  label: 'Security',       state: 'done'    },
  { number: 6,  label: 'AI Visibility',  state: 'active'  },
  { number: 7,  label: 'Performance',    state: 'pending' },
  { number: 8,  label: 'Accessibility',  state: 'pending' },
  { number: 9,  label: 'Social',         state: 'pending' },
  { number: 10, label: 'Local SEO',      state: 'pending' },
];

// ── Data contract ─────────────────────────────────────────────────────────────

export interface AiPlatformEntry {
  platformType: string;  // key into AI_PLATFORM_ASSETS registry
  name: string;
  visibility?: string;   // "Low" | "Medium" | "High"
}

export interface AiIssueEntry {
  iconType: string;
  name: string;
  description: string;
  impact?: string;
  badge?: string;
}

export interface AiVisibilityData {
  // Nav
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  steps?: AuditStepItem[];

  // Sidebar dial
  score?: number;
  maxScore?: number;
  sidebarLabel?: string;
  sidebarSubtitle?: string;

  // Status summary (footerContent of ScoreSidebar)
  statusLabel?: string;
  criticalCount?: number;
  criticalSubtitle?: string;

  // Metric highlight card
  readabilityScore?: number;
  readabilityMaxScore?: number;
  readabilityDescription?: string;

  // AI issue cards (grid)
  issuesHeader?: string;
  issues?: AiIssueEntry[];

  // Platform tiles
  platformsHeader?: string;
  platforms?: AiPlatformEntry[];
}

// ── Default data ──────────────────────────────────────────────────────────────

const DEFAULT_ISSUES: AiIssueEntry[] = [
  {
    iconType: 'llms-txt',
    name: 'Missing llms.txt',
    description: 'No llms.txt file found. AI crawlers cannot determine what content they are allowed to index.',
    impact: 'High Impact',
    badge: 'Critical',
  },
  {
    iconType: 'schema',
    name: 'No Structured Data',
    description: 'Missing schema markup prevents AI systems from extracting key facts about your business.',
    impact: 'High Impact',
    badge: 'Critical',
  },
  {
    iconType: 'faq',
    name: 'No FAQ Content',
    description: 'AI assistants prefer Q&A formatted content. No FAQ schema or page structure detected.',
    impact: 'High Impact',
    badge: 'Critical',
  },
  {
    iconType: 'clarity',
    name: 'Low Content Clarity',
    description: 'Content structure lacks clear headings and concise answers that AI models can summarize.',
    impact: 'Medium Impact',
    badge: 'Warning',
  },
];

const DEFAULT_PLATFORMS: AiPlatformEntry[] = [
  { platformType: 'chatgpt',    name: 'ChatGPT',    visibility: 'Low'  },
  { platformType: 'gemini',     name: 'Gemini',     visibility: 'Low'  },
  { platformType: 'claude',     name: 'Claude',     visibility: 'Low'  },
  { platformType: 'perplexity', name: 'Perplexity', visibility: 'Low'  },
];

// ── Stat card icons ──────────────────────────────────────────────────────────
const IconScore: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconIssues: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconOptStatus: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconChatGPT: FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5-2.5-.5-5.5 2-7s5.5-.5 7 2m-9 5c1.5 2.5 4.5 3.5 7 2s3.5-4.5 2-7m2.5-4.5c2.5 1.5 3.5 4.5 2 7s-4.5 3.5-7 2m9-5c-1.5-2.5-4.5-3.5-7-2s-3.5 4.5-2 7" />
    <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
  </svg>
);

const IconClaude: FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cc855c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 0 1 10 10c0 1.3-.25 2.54-.7 3.68M2 12A10 10 0 0 1 12 2" />
    <path d="M12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12z" />
  </svg>
);

const IconGemini: FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c0 4.5-3.5 8-8 8 4.5 0 8 3.5 8 8 0-4.5 3.5-8 8-8-4.5 0-8-3.5-8-8z" />
  </svg>
);

const IconPerplexity: FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12h6M12 9v6" />
  </svg>
);

const IconCopilot: FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" />
    <path d="M7 14a6 6 0 0 0 10 0" />
  </svg>
);

const PLATFORMS_DATA = [
  { name: 'ChatGPT', key: 'chatgpt', status: 'Low', color: '#ef4444', icon: <IconChatGPT /> },
  { name: 'Claude', key: 'claude', status: 'Low', color: '#ef4444', icon: <IconClaude /> },
  { name: 'Gemini', key: 'gemini', status: 'Low', color: '#ef4444', icon: <IconGemini /> },
  { name: 'Perplexity', key: 'perplexity', status: 'Low', color: '#ef4444', icon: <IconPerplexity /> },
  { name: 'Microsoft Copilot', key: 'copilot', status: 'Low', color: '#ef4444', icon: <IconCopilot /> },
];

const PlatformIcon: FC<{ name: string; keyName: string; fallback: ReactElement }> = ({ name, keyName, fallback }) => {
  const asset = AI_PLATFORM_ASSETS[keyName];
  if (asset && asset.imagePath) {
    return (
      <Img
        src={staticFile(asset.imagePath)}
        alt={name}
        style={{
          width: 42,
          height: 42,
          objectFit: 'contain',
        }}
      />
    );
  }
  return fallback;
};


const ISSUE_ICONS: Record<string, ReactElement> = {
  'llms-txt': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  'schema': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" />
      <rect x="2" y="14" width="8" height="8" rx="1" />
      <line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="14" x2="17" y2="22" />
    </svg>
  ),
  'faq': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  'clarity': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

// ── Scene ─────────────────────────────────────────────────────────────────────

export const AiVisibilityScene: FC<{ data: AiVisibilityData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const ease  = Easing.out(Easing.cubic);

  const score            = data.score            ?? 0;
  const maxScore         = data.maxScore         ?? 100;
  const criticalCount    = data.criticalCount    ?? 0;
  const readabilityScore = data.readabilityScore ?? 0;
  const readabilityMax   = data.readabilityMaxScore ?? 100;
  const issues           = data.issues           ?? [];
  const steps            = data.steps            ?? AI_VISIBILITY_STEPS;

  const getPlatformStatus = (platformKey: string, aiScore: number) => {
    let status: 'Low' | 'Moderate' | 'Good' = 'Low';
    if (aiScore >= 85) {
      status = 'Good';
    } else if (aiScore >= 60) {
      if (platformKey === 'chatgpt' || platformKey === 'gemini') status = 'Good';
      else status = 'Moderate';
    } else if (aiScore >= 35) {
      if (platformKey === 'chatgpt' || platformKey === 'gemini') status = 'Moderate';
      else status = 'Low';
    } else {
      status = 'Low';
    }
    const colors = {
      Low: '#ef4444',
      Moderate: '#f97316',
      Good: '#22c55e'
    };
    return { status, color: colors[status] };
  };

  let discoverabilityStatus = 'Low';
  if (score >= 80) discoverabilityStatus = 'Good';
  else if (score >= 50) discoverabilityStatus = 'Moderate';
  else discoverabilityStatus = 'Low';

  const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

  // ── Animations ──────────────────────────────────────────────────────────────

  // Global fade-in
  const globalOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Nav slide
  const navY = interpolate(frame, [0, 20], [-28, 0], { extrapolateRight: 'clamp', easing: ease });

  // Left / right panel slide-in
  const panelOpacity = interpolate(frame, [8, 28],  [0, 1],  { extrapolateRight: 'clamp' });
  const leftX        = interpolate(frame, [8, 28],  [-35, 0], { extrapolateRight: 'clamp', easing: ease });
  const rightX       = interpolate(frame, [8, 28],  [35, 0],  { extrapolateRight: 'clamp', easing: ease });

  // 1. Score gauge / ringProgress: 15 -> 75
  const dialProgress = interpolate(frame, [15, 75], [0, 1], { ...cl, easing: ease });

  // 2. Title fade-in: 25 -> 40
  const titleOpacity = interpolate(frame, [25, 40], [0, 1], cl);

  // 4. Summary cards (right column top row): 35 -> 60
  const statOpacities = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [35 + i * 6, 50 + i * 6], [0, 1], cl)
  );
  const statY = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [35 + i * 6, 50 + i * 6], [12, 0], { ...cl, easing: ease })
  );

  // 5. AI Issues section slides upward: 55 -> 70
  const findingsOpacity = interpolate(frame, [55, 70], [0, 1], cl);
  const findingsY       = interpolate(frame, [55, 70], [15, 0], { ...cl, easing: ease });

  // 6. Issue cards appear one-by-one: 60 -> 85
  const issueOpacity = ([0, 1, 2, 3] as const).map(i =>
    interpolate(frame, [60 + i * 7, 72 + i * 7], [0, 1], cl)
  );
  const issueY = ([0, 1, 2, 3] as const).map(i =>
    interpolate(frame, [60 + i * 7, 72 + i * 7], [10, 0], { ...cl, easing: ease })
  );

  // 7. AI Search Readiness Review panel slides upward: 80 -> 95
  const footerOpacity = interpolate(frame, [80, 95], [0, 1], cl);
  const footerY       = interpolate(frame, [80, 95], [20, 0], { ...cl, easing: ease });

  // 8. AI platforms appear sequentially: 90 -> 120
  const platformOp = ([0, 1, 2, 3, 4] as const).map(i =>
    interpolate(frame, [90 + i * 5, 102 + i * 5], [0, 1], cl)
  );
  const platformY = ([0, 1, 2, 3, 4] as const).map(i =>
    interpolate(frame, [90 + i * 5, 102 + i * 5], [10, 0], { ...cl, easing: ease })
  );

  // 8b. Summary text fades in: 115 -> 130
  const summaryTextOpacity = interpolate(frame, [115, 130], [0, 1], cl);


  // 9. Final glow pulse on score ring: rises at 130, peaks 143, fades by 160
  const glowPulse = interpolate(frame, [130, 143, 155, 162], [0, 1, 0.5, 0], cl);

  // Count-up driven by dialProgress
  const animatedScore = Math.round(dialProgress * score);
  const animatedIssues = Math.round(interpolate(frame, [36, 80], [0, issues.length], cl));

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
          activeColor="#a855f7"
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
            paddingRight: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            opacity: panelOpacity,
            transform: `translateX(${leftX}px)`,
          }}>

            {/* Section title */}
            <div style={{
              fontSize: 28, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase',
              marginBottom: 12, alignSelf: 'flex-start', paddingLeft: 20,
              opacity: titleOpacity,
            }}>
              <span style={{ color: '#fff' }}>AI</span>
              <span style={{
                background: 'linear-gradient(90deg,#00c8ff,#7c3aed)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginLeft: 12,
              }}>VISIBILITY</span>
            </div>

            {/* Short description */}
            <div style={{
              fontSize: 13.5, color: '#6b7a9e',
              alignSelf: 'flex-start', paddingLeft: 20, marginBottom: 32,
              lineHeight: 1.55, maxWidth: 360,
              opacity: titleOpacity,
            }}>
              {data.sidebarSubtitle ?? 'How well AI platforms can discover and cite your content'}
            </div>

            {/* Score ring with glow pulse */}
            <div style={{ position: 'relative' }}>
              <ScoreRing
                score={score}
                maxScore={maxScore}
                progress={dialProgress}
                id="ai-visibility"
                scale={1.08}
              />
              <div style={{
                position: 'absolute',
                inset: -40,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, rgba(124,58,237,0.12) 50%, transparent 70%)',
                opacity: glowPulse,
                pointerEvents: 'none',
                transform: `scale(${1 + glowPulse * 0.08})`,
              }} />
            </div>          </div>


          {/* ══ RIGHT: metric card + issues + platforms ══ */}
        {/* ══ RIGHT: Details column ══ */}
        <div style={{
          paddingLeft: 60,
          display: 'flex', flexDirection: 'column', gap: 28,
          opacity: panelOpacity,
          transform: `translateX(${rightX}px)`,
        }}>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            <StatCard
              variant="purple"
              value={animatedScore}
              description={'AI Visibility\nScore'}
              iconEl={<IconScore />}
              opacity={statOpacities[0]}
              translateY={statY[0]}
            />
            <StatCard
              variant="blue"
              value={animatedIssues}
              description={'AI Issues\nFound'}
              iconEl={<IconIssues />}
              opacity={statOpacities[1]}
              translateY={statY[1]}
            />
            <StatCard
              variant="green"
              value={discoverabilityStatus}
              description={'Discoverability\nStatus'}
              iconEl={<IconOptStatus />}
              opacity={statOpacities[2]}
              translateY={statY[2]}
            />
          </div>

          {/* ── Top AI Visibility Issues Panel ── */}
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
                background: '#a855f7', boxShadow: '0 0 6px rgba(168,85,247,0.6)', flexShrink: 0,
              }} />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#cbd5e1' }}>
                {data.issuesHeader ?? 'Top AI Visibility Issues'}
              </div>
              <div style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                background: issues.length === 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: issues.length === 0 ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
                color: issues.length === 0 ? '#22c55e' : '#ef4444', padding: '3px 10px', borderRadius: 4, letterSpacing: '0.5px',
              }}>
                {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'}
              </div>
            </div>

            {/* Finding rows */}
            <div>
              {issues.length === 0 ? (
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
                      All AI Visibility Checks Passed
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7a9e', lineHeight: 1.5 }}>
                      Your homepage has correct crawl guidance (llms.txt), structured content, FAQs, and clarity profiles optimized for AI engines.
                    </div>
                  </div>
                </div>
              ) : (
                issues.map((item, i) => {
                  const isLast = i === issues.length - 1;
                  const iconSvg = ISSUE_ICONS[item.iconType] || ISSUE_ICONS['clarity'];
                  return (
                    <div key={item.name} style={{
                      display: 'flex', alignItems: 'center', gap: 18,
                      padding: '20px 22px',
                      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                      opacity: issueOpacity[Math.min(i, issueOpacity.length - 1)],
                      transform: `translateY(${issueY[Math.min(i, issueY.length - 1)]}px)`,
                    }}>
                      {/* Icon circle */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: '#1a0e2e',
                        border: '1.5px solid rgba(168,85,247,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {iconSvg}
                      </div>
                      {/* Text */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 5 }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 13, color: '#5a6a90', lineHeight: 1.55 }}>
                          {item.description}
                        </div>
                      </div>
                      {/* Status badge */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: item.badge === 'Critical' ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
                        border: item.badge === 'Critical' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(249,115,22,0.2)',
                        borderRadius: 6, padding: '6px 12px', flexShrink: 0,
                      }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: item.badge === 'Critical' ? '#ef4444' : '#f97316' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: item.badge === 'Critical' ? '#ef4444' : '#f97316', letterSpacing: '0.5px' }}>
                          {item.badge ?? 'Needs Fix'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* ── AI Platform Visibility Footer — inside grid, full-width row ── */}
        <div style={{
          gridColumn: '1 / -1',
          marginTop: 28,
          opacity: footerOpacity,
          transform: `translateY(${footerY}px)`,
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            background: 'linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(9,16,34,0.99) 100%)',
            border: '1px solid rgba(168,85,247,0.22)', // purple theme for AI Visibility
            borderRadius: 14,
            padding: '20px 36px',
            boxShadow: '0 0 48px rgba(168,85,247,0.1), 0 0 96px rgba(124,58,237,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>

            {/* Header info / Score Display */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  fontSize: 12, fontWeight: 900, letterSpacing: '3px',
                  textTransform: 'uppercase', color: '#a855f7', marginBottom: 4,
                }}>
                  AI Platform Visibility
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                  Show how visible the homepage currently is across major AI systems.
                </div>
              </div>

              {/* Score Display (replaces bottom row score) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(168,85,247,0.12)',
                border: '1.5px solid rgba(168,85,247,0.3)',
                borderRadius: 8,
                padding: '8px 16px',
                flexShrink: 0,
                opacity: summaryTextOpacity, // fades in after cards appear
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#cbd5e1', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  AI Discoverability Score
                </span>
                <span style={{
                  fontSize: 16, fontWeight: 900,
                  background: 'linear-gradient(90deg, #a855f7, #c084fc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginLeft: 12,
                  fontFamily: 'monospace',
                }}>
                  {score}/100
                </span>
              </div>
            </div>

            {/* Platforms row - Premium Large Cards (Vertical Layout) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 20,
              margin: '6px 0',
            }}>
              {PLATFORMS_DATA.map((plat, i) => {
                const asset = AI_PLATFORM_ASSETS[plat.key] || { logoBg: 'rgba(255,255,255,0.03)', logoBorder: 'rgba(255,255,255,0.05)' };
                const { status: platStatus, color: platColor } = getPlatformStatus(plat.key, score);
                const platBg = platStatus === 'Good' ? 'rgba(34,197,94,0.12)' : platStatus === 'Moderate' ? 'rgba(249,115,22,0.12)' : 'rgba(239,68,68,0.12)';
                const platBorderColor = platStatus === 'Good' ? 'rgba(34,197,94,0.35)' : platStatus === 'Moderate' ? 'rgba(249,115,22,0.35)' : 'rgba(239,68,68,0.35)';

                return (
                  <div
                    key={plat.name}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 12,
                      padding: '16px 14px',
                      height: 146,
                      opacity: platformOp[i],
                      transform: `translateY(${platformY[i]}px)`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.02)',
                    }}
                  >
                    {/* Platform Icon Container */}
                    <div style={{
                      width: 58, height: 58, borderRadius: 12,
                      background: asset.logoBg,
                      border: asset.logoBorder ? `1.5px solid ${asset.logoBorder}` : '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}>
                      <PlatformIcon name={plat.name} keyName={plat.key} fallback={plat.icon} />
                    </div>

                    {/* Platform Name */}
                    <div style={{
                      fontSize: 14.5, fontWeight: 800, color: '#cbd5e1',
                      textAlign: 'center',
                    }}>
                      {plat.name}
                    </div>

                    {/* Visibility Status Pill (Increased by 15%) */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: platBg,
                      border: `1.5px solid ${platBorderColor}`,
                      borderRadius: 20,
                      padding: '4px 14px',
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: platColor }} />
                      <span style={{ fontSize: 11.5, fontWeight: 900, color: platColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {platStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);
};
