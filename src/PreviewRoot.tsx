/**
 * PreviewRoot.tsx — lightweight preview compositions for individual slides.
 * Used only by the capture-audit-slides.mjs screenshot script.
 * NOT part of production video rendering.
 */
import React from "react";
import { Composition, registerRoot } from "remotion";
import { AIVisibilityOverviewSlide } from "./slides/AIVisibilityOverviewSlide";
import { AISOSlide } from "./slides/AISOSlide";
import { CoverSlide } from "./slides/CoverSlide";

const aiHubSnapshot = {
  overallScore: 42,
  pagesScored: 25,
  hubScores: { aiso: 77, aeo: 28, geo: 21 },
  issuesBySeverity: { critical: 22, high: 82, medium: 101, low: 49 },
};

const aisoData = {
  score: 77,
  cards: {
    crawlability: { score: 83, total_passed: 8, total_failed: 2 },
    citability:   { score: 100, total_passed: 5, total_failed: 0 },
    authority:    { score: 51, total_passed: 4, total_failed: 4 },
    coverage:     { score: 73, total_passed: 6, total_failed: 2 },
  },
  bots: { googlebot: "pass", gptbot: "pass", claudebot: "pass" },
  issueDistribution: { critical: 0, high: 2, medium: 5, low: 3, total: 10 },
};

const CoverPreview: React.FC = () => (
  <CoverSlide
    data={{
      projectName: "Naxonify-Com",
      url: "https://naxonify.com",
      pagesCrawled: 25,
      scores: { overall: 53 },
      issueDistribution: { total: 368, high: 231, medium: 137, low: 0 },
      auditDate: "July 2026",
      description: "A comprehensive AI visibility and SEO audit of Naxonify-Com.",
    }}
    narration=""
  />
);

const AIVisibilityPreview: React.FC = () => (
  <AIVisibilityOverviewSlide data={{ aiHubSnapshot }} narration="" />
);

const AISOPreview: React.FC = () => (
  <AISOSlide data={{ aiso: aisoData }} narration="" />
);

export const PreviewRootComponent: React.FC = () => (
  <>
    <Composition
      id="PreviewCover"
      component={CoverPreview}
      durationInFrames={192}
      fps={24}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
    <Composition
      id="PreviewAIVisibility"
      component={AIVisibilityPreview}
      durationInFrames={192}
      fps={24}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
    <Composition
      id="PreviewAISO"
      component={AISOPreview}
      durationInFrames={192}
      fps={24}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  </>
);

registerRoot(PreviewRootComponent);
