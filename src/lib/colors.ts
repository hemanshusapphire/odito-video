// ── Base canvas ────────────────────────────────────────────────────────────────
export const background  = "#0A0A0F";
export const surface     = "#111118";
export const surfaceHi   = "#1A1A24";
export const border      = "#1E1E2E";
export const borderGlow  = "#2A2A40";
export const glass       = "rgba(255,255,255,0.03)";

// ── Text ───────────────────────────────────────────────────────────────────────
export const text        = "#F0F0FF";
export const textMuted   = "#6E6E8A";
export const textDim     = "#3E3E55";

// ── Semantic ───────────────────────────────────────────────────────────────────
export const pass        = "#22C55E";
export const passGlow    = "rgba(34,197,94,0.08)";
export const warn        = "#F59E0B";
export const warnGlow    = "rgba(245,158,11,0.08)";
export const fail        = "#EF4444";
export const failGlow    = "rgba(239,68,68,0.08)";

// ── Per-section accent colors ─────────────────────────────────────────────────
export const sections = {
  onPage: {
    accent: "#6C63FF",
    glow:   "rgba(108,99,255,0.15)",
  },
  technical: {
    accent: "#3B82F6",
    glow:   "rgba(59,130,246,0.15)",
  },
  security: {
    accent: "#EF4444",
    glow:   "rgba(239,68,68,0.15)",
  },
  accessibility: {
    accent: "#F59E0B",
    glow:   "rgba(245,158,11,0.15)",
  },
  ai: {
    accent: "#A855F7",
    glow:   "rgba(168,85,247,0.15)",
  },
  performance: {
    accent: "#F97316",
    glow:   "rgba(249,115,22,0.15)",
  },
  social: {
    accent: "#06B6D4",
    glow:   "rgba(6,182,212,0.15)",
  },
  gbp: {
    accent: "#22C55E",
    glow:   "rgba(34,197,94,0.15)",
  },
  summary: {
    accent: "#6C63FF",
    glow:   "rgba(108,99,255,0.20)",
  },
} as const;

// ── Score thresholds ───────────────────────────────────────────────────────────
export function scoreColor(score: number): string {
  if (score > 70) return pass;
  if (score >= 50) return warn;
  return fail;
}

// ── Severity colors ────────────────────────────────────────────────────────────
export const severity = {
  critical: "#EF4444",
  warning:  "#F59E0B",
  info:     "#6C63FF",
} as const;

// ── Convenience re-export as palette object ────────────────────────────────────
export const palette = {
  background,
  surface,
  surfaceHi,
  border,
  borderGlow,
  glass,
  text,
  textMuted,
  textDim,
  pass,
  passGlow,
  warn,
  warnGlow,
  fail,
  failGlow,
  sections,
  severity,
} as const;
