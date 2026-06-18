const { ObjectId } = require('mongodb');
const jobService = require('../shared/jobService');
const renderService = require('../shared/renderService');
const audioOrchestrator = require('../shared/audioOrchestrator');
const narration = require('../narrations/fullAuditNarration');

/**
 * Full Audit Video Processor
 * Contains all Full Audit specific logic extracted verbatim from VideoWorker.
 * No logic changes — pure extraction.
 *
 * Handles: VIDEO_GENERATION jobs (videoType === 'FULL_AUDIT' or absent)
 */

const COMPOSITION_ID = 'AuditVideo';
const MAX_RETRIES = 3;

/**
 * Entry point — called by worker.js router.
 *
 * @param {Object} job - { jobId, projectId, auditSnapshot, ...rest }
 * @param {Object} services - { audioService, config: { backendUrl, backendPublicPath } }
 */
async function process(job, services) {
  const { jobId, projectId, auditSnapshot } = job;
  const { audioService, config } = services;

  // Full Audit specific validation (was in worker.js setupRoutes())
  if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
    console.error(`[FULL_AUDIT_PROCESSOR] ❌ INVALID projectId | projectId=${projectId}`);
    await jobService.updateJobStatus(config.backendUrl, jobId, 'failed', {
      error: { message: 'Valid projectId is required' }
    });
    return;
  }

  if (!ObjectId.isValid(projectId.trim())) {
    console.error(`[FULL_AUDIT_PROCESSOR] ❌ INVALID projectId format | projectId=${projectId}`);
    await jobService.updateJobStatus(config.backendUrl, jobId, 'failed', {
      error: { message: 'Invalid projectId format' }
    });
    return;
  }

  if (!auditSnapshot) {
    console.error(`[FULL_AUDIT_PROCESSOR] ❌ MISSING auditSnapshot | jobId=${jobId}`);
    await jobService.updateJobStatus(config.backendUrl, jobId, 'failed', {
      error: { message: 'auditSnapshot is required' }
    });
    return;
  }

  const sanitizedJobId = jobId.toString().replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedProjectId = projectId.toString().replace(/[^a-zA-Z0-9-_]/g, '');

  await _processWithRetry(sanitizedJobId, sanitizedProjectId, auditSnapshot, audioService, config);
}

/**
 * Retry wrapper — identical to VideoWorker.processVideoJob().
 */
