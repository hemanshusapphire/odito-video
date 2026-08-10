import type { FC, CSSProperties } from 'react';
import { AbsoluteFill, interpolate, spring, Easing, useCurrentFrame, useVideoConfig } from 'remotion';

type IconKey = 'seo' | 'performance' | 'security' | 'aiVisibility' | 'accessibility' | 'localSeo';
interface Category { label: string; iconKey: IconKey; }

export interface IntroSceneData {
  brandName?: string; brandSuffix?: string;
  titleLine1?: string; titleLine2?: string;
  categories?: Category[]; websiteUrl?: string;
  // Legacy (not rendered)
  scanLabel?: string; completeTitle?: string; leftSubtitle?: string;
  auditStatusLabel?: string; analyzingLabel?: string; pagesAnalyzed?: number;
  pagesLabel?: string; issuesFound?: number; issuesLabel?: string;
  completeSubtitle?: string; footerPrefix?: string; footerBrand?: string;
  // Dynamic scores
  seoScore?: number;
  performanceScore?: number;
  securityScore?: number;
  aiVisibilityScore?: number;
  accessibilityScore?: number;
  localSeoScore?: number;
  totalChecks?: number;
}

interface CatConfig { label: string; iconKey: IconKey; color: string; }

const DEFAULT_CATS: CatConfig[] = [
  { label: 'SEO',           iconKey: 'seo',           color: '#3b82f6' },
  { label: 'Performance',   iconKey: 'performance',   color: '#f59e0b' },
  { label: 'Security',      iconKey: 'security',      color: '#ef4444' },
  { label: 'AI Visibility', iconKey: 'aiVisibility',  color: '#a855f7' },
  { label: 'Accessibility', iconKey: 'accessibility', color: '#22c55e' },
  { label: 'Local SEO',     iconKey: 'localSeo',      color: '#06b6d4' },
];

const CAPABILITIES = [
  'SEO Analysis',          'Performance Benchmarking',
  'Security Assessment',   'AI Visibility Analysis',
  'Accessibility Review',  'Local SEO Presence',
];

const DELIVER_STATS = [
  { value: '6',   label: 'Audit Categories' },
  { value: '50+', label: 'Validation Checks' },
  { value: 'AI',  label: 'Powered Recommendations' },
  { value: '1pg', label: 'Homepage Report' },
];

const SCOPE_ITEMS = [
  'Search Engine Optimization', 'Website Performance',
  'Security & Protection', 'AI Search Visibility',
  'Accessibility Compliance', 'Local Search Presence',
];

const CARD_DETAILS: { checks: string[]; desc: string; progress: number }[] = [
  { checks: ['Meta Tags', 'Headings', 'Content Structure'],                desc: 'Improves search visibility and rankings',        progress: 82 },
  { checks: ['Core Web Vitals', 'Load Speed', 'User Experience'],          desc: 'Improves speed and conversion rates',             progress: 65 },
  { checks: ['HTTPS', 'Security Headers', 'Vulnerability Checks'],         desc: 'Protects visitors and builds trust',              progress: 78 },
  { checks: ['LLM Readability', 'Structured Content', 'AI Discoverability'], desc: 'Helps AI systems understand your website',     progress: 58 },
  { checks: ['WCAG Compliance', 'Screen Readers', 'Keyboard Navigation'],  desc: 'Makes your website accessible to all users',     progress: 72 },
  { checks: ['Google Business Profile', 'Reviews', 'Business Presence'],   desc: 'Improves local search visibility',               progress: 55 },
];

interface Particle { x: number; bottom: number; delay: number; duration: number; size: number; isPurple: boolean; }
const PARTICLES: Particle[] = (() => {
  let s = 42;
  const r = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296; };
  return Array.from({ length: 18 }, (): Particle => ({
    x: 80 + r() * 220, bottom: 20 + r() * 50,
    delay: r() * 3, duration: 2 + r() * 2,
    size: r() < 0.4 ? 3 : 2, isPurple: r() < 0.3,
  }));
})();

