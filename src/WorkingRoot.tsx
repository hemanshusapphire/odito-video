import { Composition } from "remotion";
import { AuditVideo as WorkingVideo } from "./WorkingVideo";
// import { TOTAL_DURATION_FRAMES } from "./utils/timingUtils"; // DEPRECATED - Use dynamic duration
import { loadFont as loadSyne } from "@remotion/google-fonts/Syne";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import React from "react";

// 🚀 PERFORMANCE: Load fonts with warning suppression to avoid 48-request overhead
const loadFonts = async () => {
  try {
    await Promise.all([
      loadSyne(),
      loadJetBrains({ ignoreTooManyRequestsWarning: true } as any)
    ]);
    console.log('✅ Fonts loaded successfully (optimized with warning suppression)');
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
    </>
  );
};
