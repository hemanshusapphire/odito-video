/**
 * Homepage Audit Snapshot Adapter  v2
 * Transforms HomepageAudit.snapshot into the 10-slide video props structure.
 *
 * SOURCE:  HomepageAudit.snapshot  (finalized, patched)
 * OUTPUT:  videoProps               (10-slide data structure)
 *
 * Pure function — no async, no I/O, no network calls.
 */

function adapt(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('homepageAuditAdapter: snapshot is required');
  }

  const perf    = snapshot.performance || {};
  const sections = snapshot.sections || {};
  const summary  = sections.summary  || {};
  const pageInfo = snapshot.page_info || {};

  // ── Display name ─────────────────────────────────────────────────────────
  const projectName = pageInfo.title
    || (snapshot.url ? _domainFromUrl(snapshot.url) : 'Website Audit');

  // ── Performance ───────────────────────────────────────────────────────────
  const performanceScore = perf.score ?? snapshot.performance_score ?? null;
  const mobile  = perf.mobile  || {};
  const desktop = perf.desktop || {};

  // ── Per-section check analysis ────────────────────────────────────────────
  const onPageChecks   = sections.on_page?.checks    || [];
  const techChecks     = sections.technical?.checks  || [];
  const secChecks      = sections.security?.checks   || [];
  const aiChecksArr    = sections.ai?.checks         || [];
  const perfChecks     = sections.performance?.checks || [];
  const a11yChecks     = sections.accessibility?.checks || [];

  const _failed   = (arr) => arr.filter(c => c.status !== 'pass');
  const _critical = (arr) => _failed(arr).filter(c =>
    c.severity === 'critical' || c.severity === 'high'
  );

  // ── Social signals ────────────────────────────────────────────────────────
  const socialSignals = pageInfo.social_signals || {};
  const socialPlatforms = [
    { name: 'Facebook',  connected: socialSignals.facebook?.found  === true },
    { name: 'Instagram', connected: socialSignals.instagram?.found === true },
    { name: 'LinkedIn',  connected: socialSignals.linkedin?.found  === true },
    { name: 'X/Twitter', connected: socialSignals.twitter?.found   === true },
    { name: 'YouTube',   connected: socialSignals.youtube?.found   === true },
  ];
  const socialConnected = socialPlatforms.filter(p => p.connected).length;
  const socialMissing   = socialPlatforms.filter(p => !p.connected).length;

  // ── Google Business Presence ──────────────────────────────────────────────
  const gbp = pageInfo.google_business_presence || {};
  const googleBusinessPresence = {
    found:        gbp.found === true,
    businessName: gbp.business_name || '',
    category:     gbp.category      || '',
    rating:       gbp.rating        ?? null,
    reviewCount:  gbp.review_count  ?? 0,
    address:      gbp.address       || '',
    phone:        gbp.phone         || '',
    website:      gbp.website       || '',
    mapsUrl:      gbp.maps_url      || '',
    status:       gbp.status        || '',
  };

  // ── Top issues (split for narration + top-4 summary) ─────────────────────
  const allTopIssues = Array.isArray(snapshot.top_issues) ? snapshot.top_issues : [];
  const topIssues4   = allTopIssues.slice(0, 4).map(i => i.message || i.rule_id || '');

  // AI checks for AI visibility slide
  const aiChecksFiltered = _failed(aiChecksArr).slice(0, 3);

  return {
    url:          snapshot.url || '',
    projectName,
    audited_at:   snapshot.created_at || null,

    // ── Scores ──────────────────────────────────────────────────────────────
    scores: {
      overall:         snapshot.score          || 0,
      seo:             snapshot.on_page_score  || 0,
      technicalHealth: snapshot.technical_score || 0,
      aiVisibility:    snapshot.ai_score       || 0,
      performance:     performanceScore        || 0,
      accessibility:   sections.accessibility?.score || 0,
      security:        snapshot.security_score  || 0,
    },

    // ── Issue distribution (summary) ─────────────────────────────────────────
    issueDistribution: {
      total:    summary.total    || 0,
      critical: summary.critical || 0,
      warnings: summary.warnings || 0,
      passed:   summary.passed   || 0,
    },

    // ── Per-section breakdowns ────────────────────────────────────────────────
    onPage: {
      score:       snapshot.on_page_score  || 0,
      issueCount:  _failed(onPageChecks).length,
      checksCount: onPageChecks.length,
    },

    technical: {
      score:       snapshot.technical_score || 0,
      issueCount:  _failed(techChecks).length,
      checksCount: techChecks.length,
    },

    security: {
      score:         snapshot.security_score || 0,
      issueCount:    _failed(secChecks).length,
      criticalCount: _critical(secChecks).length,
    },

    aiVisibility: {
      score:         snapshot.ai_score || 0,
      issueCount:    _failed(aiChecksArr).length,
      criticalCount: _critical(aiChecksArr).length,
      llmScore:      pageInfo.llm_readability?.score || 0,
    },

    performance: {
      score:        performanceScore || 0,
      issueCount:   _failed(perfChecks).length,
      responseTime: _formatResponseTime(pageInfo.response_time_ms),
    },

    accessibility: {
      score:         sections.accessibility?.score || 0,
      issueCount:    _failed(a11yChecks).length,
      criticalCount: _critical(a11yChecks).length,
    },

    social: {
      connectedCount: socialConnected,
      missingCount:   socialMissing,
      platforms:      socialPlatforms,
    },

    googleBusinessPresence,
    topIssues4,

    // ── Legacy fields (kept for backward compat with old in-flight jobs) ─────
    topIssues: {
      critical: allTopIssues.filter(i => i.severity === 'critical').slice(0, 5).map(i => i.message || i.rule_id),
      warnings: allTopIssues.filter(i => i.severity !== 'critical').slice(0, 5).map(i => i.message || i.rule_id),
    },

    aiChecks: aiChecksFiltered,

    performanceMetrics: {
      score:        performanceScore || 0,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function _domainFromUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function _formatResponseTime(ms) {
  if (!ms || ms <= 0) return 'N/A';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

module.exports = { adapt };
