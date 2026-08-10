/**
 * Homepage Audit Snapshot Adapter  v3
 * Transforms HomepageAudit.snapshot into the 11-slide video props structure.
 *
 * SOURCE:  HomepageAudit.snapshot  (finalized, patched)
 * OUTPUT:  videoProps               (11-slide data structure)
 *
 * Pure function — no async, no I/O, no network calls.
 *
 * v3 changes vs v2
 *   - Added `platform` key to social platform objects (fixes icon registry lookup)
 *   - Added `verified` + `businessHours` to googleBusinessPresence
 *   - Added mobilePerfMetrics / desktopPerfMetrics sub-objects with rated values
 *   - Added P2 transformation outputs: onPageFindings, technicalFindings,
 *     securityIssues, aiIssues, accessibilityIssues
 *   - Added `missingLabels` count derived from aria/label-related a11y checks
 *   - Added `opportunities` array for Final CTA scene (score-derived)
 *   - Added `socialScore` derived from connected-profile ratio
 *
 * v4: CWV thresholds and severity color/badge/impact maps now sourced from
 * the shared constants module (../shared/homepageAuditConstants), instead of
 * locally-duplicated tables. This also fixes a pre-existing inconsistency
 * where _transformTechnicalFindings used #f97316 for 'medium' severity while
 * _transformSecurityIssues used #f59e0b for the same severity — both now use
 * the single canonical #f59e0b.
 */

const {
  getSeverityColorHex,
  getSeverityVideoBadge,
  getSeverityVideoImpact,
  rateCwvMetric,
  parseCwvValueToMs,
} = require('../shared/homepageAuditConstants');

