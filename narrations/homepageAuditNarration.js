/**
 * Homepage Audit Narration  v6
 * Structure per section: Score → Finding → Why it matters.
 * 3–4 short sentences per section. Target total: 2–3 minutes.
 * No educational lectures. No generic filler. No number-only reading.
 *
 * v6 changes vs v5:
 *   - _s1_intro:        STATIC — professional enterprise tone, no scores/counts
 *   - _s7_performance:  FULLY DYNAMIC — 4-paragraph structure using actual Core
 *                       Web Vital values; only failing metrics mentioned
 *   - _s11_finalSummary: STATIC — professional audit conclusion, no scores/lists
 *
 * v7: _s2_overallScore's healthLabel now derives from the shared scoreBands
 * (canonical: A>=85, B>=70, C>=50, else F) instead of its own 80/60 cutoffs,
 * matching the backend's grade formula. Adds an "excellent health" tier for
 * scores >= 85 that the old 2-cutoff scheme didn't distinguish.
 */

const { getScoreTier } = require('../shared/homepageAuditConstants');

function generateScript(videoProps) {
  return [
    _s1_intro(videoProps),
    _s2_overallScore(videoProps),
    _s3_onPage(videoProps),
    _s4_technical(videoProps),
    _s5_security(videoProps),
    _s6_aiVisibility(videoProps),
    _s7_performance(videoProps),
    _s8_accessibility(videoProps),
    _s9_socialSignals(videoProps),
    _s10_googleBusiness(videoProps),
    _s11_finalSummary(videoProps),
  ];
}

// ── Section 1: Intro (STATIC) ─────────────────────────────────────────────────
function _s1_intro() {
  return (
    `This homepage audit was completed using Odito AI. ` +
    `We analyzed your website across SEO, Technical Health, Security, AI Visibility, Performance, Accessibility, Social Presence, and Local SEO signals. ` +
    `Let's begin with your overall website health score.`
  );
}

// ── Section 2: Overall Health Score ──────────────────────────────────────────
function _s2_overallScore({ scores, issueDistribution }) {
  const overall  = scores.overall             || 0;
  const total    = issueDistribution.total    || 0;
  const critical = issueDistribution.critical || 0;
  const warnings = issueDistribution.warnings || 0;
  const passed   = issueDistribution.passed   || 0;

  const HEALTH_LABELS = {
    excellent: 'excellent health',
    good: 'good health',
    'needs-improvement': 'moderate health',
    poor: 'needs improvement',
  };
  const healthLabel = HEALTH_LABELS[getScoreTier(overall)];

  return (
    `Your overall website health score is ${overall} out of 100, placing it in ${healthLabel}. ` +
    `Across all audit checks, we identified ${total} total ${_plural(total, 'issue', 'issues')}, ` +
    `including ${critical} critical ${_plural(critical, 'finding', 'findings')} and ${warnings} ${_plural(warnings, 'warning', 'warnings')}. ` +
    `${passed > 0 ? `${passed} ${_plural(passed, 'check', 'checks')} passed successfully. ` : ''}` +
    `Let's walk through each area in detail.`
  );
}

// ── Section 3: On-Page SEO ────────────────────────────────────────────────────
function _s3_onPage({ scores, onPage }) {
  const score         = scores.seo             || 0;
  const issueCount    = onPage.issueCount      || 0;
  const criticalCount = onPage.criticalCount   || 0;

  const criticalClause = criticalCount > 0
    ? `, including ${criticalCount} critical ${_plural(criticalCount, 'issue', 'issues')}`
    : '';

  return (
    `Your On-Page SEO score is ${score} percent. ` +
    `We identified ${issueCount} optimization ${_plural(issueCount, 'opportunity', 'opportunities')}${criticalClause}. ` +
    `These issues affect how search engines read and rank your content.`
  );
}

// ── Section 4: Technical SEO ──────────────────────────────────────────────────
function _s4_technical({ scores, technical }) {
  const score         = scores.technicalHealth  || 0;
  const checksCount   = technical.checksCount   || 0;
  const issueCount    = technical.issueCount    || 0;
  const criticalCount = technical.criticalCount || 0;

  const criticalClause = criticalCount > 0
    ? `, ${criticalCount} of them critical`
    : '';

  return (
    `Your Technical SEO score is ${score} percent. ` +
    `Across ${checksCount} technical ${_plural(checksCount, 'check', 'checks')}, we found ${issueCount} ${_plural(issueCount, 'issue', 'issues')}${criticalClause}. ` +
    `Technical issues can prevent search engines from properly crawling and indexing your site.`
  );
}

