/**
 * generate-render-props.js
 * Fetches a HomepageAudit snapshot from MongoDB and builds the 11-slide
 * render props through the updated v3 adapter + processor pipeline.
 * Output: temp/render-validation-props.json  (ready for `npx remotion still`)
 *
 * Usage:
 *   node scripts/generate-render-props.js [auditId]
 *
 * Defaults to the most recently updated HomepageAudit document.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const adapter    = require('../adapters/homepageAuditAdapter');
const narration  = require('../narrations/homepageAuditNarration');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const OUT_PATH  = path.join(__dirname, '../temp/render-validation-props.json');

// Each scene gets a fixed duration (seconds) — no audio needed for visual validation.
// Long enough for all animations to complete (most scenes are 120 frames @ 24fps = 5s).
const SCENE_DURATION = 7.0;

async function main() {
  const targetAuditId = process.argv[2] || null;

  console.log('[generate-render-props] Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('[generate-render-props] Connected.');

  const db = mongoose.connection.db;
  const col = db.collection('homepage_audits');

  let doc;
  if (targetAuditId) {
    const { ObjectId } = require('mongodb');
    doc = await col.findOne({ _id: new ObjectId(targetAuditId) });
    if (!doc) throw new Error(`HomepageAudit not found: ${targetAuditId}`);
  } else {
    // Use the most recently updated finished audit that has a snapshot
    doc = await col.findOne(
      { 'snapshot': { $exists: true }, 'snapshot.score': { $exists: true } },
      { sort: { updatedAt: -1 } }
    );
    if (!doc) throw new Error('No completed HomepageAudit with snapshot found');
  }

  const auditId = doc._id.toString();
  const snapshot = doc.snapshot;

  console.log(`[generate-render-props] Using audit: ${auditId}`);
  console.log(`[generate-render-props] URL: ${snapshot.url || snapshot.page_info?.url || 'unknown'}`);
  console.log(`[generate-render-props] Score: ${snapshot.score}`);

  // ── Run through adapter ────────────────────────────────────────────────────
  console.log('[generate-render-props] Adapting snapshot...');
  const videoProps = adapter.adapt(snapshot);

  // ── Generate narration ─────────────────────────────────────────────────────
  console.log('[generate-render-props] Generating narration...');
  const narrationSections = narration.generateScript(videoProps);
  console.log(`[generate-render-props] ${narrationSections.length} narration sections`);

  // ── Build slides (replicate _buildSlides logic inline for standalone use) ──
  const a11yIssueCount    = videoProps.accessibility.issueCount    || 0;
  const a11yCriticalCount = videoProps.accessibility.criticalCount || 0;
  const missingLabels     = videoProps.missingLabels               || 0;

  const onPageCount = snapshot.sections?.on_page?.checks?.length || 0;
  const techCount   = snapshot.sections?.technical?.checks?.length || 0;
  const secCount    = snapshot.sections?.security?.checks?.length || 0;
  const aiCount     = snapshot.sections?.ai?.checks?.length || 0;
  const perfCount   = snapshot.sections?.performance?.checks?.length || 0;
  const a11yCount   = snapshot.sections?.accessibility?.checks?.length || 0;

  const totalChecks = onPageCount + techCount + secCount + aiCount + perfCount + a11yCount;

  const slides = [
    {
      id: 1, type: 'homepageIntro',
      narration: narrationSections[0],
      data: {
        websiteUrl:         videoProps.url,
        projectName:        videoProps.projectName,
        audited_at:         videoProps.audited_at,
        overallScore:       videoProps.scores.overall,
        issuesFound:        videoProps.issueDistribution.total,
        criticalIssues:     videoProps.issueDistribution.critical,
        warningIssues:      videoProps.issueDistribution.warnings,
        seoScore:           videoProps.scores.seo,
        performanceScore:   videoProps.scores.performance,
        securityScore:      videoProps.scores.security,
        aiVisibilityScore:  videoProps.scores.aiVisibility,
        accessibilityScore: videoProps.scores.accessibility,
        localSeoScore:      videoProps.social.score,
        totalChecks:        totalChecks,
      },
      audio: '', duration: SCENE_DURATION,
    },
    {
      id: 2, type: 'homepageOverallScore',
      narration: narrationSections[1],
      data: {
        score:          videoProps.scores.overall,
        maxScore:       100,
        totalIssues:    videoProps.issueDistribution.total,
        criticalIssues: videoProps.issueDistribution.critical,
        warningIssues:  videoProps.issueDistribution.warnings,
        passedChecks:   videoProps.issueDistribution.passed,
      },
      audio: '', duration: SCENE_DURATION,
    },
    {
      id: 3, type: 'homepageOnPage',
      narration: narrationSections[2],
      data: {
        score:        videoProps.scores.seo,
        totalIssues:  videoProps.onPage.issueCount,
        checksCount:  videoProps.onPage.checksCount,
        findings:     videoProps.onPageFindings,
      },
      audio: '', duration: SCENE_DURATION,
    },
    {
      id: 4, type: 'homepageTechnical',
      narration: narrationSections[3],
      data: {
        score:        videoProps.scores.technicalHealth,
        issuesFound:  videoProps.technical.issueCount,
        checksPassed: Math.max(0, videoProps.technical.checksCount - videoProps.technical.issueCount),
        checksCount:  videoProps.technical.checksCount,
        findings:     videoProps.technicalFindings,
        techChecks:   snapshot.sections?.technical?.checks || [],
      },
      audio: '', duration: SCENE_DURATION,
    },
    {
      id: 5, type: 'homepageSecurity',
      narration: narrationSections[4],
      data: {
        score:          videoProps.scores.security,
        securityIssues: videoProps.security.issueCount,
        criticalCount:  videoProps.security.criticalCount,
        issues:         videoProps.securityIssues,
      },
      audio: '', duration: SCENE_DURATION,
    },
    {
      id: 6, type: 'homepageAIVisibility',
      narration: narrationSections[5],
      data: {
        score:            videoProps.scores.aiVisibility,
        issueCount:       videoProps.aiVisibility.issueCount,
        criticalCount:    videoProps.aiVisibility.criticalCount,
        readabilityScore: videoProps.aiVisibility.llmScore,
        issues:           videoProps.aiIssues,
      },
      audio: '', duration: SCENE_DURATION,
    },
    {
      id: 7, type: 'homepagePerformance',
      narration: narrationSections[6],
      data: {
        score:        videoProps.scores.performance,
        mobile:       videoProps.mobilePerfMetrics,
        desktop:      videoProps.desktopPerfMetrics,
        responseTime: videoProps.performance.responseTime,
        issueCount:   videoProps.performance.issueCount,
      },
      audio: '', duration: SCENE_DURATION,
    },
    {
      id: 8, type: 'homepageAccessibility',
      narration: narrationSections[7],
      data: {
        score:                    videoProps.scores.accessibility,
        criticalViolations:       a11yCriticalCount,
        criticalViolationsBarPct: Math.min(100, Math.round(
          (a11yCriticalCount / Math.max(1, a11yIssueCount)) * 100
        )),
        missingLabels,
        missingLabelsBarPct: Math.min(100, Math.round(
          (missingLabels / Math.max(1, a11yIssueCount)) * 100
        )),
        issues: videoProps.accessibilityIssues,
      },
      audio: '', duration: SCENE_DURATION,
    },
    {
      id: 9, type: 'homepageSocialSignals',
      narration: narrationSections[8],
      data: {
        score:             videoProps.social.score,
        connectedProfiles: videoProps.social.connectedCount,
        missingProfiles:   videoProps.social.missingCount,
        platforms:         videoProps.social.platforms,
      },
      audio: '', duration: SCENE_DURATION,
    },
    {
      id: 10, type: 'homepageGBP',
      narration: narrationSections[9],
      data: {
        found:         videoProps.googleBusinessPresence.found,
        verified:      videoProps.googleBusinessPresence.verified,
        businessName:  videoProps.googleBusinessPresence.businessName,
        category:      videoProps.googleBusinessPresence.category,
        rating:        videoProps.googleBusinessPresence.rating,
        reviewCount:   videoProps.googleBusinessPresence.reviewCount,
        address:       videoProps.googleBusinessPresence.address,
        phone:         videoProps.googleBusinessPresence.phone,
        website:       videoProps.googleBusinessPresence.website,
        businessHours: videoProps.googleBusinessPresence.businessHours,
        mapsUrl:       videoProps.googleBusinessPresence.mapsUrl,
        status:        videoProps.googleBusinessPresence.status,
      },
      audio: '', duration: SCENE_DURATION,
    },
    {
      id: 11, type: 'homepageFinalSummary',
      narration: narrationSections[10],
      data: {
        overallScore:       videoProps.scores.overall,
        issuesFound:        videoProps.issueDistribution.total,
        opportunitiesFound: videoProps.issueDistribution.warnings,
        opportunities:      videoProps.opportunities,
      },
      audio: '', duration: SCENE_DURATION,
    },
  ];

  // ── Compute frame offsets per scene (24fps) ────────────────────────────────
  const FPS = 24;
  let cursor = 0;
  const sceneFrameMap = slides.map(s => {
    const dframes = Math.round(s.duration * FPS);
    const midFrame = cursor + Math.floor(dframes * 0.75); // 75% through = animations complete
    cursor += dframes;
    return { slideId: s.id, type: s.type, fromFrame: cursor - dframes, midFrame, dframes };
  });

  const totalDurationFrames = cursor;

  const renderPropsPayload = {
    composition: 'HomepageAuditVideo',
    props: { slidesWithAudio: slides, fps: FPS },
    totalDurationFrames,
    sceneFrameMap,
    auditId,
    url: videoProps.url,
    score: videoProps.scores.overall,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(renderPropsPayload, null, 2));

  console.log(`\n[generate-render-props] ✅ Written to: ${OUT_PATH}`);
  console.log(`[generate-render-props] Total duration: ${totalDurationFrames} frames @ ${FPS}fps = ${(totalDurationFrames/FPS).toFixed(1)}s`);
  console.log('\n[generate-render-props] Scene frame map:');
  sceneFrameMap.forEach(s => {
    console.log(`  Scene ${s.slideId} (${s.type}): frames ${s.fromFrame}–${s.fromFrame+s.dframes-1}, capture at frame ${s.midFrame}`);
  });

  console.log('\n[generate-render-props] Data summary:');
  console.log('  URL:', videoProps.url);
  console.log('  Score:', videoProps.scores.overall);
  console.log('  Issues:', videoProps.issueDistribution);
  console.log('  Social connected:', videoProps.social.connectedCount, '/', videoProps.social.platforms.length);
  console.log('  GBP found:', videoProps.googleBusinessPresence.found, '| verified:', videoProps.googleBusinessPresence.verified);
  console.log('  Mobile perf:', videoProps.mobilePerfMetrics.score, '| FCP:', videoProps.mobilePerfMetrics.fcp, '(', videoProps.mobilePerfMetrics.fcpRating, ')');
  console.log('  Desktop perf:', videoProps.desktopPerfMetrics.score, '| LCP:', videoProps.desktopPerfMetrics.lcp, '(', videoProps.desktopPerfMetrics.lcpRating, ')');
  console.log('  AI issues:', videoProps.aiIssues.length);
  console.log('  Readability score:', videoProps.aiVisibility.llmScore);
  console.log('  Opportunities:', videoProps.opportunities.map(o => `${o.iconType}:${o.impact}`).join(', '));

  await mongoose.disconnect();
  console.log('[generate-render-props] Done.');
}

main().catch(err => {
  console.error('[generate-render-props] ERROR:', err);
  mongoose.disconnect();
  process.exit(1);
});