function adapt(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('homepageAuditAdapter: snapshot is required');
  }

  const perf     = snapshot.performance || {};
  const sections = snapshot.sections    || {};
  const summary  = sections.summary    || {};
  const pageInfo = snapshot.page_info  || {};

  // ── Display name ─────────────────────────────────────────────────────────────
  const projectName = pageInfo.title
    || (snapshot.url ? _domainFromUrl(snapshot.url) : 'Website Audit');

  // ── Performance ───────────────────────────────────────────────────────────────
  const performanceScore = perf.score ?? snapshot.performance_score ?? null;
  const mobile  = perf.mobile  || {};
  const desktop = perf.desktop || {};

  // ── Per-section check arrays ──────────────────────────────────────────────────
  const onPageChecks = sections.on_page?.checks      || [];
  const techChecks   = sections.technical?.checks    || [];
  const secChecks    = sections.security?.checks     || [];
  const aiChecksArr  = sections.ai?.checks           || [];
  const perfChecks   = sections.performance?.checks  || [];
  const a11yChecks   = sections.accessibility?.checks || [];

  const _failed   = (arr) => arr.filter(c => c.status !== 'pass');
  const _critical = (arr) => _failed(arr).filter(c =>
    c.severity === 'critical' || c.severity === 'high'
  );

  // ── Scores object (shared everywhere) ────────────────────────────────────────
  const scores = {
    overall:         snapshot.score             || 0,
    seo:             snapshot.on_page_score     || 0,
    technicalHealth: snapshot.technical_score   || 0,
    aiVisibility:    snapshot.ai_score          || 0,
    performance:     performanceScore           || 0,
    accessibility:   sections.accessibility?.score || 0,
    security:        snapshot.security_score    || 0,
  };

  // ── Social signals ────────────────────────────────────────────────────────────
  const socialSignals = pageInfo.social_signals || {};
  const socialPlatforms = [
    { platform: 'facebook',  name: 'Facebook',  connected: socialSignals.facebook?.found  === true },
    { platform: 'instagram', name: 'Instagram', connected: socialSignals.instagram?.found === true },
    { platform: 'linkedin',  name: 'LinkedIn',  connected: socialSignals.linkedin?.found  === true },
    { platform: 'twitter',   name: 'X/Twitter', connected: socialSignals.twitter?.found   === true },
    { platform: 'youtube',   name: 'YouTube',   connected: socialSignals.youtube?.found   === true },
  ];
  const socialConnected = socialPlatforms.filter(p => p.connected).length;
  const socialMissing   = socialPlatforms.filter(p => !p.connected).length;
  const socialScore     = Math.round((socialConnected / Math.max(1, socialPlatforms.length)) * 100);

  // ── Google Business Presence ──────────────────────────────────────────────────
  const gbp = pageInfo.google_business_presence || {};
  const googleBusinessPresence = {
    found:         gbp.found       === true,
    verified:      gbp.verified    === true,   // distinct from 'found'
    businessName:  gbp.business_name || '',
    category:      gbp.category      || '',
    rating:        gbp.rating        ?? null,
    reviewCount:   gbp.review_count  ?? 0,
    address:       gbp.address       || '',
    phone:         gbp.phone         || '',
    website:       gbp.website       || '',
    businessHours: gbp.business_hours || gbp.hours || '',
    mapsUrl:       gbp.maps_url      || '',
    status:        gbp.status        || '',
  };

  // ── Top issues ────────────────────────────────────────────────────────────────
  const allTopIssues = Array.isArray(snapshot.top_issues) ? snapshot.top_issues : [];
  const topIssues4   = allTopIssues.slice(0, 4).map(i => i.message || i.rule_id || '');

  // ── Issue distribution ────────────────────────────────────────────────────────
  const issueDistribution = {
    total:    summary.total    || 0,
    critical: summary.critical || 0,
    warnings: summary.warnings || 0,
    passed:   summary.passed   || 0,
  };

  // ── Performance metric sub-objects (mobile + desktop with rated values) ───────
  const mobilePerfMetrics = {
    score:            mobile.score                              || 0,
    fcp:              mobile.fcp                               || 'N/A',
    fcpRating:        _rateMetric('fcp',        mobile.fcp),
    lcp:              mobile.lcp                               || 'N/A',
    lcpRating:        _rateMetric('lcp',        mobile.lcp),
    cls:              mobile.cls                               || 'N/A',
    clsRating:        _rateMetric('cls',        mobile.cls),
    tbt:              mobile.tbt                               || 'N/A',
    tbtRating:        _rateMetric('tbt',        mobile.tbt),
    inp:              mobile.inp                               || 'N/A',
    inpRating:        _rateMetric('inp',        mobile.inp),
    speedIndex:       mobile.speed_index || mobile.speedIndex  || 'N/A',
    speedIndexRating: _rateMetric('speedIndex', mobile.speed_index || mobile.speedIndex),
  };

  const desktopPerfMetrics = {
    score:            desktop.score                               || 0,
    fcp:              desktop.fcp                                || 'N/A',
    fcpRating:        _rateMetric('fcp',        desktop.fcp),
    lcp:              desktop.lcp                                || 'N/A',
    lcpRating:        _rateMetric('lcp',        desktop.lcp),
    cls:              desktop.cls                                || 'N/A',
    clsRating:        _rateMetric('cls',        desktop.cls),
    tbt:              desktop.tbt                                || 'N/A',
    tbtRating:        _rateMetric('tbt',        desktop.tbt),
    inp:              desktop.inp                                || 'N/A',
    inpRating:        _rateMetric('inp',        desktop.inp),
    speedIndex:       desktop.speed_index || desktop.speedIndex  || 'N/A',
    speedIndexRating: _rateMetric('speedIndex', desktop.speed_index || desktop.speedIndex),
  };

  // ── P2: Check transformation outputs ─────────────────────────────────────────
  const onPageFindings      = _transformOnPageFindings(onPageChecks);
  const technicalFindings   = _transformTechnicalFindings(techChecks);
  const securityIssues      = _transformSecurityIssues(secChecks);
  const aiIssues            = _transformAiIssues(aiChecksArr);
  const accessibilityIssues = _transformAccessibilityIssues(a11yChecks);
  const missingLabels       = _countMissingLabels(a11yChecks);
  const opportunities       = _buildOpportunities(scores);

  return {
    url:          snapshot.url || '',
    projectName,
    audited_at:   snapshot.created_at || null,

    // ── Scores ──────────────────────────────────────────────────────────────────
    scores,

    // ── Issue distribution ───────────────────────────────────────────────────────
    issueDistribution,

    // ── Per-section breakdowns ────────────────────────────────────────────────────
    onPage: {
      score:       scores.seo,
      issueCount:  _failed(onPageChecks).length,
      checksCount: onPageChecks.length,
    },

    technical: {
      score:       scores.technicalHealth,
      issueCount:  _failed(techChecks).length,
      checksCount: techChecks.length,
    },

    security: {
      score:         scores.security,
      issueCount:    _failed(secChecks).length,
      criticalCount: _critical(secChecks).length,
    },

    aiVisibility: {
      score:         scores.aiVisibility,
      issueCount:    _failed(aiChecksArr).length,
      criticalCount: _critical(aiChecksArr).length,
      llmScore:      pageInfo.llm_readability?.score || 0,
    },

    performance: {
      score:        scores.performance,
      issueCount:   _failed(perfChecks).length,
      responseTime: _formatResponseTime(pageInfo.response_time_ms),
    },

    accessibility: {
      score:         scores.accessibility,
      issueCount:    _failed(a11yChecks).length,
      criticalCount: _critical(a11yChecks).length,
    },

    // ── Social ───────────────────────────────────────────────────────────────────
    social: {
      score:          socialScore,
      connectedCount: socialConnected,
      missingCount:   socialMissing,
      platforms:      socialPlatforms,   // each item now has { platform, name, connected }
    },

    // ── Google Business ──────────────────────────────────────────────────────────
    googleBusinessPresence,              // now includes `verified` + `businessHours`

    // ── Top issues ───────────────────────────────────────────────────────────────
    topIssues4,

    // ── Performance metric sub-objects ───────────────────────────────────────────
    mobilePerfMetrics,
    desktopPerfMetrics,

    // ── P2 transformation outputs ────────────────────────────────────────────────
    onPageFindings,
    technicalFindings,
    securityIssues,
    aiIssues,
    accessibilityIssues,
    missingLabels,
    opportunities,

    // ── Legacy fields (kept for backward compat + narration) ─────────────────────
    topIssues: {
      critical: allTopIssues.filter(i => i.severity === 'critical').slice(0, 5).map(i => i.message || i.rule_id),
      warnings: allTopIssues.filter(i => i.severity !== 'critical').slice(0, 5).map(i => i.message || i.rule_id),
    },

    aiChecks: _failed(aiChecksArr).slice(0, 3),

    performanceMetrics: {
      score:        scores.performance,
      mobileScore:  mobile.score    || 0,
      desktopScore: desktop.score   || 0,
      fcp:          mobile.fcp      || 'N/A',
      lcp:          mobile.lcp      || 'N/A',
      tbt:          mobile.tbt      || 'N/A',
      cls:          mobile.cls      || 'N/A',
      desktopFcp:   desktop.fcp    || 'N/A',
      desktopLcp:   desktop.lcp    || 'N/A',
      desktopTbt:   desktop.tbt    || 'N/A',
      desktopCls:   desktop.cls    || 'N/A',
    },

    pageInfo: {
      title:          pageInfo.title            || '',
      description:    pageInfo.meta_description || '',
      hasSchema:      pageInfo.has_schema       || false,
      isHttps:        pageInfo.is_https         || false,
      responseTimeMs: pageInfo.response_time_ms || 0,
    },
  };
}

