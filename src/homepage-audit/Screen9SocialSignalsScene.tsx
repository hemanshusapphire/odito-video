import type { FC } from 'react';
import { AbsoluteFill, interpolate, Easing, useCurrentFrame } from 'remotion';
import { AuditStepNav } from './components/AuditStepNav';
import type { AuditStepItem } from './components/AuditStepNav';
import { ScoreSidebar } from './components/ScoreSidebar';
import { AccessibilityMetricCard } from './components/AccessibilityMetricCard';
import { SocialPlatformCard } from './components/SocialPlatformCard';
import { InsightBanner } from './components/InsightBanner';

// ── Step nav — step 9 active, teal theme ─────────────────────────────────────

const SOCIAL_AUDIT_STEPS: AuditStepItem[] = [
  { number: 1,  label: 'Intro',          state: 'done'    },
  { number: 2,  label: 'Overall Score',  state: 'done'    },
  { number: 3,  label: 'On-Page SEO',    state: 'done'    },
  { number: 4,  label: 'Technical',      state: 'done'    },
  { number: 5,  label: 'Security',       state: 'done'    },
  { number: 6,  label: 'AI Visibility',  state: 'done'    },
  { number: 7,  label: 'Performance',    state: 'done'    },
  { number: 8,  label: 'Accessibility',  state: 'done'    },
  { number: 9,  label: 'Social',         state: 'active'  },
  { number: 10, label: 'Local SEO',      state: 'pending' },
];

// ── Data contract ─────────────────────────────────────────────────────────────

export interface SocialPlatformEntry {
  platform: string;   // key into SOCIAL_PLATFORM_ASSETS registry
  name: string;
  connected: boolean;
}

export interface SocialSignalsData {
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  steps?: AuditStepItem[];

  // Sidebar
  score?: number;
  maxScore?: number;
  sidebarLabel?: string;
  sidebarSubtitle?: string;

  // Metric cards
  connectedProfiles?: number;
  connectedProfilesDesc?: string;
  missingProfiles?: number;
  missingProfilesDesc?: string;

  // Platform list
  platformsHeader?: string;
  platforms?: SocialPlatformEntry[];

  // Banner
  bannerTitle?: string;
  bannerSubtitle?: string;
}

// ── Default data ──────────────────────────────────────────────────────────────

const DEFAULT_PLATFORMS: SocialPlatformEntry[] = [
  { platform: 'facebook',  name: 'Facebook',  connected: true  },
  { platform: 'instagram', name: 'Instagram', connected: true  },
  { platform: 'linkedin',  name: 'LinkedIn',  connected: true  },
  { platform: 'twitter',   name: 'Twitter',   connected: false },
  { platform: 'youtube',   name: 'YouTube',   connected: false },
];

// ── Theme ─────────────────────────────────────────────────────────────────────

const ACCENT = '#14b8a6'; // teal

// ── Banner icon ───────────────────────────────────────────────────────────────

