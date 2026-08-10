import type { FC } from 'react';
import { AbsoluteFill, interpolate, Easing, useCurrentFrame } from 'remotion';
import { AuditStepNav } from './components/AuditStepNav';
import type { AuditStepItem } from './components/AuditStepNav';
import { ScoreSidebar } from './components/ScoreSidebar';
import { InsightBanner } from './components/InsightBanner';
import { PerformanceMetricsCard } from './components/PerformanceMetricsCard';
import type { PerformanceMetric, MetricRating } from './components/PerformanceMetricsCard';

// ── Step nav — step 7 active, amber theme ─────────────────────────────────────

const PERFORMANCE_AUDIT_STEPS: AuditStepItem[] = [
  { number: 1,  label: 'Intro',          state: 'done'    },
  { number: 2,  label: 'Overall Score',  state: 'done'    },
  { number: 3,  label: 'On-Page SEO',    state: 'done'    },
  { number: 4,  label: 'Technical',      state: 'done'    },
  { number: 5,  label: 'Security',       state: 'done'    },
  { number: 6,  label: 'AI Visibility',  state: 'done'    },
  { number: 7,  label: 'Performance',    state: 'active'  },
  { number: 8,  label: 'Accessibility',  state: 'pending' },
  { number: 9,  label: 'Social',         state: 'pending' },
  { number: 10, label: 'Local SEO',      state: 'pending' },
];

// ── Data contract ─────────────────────────────────────────────────────────────

export interface PerformanceDeviceMetrics {
  score?: number;
  lcp?: string;        lcpRating?: MetricRating;
  fcp?: string;        fcpRating?: MetricRating;
  cls?: string;        clsRating?: MetricRating;
  inp?: string;        inpRating?: MetricRating;
  tbt?: string;        tbtRating?: MetricRating;
  speedIndex?: string; speedIndexRating?: MetricRating;
}

export interface PerformanceData {
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  steps?: AuditStepItem[];

  // Overall performance score (sidebar dial)
  score?: number;
  maxScore?: number;
  sidebarLabel?: string;
  sidebarSubtitle?: string;

  // Per-device metrics
  mobile?: PerformanceDeviceMetrics;
  desktop?: PerformanceDeviceMetrics;

  // Bottom banner
  bannerTitle?: string;
  bannerSubtitle?: string;
}

// ── Default data ──────────────────────────────────────────────────────────────

const DEFAULT_MOBILE: PerformanceDeviceMetrics = {
  score: 39,
  lcp: '4.2s',         lcpRating:        'poor',
  fcp: '2.1s',         fcpRating:        'needs-improvement',
  cls: '0.14',         clsRating:        'needs-improvement',
  inp: '380ms',        inpRating:        'poor',
  tbt: '520ms',        tbtRating:        'poor',
  speedIndex: '3.8s',  speedIndexRating: 'poor',
};