async function _processWithRetry(jobId, projectId, auditSnapshot, audioService, config) {
  let retryCount = 0;

  while (retryCount <= MAX_RETRIES) {
    try {
      console.log(`[FULL_AUDIT_PROCESSOR] Processing started | jobId=${jobId} | attempt=${retryCount + 1}`);

      const audit = auditSnapshot;
      if (!audit) throw new Error('auditSnapshot is missing in video worker');

      console.log(`[FULL_AUDIT_PROCESSOR] ✅ Using provided auditSnapshot (NO DB script)`);
      console.log(`[FULL_AUDIT_PROCESSOR] AUDIT SNAPSHOT RECEIVED:`, JSON.stringify(audit, null, 2));

      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 10,
        currentStep: 'Preparing video script',
        retryCount,
        maxRetries: MAX_RETRIES,
        timestamp: new Date(),
        hasAuditSnapshot: !!auditSnapshot
      });

      // Step 1: Generate slides
      console.log(`[FULL_AUDIT_PROCESSOR] Generating structured slides from audit data...`);
      const structuredSlides = generateStructuredSlides(audit);

      if (!structuredSlides || structuredSlides.length === 0) {
        throw new Error('Slides generation failed - no slides created');
      }
      if (structuredSlides.length < 13) {
        throw new Error(`Minimum 13 slides required. Got ${structuredSlides?.length || 0} slides`);
      }

      console.log(`[FULL_AUDIT_PROCESSOR] ✅ Created ${structuredSlides.length} structured slides`);

      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 20,
        currentStep: 'Script prepared - starting audio generation'
      });

      // Step 2: Generate audio
      console.log(`[FULL_AUDIT_PROCESSOR] Generating separate audio for ${structuredSlides.length} slides...`);

      const updateStatus = (jId, status, data) =>
        jobService.updateJobStatus(config.backendUrl, jId, status, data);

      const audioFiles = await audioOrchestrator.generateWithProgress(
        structuredSlides, projectId, jobId, audioService, updateStatus
      );

      console.log(`[FULL_AUDIT_PROCESSOR] ✅ Generated ${audioFiles.length} separate audio files`);

      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 70,
        currentStep: 'Audio generation complete - preparing video rendering'
      });

      // Attach audio to slides
      const slidesWithAudio = audioOrchestrator.attachAudioToSlides(structuredSlides, audioFiles);

      console.log(`[FULL_AUDIT_PROCESSOR] ✅ Attached audio to all slides`);

      if (!slidesWithAudio || slidesWithAudio.length === 0) {
        throw new Error('Slides generation failed - cannot render video without slides');
      }
      if (!audioFiles || audioFiles.length === 0) {
        throw new Error('Audio generation failed - cannot render video without audio');
      }

      console.log(`[FULL_AUDIT_PROCESSOR] ✅ Fail-safe validation passed - proceeding with render`);

      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 80,
        currentStep: 'Rendering video'
      });

      // Step 3: Render
      const videoFileName = `${projectId}-${jobId}.mp4`;
      const videoPath = await renderService.render(
        projectId, jobId, slidesWithAudio, COMPOSITION_ID, config
      );
      console.log(`[FULL_AUDIT_PROCESSOR] Render done | path=${videoPath}`);

      await jobService.updateJobStatus(config.backendUrl, jobId, 'processing', {
        progress: 95,
        currentStep: 'Finalizing video'
      });

      // Step 4: Complete
      console.log(`[FULL_AUDIT_PROCESSOR] 🎬 VIDEO RENDERED: ${videoPath}`);
      console.log(`[FULL_AUDIT_PROCESSOR] 📡 VIDEO URL: ${config.backendUrl}/videos/${videoFileName}`);

      const resultData = {
        videoUrl: `${config.backendUrl}/videos/${videoFileName}`,
        videoFileName,
        audioFiles,
        processingTime: Date.now(),
        retryCount,
        slidesGenerated: structuredSlides.length,
        audioFilesGenerated: audioFiles.length,
        providerUsed: 'per_slide_audio_generation',
        slideBreakdown: {
          originalSlides: 9,
          newAiSlides: 3,
          totalSlides: structuredSlides.length
        }
      };

      console.log(`[FULL_AUDIT_PROCESSOR] SENDING DATA:`, JSON.stringify(resultData, null, 2));
      console.log(`[FULL_AUDIT_PROCESSOR] 🎬 VIDEO COMPLETE:`, {
        jobId,
        projectId,
        videoUrl: resultData.videoUrl,
        videoFileName: resultData.videoFileName,
        status: 'RENDERED'
      });

      await jobService.updateJobStatus(config.backendUrl, jobId, 'completed', {
        progress: 100,
        currentStep: 'Completed',
        result_data: resultData
      });

      console.log(`[FULL_AUDIT_PROCESSOR] Job completed | jobId=${jobId} | attempts=${retryCount + 1}`);
      return;

    } catch (error) {
      console.error(`[FULL_AUDIT_PROCESSOR] Job attempt ${retryCount + 1} failed | jobId=${jobId}:`, error);

      retryCount++;
      const shouldRetry = jobService.shouldRetryJob(error, retryCount, MAX_RETRIES);

      if (shouldRetry && retryCount <= MAX_RETRIES) {
        const delay = Math.min(5000 * Math.pow(2, retryCount - 1), 30000);
        console.log(`[FULL_AUDIT_PROCESSOR] Retrying job in ${delay}ms | jobId=${jobId} | attempt=${retryCount + 1}/${MAX_RETRIES + 1}`);

        await jobService.updateJobStatus(config.backendUrl, jobId, 'retrying', {
          error: error.message,
          retryCount,
          maxRetries: MAX_RETRIES,
          nextRetryAt: new Date(Date.now() + delay)
        });

        await jobService.sleep(delay);
      } else {
        console.error(`[FULL_AUDIT_PROCESSOR] Job failed permanently | jobId=${jobId} | attempts=${retryCount}`);

        await jobService.updateJobStatus(config.backendUrl, jobId, 'failed', {
          error: {
            message: error.message,
            stack: error.stack,
            timestamp: new Date(),
            retryCount,
            finalAttempt: true
          }
        });
        return;
      }
    }
  }
}

