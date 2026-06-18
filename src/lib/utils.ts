import type { SlideWithAudio } from "./types";

// ── Frame / time conversion ────────────────────────────────────────────────────

export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

// ── Slide timing calculator ───────────────────────────────────────────────────

export interface SlideTiming {
  index: number;
  from: number;
  durationInFrames: number;
  to: number;
  slide: SlideWithAudio;
}

export function buildSlideTiming(
  slides: SlideWithAudio[],
  fps: number,
): SlideTiming[] {
  let cursor = 0;
  return slides.map((slide, index) => {
    const durationInFrames = secondsToFrames(slide.duration, fps);
    const timing: SlideTiming = {
      index,
      from: cursor,
      durationInFrames,
      to: cursor + durationInFrames,
      slide,
    };
    cursor += durationInFrames;
    return timing;
  });
}

export function totalFrames(timings: SlideTiming[]): number {
  if (timings.length === 0) return 0;
  return timings[timings.length - 1].to;
}

// ── Stagger helpers ───────────────────────────────────────────────────────────

/** Returns the delay for the nth child given a base delay and per-item stagger. */
export function staggerDelay(
  index: number,
  staggerFrames: number,
  initialDelay = 0,
): number {
  return initialDelay + index * staggerFrames;
}

// ── Clamp ─────────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ── Score → semantic label ────────────────────────────────────────────────────

export function scoreLabel(score: number): string {
  if (score > 70) return "Good";
  if (score >= 50) return "Needs Work";
  return "Critical";
}

// ── Hostname extractor ────────────────────────────────────────────────────────

export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ── Normalize TopIssue — accepts string or { title, severity } ────────────────

export function issueTitle(issue: string | { title: string }): string {
  return typeof issue === "string" ? issue : issue.title;
}

export function issueSeverity(
  issue: string | { severity?: string },
): "critical" | "warning" | "info" {
  if (typeof issue === "string") return "warning";
  const s = issue.severity;
  if (s === "critical" || s === "warning" || s === "info") return s;
  return "warning";
}