// ── Icon-type mappings (rule_id → scene iconType) ─────────────────────────────

const ON_PAGE_ICON_MAP = {
  meta_description: 'meta', missing_meta_description: 'meta', meta_desc: 'meta', title_tag: 'meta',
  h1_missing: 'h1', h1_multiple: 'h1', multiple_h1: 'h1', missing_h1: 'h1',
  schema: 'schema', structured_data: 'schema', missing_schema: 'schema', no_schema: 'schema',
};

const TECHNICAL_ICON_MAP = {
  ssl: 'ssl', https: 'ssl', ssl_certificate: 'ssl', mixed_content: 'ssl', no_https: 'ssl',
  crawl: 'crawl', crawlability: 'crawl', crawl_error: 'crawl', blocked_by_robots: 'crawl',
  redirect: 'redirect', redirect_chain: 'redirect', broken_redirect: 'redirect', multiple_redirects: 'redirect',
  sitemap: 'sitemap', xml_sitemap: 'sitemap', missing_sitemap: 'sitemap', sitemap_error: 'sitemap',
  robots: 'robots', robots_txt: 'robots', missing_robots: 'robots', robots_disallow: 'robots',
};

const SECURITY_ICON_MAP = {
  csp: 'csp', content_security_policy: 'csp', missing_csp: 'csp',
  hsts: 'hsts', http_strict_transport: 'hsts', strict_transport: 'hsts', missing_hsts: 'hsts',
  xframe: 'xframe', x_frame_options: 'xframe', frame_options: 'xframe', clickjacking: 'xframe',
  ssl: 'ssl', https: 'ssl', certificate: 'ssl', tls: 'ssl', invalid_ssl: 'ssl',
  cors: 'cors', cross_origin: 'cors',
};

