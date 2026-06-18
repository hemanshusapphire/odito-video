/**
 * Full Audit Narration Helpers
 * Extracted verbatim from VideoWorker class — zero logic changes.
 * All narration text is identical to the original worker.
 */

function generateKeywordNarration(keywordData) {
  const totalKeywords = keywordData.totalKeywords || 0;
  const topRankingsCount = keywordData.topRankings?.length || 0;
  const opportunitiesCount = keywordData.opportunities?.length || 0;
  const notRankingCount = keywordData.notRanking?.length || 0;

  if (notRankingCount === totalKeywords && totalKeywords > 0) {
    return `Currently, none of your ${totalKeywords} tracked keywords are ranking in the top 100 search results. This represents a significant opportunity, as each keyword optimized properly could unlock new streams of organic traffic and potential customers for your business.`;
  }

  if (topRankingsCount > 0 && opportunitiesCount > 0 && notRankingCount > 0) {
    return `Your keyword performance shows mixed results. ${topRankingsCount} keywords are already ranking well, while ${opportunitiesCount} present strong growth opportunities. The ${notRankingCount} keywords not yet ranking need targeted optimization to start appearing in search results.`;
  }

  if (topRankingsCount > 0 && notRankingCount === 0) {
    return `Excellent progress! All ${totalKeywords} of your tracked keywords are ranking, with ${topRankingsCount} achieving top positions. This strong foundation can be leveraged to capture even more search visibility and traffic.`;
  }

  if (opportunitiesCount > 0) {
    return `You have ${opportunitiesCount} keywords positioned just outside the top 10, representing immediate growth opportunities. With focused optimization, these could move to page one and significantly increase your organic traffic.`;
  }

  return `You're tracking ${totalKeywords} keywords. Some are performing well while others present opportunities for improvement. Let's explore how to optimize your keyword strategy for better search visibility.`;
}

function generateAIOverviewNarration(aiVisibilityScore, hasKnowledgeGraph) {
  const score = aiVisibilityScore || 0;
  if (score >= 70) return `Your AI visibility score is ${score}. Your brand has strong presence in AI-generated search results.`;
  if (score >= 50) return `Your AI visibility score is ${score}. Your brand has moderate presence in AI-generated search results.`;
  return `Your AI visibility score is ${score}. Your brand has limited presence in AI-generated search results.`;
}

function generateAICategoryNarration(categories) {
  const scores = Object.values(categories).filter(s => s > 0);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;
  if (avgScore >= 70) return 'Your AI performance shows strong results across key categories, indicating solid optimization for AI search visibility.';
  if (avgScore >= 50) return 'Your AI performance varies across key categories, with moderate optimization overall.';
  return 'Your AI performance needs attention across multiple categories to improve search visibility.';
}

function generateAIDetailedMetricsNarration(detailedMetrics) {
  return 'Your technical AI readiness shows improvement opportunities in schema, FAQs, and content structure.';
}

function generateAITopIssuesNarration(checklist) {
  const topIssues = extractTopIssues(checklist);
  if (topIssues.length === 0) return 'Your AI optimization shows no critical issues.';
  return `These are the top 3 critical issues impacting your AI visibility.`;
}

function extractTopIssues(checklist) {
  if (!Array.isArray(checklist) || checklist.length === 0) return [];

  const sortedIssues = [...checklist]
    .map(issue => {
      const title = issue.title || issue.description || issue.item || 'Unknown issue';
      const scoreMatch = title.match(/scored\s+(\d+(?:\.\d+)?)/);
      const realScore = scoreMatch ? parseFloat(scoreMatch[1]) : (issue.score || issue.score_value || 0);

      let cleanTitle = title
        .replace(/^Rule\s+/i, '')
        .replace(/\s+scored\s+\d+(?:\.\d+)?\s*$/i, '')
        .trim();

      cleanTitle = cleanTitle
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();

      if (!cleanTitle) {
        cleanTitle = title
          .replace(/^Rule\s+\w+\s+scored\s+\d+(?:\.\d+)?$/i, 'Technical Issue')
          .trim();
      }

      return {
        title: cleanTitle,
        score: realScore,
        status: issue.status || 'info',
        category: 'general',
        recommendation: issue.recommendation || ''
      };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return sortedIssues;
}

function deriveCategory(title) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('schema') || lowerTitle.includes('structured')) return 'schema';
  if (lowerTitle.includes('faq') || lowerTitle.includes('question')) return 'faq';
  if (lowerTitle.includes('entity') || lowerTitle.includes('knowledge')) return 'entity';
  if (lowerTitle.includes('citation') || lowerTitle.includes('authority')) return 'citation';
  if (lowerTitle.includes('conversational') || lowerTitle.includes('content')) return 'content';
  return 'general';
}

