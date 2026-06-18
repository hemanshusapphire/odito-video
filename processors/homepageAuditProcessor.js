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

      // Step 2: Generate narration (10 sections, one per slide)
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] Generating narration script...`);
      const narrationSections = narration.generateScript(videoProps);
      console.log(`[HOMEPAGE_AUDIT_PROCESSOR] ✅ Generated ${narrationSections.length} narration sections`);

      // Step 3: Build 10 slides
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
 * Build 10 structured slides from adapted video props + narration sections.
 * One slide per script section: Intro → OnPage → Technical → Security →
 * AIVisibility → Performance → Accessibility → Social → GBP → FinalSummary.
 */
function _buildSlides(props, narrationSections) {
  return [
    // ── 1. Intro ─────────────────────────────────────────────────────────────
    {
      id: 1,
      type: 'homepageIntro',
      title: props.projectName,
      subtitle: props.url,
      narration: narrationSections[0],
      data: {
        url:            props.url,
        projectName:    props.projectName,
        audited_at:     props.audited_at,
        overallScore:   props.scores.overall,
        totalIssues:    props.issueDistribution.total,
        criticalIssues: props.issueDistribution.critical,
        warningIssues:  props.issueDistribution.warnings,
      },
    },

    // ── 2. On-Page SEO ────────────────────────────────────────────────────────
    {
      id: 2,
      type: 'homepageOnPage',
      title: 'On-Page SEO',
      subtitle: `Score: ${props.scores.seo}`,
      narration: narrationSections[1],
      data: {
        sectionName:  'On-Page SEO',
        score:        props.scores.seo,
        issueCount:   props.onPage.issueCount,
        checksCount:  props.onPage.checksCount,
        accentColor:  '#3b82f6',   // blue
      },
    },

    // ── 3. Technical SEO ──────────────────────────────────────────────────────
    {
      id: 3,
      type: 'homepageTechnical',
      title: 'Technical SEO',
      subtitle: `Score: ${props.scores.technicalHealth}`,
      narration: narrationSections[2],
      data: {
        sectionName:  'Technical SEO',
        score:        props.scores.technicalHealth,
        issueCount:   props.technical.issueCount,
        checksCount:  props.technical.checksCount,
        accentColor:  '#06b6d4',   // cyan
      },
    },

    // ── 4. Security ───────────────────────────────────────────────────────────
    {
      id: 4,
      type: 'homepageSecurity',
      title: 'Security',
      subtitle: `Score: ${props.scores.security}`,
      narration: narrationSections[3],
      data: {
        sectionName:   'Security',
        score:         props.scores.security,
        issueCount:    props.security.issueCount,
        criticalCount: props.security.criticalCount,
        checksCount:   null,
        accentColor:   '#ef4444',  // red
      },
    },

    // ── 5. AI Visibility ──────────────────────────────────────────────────────
    {
      id: 5,
      type: 'homepageAIVisibility',
      title: 'AI Visibility',
      subtitle: `Score: ${props.scores.aiVisibility}`,
      narration: narrationSections[4],
      data: {
        score:         props.scores.aiVisibility,
        issueCount:    props.aiVisibility.issueCount,
        criticalCount: props.aiVisibility.criticalCount,
        llmScore:      props.aiVisibility.llmScore,
        aiChecks:      props.aiChecks,
      },
    },

    // ── 6. Performance ────────────────────────────────────────────────────────
    {
      id: 6,
      type: 'homepagePerformance',
      title: 'Performance',
      subtitle: `Score: ${props.scores.performance}`,
      narration: narrationSections[5],
      data: {
        score:        props.scores.performance,
        mobileScore:  props.performanceMetrics.mobileScore,
        desktopScore: props.performanceMetrics.desktopScore,
        responseTime: props.performance.responseTime,
        issueCount:   props.performance.issueCount,
      },
    },

    // ── 7. Accessibility ──────────────────────────────────────────────────────
    {
      id: 7,
      type: 'homepageAccessibility',
      title: 'Accessibility',
      subtitle: `Score: ${props.scores.accessibility}`,
      narration: narrationSections[6],
      data: {
        sectionName:   'Accessibility',
        score:         props.scores.accessibility,
        issueCount:    props.accessibility.issueCount,
        criticalCount: props.accessibility.criticalCount,
        checksCount:   null,
        accentColor:   '#10b981',  // green
      },
    },

    // ── 8. Social Signals ─────────────────────────────────────────────────────
    {
      id: 8,
      type: 'homepageSocialSignals',
      title: 'Social Signals',
      subtitle: `${props.social.connectedCount} Connected`,
      narration: narrationSections[7],
      data: {
        connectedCount: props.social.connectedCount,
        missingCount:   props.social.missingCount,
        platforms:      props.social.platforms,
      },
    },

    // ── 9. Google Business Presence ───────────────────────────────────────────
    {
      id: 9,
      type: 'homepageGBP',
      title: 'Google Business Presence',
      subtitle: props.googleBusinessPresence.found ? 'Profile Found' : 'Profile Not Found',
      narration: narrationSections[8],
      data: props.googleBusinessPresence,
    },

    // ── 10. Final Summary ─────────────────────────────────────────────────────
    {
      id: 10,
      type: 'homepageFinalSummary',
      title: 'Final Summary',
      subtitle: 'Key Opportunities',
      narration: narrationSections[9],
      data: {
        overallScore: props.scores.overall,
        topIssues:    props.topIssues4,
      },
    },
  ];
}

module.exports = { process };