const AI_ICON_MAP = {
  llms_txt: 'llms-txt', llmstxt: 'llms-txt', missing_llms_txt: 'llms-txt', no_llms_txt: 'llms-txt',
  schema: 'schema', structured_data: 'schema', missing_schema: 'schema',
  faq: 'faq', missing_faq: 'faq', no_faq: 'faq',
  clarity: 'clarity', readability: 'clarity', content_clarity: 'clarity',
};

const A11Y_ICON_MAP = {
  alt_text: 'alt-text', missing_alt: 'alt-text', img_alt: 'alt-text', image_alt: 'alt-text',
  link_label: 'link-labels', aria_label: 'link-labels', aria_labelledby: 'link-labels', link_name: 'link-labels',
  form_field: 'form-fields', form_label: 'form-fields', input_label: 'form-fields', label: 'form-fields',
};

// Rule IDs that count toward "missing labels" metric
const LABEL_RULE_IDS = new Set([
  'aria_label', 'aria-label', 'image_alt', 'img_alt', 'link_label', 'aria_labelledby',
  'form_label', 'input_label', 'button_name', 'link_name', 'alt_text', 'missing_alt',
]);

// ── P2 transformation functions ────────────────────────────────────────────────

function _transformOnPageFindings(checks) {
  return _failedChecks(checks).slice(0, 4).map(c => ({
    iconType:      ON_PAGE_ICON_MAP[c.rule_id] || c.rule_id || 'info',
    name:          c.name || c.title || c.message || _titleCase(c.rule_id) || 'SEO Issue',
    description:   c.description || c.message || 'This issue affects your on-page SEO performance.',
    affectedCount: c.affected_count ?? c.count ?? c.instances ?? 1,
    affectedLabel: c.affected_label || 'pages',
  }));
}

function _transformTechnicalFindings(checks) {
  return _failedChecks(checks).slice(0, 4).map(c => ({
    iconType:      TECHNICAL_ICON_MAP[c.rule_id] || c.rule_id || 'crawl',
    name:          c.name || c.title || c.message || _titleCase(c.rule_id) || 'Technical Issue',
    description:   c.description || c.message || 'This issue affects crawlability and indexation.',
    affectedCount: c.affected_count ?? c.count ?? c.instances ?? 1,
    affectedLabel: c.affected_label || 'pages',
    countColor:    getSeverityColorHex(c.severity),
  }));
}

