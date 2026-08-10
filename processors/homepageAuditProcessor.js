const jobService = require('../shared/jobService');
const renderService = require('../shared/renderService');
const audioOrchestrator = require('../shared/audioOrchestrator');
const adapter = require('../adapters/homepageAuditAdapter');
const narration = require('../narrations/homepageAuditNarration');

/**
 * Homepage Audit Video Processor
 * Handles: HOMEPAGE_AUDIT jobs
 *
 * Source of truth: job.auditSnapshot (HomepageAudit.snapshot — finalized)
 * Never fetches live data, never reruns audits.
 *
 * Phase 2: validates + prepares payload
 * Phase 4: completes audio + render
 *
 * v3 changes:
 *   - _buildSlides now emits 11 slides (added homepageOverallScore at position 2)
 *   - All narration indices shifted +1 to accommodate new slide
 *   - Fixed all field-name mismatches between adapter output and scene data contracts
 *   - Performance slide now passes mobile/desktop sub-objects (was flat mobileScore/desktopScore)
 *   - Accessibility slide passes criticalViolations, missingLabels + bar percentages
 *   - Social slide passes connectedProfiles/missingProfiles (was connectedCount/missingCount)
 *   - GBP slide passes verified + businessHours (P3)
 *   - AI slide passes readabilityScore (was llmScore) + issues[] from P2 transform
 *   - Final Summary slide passes issuesFound, opportunitiesFound, opportunities[]
 */

const COMPOSITION_ID = 'HomepageAuditVideo';
const MAX_RETRIES = 2;

/**
 * Entry point — called by worker.js router.
 *
 * @param {Object} job - { jobId, auditId, auditSnapshot }
 * @param {Object} services - { audioService, config: { backendUrl, backendPublicPath } }
 */
async function process(job, services) {
  const { jobId, auditId, auditSnapshot } = job;
  const { audioService, config } = services;

  console.log(`[HOMEPAGE_AUDIT_PROCESSOR] Job received | jobId=${jobId} | auditId=${auditId}`);

  // Validate Homepage Audit specific fields
  if (!auditId || typeof auditId !== 'string' || auditId.trim().length === 0) {
    console.error(`[HOMEPAGE_AUDIT_PROCESSOR] ❌ INVALID auditId | auditId=${auditId}`);
    await jobService.updateJobStatus(config.backendUrl, jobId, 'failed', {
      error: { message: 'Valid auditId is required for HOMEPAGE_AUDIT jobs' }
    });
    return;
  }

  if (!auditSnapshot || typeof auditSnapshot !== 'object') {
    console.error(`[HOMEPAGE_AUDIT_PROCESSOR] ❌ MISSING auditSnapshot | jobId=${jobId}`);
    await jobService.updateJobStatus(config.backendUrl, jobId, 'failed', {
      error: { message: 'auditSnapshot is required for HOMEPAGE_AUDIT jobs' }
    });
    return;
  }

  const sanitizedJobId = jobId.toString().replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedAuditId = auditId.toString().replace(/[^a-zA-Z0-9-_]/g, '');

  await _processWithRetry(sanitizedJobId, sanitizedAuditId, auditSnapshot, audioService, config);
}