/**
 * Generate 15 structured slides (9 base + 4 AI + 1 CTA + 1 keyword) from auditSnapshot.
 * Extracted verbatim from VideoWorker.generateStructuredSlides() — zero logic changes.
 */
function generateStructuredSlides(audit) {
  try {
    console.log(`[FULL_AUDIT_PROCESSOR] 🎬 Generating structured slides from audit data`);

    if (!audit || typeof audit !== 'object') {
      throw new Error('Invalid auditSnapshot provided');
    }

    const projectName = audit?.projectName || 'Website';
    const url = audit?.url || 'N/A';
    const scores = audit?.scores || {};
    const pagesCrawled = audit?.pagesCrawled || 0;
    const issueDistribution = audit?.issueDistribution || {};
    const topIssues = audit?.topIssues || {};
    const highIssues = topIssues?.high || [];
    const mediumIssues = topIssues?.medium || [];
    const lowIssues = topIssues?.low || [];

    console.log(`[FULL_AUDIT_PROCESSOR] 📊 Issue counts for dynamic narration:`);
    console.log(`[FULL_AUDIT_PROCESSOR]   High issues: ${issueDistribution.high || 0}`);
    console.log(`[FULL_AUDIT_PROCESSOR]   Medium issues: ${issueDistribution.medium || 0}`);
    console.log(`[FULL_AUDIT_PROCESSOR]   Low issues: ${issueDistribution.low || 0}`);

    const technicalHighlights = audit?.technicalHighlights || {};
    const performanceMetrics = audit?.performanceMetrics || {};
    const coreWebVitals = narration.extractCoreWebVitals(performanceMetrics);
    const keywordData = audit?.keywordData || {};
    const aiAnalysis = audit?.aiAnalysis || {};

    console.log(`[FULL_AUDIT_PROCESSOR] 📊 Keyword data extracted:`, {
      totalKeywords: keywordData.totalKeywords || 0,
      topRankingsCount: keywordData.topRankings?.length || 0,
      opportunitiesCount: keywordData.opportunities?.length || 0,
      notRankingCount: keywordData.notRanking?.length || 0
    });

    console.log(`[FULL_AUDIT_PROCESSOR] 📈 Extracted data - Project: ${projectName}, Overall Score: ${scores.overall}`);

    // Score helpers (inline in original, kept here for identical behavior)
    function getScoreStatus(score) {
      const normalizedScore = score || 0;
      if (normalizedScore >= 75) return 'strong';
      if (normalizedScore >= 50) return 'moderate';
      return 'weak';
    }

    function groupScores(scores) {
      const groups = { strong: [], moderate: [], weak: [] };
      const metrics = [
        { name: 'Technical', key: 'technicalHealth' },
        { name: 'Performance', key: 'performance' },
        { name: 'SEO', key: 'seo' },
        { name: 'AI Visibility', key: 'aiVisibility' }
      ];
      metrics.forEach(metric => {
        const score = scores[metric.key];
        if (score !== null && score !== undefined && !isNaN(score)) {
          groups[getScoreStatus(score)].push({ name: metric.name, score });
        }
      });
      return groups;
    }

    function generateScoreNarration(scores) {
      const overall = scores.overall || 0;
      const groups = groupScores(scores);
      let n = `Your overall score is ${overall} out of 100. `;
      if (groups.strong.length > 0) {
        const list = groups.strong.map(m => `${m.name} at ${m.score}`).join(' and ');
        n += `${list} ${groups.strong.length === 1 ? 'is' : 'are'} performing strongly. `;
      }
      if (groups.moderate.length > 0) {
        const list = groups.moderate.map(m => `${m.name} at ${m.score}`).join(' and ');
        n += `${list} show${groups.moderate.length === 1 ? 's' : ''} moderate performance. `;
      }
      if (groups.weak.length > 0) {
        const list = groups.weak.map(m => `${m.name} at ${m.score}`).join(' and ');
        if (groups.weak.length === 1) {
          n += `${list} is underperforming and needs attention. `;
        } else {
          n += `${list} are underperforming and need immediate attention. `;
        }
      }
      if (groups.weak.length >= 2) {
        n += 'These gaps are severely limiting your growth and require urgent action.';
      } else if (groups.weak.length === 1) {
        n += 'This gap represents an improvement opportunity that could boost your overall performance.';
      } else {
        n += 'Your strong performance across all areas positions you well for continued success.';
      }
      return n;
    }

    const slides = [
      {
        id: 1,
        type: 'projectOverview',
        title: projectName,
        subtitle: url,
        narration: `${projectName} scores ${scores.overall || 0} out of 100 — not because the business isn't good, but because the website isn't communicating that to search engines. Let's break down exactly why.`,
        data: { projectName, url, pagesCrawled, scores, issueDistribution }
      },
      {
        id: 2,
        type: 'scoreSummary',
        title: 'Overall Score Analysis',
        subtitle: `Score: ${scores.overall || 0}/100`,
        narration: generateScoreNarration(scores),
        data: { scores, overall: scores.overall || 0 }
      },
      {
        id: 3,
        type: 'issueDistribution',
        title: 'Issue Distribution',
        subtitle: `${issueDistribution.total || 0} Total Issues`,
        narration: `${issueDistribution.total || 0} issues found — and ${issueDistribution.high || 0} of them are high priority. That means ${Math.round(((issueDistribution.high || 0) / (issueDistribution.total || 1)) * 100)}% of your problems are actively costing you rankings right now, today.`,
        data: { issueDistribution, total: issueDistribution.total || 0 }
      },
      {
        id: 4,
        type: 'highIssues',
        title: 'High Priority Issues',
        subtitle: (issueDistribution.high || 0) === 0
          ? 'No issues detected 🎉'
          : `Showing top ${highIssues.length} of ${issueDistribution.high || 0} high-priority issues`,
        narration: (issueDistribution.high || 0) === 0
          ? 'Excellent news! There are no high priority issues detected. This means your site doesn\'t have any critical problems that could be actively harming your rankings right now.'
          : 'These high priority issues are the ones bleeding your score the most. Every one of them fixed is a direct point gain — address them first and your overall score could jump significantly within 30 days.',
        data: { issues: highIssues, count: highIssues.length, totalHigh: issueDistribution.high || 0, hasZeroIssues: (issueDistribution.high || 0) === 0 }
      },
      {
        id: 5,
        type: 'mediumIssues',
        title: 'Medium Priority Issues',
        subtitle: (issueDistribution.medium || 0) === 0
          ? 'No issues detected 🎉'
          : `Showing top ${mediumIssues.length} of ${issueDistribution.medium || 0} issues`,
        narration: (issueDistribution.medium || 0) === 0
          ? 'Great job! There are no medium priority issues to address. Your site is already well-maintained beyond the critical fixes, showing search engines you\'re running a tight ship.'
          : 'Your medium priority issues aren\'t urgent, but they\'re adding up quietly. Resolve these and you\'re not just fixing problems — you\'re sending search engines a signal that this site is actively maintained and trustworthy.',
        data: { issues: mediumIssues, count: mediumIssues.length, totalMedium: issueDistribution.medium || 0, hasZeroIssues: (issueDistribution.medium || 0) === 0 }
      },
      {
        id: 6,
        type: 'lowIssues',
        title: 'Low Priority Issues',
        subtitle: (issueDistribution.low || 0) === 0
          ? 'No issues detected 🎉'
          : `Showing top ${lowIssues.length} of ${issueDistribution.low || 0} issues`,
        narration: (issueDistribution.low || 0) === 0
          ? 'The good news is, there are no low-priority issues detected. This means your site is already clean at the foundational level, allowing you to focus on higher-impact improvements.'
          : 'Even the low priority items matter. Small fixes, but each one removed is one less reason for search engines to rank someone else above you.',
        data: { issues: lowIssues, count: lowIssues.length, totalLow: issueDistribution.low || 0, hasZeroIssues: (issueDistribution.low || 0) === 0 }
      },
      {
        id: 7,
        type: 'technicalHighlights',
        title: 'Technical Highlights',
        subtitle: 'Technical SEO Overview',
        narration: `${scores.technicalHealth || 0} is decent — but all ${pagesCrawled || 0} pages are missing security headers, which search engines flag as unsafe. Plus inconsistent H1 tags mean search engines can't identify what your pages are actually about.`,
        data: { auditSnapshot: { technicalHighlights, scores, issueDistribution } }
      },
      {
        id: 8,
        type: 'performanceSummary',
        title: 'Performance Summary',
        subtitle: `Performance Score: ${performanceMetrics.pageSpeed || 0}`,
        narration: (() => {
          const pageSpeed = performanceMetrics.pageSpeed || 0;
          const mobileScore = performanceMetrics.mobileScore || 0;
          const desktopScore = performanceMetrics.desktopScore || 0;
          const getCategory = s => s >= 75 ? 'strong' : s >= 50 ? 'moderate' : 'weak';
          let n = `Your performance score is ${pageSpeed}. `;
          if (mobileScore < desktopScore) {
            n += `Mobile performance is lagging at ${mobileScore} compared to desktop at ${desktopScore}. `;
          } else if (desktopScore < mobileScore) {
            n += `Desktop performance is lower at ${desktopScore} compared to mobile at ${mobileScore}. `;
          } else {
            n += `Both mobile and desktop are similar at ${mobileScore}. `;
          }
          const category = getCategory(pageSpeed);
          if (category === 'weak') {
            n += 'This indicates serious performance bottlenecks affecting load speed and user experience. ';
          } else if (category === 'moderate') {
            n += 'This shows moderate performance with room for optimization. ';
          } else {
            n += 'This demonstrates strong performance across the board. ';
          }
          if (pageSpeed < 50 || mobileScore < 50) {
            n += 'Focus on optimizing heavy assets, enabling compression, and improving load efficiency for quick gains.';
          } else {
            n += 'Consider fine-tuning with caching strategies and minor optimizations for even better results.';
          }
          return n;
        })(),
        data: {
          pageSpeed: performanceMetrics.pageSpeed || 0,
          mobileScore: performanceMetrics.mobileScore || 0,
          desktopScore: performanceMetrics.desktopScore || 0
        }
      },
      {
        id: 9,
        type: 'coreWebVitals',
        title: 'Core Web Vitals',
        subtitle: 'User Experience Metrics',
        narration: `Your main content takes ${narration.getLCPValue(coreWebVitals?.mobile)} seconds to appear on mobile — search engine guidelines recommend 2.5. That gap is where your visitors lose patience and leave. Desktop is better, but still problematic.`,
        data: coreWebVitals
      },
      {
        id: 10,
        type: 'keywords',
        title: 'Keyword Performance',
        subtitle: `${keywordData.totalKeywords || 0} Keywords Tracked`,
        narration: narration.generateKeywordNarration(keywordData),
        data: keywordData
      }
    ];

    const newAiSlides = generateAISlides(aiAnalysis, scores);

    const slide14 = {
      id: 15,
      type: 'ctaClosure',
      title: "What's Next?",
      subtitle: 'Take Action on Your SEO & AI Growth',
      narration: `Now you have two clear paths. You can use the AI-powered suggestions provided in this audit and implement them yourself. Or, if you'd prefer faster and expert-driven results, our team can handle everything for you. Let's take your SEO and AI visibility to the next level.`,
      data: {
        cards: [
          { title: 'Use AI Suggestions', description: 'Follow the AI recommendations provided in this audit to improve your SEO step by step.' },
          { title: 'Do It Yourself', description: 'Apply the fixes on your own using the insights and improve your rankings gradually.' },
          { title: 'Let Us Handle It', description: 'Our team can implement everything for you. Get in touch and scale your SEO faster.' }
        ]
      }
    };

    const allSlides = [...slides, ...newAiSlides, slide14];

    if (allSlides.length < 14) {
      throw new Error(`Minimum 14 slides required. Got ${allSlides.length}`);
    }

    allSlides.forEach((slide, index) => {
      if (!slide.id || !slide.type || !slide.narration) {
        throw new Error(`Slide ${index + 1} missing required fields`);
      }
    });

    console.log(`[FULL_AUDIT_PROCESSOR] ✅ Successfully created ${allSlides.length} structured slides`);
    return allSlides;

  } catch (error) {
    console.error(`[FULL_AUDIT_PROCESSOR] ❌ Error generating structured slides:`, error);
    throw error;
  }
}

