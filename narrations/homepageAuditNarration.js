/**
 * Homepage Audit Narration  v4
 * Structure per section: Score → Finding → Why it matters.
 * 3–4 short sentences per section. Target total: 2–3 minutes.
 * No educational lectures. No generic filler. No number-only reading.
 */

function generateScript(videoProps) {
  return [
    _s1_intro(videoProps),
    _s2_onPage(videoProps),
    _s3_technical(videoProps),
    _s4_security(videoProps),
    _s5_aiVisibility(videoProps),
    _s6_performance(videoProps),
    _s7_accessibility(videoProps),
    _s8_socialSignals(videoProps),
    _s9_googleBusiness(videoProps),
    _s10_finalSummary(videoProps),
  ];
}

// ── Section 1: Intro ──────────────────────────────────────────────────────────
function _s1_intro({ scores, issueDistribution }) {
  const overall  = scores.overall             || 0;
  const total    = issueDistribution.total    || 0;
  const critical = issueDistribution.critical || 0;
  const warnings = issueDistribution.warnings || 0;

  return (
    `We've completed your website Homepage audit. ` +
    `Your overall score is ${overall} out of 100. ` +
    `We identified ${total} ${_plural(total, 'issue', 'issues')} across your website, ` +
    `including ${critical} critical ${_plural(critical, 'issue', 'issues')} and ${warnings} warnings. ` +
    `Here's a breakdown of what we found.`
  );
}

// ── Section 2: On-Page SEO ────────────────────────────────────────────────────
function _s2_onPage({ scores, onPage }) {
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

// ── Section 3: Technical SEO ──────────────────────────────────────────────────
function _s3_technical({ scores, technical }) {
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

// ── Section 4: Security ───────────────────────────────────────────────────────
function _s4_security({ scores, security }) {
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

// ── Section 5: AI Visibility ──────────────────────────────────────────────────
function _s5_aiVisibility({ scores, aiVisibility }) {
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

// ── Section 6: Performance ────────────────────────────────────────────────────
function _s6_performance({ scores, performance, performanceMetrics }) {
  const score        = scores.performance              || 0;
  const mobileScore  = performanceMetrics.mobileScore  || 0;
  const desktopScore = performanceMetrics.desktopScore || 0;
  const responseTime = performance.responseTime        || 'N/A';
  const issueCount   = performance.issueCount          || 0;

  return (
    `Your Performance score is ${score} percent. ` +
    `Mobile scored ${mobileScore} and desktop scored ${desktopScore}, with a server response time of ${responseTime}. ` +
    `We identified ${issueCount} performance ${_plural(issueCount, 'issue', 'issues')} that may be slowing down your website. ` +
    `Faster load times directly impact both user experience and search rankings.`
  );
}

// ── Section 7: Accessibility ──────────────────────────────────────────────────
function _s7_accessibility({ scores, accessibility }) {
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

// ── Section 8: Social Signals ─────────────────────────────────────────────────
function _s8_socialSignals({ social }) {
  const connected = social.connectedCount || 0;
  const missing   = social.missingCount   || 0;

  return (
    `We detected ${connected} connected social ${_plural(connected, 'profile', 'profiles')} and ${missing} missing. ` +
    `A strong social presence reinforces your brand authority and builds trust signals across the web.`
  );
}

// ── Section 9: Google Business Presence ──────────────────────────────────────
function _s9_googleBusiness({ googleBusinessPresence }) {
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

// ── Section 10: Final Summary ─────────────────────────────────────────────────
function _s10_finalSummary({ topIssues4, scores }) {
  const issues  = (topIssues4 || []).filter(Boolean);
  const overall = scores.overall || 0;

  const listText = issues.length > 0
    ? issues.map((t, i) => `${i + 1}. ${t}`).join('. ')
    : 'Multiple optimization opportunities were identified.';

  return (
    `Here are the top opportunities from your audit. ` +
    `${listText}. ` +
    `Your overall score is ${overall} out of 100. ` +
    `Your complete OditoAI report contains detailed findings and next steps for every issue identified.`
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _plural(count, singular, plural) {
  return count === 1 ? singular : plural;
}

module.exports = { generateScript };
