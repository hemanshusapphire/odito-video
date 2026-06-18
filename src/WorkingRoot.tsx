import { Composition } from "remotion";
import { AuditVideo as WorkingVideo } from "./WorkingVideo";
import { HomepageAuditVideo } from "./homepage-audit/HomepageAuditVideo";
// import { TOTAL_DURATION_FRAMES } from "./utils/timingUtils"; // DEPRECATED - Use dynamic duration
import { loadFont as loadSyne } from "@remotion/google-fonts/Syne";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import React from "react";

// Load fonts for all compositions
const loadFonts = async () => {
  try {
    await Promise.all([
      loadSyne(),
      loadJetBrains({ ignoreTooManyRequestsWarning: true } as any),
      loadInter(),
    ]);
    console.log('✅ Fonts loaded successfully');
  } catch (error) {
    console.warn('⚠️ Font loading failed:', error);
  }
};
loadFonts();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AuditVideo"
        component={WorkingVideo}
        // durationInFrames will be set dynamically from worker input
        // Use a reasonable default for development (61.6 seconds = 1478 frames at 24 FPS)
        durationInFrames={1478}
        fps={24} // 🚀 PERFORMANCE: Reduced from 30 to 24 FPS for 20% faster rendering
        width={1920}
        height={1080}
        defaultProps={{
          audioUrl: '',
          projectId: '',
          slidesWithAudio: [],      // ✅ FIXED: Correct key matching worker
          durationInFrames: 1478,   // Dynamic duration from worker
          totalDuration: 61.6       // Dynamic total duration in seconds from worker
        }}
      />

      {/* Homepage Audit Video — 10-scene pipeline, ~80s at 30fps = 2400 frames.
          Duration is overridden dynamically by the worker via calculateMetadata. */}
      <Composition
        id="HomepageAuditVideo"
        component={HomepageAuditVideo}
        durationInFrames={2460}
        fps={24}
        width={1920}
        height={1080}
        defaultProps={{
          slidesWithAudio: [],
          fps: 24,
        }}
      />
    </>
  );
};
