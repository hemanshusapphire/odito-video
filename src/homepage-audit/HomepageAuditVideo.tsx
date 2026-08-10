import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";

import { buildSlideTiming, totalFrames } from "../lib/utils";
import type { HomepageAuditVideoProps, SlideType, SlideData } from "../lib/types";

import { IntroScene }          from "./Screen1IntroScene";
import { OverallScoreScene }   from "./Screen2OverallScoreScene";
import { OnPageSeoScene }      from "./Screen3OnPageSeoScene";
import { TechnicalSeoScene }   from "./Screen4TechnicalSeoScene";
import { SecurityScene }       from "./Screen5SecurityScene";
import { AiVisibilityScene }   from "./Screen6AiVisibilityScene";
import { PerformanceScene }      from "./Screen7PerformanceScene";
import { AccessibilityScene }    from "./Screen8AccessibilityScene";
import { SocialSignalsScene }    from "./Screen9SocialSignalsScene";
import { LocalBusinessScene }    from "./Screen10LocalBusinessScene";
import { FinalSummaryScene }     from "./Screen11FinalCtaScene";

const SCENE_MAP: Partial<Record<SlideType, React.FC<{ data: SlideData; narration?: string }>>> = {
  homepageIntro:         IntroScene        as React.FC<{ data: SlideData; narration?: string }>,
  homepageOverallScore:  OverallScoreScene as React.FC<{ data: SlideData; narration?: string }>,
  homepageOnPage:        OnPageSeoScene    as React.FC<{ data: SlideData; narration?: string }>,
  homepageTechnical:     TechnicalSeoScene as React.FC<{ data: SlideData; narration?: string }>,
  homepageSecurity:      SecurityScene     as React.FC<{ data: SlideData; narration?: string }>,
  homepageAIVisibility:  AiVisibilityScene  as React.FC<{ data: SlideData; narration?: string }>,
  homepagePerformance:   PerformanceScene   as React.FC<{ data: SlideData; narration?: string }>,
  homepageAccessibility: AccessibilityScene as React.FC<{ data: SlideData; narration?: string }>,
  homepageSocialSignals: SocialSignalsScene as React.FC<{ data: SlideData; narration?: string }>,
  homepageGBP:           LocalBusinessScene as React.FC<{ data: SlideData; narration?: string }>,
  homepageFinalSummary:  FinalSummaryScene  as React.FC<{ data: SlideData; narration?: string }>,
};

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
  const fps = propsFps ?? configFps ?? 24;
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
      <AbsoluteFill style={{ background: "#0A0A0F", color: "#F0F0FF", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>No slides available</div>
        <div style={{ fontSize: 20, opacity: 0.4 }}>Waiting for homepage audit slide data…</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: "#0A0A0F", opacity: globalOpacity }}>
      {timings.map((timing) => {
        const { slide, from, durationInFrames, index } = timing;
        const Scene = SCENE_MAP[slide.type];
        if (!Scene) {
          console.warn(`[HomepageAuditVideo] No V2 scene registered for type: "${slide.type}"`);
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
