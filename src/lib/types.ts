// ── Per-scene data shapes ──────────────────────────────────────────────────────

export interface IntroData {
  url: string;
  projectName?: string;
  overallScore: number;
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  audited_at?: string;
}

export interface SectionScoreData {
  sectionName: string;
  score: number;
  issueCount: number;
  checksCount?: number;
  criticalCount?: number;
  accentColor: string;
}

export interface AICheck {
  name?: string;
  message?: string;
  rule_id?: string;
  passed: boolean;
}

export interface AIVisibilityData {
  score: number;
  llmScore: number;
  issueCount: number;
  criticalCount: number;
  aiChecks: AICheck[];
}

export interface PerformanceData {
  score: number;
  mobileScore: number;
  desktopScore: number;
  responseTime: string;
  issueCount: number;
}

export interface Platform {
  name: string;
  connected: boolean;
}

export interface SocialSignalsData {
  connectedCount: number;
  missingCount: number;
  platforms: Platform[];
}

export interface GBPData {
  found: boolean;
  businessName?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
  website?: string;
  status?: string;
}

export type IssueSeverity = "critical" | "warning" | "info";

export interface TopIssue {
  title: string;
  severity: IssueSeverity;
}

export interface FinalSummaryData {
  overallScore: number;
  topIssues: Array<string | TopIssue>;
}

// ── Slide type discriminant union ─────────────────────────────────────────────

export type SlideType =
  | "homepageIntro"
  | "homepageOnPage"
  | "homepageTechnical"
  | "homepageSecurity"
  | "homepageAccessibility"
  | "homepageAIVisibility"
  | "homepagePerformance"
  | "homepageSocialSignals"
  | "homepageGBP"
  | "homepageFinalSummary"
  // v1 backward compat
  | "homepageOverallScore"
  | "homepageCategoryScores"
  | "homepageTopIssues"
  | "homepageAISummary"
  | "homepageCTA";

export type SlideData =
  | IntroData
  | SectionScoreData
  | AIVisibilityData
  | PerformanceData
  | SocialSignalsData
  | GBPData
  | FinalSummaryData;

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
