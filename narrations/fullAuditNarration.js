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

function generateAIVisibilityOverviewNarration(aiHubSnapshot) {
  if (!aiHubSnapshot) {
    return 'Your AI Visibility data is being analyzed. Once complete, you will see detailed scores across AISO, AEO, and GEO dimensions.';
  }
  const { overallScore, pagesScored, hubScores, issuesBySeverity } = aiHubSnapshot;
  const aisoS = hubScores?.aiso ?? 0;
  const aeoS  = hubScores?.aeo  ?? 0;
  const geoS  = hubScores?.geo  ?? 0;
  const highCount = issuesBySeverity?.high ?? 0;
  const total = highCount + (issuesBySeverity?.medium ?? 0) + (issuesBySeverity?.low ?? 0);

  let n = `Your AI Visibility score is ${overallScore} out of 100, analyzed across ${pagesScored} pages. `;

  const weak = [];
  if (aisoS < 70) weak.push(`AISO at ${aisoS}`);
  if (aeoS  < 70) weak.push(`AEO at ${aeoS}`);
  if (geoS  < 70) weak.push(`GEO at ${geoS}`);

  if (weak.length === 0) {
    n += 'All three AI dimensions are performing well — your content is discoverable, answerable, and trusted by generative engines. ';
  } else if (weak.length === 1) {
    n += `${weak[0]} is the primary area needing improvement. `;
  } else {
    n += `${weak.join(' and ')} are the primary areas needing improvement. `;
  }

  if (total > 0) {
    n += `There are ${total} AI-specific issues to address, with ${highCount} high-priority items requiring immediate attention.`;
  }
  return n;
}

function generateAISONarration(aisoData) {
  if (!aisoData) {
    return 'AISO data is being processed. This hub measures how well AI search agents can crawl, index, and cite your content.';
  }
  const { score, cards, issueDistribution } = aisoData;
  const crawlScore = cards?.crawlability?.score ?? 0;
  const citeScore  = cards?.citability?.score   ?? 0;
  const highCount  = issueDistribution?.high     ?? 0;

  let n = `Your AI Search Optimization score is ${score}. `;

  if (score >= 70) {
    n += 'Your site is well-positioned for AI crawler access and citation. ';
  } else if (score >= 40) {
    n += 'There are meaningful gaps preventing full AI crawler access and indexing. ';
  } else {
    n += 'Significant barriers are blocking AI crawlers from indexing your content effectively. ';
  }

  if (crawlScore < 70) {
    n += `Crawlability at ${crawlScore} indicates AI bots face obstacles reaching your pages. `;
  }
  if (citeScore < 70) {
    n += `Citability at ${citeScore} means your content is not yet structured for AI citation. `;
  }
  if (highCount > 0) {
    n += `Resolving the ${highCount} high-priority AISO issues will directly improve your AI crawler accessibility.`;
  }
  return n;
}

function generateAEONarration(aeoData) {
  if (!aeoData) {
    return 'AEO data is being processed. This hub measures how well your content answers questions posed to AI assistants.';
  }
  const { score, signals, issueDistribution } = aeoData;
  const passingSignals = (signals || []).filter(s => s.status === 'pass').length;
  const totalSignals   = (signals || []).length;
  const highCount      = issueDistribution?.high ?? 0;

  let n = `Your Answer Engine Optimization score is ${score}. `;

  if (score >= 70) {
    n += 'Your content is well-structured for AI assistants to extract direct answers. ';
  } else if (score >= 40) {
    n += 'Your content partially meets AEO standards but has structural gaps AI assistants struggle with. ';
  } else {
    n += 'Your content is not yet optimized for AI assistants to find and deliver accurate answers. ';
  }

  if (totalSignals > 0) {
    n += `${passingSignals} of ${totalSignals} AEO signals are passing. `;
  }
  if (highCount > 0) {
    n += `Address the ${highCount} high-priority AEO issues to significantly boost your answer engine rankings.`;
  }
  return n;
}

function generateGEONarration(geoData) {
  if (!geoData) {
    return 'GEO data is being processed. This hub measures how well generative AI engines trust and feature your content.';
  }
  const { score, entityTrustScore, cards, issueDistribution } = geoData;
  const GEO_CARD_LABELS = {
    entity_authority:      'Entity Authority',
    knowledge_graph_score: 'Knowledge Graph',
    brand_corroboration:   'Brand Corroboration',
    schema_coverage:       'Schema Coverage',
  };
  const topCard = Object.entries(cards || {})
    .map(([key, c]) => ({ key, score: c?.score ?? 0 }))
    .sort((a, b) => b.score - a.score)[0] ?? null;
  const highCount = issueDistribution?.high ?? 0;

  let n = `Your Generative Engine Optimization score is ${score}, giving you an entity trust grade of ${entityTrustScore}. `;

  if (score >= 70) {
    n += 'Generative AI engines recognize your entity and surface your content with confidence. ';
  } else if (score >= 40) {
    n += 'Generative engines partially trust your entity but lack enough signals to feature you consistently. ';
  } else {
    n += 'Your entity signals are weak, causing generative engines to overlook your content. ';
  }

  if (topCard && topCard.score > 0) {
    n += `Your strongest GEO area is ${GEO_CARD_LABELS[topCard.key] ?? topCard.key} at ${topCard.score}. `;
  }
  if (highCount > 0) {
    n += `Fixing the ${highCount} high-priority GEO issues will strengthen your entity trust signals.`;
  }
  return n;
}

module.exports = {
  generateKeywordNarration,
  generateIssueNarration,
  generateTechnicalNarration,
  extractFirstFailingCheck,
  getPerformanceGrade,
  getLCPValue,
  generateCoreWebVitalsNarration,
  extractCoreWebVitals,
  generateAIVisibilityOverviewNarration,
  generateAISONarration,
  generateAEONarration,
  generateGEONarration,
};
