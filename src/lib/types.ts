// ── Slide type discriminant union ─────────────────────────────────────────────
// These 10 types match exactly what homepageAuditProcessor._buildSlides() emits.

export type SlideType =
  | "homepageIntro"
  | "homepageOverallScore"
  | "homepageOnPage"
  | "homepageTechnical"
  | "homepageSecurity"
  | "homepageAIVisibility"
  | "homepagePerformance"
  | "homepageAccessibility"
  | "homepageSocialSignals"
  | "homepageGBP"
  | "homepageFinalSummary";

// V2 per-scene data shapes are defined here as scenes are built.
// SlideData is a union of all scene data types.
export type SlideData = Record<string, unknown>;

// ── SlideWithAudio (what HomepageAuditVideo receives) ─────────────────────────

export interface SlideWithAudio {
  type: SlideType;
  data: SlideData;
  audio: string;
  duration: number; // seconds
  narration?: string;
}

// ── Root composition props ────────────────────────────────────────────────────

export interface HomepageAuditVideoProps {
  slidesWithAudio?: SlideWithAudio[];
  fps?: number;
}

// ── Scene component contract ──────────────────────────────────────────────────

export interface SceneProps<T extends SlideData = SlideData> {
  data: T;
  narration?: string;
}