const BannerIcon = (
  <div style={{
    width: 48, height: 48, borderRadius: '50%',
    background: '#041a18', border: '1.5px solid #0f766e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5"  r="3" />
      <circle cx="6"  cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59"  y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49" />
    </svg>
  </div>
);

// ── Scene ─────────────────────────────────────────────────────────────────────

export const SocialSignalsScene: FC<{ data: SocialSignalsData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const ease  = Easing.out(Easing.cubic);

  const score             = data.score             ?? 72;
  const maxScore          = data.maxScore          ?? 100;
  const steps             = data.steps             ?? SOCIAL_AUDIT_STEPS;
  const connectedProfiles = data.connectedProfiles ?? 3;
  const missingProfiles   = data.missingProfiles   ?? 2;
  const platforms         = data.platforms         ?? DEFAULT_PLATFORMS;
  const totalPlatforms    = Math.max(1, connectedProfiles + missingProfiles);

  // ── Animation values ─────────────────────────────────────────────────────────

  const globalOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const navY          = interpolate(frame, [0, 20], [-28, 0], { extrapolateRight: 'clamp', easing: ease });

  const panelOpacity = interpolate(frame, [8, 28], [0, 1],   { extrapolateRight: 'clamp' });
  const leftX        = interpolate(frame, [8, 28], [-35, 0],  { extrapolateRight: 'clamp', easing: ease });
  const rightX       = interpolate(frame, [8, 28], [35, 0],   { extrapolateRight: 'clamp', easing: ease });

  // Dial + score count-up
  const dialProgress  = interpolate(frame, [20, 80], [0, 1],  { extrapolateRight: 'clamp', easing: ease });
  const animatedScore = Math.round(interpolate(frame, [20, 80], [0, score], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const labelOpacity  = interpolate(frame, [30, 46], [0, 1],  { extrapolateRight: 'clamp' });

  // Metric card 1 — Connected Profiles
  const card1Opacity      = interpolate(frame, [36, 52], [0, 1],  { extrapolateRight: 'clamp' });
  const card1Y            = interpolate(frame, [36, 52], [16, 0], { extrapolateRight: 'clamp', easing: ease });
  const animatedConnected = Math.round(interpolate(frame, [36, 75], [0, connectedProfiles], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const connectedBarWidth = interpolate(frame, [40, 76], [0, (connectedProfiles / totalPlatforms) * 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Metric card 2 — Missing Profiles
  const card2Opacity    = interpolate(frame, [44, 60], [0, 1],  { extrapolateRight: 'clamp' });
  const card2Y          = interpolate(frame, [44, 60], [16, 0], { extrapolateRight: 'clamp', easing: ease });
  const animatedMissing = Math.round(interpolate(frame, [44, 78], [0, missingProfiles], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const missingBarWidth = interpolate(frame, [48, 78], [0, (missingProfiles / totalPlatforms) * 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Platforms header
  const platformsHeaderOpacity = interpolate(frame, [52, 64], [0, 1], { extrapolateRight: 'clamp' });
  const platformsHeaderY       = interpolate(frame, [52, 64], [8, 0],  { extrapolateRight: 'clamp', easing: ease });

  // Platform cards stagger
  const platformOpacities = platforms.map((_, i) =>
    interpolate(frame, [58 + i * 5, 72 + i * 5], [0, 1], { extrapolateRight: 'clamp' })
  );
  const platformYs = platforms.map((_, i) =>
    interpolate(frame, [58 + i * 5, 72 + i * 5], [10, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // Banner
  const bannerOpacity = interpolate(frame, [84, 96], [0, 1],  { extrapolateRight: 'clamp' });
  const bannerY       = interpolate(frame, [84, 96], [12, 0], { extrapolateRight: 'clamp', easing: ease });

  // Social Visibility Benefits strip
  const benefitOps = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [94 + i * 6, 108 + i * 6], [0, 1], { extrapolateRight: 'clamp' })
  );
  const benefitYs = ([0, 1, 2] as const).map(i =>
    interpolate(frame, [94 + i * 6, 108 + i * 6], [12, 0], { extrapolateRight: 'clamp', easing: ease })
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

        {/* ── Main 2-col (content-sized) ── */}
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
              dialId="social-signals"
              gradStart="#0f766e"
              gradMid={ACCENT}
              gradEnd="#2dd4bf"
              label={data.sidebarLabel ?? 'Social Signals'}
              subtitle={data.sidebarSubtitle ?? 'How well your website is connected to social platforms and social presence signals'}
              labelOpacity={labelOpacity}
              size={300}
            />
          </div>

          {/* ══ RIGHT: metric cards + platforms ══ */}
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
                    stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                }
                value={animatedConnected}
                label="Connected Profiles"
                description={data.connectedProfilesDesc ?? 'Social platforms actively linked to your website.'}
                accentColor="#22c55e"
                iconBg="rgba(34,197,94,.08)"
                iconBorder="rgba(34,197,94,.45)"
                barWidth={connectedBarWidth}
                opacity={card1Opacity}
                translateY={card1Y}
              />
              <AccessibilityMetricCard
                iconEl={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8"  x2="12"   y2="12" />
                    <circle cx="12" cy="16" r="1" fill="#f59e0b" stroke="none" />
                  </svg>
                }
                value={animatedMissing}
                label="Missing Profiles"
                description={data.missingProfilesDesc ?? 'Social platforms not yet connected to your website.'}
                accentColor="#f59e0b"
                iconBg="rgba(245,158,11,.08)"
                iconBorder="rgba(245,158,11,.45)"
                barWidth={missingBarWidth}
                opacity={card2Opacity}
                translateY={card2Y}
              />
            </div>

            {/* Platforms section header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 11.5, fontWeight: 700, letterSpacing: '2.5px',
              textTransform: 'uppercase', color: '#d4d2e8',
              opacity: platformsHeaderOpacity,
              transform: `translateY(${platformsHeaderY}px)`,
            }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: ACCENT, flexShrink: 0 }} />
              {data.platformsHeader ?? 'Social Platform Status'}
            </div>

            {/* Platform cards — 2-col grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {platforms.map((entry, i) => (
                <SocialPlatformCard
                  key={entry.platform}
                  platformType={entry.platform}
                  name={entry.name}
                  connected={entry.connected}
                  opacity={platformOpacities[i] ?? 1}
                  translateY={platformYs[i] ?? 0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Insight banner ── */}
        <div style={{ padding: '0 28px', opacity: bannerOpacity, transform: `translateY(${bannerY}px)`, marginBottom: 24 }}>
          <InsightBanner
            iconEl={BannerIcon}
            title={data.bannerTitle ?? 'More active social profiles can improve brand authority, trust, and online visibility.'}
            subtitle={data.bannerSubtitle ?? 'Connecting your social platforms helps search engines verify your business and strengthens your digital footprint.'}
            background="linear-gradient(135deg, #041a18 0%, #031410 60%, #020e0c 100%)"
            borderColor="rgba(20,184,166,.2)"
            opacity={1}
            translateY={0}
            padding="26px 30px"
          />
        </div>

        {/* ── Social Visibility Benefits ── */}
        <div style={{ padding: '16px 28px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: 12, fontWeight: 900, letterSpacing: '3px',
            textTransform: 'uppercase', color: ACCENT,
            marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
            opacity: benefitOps[0],
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: ACCENT,
              boxShadow: `0 0 8px ${ACCENT}, 0 0 16px ${ACCENT}`,
            }} />
            Social Visibility Benefits
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, paddingBottom: 25 }}>
            {([
              {
                title: 'Brand Authority',
                stat: '3× more trusted',
                desc: 'Businesses with active social profiles are considered 3x more credible by consumers and AI recommendation engines.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ),
              },
              {
                title: 'AI Visibility',
                stat: 'Cited in AI answers',
                desc: 'AI assistants like ChatGPT and Gemini pull social profile data when recommending businesses. More profiles = more citations.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                    <path d="M19 3l.6 1.9L21 6l-1.4.6L19 8.5l-.6-1.9L17 6l1.4-.6L19 3z" />
                  </svg>
                ),
              },
              {
                title: 'Search Rankings',
                stat: '+18% local visibility',
                desc: 'Social signals are used as trust indicators by Google. Consistent profiles strengthen NAP data and local SEO rankings.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                ),
              },
            ] as const).map((benefit, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${ACCENT}10 0%, #0a0c18 100%)`,
                border: `1px solid ${ACCENT}28`,
                borderRadius: 12,
                padding: '20px 16px',
                display: 'flex', flexDirection: 'column', gap: 8,
                opacity: benefitOps[i],
                transform: `translateY(${benefitYs[i]}px)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${ACCENT}18`, border: `1px solid ${ACCENT}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {benefit.icon}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 900, color: ACCENT,
                    background: `${ACCENT}22`, border: `1.5px solid ${ACCENT}50`,
                    borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap',
                  }}>{benefit.stat}</div>
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#e0f8f5', marginBottom: 2 }}>{benefit.title}</div>
                <div style={{ fontSize: 12.5, color: '#4a6a66', lineHeight: 1.6 }}>{benefit.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