const DEFAULT_DESKTOP: PerformanceDeviceMetrics = {
  score: 67,
  lcp: '2.3s',         lcpRating:        'needs-improvement',
  fcp: '0.9s',         fcpRating:        'good',
  cls: '0.06',         clsRating:        'good',
  inp: '180ms',        inpRating:        'needs-improvement',
  tbt: '210ms',        tbtRating:        'needs-improvement',
  speedIndex: '1.9s',  speedIndexRating: 'needs-improvement',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACCENT = '#f59e0b';
const NUM_METRICS = 6;

function buildMetrics(d: PerformanceDeviceMetrics): PerformanceMetric[] {
  return [
    { label: 'LCP',         value: d.lcp        ?? '–', rating: d.lcpRating        },
    { label: 'FCP',         value: d.fcp        ?? '–', rating: d.fcpRating        },
    { label: 'CLS',         value: d.cls        ?? '–', rating: d.clsRating        },
    { label: 'INP',         value: d.inp        ?? '–', rating: d.inpRating        },
    { label: 'TBT',         value: d.tbt        ?? '–', rating: d.tbtRating        },
    { label: 'Speed Index', value: d.speedIndex ?? '–', rating: d.speedIndexRating },
  ];
}

// ── Banner icon ───────────────────────────────────────────────────────────────

const BannerIcon = (
  <div style={{
    width: 48, height: 48, borderRadius: '50%',
    background: '#120d00', border: '1.5px solid #78350f',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  </div>
);

// ── Scene ─────────────────────────────────────────────────────────────────────

export const PerformanceScene: FC<{ data: PerformanceData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const ease  = Easing.out(Easing.cubic);

  const score        = data.score   ?? 39;
  const maxScore     = data.maxScore ?? 100;
  const steps        = data.steps   ?? PERFORMANCE_AUDIT_STEPS;
  const mobileData   = data.mobile  ?? DEFAULT_MOBILE;
  const desktopData  = data.desktop ?? DEFAULT_DESKTOP;
  const mobileScore  = mobileData.score  ?? 39;
  const desktopScore = desktopData.score ?? 67;

  const mobileMetrics  = buildMetrics(mobileData);
  const desktopMetrics = buildMetrics(desktopData);

  // ── Animation values ─────────────────────────────────────────────────────────

  const globalOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const navY          = interpolate(frame, [0, 20], [-28, 0], { extrapolateRight: 'clamp', easing: ease });

  const panelOpacity = interpolate(frame, [8, 28], [0, 1],   { extrapolateRight: 'clamp' });
  const leftX        = interpolate(frame, [8, 28], [-35, 0],  { extrapolateRight: 'clamp', easing: ease });
  const rightX       = interpolate(frame, [8, 28], [35, 0],   { extrapolateRight: 'clamp', easing: ease });

  // Overall dial + sidebar label
  const dialProgress   = interpolate(frame, [20, 80], [0, 1],  { extrapolateRight: 'clamp', easing: ease });
  const animatedScore  = Math.round(interpolate(frame, [20, 80], [0, score], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const labelOpacity   = interpolate(frame, [30, 46], [0, 1],  { extrapolateRight: 'clamp' });

  // Mobile card entrance
  const mobileOpacity      = interpolate(frame, [36, 52], [0, 1],  { extrapolateRight: 'clamp' });
  const mobileCardY        = interpolate(frame, [36, 52], [18, 0], { extrapolateRight: 'clamp', easing: ease });
  const animatedMobileScore = Math.round(interpolate(frame, [36, 80], [0, mobileScore],  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  // Desktop card entrance
  const desktopOpacity      = interpolate(frame, [44, 60], [0, 1],  { extrapolateRight: 'clamp' });
  const desktopCardY        = interpolate(frame, [44, 60], [18, 0], { extrapolateRight: 'clamp', easing: ease });
  const animatedDesktopScore = Math.round(interpolate(frame, [44, 80], [0, desktopScore], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  // Mobile metric row stagger — starts at frame 52
  const mobileMetricOpacities = Array.from({ length: NUM_METRICS }, (_, i) =>
    interpolate(frame, [52 + i * 5, 64 + i * 5], [0, 1], { extrapolateRight: 'clamp' })
  );
  const mobileMetricYs = Array.from({ length: NUM_METRICS }, (_, i) =>
    interpolate(frame, [52 + i * 5, 64 + i * 5], [8, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // Desktop metric row stagger — starts at frame 58
  const desktopMetricOpacities = Array.from({ length: NUM_METRICS }, (_, i) =>
    interpolate(frame, [58 + i * 5, 70 + i * 5], [0, 1], { extrapolateRight: 'clamp' })
  );
  const desktopMetricYs = Array.from({ length: NUM_METRICS }, (_, i) =>
    interpolate(frame, [58 + i * 5, 70 + i * 5], [8, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // Bottom banner
  const bannerOpacity = interpolate(frame, [88, 100], [0, 1],  { extrapolateRight: 'clamp' });
  const bannerY       = interpolate(frame, [88, 100], [12, 0], { extrapolateRight: 'clamp', easing: ease });

  // Performance insights strip
  const insightOps = ([0, 1, 2, 3] as const).map(i =>
    interpolate(frame, [96 + i * 4, 110 + i * 4], [0, 1], { extrapolateRight: 'clamp' })
  );
  const insightYs = ([0, 1, 2, 3] as const).map(i =>
    interpolate(frame, [96 + i * 4, 110 + i * 4], [12, 0], { extrapolateRight: 'clamp', easing: ease })
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

        {/* ── Main 2-col (fixed height, not stretching) ── */}
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
              dialId="performance"
              gradStart="#ef4444"
              gradMid="#f59e0b"
              gradEnd="#22c55e"
              label={data.sidebarLabel ?? 'Performance'}
              subtitle={data.sidebarSubtitle ?? 'How fast and responsive your website is for users'}
              labelOpacity={labelOpacity}
              size={300}
            />
          </div>

          {/* ══ RIGHT: Mobile + Desktop cards (content-sized, no stretch) ══ */}
          <div style={{
            padding: '24px 28px 20px 24px',
            display: 'flex', flexDirection: 'column', gap: 16,
            opacity: panelOpacity,
            transform: `translateX(${rightX}px)`,
          }}>
            {/* Mobile + Desktop cards — no flex:1, size to content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <PerformanceMetricsCard
                device="mobile"
                score={animatedMobileScore}
                metrics={mobileMetrics}
                accentColor={ACCENT}
                opacity={mobileOpacity}
                translateY={mobileCardY}
                metricOpacities={mobileMetricOpacities}
                metricTranslateYs={mobileMetricYs}
              />
              <PerformanceMetricsCard
                device="desktop"
                score={animatedDesktopScore}
                metrics={desktopMetrics}
                accentColor={ACCENT}
                opacity={desktopOpacity}
                translateY={desktopCardY}
                metricOpacities={desktopMetricOpacities}
                metricTranslateYs={desktopMetricYs}
              />
            </div>
          </div>
        </div>

        {/* ── Insight banner ── */}
        <div style={{
          padding: '0 28px',
          opacity: bannerOpacity,
          transform: `translateY(${bannerY}px)`,
          marginBottom: 24,
        }}>
          <InsightBanner
            iconEl={BannerIcon}
            title={data.bannerTitle ?? 'Performance is impacting your website experience.'}
            subtitle={data.bannerSubtitle ?? 'Slow page speed increases bounce rates and reduces conversions. Core Web Vitals are a confirmed Google ranking factor.'}
            background="linear-gradient(135deg, #1c1200 0%, #140e00 60%, #100a00 100%)"
            borderColor="#3d2800"
            opacity={1}
            translateY={0}
            padding="26px 30px"
          />
        </div>

        {/* ── Performance Insights strip ── */}
        <div style={{ padding: '16px 28px 0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          {/* Header */}
          <div style={{
            fontSize: 12, fontWeight: 900, letterSpacing: '3px',
            textTransform: 'uppercase', color: '#f59e0b',
            marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
            opacity: insightOps[0],
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#f59e0b',
              boxShadow: '0 0 8px #f59e0b, 0 0 16px #f59e0b',
            }} />
            Performance Insights
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, paddingBottom: 20 }}>
            {([
              {
                metric: 'LCP',
                full: 'Largest Contentful Paint',
                value: mobileData.lcp ?? '4.2s',
                rating: mobileData.lcpRating ?? 'poor',
                tip: 'Optimize images and server response time to reduce LCP below 2.5s.',
              },
              {
                metric: 'FCP',
                full: 'First Contentful Paint',
                value: mobileData.fcp ?? '2.1s',
                rating: mobileData.fcpRating ?? 'needs-improvement',
                tip: 'Eliminate render-blocking resources and defer non-critical CSS.',
              },
              {
                metric: 'CLS',
                full: 'Cumulative Layout Shift',
                value: mobileData.cls ?? '0.14',
                rating: mobileData.clsRating ?? 'needs-improvement',
                tip: 'Set explicit size attributes on images and embeds to prevent layout shifts.',
              },
              {
                metric: 'TBT',
                full: 'Total Blocking Time',
                value: mobileData.tbt ?? '520ms',
                rating: mobileData.tbtRating ?? 'poor',
                tip: 'Break up long JavaScript tasks and reduce third-party script load.',
              },
            ] as const).map((insight, i) => {
              const ratingColor = insight.rating === 'poor' ? '#ef4444' : insight.rating === 'needs-improvement' ? '#f59e0b' : '#22c55e';
              const ratingLabel = insight.rating === 'poor' ? 'Poor' : insight.rating === 'needs-improvement' ? 'Needs Work' : 'Good';
              return (
                <div key={i} style={{
                  background: 'linear-gradient(135deg, #0e0a02 0%, #0a0c18 100%)',
                  border: `1px solid ${ratingColor}28`,
                  borderRadius: 12,
                  padding: '20px 18px',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  opacity: insightOps[i],
                  transform: `translateY(${insightYs[i]}px)`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: ratingColor, letterSpacing: '-0.5px' }}>{insight.metric}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '1px',
                      color: ratingColor, background: `${ratingColor}18`,
                      border: `1px solid ${ratingColor}40`,
                      borderRadius: 20, padding: '2px 8px',
                    }}>{ratingLabel}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7a9e', marginBottom: 2 }}>{insight.full}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{insight.value}</div>
                  <div style={{ fontSize: 11.5, color: '#5a6680', lineHeight: 1.5, marginTop: 2 }}>{insight.tip}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