function _transformSecurityIssues(checks) {
  return _failedChecks(checks).slice(0, 6).map(c => ({
    iconType:    SECURITY_ICON_MAP[c.rule_id] || c.rule_id || 'ssl',
    name:        c.name || c.title || c.message || _titleCase(c.rule_id) || 'Security Issue',
    status:      (c.severity === 'critical' || c.severity === 'high') ? 'Critical' : 'Warning',
    statusColor: getSeverityColorHex(c.severity),
  }));
}

function _transformAiIssues(checks) {
  return _failedChecks(checks).slice(0, 4).map(c => ({
    iconType:    AI_ICON_MAP[c.rule_id] || c.rule_id || 'clarity',
    name:        c.name || c.title || c.message || _titleCase(c.rule_id) || 'AI Visibility Issue',
    description: c.description || c.message || 'This issue affects your visibility in AI-powered search.',
    impact:      getSeverityVideoImpact(c.severity),
    badge:       getSeverityVideoBadge(c.severity),
  }));
}

function _transformAccessibilityIssues(checks) {
  return _failedChecks(checks).slice(0, 3).map(c => ({
    iconType:     A11Y_ICON_MAP[c.rule_id] || c.rule_id || 'alt-text',
    name:         c.name || c.title || c.message || _titleCase(c.rule_id) || 'Accessibility Issue',
    description:  c.description || c.message || 'This issue affects accessibility compliance.',
    count:        c.affected_count ?? c.count ?? c.instances ?? 1,
    affectedLabel: c.affected_label || 'elements',
  }));
}

function _countMissingLabels(checks) {
  return _failedChecks(checks)
    .filter(c => LABEL_RULE_IDS.has(c.rule_id))
    .reduce((sum, c) => sum + (c.affected_count ?? c.count ?? c.instances ?? 1), 0);
}

/**
 * Build Final CTA opportunities from category scores.
 * Sorted worst-first so the most critical categories appear first.
 */
function _buildOpportunities(scores) {
  const CATEGORIES = [
    { iconType: 'security',      title: 'Security',       description: 'Fix vulnerabilities and build trust',        score: scores.security      },
    { iconType: 'ai-visibility', title: 'AI Visibility',  description: 'Improve visibility in AI-powered search',    score: scores.aiVisibility  },
    { iconType: 'performance',   title: 'Performance',    description: 'Improve page speed and user experience',     score: scores.performance   },
    { iconType: 'accessibility', title: 'Accessibility',  description: 'Make your website accessible to all users',  score: scores.accessibility },
  ];
  const _toImpact = s => (s ?? 100) < 50 ? 'high' : (s ?? 100) < 75 ? 'medium' : 'low';
  return CATEGORIES
    .sort((a, b) => (a.score ?? 100) - (b.score ?? 100))
    .map(({ score, ...opp }) => ({ ...opp, impact: _toImpact(score) }));
}

// ── Performance metric rating helpers ─────────────────────────────────────────
// Thresholds/parsing sourced from ../shared/homepageAuditConstants (canonical).
// This wrapper preserves the original `undefined` (not `null`) return for
// "no rating available", since this object is later JSON-serialized for
// Remotion — `undefined` keys are dropped by JSON.stringify while `null`
// keys are kept, and downstream scene code relies on the field being absent.

function _rateMetric(type, valueStr) {
  if (!valueStr || valueStr === 'N/A') return undefined;
  // Strip locale-format commas before parsing: "1,500 ms" → "1500 ms"
  const cleaned = String(valueStr).trim().toLowerCase().replace(/,/g, '');
  const ms = parseCwvValueToMs(type, cleaned);
  const rating = rateCwvMetric(type, ms);
  return rating === null ? undefined : rating;
}

// ── General helpers ────────────────────────────────────────────────────────────

function _failedChecks(arr) {
  return Array.isArray(arr) ? arr.filter(c => c.status !== 'pass') : [];
}

function _domainFromUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function _formatResponseTime(ms) {
  if (!ms || ms <= 0) return 'N/A';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function _titleCase(str) {
  if (!str) return '';
  return String(str).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

module.exports = { adapt };
