import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";

import { IntroScene }                  from "./scenes/IntroScene";
import { SectionScoreScene }           from "./scenes/SectionScoreScene";
import { AIVisibilityScene }           from "./scenes/AIVisibilityScene";
import { PerformanceScene }            from "./scenes/PerformanceScene";
import { SocialSignalsScene }          from "./scenes/SocialSignalsScene";
import { GoogleBusinessPresenceScene } from "./scenes/GoogleBusinessPresenceScene";
import { FinalSummaryScene }           from "./scenes/FinalSummaryScene";
import { OverallScoreScene }           from "./scenes/OverallScoreScene";
import { CategoryScoresScene }         from "./scenes/CategoryScoresScene";
import { TopIssuesScene }              from "./scenes/TopIssuesScene";
import { AISummaryScene }              from "./scenes/AISummaryScene";
import { CTAScene }                    from "./scenes/CTAScene";

import { buildSlideTiming, totalFrames } from "../lib/utils";
import { background } from "../lib/colors";
import type { HomepageAuditVideoProps, SlideType, SlideData } from "../lib/types";

const SCENE_MAP: Record<SlideType, React.FC<{ data: SlideData; narration?: string }>> = {
  homepageIntro:          IntroScene           as React.FC<{ data: SlideData; narration?: string }>,
  homepageOnPage:         SectionScoreScene    as React.FC<{ data: SlideData; narration?: string }>,
  homepageTechnical:      SectionScoreScene    as React.FC<{ data: SlideData; narration?: string }>,
  homepageSecurity:       SectionScoreScene    as React.FC<{ data: SlideData; narration?: string }>,
  homepageAccessibility:  SectionScoreScene    as React.FC<{ data: SlideData; narration?: string }>,
  homepageAIVisibility:   AIVisibilityScene    as React.FC<{ data: SlideData; narration?: string }>,
  homepagePerformance:    PerformanceScene     as React.FC<{ data: SlideData; narration?: string }>,
  homepageSocialSignals:  SocialSignalsScene   as React.FC<{ data: SlideData; narration?: string }>,
  homepageGBP:            GoogleBusinessPresenceScene as React.FC<{ data: SlideData; narration?: string }>,
  homepageFinalSummary:   FinalSummaryScene    as React.FC<{ data: SlideData; narration?: string }>,
  homepageOverallScore:   OverallScoreScene    as React.FC<{ data: SlideData; narration?: string }>,
  homepageCategoryScores: CategoryScoresScene  as React.FC<{ data: SlideData; narration?: string }>,
  homepageTopIssues:      TopIssuesScene       as React.FC<{ data: SlideData; narration?: string }>,
  homepageAISummary:      AISummaryScene       as React.FC<{ data: SlideData; narration?: string }>,
  homepageCTA:            CTAScene             as React.FC<{ data: SlideData; narration?: string }>,
};

// Per-sequence fade-out wrapper — reads local frame inside each Sequence
const SceneFadeWrapper: React.FC<{ durationInFrames: number; children: React.ReactNode }> = ({
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const HomepageAuditVideo: React.FC<HomepageAuditVideoProps> = ({
  slidesWithAudio = [],
  fps: propsFps,
}) => {
  const { fps: configFps } = useVideoConfig();
  const fps = propsFps ?? configFps ?? 30;
  const frame = useCurrentFrame();

  const timings = useMemo(() => buildSlideTiming(slidesWithAudio, fps), [slidesWithAudio, fps]);
  const total   = useMemo(() => totalFrames(timings), [timings]);

  const globalOpacity = interpolate(
    frame,
    [Math.max(0, total - 12), total],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  if (slidesWithAudio.length === 0) {
    return (
      <AbsoluteFill style={{ background, color: "#F0F0FF", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", fontFamily: "Inter, DM Sans, system-ui, sans-serif" }}>
        <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>No slides available</div>
        <div style={{ fontSize: 20, opacity: 0.4 }}>Waiting for homepage audit slide data…</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background, opacity: globalOpacity }}>
      {timings.map((timing) => {
        const { slide, from, durationInFrames, index } = timing;
        const Scene = SCENE_MAP[slide.type];
        if (!Scene) {
          console.warn(`[HomepageAuditVideo] Unknown slide type: "${slide.type}"`);
          return null;
        }
        return (
          <Sequence key={index} from={from} durationInFrames={durationInFrames}>
            {slide.audio && (
              <Audio src={staticFile(slide.audio)} volume={1} startFrom={0} endAt={durationInFrames} />
            )}
            <SceneFadeWrapper durationInFrames={durationInFrames}>
              <Scene data={slide.data} narration={slide.narration} />
            </SceneFadeWrapper>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