interface IconProps { color: string; size: number; }
const IconSEO: FC<IconProps> = ({ color, size }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><line x1="17" y1="17" x2="21" y2="21" />
  </svg>
);
const IconPerformance: FC<IconProps> = ({ color, size }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconSecurity: FC<IconProps> = ({ color, size }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" />
    <polyline points="9,12 11,14 15,10" />
  </svg>
);
const IconAI: FC<IconProps> = ({ color, size }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
    <rect x="7" y="8" width="10" height="9" rx="2" />
    <line x1="12" y1="8" x2="12" y2="5" />
    <circle cx="12" cy="4.2" r="1.2" fill={color} />
    <line x1="7" y1="13" x2="5" y2="13" /><line x1="17" y1="13" x2="19" y2="13" />
    <circle cx="10" cy="12" r="1.1" fill={color} /><circle cx="14" cy="12" r="1.1" fill={color} />
    <line x1="10" y1="17" x2="9" y2="20" /><line x1="14" y1="17" x2="15" y2="20" />
  </svg>
);
const IconA11y: FC<IconProps> = ({ color, size }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="8" r="2" />
    <line x1="12" y1="10" x2="12" y2="16" /><line x1="9" y1="13" x2="15" y2="13" />
    <line x1="12" y1="16" x2="10" y2="19" /><line x1="12" y1="16" x2="14" y2="19" />
  </svg>
);
const IconLocal: FC<IconProps> = ({ color, size }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const ICON_MAP: Record<IconKey, FC<IconProps>> = {
  seo: IconSEO, performance: IconPerformance, security: IconSecurity,
  aiVisibility: IconAI, accessibility: IconA11y, localSeo: IconLocal,
};
const CatIcon: FC<IconProps & { iconKey: IconKey }> = ({ iconKey, color, size }) => {
  const C = ICON_MAP[iconKey] ?? IconSEO;
  return <C color={color} size={size} />;
};

function extractDomain(url: string): string {
  try { return new URL(url.startsWith('http') ? url : 'https://' + url).hostname.replace(/^www\./, ''); }
  catch { return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]; }
}

export const IntroScene: FC<{ data: IntroSceneData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = Easing.out(Easing.cubic);
  const cl   = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const sp   = (f: number, s: number, d: number) =>
    spring({ frame: f, fps, from: s, to: d, config: { damping: 18, stiffness: 160, mass: 1 } });

  const cats: CatConfig[] = (data.categories ?? []).length === 6
    ? (data.categories as CatConfig[]).map((c, i) => ({ ...DEFAULT_CATS[i], label: c.label, iconKey: c.iconKey }))
    : DEFAULT_CATS;

  const domain = extractDomain(data.websiteUrl ?? 'yourwebsite.com');

  const deliverStats = [
    { value: '6',   label: 'Audit Categories' },
    { value: data.totalChecks ? String(data.totalChecks) : '50+', label: 'Validation Checks' },
    { value: 'AI',  label: 'Powered Recommendations' },
    { value: '1pg', label: 'Homepage Report' },
  ];

  const cardProgress = [
    data.seoScore ?? 82,
    data.performanceScore ?? 65,
    data.securityScore ?? 78,
    data.aiVisibilityScore ?? 58,
    data.accessibilityScore ?? 72,
    data.localSeoScore ?? 55,
  ];

  // Scene 1 = 168 frames total (5.6s at 30fps).
  // All timings must complete within frame 168.

  // ─── PHASE 1+2 combined (0s → 0.8s = 0 → 24f) ───────────────────────────
  // Background + entire left panel (logo + all content) enter together.
  const bgOp   = interpolate(frame, [0, 18], [0, 1], cl);
  const leftOp = interpolate(frame, [0, 22], [0, 1], cl);
  const leftX  = interpolate(frame, [0, 24], [-100, 0], { ...cl, easing: ease });

  // Within left panel — all content visible immediately (no internal stagger)
  const logoOp  = 1;
  const titleOp = 1;
  const titleY  = 0;
  const descOp  = 1;
  const capHOp  = 1;
  const capDW   = 1;
  const capOp   = CAPABILITIES.map(() => 1);
  const capX    = CAPABILITIES.map(() => 0);
  const stOp    = 1;
  const stY     = 0;
  const badgeOp = 1;

  // ─── PHASE 3 (0.8s → 1.6s = 24 → 48f) ──────────────────────────────────
  // Right panel header: domain + completed badge + scope strip fade + rise.
  const domOp   = interpolate(frame, [24, 42], [0, 1], cl);
  const domY    = interpolate(frame, [24, 42], [30, 0], { ...cl, easing: ease });
  const doneOp  = interpolate(frame, [30, 46], [0, 1], cl);
  const scopeOp = interpolate(frame, [36, 52], [0, 1], cl);
  const scopeY  = interpolate(frame, [36, 52], [30, 0], { ...cl, easing: ease });

  // ─── PHASE 4 cards — sequential, 20f each ────────────────────────────────
  // 6 cards × 20f = 120f. Start at 48f → last card ends at 48 + 6×20 = 168f ✓
  const CARD_START = [48, 68, 88, 108, 128, 148] as const;
  const CARD_DUR   = 20;

  const cardOp: number[] = cats.map((_, i) =>
    interpolate(frame, [CARD_START[i], CARD_START[i] + CARD_DUR], [0, 1], cl)
  );
  const cardScale: number[] = cats.map((_, i) =>
    sp(Math.max(0, frame - CARD_START[i]), 0.85, 1)
  );

  // Border glow: peaks at card entrance end, then fades over 18f
  const cardGlow: number[] = cats.map((_, i) => {
    const peak = CARD_START[i] + CARD_DUR;
    if (frame < CARD_START[i]) return 0;
    if (frame <= peak) return interpolate(frame, [CARD_START[i], peak], [0, 1], cl);
    return interpolate(Math.max(0, frame - peak), [0, 18], [1, 0], cl);
  });

  // Checkpoints fade in shortly after each card header lands
  const cpOp = cats.map((_, i) =>
    interpolate(frame, [CARD_START[i] + 8, CARD_START[i] + CARD_DUR + 6], [0, 1], cl)
  );

  // Particles
  const pStates = PARTICLES.map(p => {
    const dF = p.delay * fps, cF = p.duration * fps;
    if (frame < dF) return { opacity: 0, ty: 0 };
    const t = ((frame - dF) % cF) / cF;
    const opacity = t < 0.2 ? interpolate(t, [0, 0.2], [0, 0.6]) : t < 0.8 ? 0.6 * (1 - (t - 0.2) / 0.6 * 0.4) : interpolate(t, [0.8, 1], [0.36, 0]);
    return { opacity, ty: interpolate(t, [0, 1], [0, -180]) };
  });

  const gradTxt: CSSProperties = {
    background: 'linear-gradient(120deg, #60a5fa 0%, #3b82f6 45%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  };
  const SL: CSSProperties = {
    fontSize: 9.5, fontWeight: 800, letterSpacing: '2.5px',
    textTransform: 'uppercase', color: '#1e3050',
  };

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: '#060c1a', color: '#e2e8f0', WebkitFontSmoothing: 'antialiased', overflow: 'hidden', opacity: bgOp }}>
      <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', height: '100%' }}>

        {/* ═══ LEFT PANEL ═══ */}
        <div style={{ position: 'relative', padding: '44px 44px 40px', display: 'flex', flexDirection: 'column', background: '#080e1e', borderRight: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', opacity: leftOp, transform: `translateX(${leftX}px)` }}>

          {/* Background grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
          {/* Bottom glow */}
          <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: 560, height: 280, background: 'radial-gradient(ellipse, rgba(37,99,235,0.2) 0%, transparent 68%)', pointerEvents: 'none' }} />

          {/* Particles */}
          {PARTICLES.map((p, i) => {
            const ps = pStates[i];
            return <div key={i} style={{ position: 'absolute', width: p.size, height: p.size, background: p.isPurple ? '#a855f7' : '#00d4ff', borderRadius: '50%', left: p.x, bottom: p.bottom, opacity: ps.opacity, transform: `translateY(${ps.ty}px)`, zIndex: 0 }} />;
          })}

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 30, opacity: logoOp }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#4f9cf9', boxShadow: '0 0 10px rgba(79,156,249,0.7)', flexShrink: 0 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-0.2px' }}>
                odito<span style={{ color: '#4f9cf9' }}>.ai</span>
              </div>
            </div>

            {/* Title */}
            <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)` }}>
              <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.0, letterSpacing: '-2px', color: '#fff' }}>
                {data.titleLine1 ?? 'ODITO AI'}
              </div>
              <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.0, letterSpacing: '-2px', ...gradTxt }}>
                {data.titleLine2 ?? 'WEBSITE AUDIT'}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: 14, marginBottom: 24, opacity: descOp }}>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                AI-powered auditing platform analyzing SEO, Performance, Security,<br />
                Accessibility, AI Visibility and Local SEO.
              </div>
            </div>

            {/* Capabilities */}
            <div style={{ marginBottom: 22, opacity: capHOp }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                <div style={SL}>Audit Capabilities</div>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(59,130,246,0.22), transparent)', transform: `scaleX(${capDW})`, transformOrigin: 'left' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                {CAPABILITIES.map((cap, i) => (
                  <div key={cap} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 12px', opacity: capOp[i], transform: `translateX(${capX[i]}px)` }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#22c55e', fontWeight: 900 }}>✓</div>
                    <span style={{ fontSize: 12, color: '#7a9ab8', fontWeight: 500 }}>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ marginBottom: 22, opacity: stOp, transform: `translateY(${stY}px)` }}>
              <div style={{ ...SL, marginBottom: 11 }}>What We Deliver</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {deliverStats.map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 5 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, ...gradTxt }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: '#2e4a68', lineHeight: 1.35 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom badge */}
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(37,99,235,0.07)', border: '0.5px solid rgba(37,99,235,0.18)', borderRadius: 8, padding: '12px 16px', opacity: badgeOp }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px rgba(59,130,246,0.7)', flexShrink: 0 }} />
              <div style={{ fontSize: 11.5, color: '#3a5278' }}>
                Powered by <span style={{ color: '#4f9cf9', fontWeight: 600 }}>ODITO AI</span> — Enterprise-grade homepage analysis engine
              </div>
            </div>

          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div style={{ padding: '34px 40px 34px 36px', display: 'flex', flexDirection: 'column', gap: 14, background: '#060c1a', overflow: 'hidden' }}>

          {/* Target row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ opacity: domOp, transform: `translateY(${domY}px)` }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#1e3050', marginBottom: 7 }}>Audit Target</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>{domain}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.09)', border: '0.5px solid rgba(34,197,94,0.28)', borderRadius: 6, padding: '8px 18px', opacity: doneOp, alignSelf: 'center', whiteSpace: 'nowrap' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#22c55e' }}>Homepage Audit Completed</span>
            </div>
          </div>

          {/* Scope strip */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 9, padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 20, opacity: scopeOp, transform: `translateY(${scopeY}px)` }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#1e3050', whiteSpace: 'nowrap', flexShrink: 0 }}>Scope</div>
            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '0 20px', flex: 1 }}>
              {SCOPE_ITEMS.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#3d5670', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>

          {/* Cards 3×2 grid */}
          <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 12 }}>
            {cats.map((cat, i) => {
              const detail   = CARD_DETAILS[i];
              const hex22    = `${cat.color}22`;
              const hex18    = `${cat.color}18`;
              const glowSz   = Math.round(cardGlow[i] * 18);
              const glowAlph = Math.round(cardGlow[i] * 60).toString(16).padStart(2, '0');
              return (
                <div key={cat.label} style={{
                  borderRadius: 12,
                  border: `0.5px solid ${cat.color}${cardGlow[i] > 0.05 ? '80' : '30'}`,
                  background: `${cat.color}0d`,
                  padding: '15px 15px 13px',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  position: 'relative', overflow: 'hidden',
                  opacity: cardOp[i],
                  transform: `scale(${cardScale[i]})`,
                  boxShadow: glowSz > 0 ? `0 0 ${glowSz}px ${cat.color}${glowAlph}, inset 0 0 ${Math.round(glowSz * 0.5)}px ${cat.color}18` : 'none',
                  transition: 'box-shadow 0ms',
                }}>
                  {/* Top accent line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }} />

                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: hex18, border: `1.5px solid ${cat.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px ${hex22}` }}>
                        <CatIcon iconKey={cat.iconKey} color={cat.color} size={16} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#dde6f4' }}>{cat.label}</div>
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 4, background: hex18, color: cat.color }}>
                      Analyzed
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

                  {/* Checkpoints */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, opacity: cpOp[i] }}>
                    {detail.checks.map(check => (
                      <div key={check} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,0.03)', borderRadius: 7, padding: '9px 11px' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: hex18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: cat.color }}>✓</div>
                        <div style={{ flex: 1, fontSize: 12, color: '#7a98b8', fontWeight: 500 }}>{check}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
                          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#22c55e' }}>Done</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Scan complete row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.05)', border: '0.5px solid rgba(34,197,94,0.14)', borderRadius: 6, padding: '7px 10px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.5)', flexShrink: 0 }} />
                    <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#22c55e' }}>3/3 Checks Complete</span>
                    <div style={{ flex: 1, height: 2, borderRadius: 1, background: 'rgba(34,197,94,0.15)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #22c55e, #16a34a)', borderRadius: 1 }} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 10.5, color: '#2a3f58', lineHeight: 1.35 }}>{detail.desc}</div>
                    <div style={{ width: 48, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', flexShrink: 0, marginLeft: 10 }}>
                      <div style={{ height: '100%', width: `${cardProgress[i]}%`, background: cat.color, borderRadius: 2 }} />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </AbsoluteFill>
  );
};