async function _processWithRetry(jobId, auditId, auditSnapshot, audioService, config) {
  let retryCount = 0;

  while (retryCount <= MAX_RETRIES) {
    try {
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] Processing started | jobId=${jobId} | attempt=${retryCount + 1}`);

      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 10,
        currentStep: 'Preparing homepage audit video',
        retryCount,
        timestamp: new Date()
      });

      // Step 1: Adapt snapshot to video props
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] Adapting snapshot to video props...`);
      const videoProps = adapter.adapt(auditSnapshot);
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] ✅ Adapted video props | url=${videoProps.url} | score=${videoProps.scores.overall}`);

      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 15,
        currentStep: 'Generating narration script'
      });

      // Step 2: Generate narration (11 sections, one per slide)
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] Generating narration script...`);
      const narrationSections = narration.generateScript(videoProps);
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] ✅ Generated ${narrationSections.length} narration sections`);

      // Step 3: Build 11 slides
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] Building slides...`);
      const structuredSlides = _buildSlides(videoProps, narrationSections);
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] ✅ Created ${structuredSlides.length} slides`);

      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 20,
        currentStep: 'Script prepared - starting audio generation'
      });

      // Step 4: Generate per-slide audio
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] Generating per-slide audio...`);
      const updateStatus = (jId, status, data) =>
        jobService.updateJobStatus(config.backendUrl, jId, status, data);

      const audioFiles = await audioOrchestrator.generateWithProgress(
        structuredSlides, auditId, jobId, audioService, updateStatus
      );
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] ✅ Generated ${audioFiles.length} audio files`);

      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 70,
        currentStep: 'Audio complete - rendering video'
      });

      // Step 5: Attach audio to slides
      const slidesWithAudio = audioOrchestrator.attachAudioToSlides(structuredSlides, audioFiles);

      // Step 6: Render
      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 80,
        currentStep: 'Rendering video'
      });

      const videoFileName = `${auditId}-${jobId}.mp4`;
      const videoPath = await renderService.render(
        auditId, jobId, slidesWithAudio, COMPOSITION_ID, config
      );
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] Render done | path=${videoPath}`);

      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 95,
        currentStep: 'Finalizing video'
      });

      // Step 7: Complete
      const resultData = {
        videoUrl: `${config.backendUrl}/videos/${videoFileName}`,
        videoFileName,
        audioFiles,
        processingTime: Date.now(),
        slidesGenerated: structuredSlides.length,
        audioFilesGenerated: audioFiles.length,
        auditId,
        compositionId: COMPOSITION_ID
      };

      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] 🎬 VIDEO COMPLETE:`, {
        jobId,
        auditId,
        videoUrl: resultData.videoUrl,
        status: 'RENDERED'
      });

      await jobService.updateJobStatus(config.backendUrl, jobId, 'completed', {
        progress: 100,
        currentStep: 'Completed',
        result_data: resultData
      });

      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] Job completed | jobId=${jobId} | attempts=${retryCount + 1}`);
      return;

    } catch (error) {
      console.error(`[HOMEPAGE_AUDIT_PROCESSOR] Attempt ${retryCount + 1} failed | jobId=${jobId}:`, error);

      retryCount++;
      const shouldRetry = jobService.shouldRetryJob(error, retryCount, MAX_RETRIES);

      if (shouldRetry && retryCount <= MAX_RETRIES) {
        const delay = Math.min(5000 * Math.pow(2, retryCount - 1), 30000);
        console.log(`[HOMEPAGE_AUDIT_PROCESSOR] Retrying in ${delay}ms | jobId=${jobId}`);
        await jobService.updateJobStatus(config.backendUrl, jobId, 'retrying', {
          error: error.message, retryCount, maxRetries: MAX_RETRIES
        });
        await jobService.sleep(delay);
      } else {
        await jobService.updateJobStatus(config.backendUrl, jobId, 'failed', {
          error: { message: error.message, stack: error.stack, timestamp: new Date(), retryCount, finalAttempt: true }
        });
        return;
      }
    }
  }
}

/**
 * Build 11 structured slides from adapted video props + narration sections.
 *
 * Slide order:
 *   1  homepageIntro          → narrationSections[0]
 *   2  homepageOverallScore   → narrationSections[1]   ← NEW
 *   3  homepageOnPage         → narrationSections[2]
 *   4  homepageTechnical      → narrationSections[3]
 *   5  homepageSecurity       → narrationSections[4]
 *   6  homepageAIVisibility   → narrationSections[5]
 *   7  homepagePerformance    → narrationSections[6]
 *   8  homepageAccessibility  → narrationSections[7]
 *   9  homepageSocialSignals  → narrationSections[8]
 *   10 homepageGBP            → narrationSections[9]
 *   11 homepageFinalSummary   → narrationSections[10]
 */
