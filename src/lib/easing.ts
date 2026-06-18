import type { SpringConfig } from "remotion";

// ── Named spring configs ───────────────────────────────────────────────────────

/** Fast badge/label entrances, WipeReveal */
export const snappy: SpringConfig = {
  damping:   400,
  stiffness: 280,
  mass:      1,
  overshootClamping: true,
};

/** Default — CountUp, most ScaleIn, SlideIn, ArcGauge */
export const smooth: SpringConfig = {
  damping:   200,
  stiffness: 120,
  mass:      1,
  overshootClamping: false,
};

/** FinalSummaryScene ArcGauge only — dramatic overshoot */
export const bouncy: SpringConfig = {
  damping:   80,
  stiffness: 100,
  mass:      1,
  overshootClamping: false,
};

/** Gentle entrance for background/ambient elements */
export const gentle: SpringConfig = {
  damping:   250,
  stiffness:  80,
  mass:       1,
  overshootClamping: false,
};

/** Slow arc draw — takes ~90 frames (3s at 30fps) to complete. ArcGauge only. */
export const arcDraw: SpringConfig = {
  damping:   40,
  stiffness: 30,
  mass:      1.2,
  overshootClamping: false,
};