/**
 * Generate 4 AI Analysis slides (10–13) from aiAnalysis data.
 * Extracted verbatim from VideoWorker.generateAISlides() — zero logic changes.
 */
function generateAISlides(aiAnalysis, scores) {
  try {
    console.log(`[FULL_AUDIT_PROCESSOR] 🤖 Generating AI Analysis slides from aiAnalysis data`);

    if (!aiAnalysis || typeof aiAnalysis !== 'object') {
      console.warn(`[FULL_AUDIT_PROCESSOR] ⚠️ aiAnalysis data missing or invalid, using fallback values`);
      aiAnalysis = { score: 0, summary: 'AI analysis data unavailable', hasKnowledgeGraph: false, categories: {}, detailedMetrics: {}, checklist: [] };
    }

    const categories = aiAnalysis.categories || {};
    const detailedMetrics = aiAnalysis.detailedMetrics || {};
    const checklist = aiAnalysis.checklist || [];

    const slide10 = {
      id: 10,
      type: 'aiAnalysis',
      title: 'AI Analysis Overview',
      subtitle: 'AI Search Readiness Summary',
      narration: `And now the most important score in today's world — AI Visibility. ChatGPT, Claude, Perplexity, AI search overviews — these are the new search engines. People aren't just searching online anymore, they're asking AI. And AI decides who to mention, who to recommend, who to trust. Your score is ${scores.aiVisibility || 0} — meaning right now, you're largely invisible in that conversation. This is the score that will define the next 5 years of your online presence.`,
      data: {
        score: scores.aiVisibility || 0,
        summary: aiAnalysis.summary || 'AI analysis data unavailable',
        hasKnowledgeGraph: aiAnalysis.hasKnowledgeGraph || false
      }
    };

    const slide11 = {
      id: 11,
      type: 'aiCategoryBreakdown',
      title: 'AI Category Breakdown',
      subtitle: 'AI Performance Distribution',
      narration: (() => {
        const aiImpact = categories.aiImpact || 0;
        const citationProbability = categories.citationProbability || 0;
        const llmReadiness = categories.llmReadiness || 0;
        const aeoScore = categories.aeoScore || 0;
        const topicalAuthority = categories.topicalAuthority || 0;
        const voiceIntent = categories.voiceIntent || 0;
        const getStatus = s => s >= 75 ? 'strong' : s >= 50 ? 'moderate' : 'weak';
        const allCats = [
          { name: 'AI Impact', score: aiImpact },
          { name: 'Citation Probability', score: citationProbability },
          { name: 'LLM Readiness', score: llmReadiness },
          { name: 'AEO Score', score: aeoScore },
          { name: 'Topical Authority', score: topicalAuthority },
          { name: 'Voice Intent', score: voiceIntent }
        ];
        const groups = { strong: [], moderate: [], weak: [] };
        allCats.forEach(c => groups[getStatus(c.score)].push(c));
        let n = 'Your AI performance shows a mixed distribution across key areas. ';
        if (groups.strong.length > 0) n += `${groups.strong.map(c => `${c.name} at ${c.score}`).join(' and ')} ${groups.strong.length === 1 ? 'is' : 'are'} performing strongly. `;
        if (groups.moderate.length > 0) n += `${groups.moderate.map(c => `${c.name} at ${c.score}`).join(' and ')} ${groups.moderate.length === 1 ? 'shows' : 'show'} moderate performance. `;
        if (groups.weak.length > 0) n += `${groups.weak.map(c => `${c.name} at ${c.score}`).join(' and ')} ${groups.weak.length === 1 ? 'is' : 'are'} underperforming and need attention. `;
        if (groups.weak.length >= 3) n += 'This indicates low AI readiness requiring comprehensive optimization.';
        else if (groups.weak.length >= 1) n += 'Improving these areas will strengthen your AI visibility and authority.';
        else n += 'You demonstrate strong AI optimization across all key areas.';
        return n;
      })(),
      data: {
        categories: {
          aiImpact: categories.aiImpact || 0,
          citationProbability: categories.citationProbability || 0,
          llmReadiness: categories.llmReadiness || 0,
          aeoScore: categories.aeoScore || 0,
          topicalAuthority: categories.topicalAuthority || 0,
          voiceIntent: categories.voiceIntent || 0
        }
      }
    };

    const slide12 = {
      id: 12,
      type: 'aiDetailedMetrics',
      title: 'AI Detailed Metrics',
      subtitle: 'Technical AI Readiness',
      narration: (() => {
        const m = {
          schemaCoverage: detailedMetrics.schemaCoverage || 0,
          faqOptimization: detailedMetrics.faqOptimization || 0,
          conversationalScore: detailedMetrics.conversationalScore || 0,
          aiSnippetProbability: detailedMetrics.aiSnippetProbability || 0,
          aiCitationRate: detailedMetrics.aiCitationRate || 0,
          knowledgeGraph: detailedMetrics.knowledgeGraph || 0
        };
        const getStatus = s => s >= 75 ? 'strong' : s >= 50 ? 'moderate' : 'weak';
        const allMetrics = [
          { name: 'Schema Coverage', score: m.schemaCoverage },
          { name: 'FAQ Optimization', score: m.faqOptimization },
          { name: 'Conversational Score', score: m.conversationalScore },
          { name: 'AI Snippet Probability', score: m.aiSnippetProbability },
          { name: 'AI Citation Rate', score: m.aiCitationRate },
          { name: 'Knowledge Graph', score: m.knowledgeGraph }
        ];
        const groups = { strong: [], moderate: [], weak: [] };
        allMetrics.forEach(met => groups[getStatus(met.score)].push(met));
        let n = 'Your technical AI readiness shows varied performance across key metrics. ';
        if (groups.strong.length > 0) n += `${groups.strong.map(met => `${met.name} at ${met.score}`).join(' and ')} ${groups.strong.length === 1 ? 'is' : 'are'} performing strongly. `;
        if (groups.moderate.length > 0) n += `${groups.moderate.map(met => `${met.name} at ${met.score}`).join(' and ')} ${groups.moderate.length === 1 ? 'shows' : 'show'} moderate performance. `;
        if (groups.weak.length > 0) n += `${groups.weak.map(met => `${met.name} at ${met.score}`).join(' and ')} ${groups.weak.length === 1 ? 'needs' : 'need'} improvement. `;
        if (groups.weak.length >= 3) n += 'This indicates low AI visibility requiring comprehensive optimization.';
        else if (groups.weak.length >= 1) n += 'Addressing these areas presents an opportunity to enhance your AI search presence.';
        else n += 'You demonstrate strong AI readiness across all technical metrics.';
        return n;
      })(),
      data: {
        detailedMetrics: {
          schemaCoverage: detailedMetrics.schemaCoverage || 0,
          faqOptimization: detailedMetrics.faqOptimization || 0,
          conversationalScore: detailedMetrics.conversationalScore || 0,
          aiSnippetProbability: detailedMetrics.aiSnippetProbability || 0,
          aiCitationRate: detailedMetrics.aiCitationRate || 0,
          knowledgeGraph: detailedMetrics.knowledgeGraph || 0
        }
      }
    };

    const slide13 = {
      id: 13,
      type: 'aiTopIssues',
      title: 'AI Top Issues',
      subtitle: 'Critical AI Optimization Areas',
      narration: 'The root cause is clear — AI systems do not understand your entity properly. They don\'t know who you are, what you do, or who you serve. Fixing your entity clarity can significantly improve your AI visibility score.',
      data: { topIssues: narration.extractTopIssues(checklist) }
    };

    const aiSlides = [slide10, slide11, slide12, slide13];
    console.log(`[FULL_AUDIT_PROCESSOR] ✅ Generated ${aiSlides.length} AI Analysis slides (slides 10-13)`);
    aiSlides.forEach(slide => console.log(`[FULL_AUDIT_PROCESSOR]   AI Slide ${slide.id}: ${slide.title} (${slide.type})`));

    return aiSlides;

  } catch (error) {
    console.error(`[FULL_AUDIT_PROCESSOR] ❌ Error generating AI slides:`, error);
    throw error;
  }
}

module.exports = { process };
