import type { FC, ReactElement } from 'react';
import { AbsoluteFill, interpolate, Easing, useCurrentFrame } from 'remotion';
import { AuditStepNav } from './components/AuditStepNav';
import type { AuditStepItem } from './components/AuditStepNav';
import { LocalBusinessProfileCard } from './components/LocalBusinessProfileCard';
import { LocalBusinessChecklistCard } from './components/LocalBusinessChecklistCard';
import type { ChecklistItem } from './components/LocalBusinessChecklistCard';
import { LocalSeoOpportunityCard } from './components/LocalSeoOpportunityCard';
import type { ImpactLevel } from './components/LocalSeoOpportunityCard';
import { InsightBanner } from './components/InsightBanner';

// ── Step nav — step 10 active, indigo theme ───────────────────────────────────

const LOCAL_BUSINESS_STEPS: AuditStepItem[] = [
  { number: 1,  label: 'Intro',          state: 'done'   },
  { number: 2,  label: 'Overall Score',  state: 'done'   },
  { number: 3,  label: 'On-Page SEO',    state: 'done'   },
  { number: 4,  label: 'Technical',      state: 'done'   },
  { number: 5,  label: 'Security',       state: 'done'   },
  { number: 6,  label: 'AI Visibility',  state: 'done'   },
  { number: 7,  label: 'Performance',    state: 'done'   },
  { number: 8,  label: 'Accessibility',  state: 'done'   },
  { number: 9,  label: 'Social',         state: 'done'   },
  { number: 10, label: 'Local SEO',      state: 'active' },
];

// ── Data contract ─────────────────────────────────────────────────────────────

export interface LocalSeoOpportunity {
  iconType: string;
  title: string;
  description: string;
  impact: ImpactLevel;
}

export interface LocalBusinessData {
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  steps?: AuditStepItem[];

  // Business profile card
  businessName?: string;
  category?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
  website?: string;
  businessHours?: string;

  // Checklist
  checklistHeader?: string;
  checklist?: ChecklistItem[];

  // Opportunities
  opportunitiesHeader?: string;
  opportunitiesSubtitle?: string;
  opportunities?: LocalSeoOpportunity[];

  // Pro tip
  proTipText?: string;
  proTipHighlight?: string;

  // Banner
  bannerTitle?: string;
  bannerSubtitle?: string;
}

// ── Default data ──────────────────────────────────────────────────────────────

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { iconType: 'verified', label: 'Verified Business', status: 'connected' },
  { iconType: 'phone',    label: 'Phone Number',      status: 'connected' },
  { iconType: 'website',  label: 'Website',           status: 'connected' },
  { iconType: 'address',  label: 'Business Address',  status: 'connected' },
  { iconType: 'photos',   label: 'Photos Added',      status: 'warning'   },
  { iconType: 'services', label: 'Services Added',    status: 'warning'   },
  { iconType: 'posts',    label: 'Recent Posts',      status: 'missing'   },
];

const DEFAULT_OPPORTUNITIES: LocalSeoOpportunity[] = [
  { iconType: 'services', title: 'Missing Services',  description: 'Add more services to help customers understand what you offer.',              impact: 'High'   },
  { iconType: 'reviews',  title: 'Low Review Count',  description: 'Get more customer reviews to build trust and improve local rankings.',       impact: 'Medium' },
  { iconType: 'posts',    title: 'No Recent Posts',   description: 'Regular posts keep your profile active and engage local customers.',         impact: 'High'   },
];

// ── Opportunity icon registry ─────────────────────────────────────────────────

interface OppIconEntry { iconEl: ReactElement; iconBg: string }

const OPP_ICONS: Record<string, OppIconEntry> = {
  services: {
    iconEl: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    iconBg: 'rgba(220,50,50,.18)',
  },
  reviews: {
    iconEl: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    iconBg: 'rgba(245,158,11,.15)',
  },
  posts: {
    iconEl: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    iconBg: 'rgba(220,50,50,.18)',
  },
};

const FALLBACK_OPP: OppIconEntry = {
  iconEl: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  iconBg: 'rgba(99,102,241,.15)',
};

// ── Theme ─────────────────────────────────────────────────────────────────────

const ACCENT = '#6366f1'; // indigo — distinct from Screen 8's #7c6cf8

// ── Inline Pro Tip card ───────────────────────────────────────────────────────