function generateIssueNarration(totalCount, shownCount, issueType) {
  if (shownCount < totalCount) {
    return `Your website has ${totalCount} ${issueType}-priority issues. Showing the top ${shownCount} most important issues that need attention.`;
  }
  return `Your website has ${totalCount} ${issueType}-priority issues that need attention.`;
}

function generateTechnicalNarration(technicalHighlights) {
  const firstFailingCheck = extractFirstFailingCheck(technicalHighlights);
  if (firstFailingCheck) {
    return `From a technical perspective, your website shows a mix of strengths and issues. Key areas such as ${firstFailingCheck} need attention, while several other aspects are properly configured.`;
  }
  return `From a technical perspective, your website shows a mix of strengths and issues. Several aspects are properly configured while others need attention.`;
}

function extractFirstFailingCheck(technicalHighlights) {
  if (!technicalHighlights || typeof technicalHighlights !== 'object') return null;
  const checks = technicalHighlights.checks || technicalHighlights.items || [];
  for (const check of checks) {
    if (check.status === 'FAIL' || check.status === 'WARN') {
      return check.name || check.check || check.title || 'technical issue';
    }
  }
  return null;
}

function getPerformanceGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getLCPValue(mobileData) {
  const lcp = mobileData?.lcp;
  if (typeof lcp === 'number') return lcp.toFixed(1);
  if (typeof lcp === 'string' && lcp !== 'N/A') return lcp;
  return '5.1';
}

function generateCoreWebVitalsNarration(coreWebVitals) {
  const mobile = coreWebVitals?.mobile || {};
  const desktop = coreWebVitals?.desktop || {};
  return `Core Web Vitals show that on mobile, Largest Contentful Paint is ${mobile.lcp || 'N/A'} and Total Blocking Time is ${mobile.tbt || 'N/A'}. On desktop, LCP is ${desktop.lcp || 'N/A'} and TBT is ${desktop.tbt || 'N/A'}, reflecting differences in performance across devices.`;
}

function extractCoreWebVitals(performanceMetrics) {
  try {
    const mobileMetrics = performanceMetrics?.metrics || [];
    const desktopMetrics = performanceMetrics?.desktopMetrics || [];

    const find = (arr, term) => arr.find(m =>
      m?.metric?.toLowerCase().includes(term.toLowerCase())
    );

    return {
      mobile: {
        lcp: find(mobileMetrics, 'largest contentful')?.mobile || find(mobileMetrics, 'lcp')?.desktop || 'N/A',
        tbt: find(mobileMetrics, 'total blocking')?.mobile   || find(mobileMetrics, 'tbt')?.desktop   || 'N/A',
        fcp: find(mobileMetrics, 'first contentful')?.mobile || find(mobileMetrics, 'fcp')?.desktop   || 'N/A',
        cls: find(mobileMetrics, 'cumulative')?.mobile       || find(mobileMetrics, 'cls')?.desktop   || 'N/A',
        score: performanceMetrics?.mobileScore || 0
      },
      desktop: {
        lcp: find(desktopMetrics, 'largest contentful')?.desktop || find(desktopMetrics, 'lcp')?.mobile || 'N/A',
        tbt: find(desktopMetrics, 'total blocking')?.desktop    || find(desktopMetrics, 'tbt')?.mobile  || 'N/A',
        fcp: find(desktopMetrics, 'first contentful')?.desktop  || find(desktopMetrics, 'fcp')?.mobile  || 'N/A',
        cls: find(desktopMetrics, 'cumulative')?.desktop        || find(desktopMetrics, 'cls')?.mobile  || 'N/A',
        score: performanceMetrics?.desktopScore || 0
      }
    };
  } catch (error) {
    console.warn(`[FULL_AUDIT_NARRATION] ⚠️ Error extracting Core Web Vitals:`, error.message);
    const empty = { lcp: 'N/A', tbt: 'N/A', fcp: 'N/A', cls: 'N/A', score: 0 };
    return { mobile: { ...empty }, desktop: { ...empty } };
  }
}

module.exports = {
  generateKeywordNarration,
  generateAIOverviewNarration,
  generateAICategoryNarration,
  generateAIDetailedMetricsNarration,
  generateAITopIssuesNarration,
  extractTopIssues,
  deriveCategory,
  generateIssueNarration,
  generateTechnicalNarration,
  extractFirstFailingCheck,
  getPerformanceGrade,
  getLCPValue,
  generateCoreWebVitalsNarration,
  extractCoreWebVitals
};