function _buildSlides(props, narrationSections) {
  const a11yIssueCount    = props.accessibility.issueCount    || 0;
  const a11yCriticalCount = props.accessibility.criticalCount || 0;
  const missingLabels     = props.missingLabels               || 0;

  return [
    // ── 1. Intro ─────────────────────────────────────────────────────────────
    {
      id: 1,
      type: 'homepageIntro',
      title: props.projectName,
      subtitle: props.url,
      narration: narrationSections[0],
      data: {
        websiteUrl:     props.url,               // FIXED: was 'url'
        projectName:    props.projectName,
        audited_at:     props.audited_at,
        overallScore:   props.scores.overall,
        issuesFound:    props.issueDistribution.total,     // FIXED: was 'totalIssues'
        criticalIssues: props.issueDistribution.critical,
        warningIssues:  props.issueDistribution.warnings,
      },
    },

    // ── 2. Overall Health Score ───────────────────────────────────────────────
    {
      id: 2,
      type: 'homepageOverallScore',
      title: 'Overall Score',
      subtitle: `Score: ${props.scores.overall}`,
      narration: narrationSections[1],
      data: {
        score:          props.scores.overall,
        maxScore:       100,
        totalIssues:    props.issueDistribution.total,
        criticalIssues: props.issueDistribution.critical,
        warningIssues:  props.issueDistribution.warnings,
        passedChecks:   props.issueDistribution.passed,
      },
    },

    // ── 3. On-Page SEO ────────────────────────────────────────────────────────
    {
      id: 3,
      type: 'homepageOnPage',
      title: 'On-Page SEO',
      subtitle: `Score: ${props.scores.seo}`,
      narration: narrationSections[2],
      data: {
        score:        props.scores.seo,
        totalIssues:  props.onPage.issueCount,      // FIXED: was 'issueCount'
        checksCount:  props.onPage.checksCount,
        findings:     props.onPageFindings,         // P2: transformed check objects
      },
    },

    // ── 4. Technical SEO ──────────────────────────────────────────────────────
    {
      id: 4,
      type: 'homepageTechnical',
      title: 'Technical SEO',
      subtitle: `Score: ${props.scores.technicalHealth}`,
      narration: narrationSections[3],
      data: {
        score:        props.scores.technicalHealth,
        issuesFound:  props.technical.issueCount,                                          // FIXED: was 'issueCount'
        checksPassed: Math.max(0, props.technical.checksCount - props.technical.issueCount), // FIXED: was 'checksCount'
        checksCount:  props.technical.checksCount,
        findings:     props.technicalFindings,    // P2: transformed check objects
      },
    },

    // ── 5. Security ───────────────────────────────────────────────────────────
    {
      id: 5,
      type: 'homepageSecurity',
      title: 'Security',
      subtitle: `Score: ${props.scores.security}`,
      narration: narrationSections[4],
      data: {
        score:          props.scores.security,
        securityIssues: props.security.issueCount,   // FIXED: was 'issueCount'
        criticalCount:  props.security.criticalCount,
        issues:         props.securityIssues,        // P2: transformed check objects
      },
    },

    // ── 6. AI Visibility ──────────────────────────────────────────────────────
    {
      id: 6,
      type: 'homepageAIVisibility',
      title: 'AI Visibility',
      subtitle: `Score: ${props.scores.aiVisibility}`,
      narration: narrationSections[5],
      data: {
        score:            props.scores.aiVisibility,
        issueCount:       props.aiVisibility.issueCount,
        criticalCount:    props.aiVisibility.criticalCount,
        readabilityScore: props.aiVisibility.llmScore,  // FIXED: was 'llmScore'
        issues:           props.aiIssues,               // P2: transformed (was 'aiChecks' w/ wrong shape)
      },
    },

    // ── 7. Performance ────────────────────────────────────────────────────────
    {
      id: 7,
      type: 'homepagePerformance',
      title: 'Performance',
      subtitle: `Score: ${props.scores.performance}`,
      narration: narrationSections[6],
      data: {
        score:        props.scores.performance,
        mobile:       props.mobilePerfMetrics,    // FIXED: was flat 'mobileScore'
        desktop:      props.desktopPerfMetrics,   // FIXED: was flat 'desktopScore'
        responseTime: props.performance.responseTime,
        issueCount:   props.performance.issueCount,
      },
    },

    // ── 8. Accessibility ──────────────────────────────────────────────────────
    {
      id: 8,
      type: 'homepageAccessibility',
      title: 'Accessibility',
      subtitle: `Score: ${props.scores.accessibility}`,
      narration: narrationSections[7],
      data: {
        score:                   props.scores.accessibility,
        criticalViolations:      a11yCriticalCount,                                           // FIXED: was 'criticalCount'
        criticalViolationsBarPct: Math.min(100, Math.round(
          (a11yCriticalCount / Math.max(1, a11yIssueCount)) * 100
        )),
        missingLabels,                                                                        // NEW: derived from label-related checks
        missingLabelsBarPct: Math.min(100, Math.round(
          (missingLabels / Math.max(1, a11yIssueCount)) * 100
        )),
        issues: props.accessibilityIssues,  // P2: transformed check objects
      },
    },

    // ── 9. Social Signals ─────────────────────────────────────────────────────
    {
      id: 9,
      type: 'homepageSocialSignals',
      title: 'Social Signals',
      subtitle: `${props.social.connectedCount} Connected`,
      narration: narrationSections[8],
      data: {
        score:             props.social.score,
        connectedProfiles: props.social.connectedCount,  // FIXED: was 'connectedCount'
        missingProfiles:   props.social.missingCount,    // FIXED: was 'missingCount'
        platforms:         props.social.platforms,       // P4: each item now has { platform, name, connected }
      },
    },

    // ── 10. Google Business Presence ──────────────────────────────────────────
    {
      id: 10,
      type: 'homepageGBP',
      title: 'Google Business Presence',
      subtitle: props.googleBusinessPresence.found ? 'Profile Found' : 'Profile Not Found',
      narration: narrationSections[9],
      data: {
        found:         props.googleBusinessPresence.found,
        verified:      props.googleBusinessPresence.verified,      // P3: was missing
        businessName:  props.googleBusinessPresence.businessName,
        category:      props.googleBusinessPresence.category,
        rating:        props.googleBusinessPresence.rating,
        reviewCount:   props.googleBusinessPresence.reviewCount,
        address:       props.googleBusinessPresence.address,
        phone:         props.googleBusinessPresence.phone,
        website:       props.googleBusinessPresence.website,
        businessHours: props.googleBusinessPresence.businessHours, // P3: was missing
        mapsUrl:       props.googleBusinessPresence.mapsUrl,
        status:        props.googleBusinessPresence.status,
      },
    },

    // ── 11. Final Summary ─────────────────────────────────────────────────────
    {
      id: 11,
      type: 'homepageFinalSummary',
      title: 'Final Summary',
      subtitle: 'Key Opportunities',
      narration: narrationSections[10],
      data: {
        overallScore:       props.scores.overall,
        issuesFound:        props.issueDistribution.total,    // NEW
        opportunitiesFound: props.issueDistribution.warnings, // NEW (warnings = optimization opportunities)
        opportunities:      props.opportunities,              // NEW: FinalCtaOpportunity[] from P2
      },
    },
  ];
}

module.exports = { process };