// ── Section 5: Security ───────────────────────────────────────────────────────
function _s5_security({ scores, security }) {
  const score         = scores.security         || 0;
  const issueCount    = security.issueCount     || 0;
  const criticalCount = security.criticalCount  || 0;

  const criticalClause = criticalCount > 0
    ? `, including ${criticalCount} critical ${_plural(criticalCount, 'finding', 'findings')}`
    : '';

  return (
    `Your Security score is ${score} percent. ` +
    `We found ${issueCount} security-related ${_plural(issueCount, 'issue', 'issues')}${criticalClause}. ` +
    `Missing security headers reduce trust signals for both users and search engines.`
  );
}

// ── Section 6: AI Visibility ──────────────────────────────────────────────────
function _s6_aiVisibility({ scores, aiVisibility }) {
  const score         = scores.aiVisibility        || 0;
  const issueCount    = aiVisibility.issueCount     || 0;
  const criticalCount = aiVisibility.criticalCount  || 0;

  const criticalClause = criticalCount > 0
    ? `, including ${criticalCount} critical`
    : '';

  return (
    `Now let's look at one of the most important areas for modern websites. ` +
    `AI systems like ChatGPT, Claude, Gemini, and Perplexity reference websites when answering questions. ` +
    `Your AI Visibility score is ${score} percent, with ${issueCount} ${_plural(issueCount, 'issue', 'issues')} identified${criticalClause}. ` +
    `Improving these signals increases your chances of appearing in AI-generated answers and recommendations.`
  );
}

// ── Section 7: Performance (STATIC) ──────────────────────────────────────────
function _s7_performance() {
  return (
    `Your homepage performance requires improvement across several Core Web Vital metrics. ` +
    `The analysis identified opportunities related to content rendering speed, visual stability, and page responsiveness. ` +
    `Addressing these areas can help deliver a faster and more consistent user experience.`
  );
}

// ── Section 8: Accessibility ──────────────────────────────────────────────────
function _s8_accessibility({ scores, accessibility }) {
  const score         = scores.accessibility        || 0;
  const issueCount    = accessibility.issueCount    || 0;
  const criticalCount = accessibility.criticalCount || 0;

  const criticalClause = criticalCount > 0
    ? `, including ${criticalCount} critical ${_plural(criticalCount, 'finding', 'findings')}`
    : '';

  return (
    `Your Accessibility score is ${score} percent. ` +
    `We found ${issueCount} accessibility ${_plural(issueCount, 'issue', 'issues')}${criticalClause}. ` +
    `These issues can affect usability for visitors and may impact compliance and search performance.`
  );
}

// ── Section 9: Social Signals ─────────────────────────────────────────────────
function _s9_socialSignals({ social }) {
  const connected = social.connectedCount || 0;
  const missing   = social.missingCount   || 0;

  return (
    `We detected ${connected} connected social ${_plural(connected, 'profile', 'profiles')} and ${missing} missing. ` +
    `A strong social presence reinforces your brand authority and builds trust signals across the web.`
  );
}

// ── Section 10: Google Business Presence ─────────────────────────────────────
function _s10_googleBusiness({ googleBusinessPresence }) {
  const gbp = googleBusinessPresence || {};

  if (!gbp.found) {
    return (
      `We could not find a verified Google Business Profile for this business. ` +
      `Claiming your profile is one of the fastest ways to improve visibility in Google Search and Maps.`
    );
  }

  const rating      = gbp.rating      != null ? gbp.rating.toFixed(1) : '0.0';
  const reviewCount = gbp.reviewCount != null ? gbp.reviewCount        : 0;

  return (
    `Your Google Business Profile is verified. ` +
    `Your business currently holds a ${rating}-star rating based on ${reviewCount} customer ${_plural(reviewCount, 'review', 'reviews')}. ` +
    `A complete and active profile improves your visibility in Google Search and Maps.`
  );
}

// ── Section 11: Final Summary (STATIC) ───────────────────────────────────────
function _s11_finalSummary() {
  return (
    `The homepage audit is now complete. ` +
    `This report highlights the most important opportunities identified during the analysis. ` +
    `Thank you for using Odito AI Website Audit.`
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _plural(count, singular, plural) {
  return count === 1 ? singular : plural;
}


module.exports = { generateScript };