function ProTipCard({
  text = 'Businesses with complete profiles and regular updates get 70% more clicks and higher local visibility.',
  highlight = '70% more clicks',
  opacity = 1,
  translateY = 0,
}: { text?: string; highlight?: string; opacity?: number; translateY?: number }) {
  const parts = text.split(highlight);
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1640 0%, #131230 100%)',
      border: '1px solid rgba(99,102,241,.3)',
      borderRadius: 14,
      padding: '20px 18px 18px',
      display: 'flex', flexDirection: 'column', gap: 12,
      opacity,
      transform: `translateY(${translateY}px)`,
    }}>
      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'rgba(99,102,241,.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
          stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="18" x2="15" y2="18" />
          <line x1="10" y1="22" x2="14" y2="22" />
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
        </svg>
      </div>

      {/* Pro Tip label */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
        textTransform: 'uppercase', color: '#a5b4fc',
      }}>
        Pro Tip
      </div>

      {/* Text with highlighted portion */}
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.6, flex: 1 }}>
        {parts[0]}
        <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{highlight}</span>
        {parts[1]}
      </div>
    </div>
  );
}

// ── Banner icon ───────────────────────────────────────────────────────────────

const BannerIcon = (
  <div style={{
    width: 52, height: 52, borderRadius: '50%',
    background: 'rgba(99,102,241,.2)', border: '1.5px solid rgba(99,102,241,.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  </div>
);

// ── Decorative map pin art for banner right side ──────────────────────────────

const MapPinArt = (
  <svg viewBox="0 0 200 120" width="200" height="120" style={{ opacity: 0.6 }}>
    {/* Grid lines */}
    {[0, 30, 60, 90, 120].map((y) => (
      <line key={y} x1="0" y1={y} x2="200" y2={y}
        stroke="rgba(99,102,241,.15)" strokeWidth="1" />
    ))}
    {[0, 40, 80, 120, 160, 200].map((x) => (
      <line key={x} x1={x} y1="0" x2={x} y2="120"
        stroke="rgba(99,102,241,.15)" strokeWidth="1" />
    ))}
    {/* Glow under pin */}
    <ellipse cx="140" cy="100" rx="38" ry="10"
      fill="rgba(99,102,241,.3)" />
    <ellipse cx="140" cy="100" rx="22" ry="5"
      fill="rgba(99,102,241,.5)" />
    {/* Map pin */}
    <path d="M140 30 C121 30 107 44 107 61 C107 80 140 100 140 100 C140 100 173 80 173 61 C173 44 159 30 140 30 Z"
      fill="rgba(99,102,241,.35)" stroke="#a5b4fc" strokeWidth="2" />
    <circle cx="140" cy="61" r="10"
      fill="#a5b4fc" />
    {/* Small dots */}
    <circle cx="80"  cy="45" r="3" fill="rgba(165,180,252,.4)" />
    <circle cx="60"  cy="80" r="2" fill="rgba(165,180,252,.3)" />
    <circle cx="175" cy="40" r="2" fill="rgba(165,180,252,.3)" />
    <circle cx="50"  cy="55" r="1.5" fill="rgba(165,180,252,.25)" />
  </svg>
);

// ── Scene ─────────────────────────────────────────────────────────────────────

export const LocalBusinessScene: FC<{ data: LocalBusinessData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const ease  = Easing.out(Easing.cubic);

  const businessName  = data.businessName  ?? 'Elite Dental Care';
  const category      = data.category      ?? 'Dental Clinic';
  const verified      = data.verified      ?? true;
  const rating        = data.rating        ?? 4.6;
  const reviewCount   = data.reviewCount   ?? 245;
  const address       = data.address       ?? '1234 Healthcare Blvd, San Francisco, CA 94107, USA';
  const phone         = data.phone         ?? '(415) 555-3498';
  const website       = data.website       ?? 'www.elitedentalcare.com';
  const businessHours = data.businessHours ?? 'Mon – Fri: 9:00 AM – 6:00 PM  •  Sat: 9:00 AM – 2:00 PM';
  const checklist     = data.checklist     ?? DEFAULT_CHECKLIST;
  const opportunities = data.opportunities ?? DEFAULT_OPPORTUNITIES;
  const steps         = data.steps         ?? LOCAL_BUSINESS_STEPS;

  // ── Animation values ─────────────────────────────────────────────────────────

  const globalOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const navY          = interpolate(frame, [0, 20], [-28, 0], { extrapolateRight: 'clamp', easing: ease });

  // Page header
  const headerOpacity = interpolate(frame, [8, 22], [0, 1],  { extrapolateRight: 'clamp' });
  const headerY       = interpolate(frame, [8, 22], [10, 0], { extrapolateRight: 'clamp', easing: ease });

  // Business profile card (left)
  const profileOpacity = interpolate(frame, [12, 28], [0, 1],   { extrapolateRight: 'clamp' });
  const profileX       = interpolate(frame, [12, 28], [-30, 0],  { extrapolateRight: 'clamp', easing: ease });

  // Checklist card (right)
  const checklistOpacity = interpolate(frame, [18, 34], [0, 1],  { extrapolateRight: 'clamp' });
  const checklistX       = interpolate(frame, [18, 34], [30, 0], { extrapolateRight: 'clamp', easing: ease });

  // Checklist items stagger (start frame 30, 4-frame gap)
  const itemOpacities = checklist.map((_, i) =>
    interpolate(frame, [30 + i * 4, 44 + i * 4], [0, 1], { extrapolateRight: 'clamp' })
  );
  const itemYs = checklist.map((_, i) =>
    interpolate(frame, [30 + i * 4, 44 + i * 4], [8, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // Opportunities header
  const oppHeaderOpacity = interpolate(frame, [56, 68], [0, 1],  { extrapolateRight: 'clamp' });
  const oppHeaderY       = interpolate(frame, [56, 68], [8, 0],  { extrapolateRight: 'clamp', easing: ease });

  // Opportunity cards stagger (start frame 62, 6-frame gap)
  const totalCards = opportunities.length + 1; // +1 for pro tip
  const cardOpacities = Array.from({ length: totalCards }, (_, i) =>
    interpolate(frame, [62 + i * 6, 76 + i * 6], [0, 1], { extrapolateRight: 'clamp' })
  );
  const cardYs = Array.from({ length: totalCards }, (_, i) =>
    interpolate(frame, [62 + i * 6, 76 + i * 6], [14, 0], { extrapolateRight: 'clamp', easing: ease })
  );

  // Bottom banner
  const bannerOpacity = interpolate(frame, [86, 98], [0, 1],  { extrapolateRight: 'clamp' });
  const bannerY       = interpolate(frame, [86, 98], [12, 0], { extrapolateRight: 'clamp', easing: ease });

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

        <div style={{ padding: '22px 60px 24px' }}>

          {/* Page header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            marginBottom: 20,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(99,102,241,.2)', border: '1px solid rgba(99,102,241,.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                Local Business Presence
              </div>
              <div style={{ fontSize: 13.5, color: '#6b7a9e', marginTop: 3 }}>
                Google Business Profile audit for your business
              </div>
            </div>
          </div>

          {/* Main 2-col: profile card + checklist */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 420px',
            gap: 16,
            marginBottom: 20,
          }}>
            <LocalBusinessProfileCard
              businessName={businessName}
              category={category}
              verified={verified}
              rating={rating}
              reviewCount={reviewCount}
              address={address}
              phone={phone}
              website={website}
              businessHours={businessHours}
              opacity={profileOpacity}
              translateX={profileX}
            />
            <LocalBusinessChecklistCard
              header={data.checklistHeader}
              items={checklist}
              itemOpacities={itemOpacities}
              itemTranslateYs={itemYs}
              opacity={checklistOpacity}
              translateX={checklistX}
            />
          </div>

          {/* Opportunities section header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            marginBottom: 14,
            opacity: oppHeaderOpacity,
            transform: `translateY(${oppHeaderY}px)`,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                {data.opportunitiesHeader ?? 'Top Local SEO Opportunities'}
              </div>
              <div style={{ fontSize: 12.5, color: '#6b7a9e', marginTop: 2 }}>
                {data.opportunitiesSubtitle ?? 'Focus on these areas to improve your local visibility'}
              </div>
            </div>
          </div>

          {/* Opportunity cards + pro tip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${opportunities.length + 1}, 1fr)`,
            gap: 14,
            marginBottom: 20,
          }}>
            {opportunities.map((opp, i) => {
              const icon = OPP_ICONS[opp.iconType] ?? FALLBACK_OPP;
              return (
                <LocalSeoOpportunityCard
                  key={i}
                  iconEl={icon.iconEl}
                  iconBg={icon.iconBg}
                  title={opp.title}
                  description={opp.description}
                  impact={opp.impact}
                  opacity={cardOpacities[i] ?? 1}
                  translateY={cardYs[i] ?? 0}
                />
              );
            })}
            <ProTipCard
              text={data.proTipText}
              highlight={data.proTipHighlight}
              opacity={cardOpacities[opportunities.length] ?? 1}
              translateY={cardYs[opportunities.length] ?? 0}
            />
          </div>

          {/* Bottom banner */}
          <InsightBanner
            iconEl={BannerIcon}
            title={data.bannerTitle ?? 'Your business is easy to find and well represented.'}
            subtitle={data.bannerSubtitle ?? 'Keep your profile updated and get more reviews to dominate local search results.'}
            background="linear-gradient(130deg, #0e1028 0%, #141240 100%)"
            borderColor="rgba(99,102,241,.25)"
            rightEl={MapPinArt}
            opacity={bannerOpacity}
            translateY={bannerY}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
