/**
 * Central asset registry for AI platform logos.
 * Paths are relative to video/public/ and consumed via staticFile() from Remotion.
 * Add or update entries here; components never hardcode asset paths.
 */

export interface AiPlatformAsset {
  /** Path relative to video/public/. null = no raster image, use inline SVG fallback. */
  imagePath: string | null;
  /** Logo container background color */
  logoBg: string;
  /** Logo container border color */
  logoBorder?: string;
}

export type AiPlatformKey = 'chatgpt' | 'gemini' | 'claude' | 'perplexity' | string;

export const AI_PLATFORM_ASSETS: Record<string, AiPlatformAsset> = {
  chatgpt:    { imagePath: 'ai-platforms/chatgpt.png',    logoBg: '#0a2e1a', logoBorder: '#0d3d22' },
  claude:     { imagePath: 'ai-platforms/claude.png',     logoBg: '#2a1208', logoBorder: '#3d1e0a' },
  perplexity: { imagePath: 'ai-platforms/perplexity-ai.png', logoBg: '#0a1e1e', logoBorder: '#0d2c2c' },
  gemini:     { imagePath: 'ai-platforms/gemini.png',        logoBg: '#0a1a3a', logoBorder: '#0d2550' },
  bing:       { imagePath: 'ai-platforms/bing.png',          logoBg: '#001a40', logoBorder: '#002966' },
};

/** Visibility label → display color */
export const VISIBILITY_COLORS: Record<string, string> = {
  Low:    '#ef4444',
  Medium: '#f59e0b',
  High:   '#10b981',
};
