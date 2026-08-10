/**
 * capture-audit-slides.mjs
 * Renders specific AuditVideo slides as PNG screenshots.
 *
 * Usage:  node scripts/capture-audit-slides.mjs
 * Output: temp/screenshots/audit-slide-XX-<type>.png
 */

import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'temp', 'screenshots');
mkdirSync(OUT_DIR, { recursive: true });

// ─── Mock audit data matching real data shapes ────────────────────────────────

const aiHubSnapshot = {
  overallScore: 42,
  pagesScored: 25,
  hubScores: { aiso: 77, aeo: 28, geo: 21 },
  issuesBySeverity: { critical: 22, high: 82, medium: 101, low: 49 },
};

const aisoData = {
  score: 77,
  cards: {
    crawlability: { score: 83, total_passed: 8, total_failed: 2 },
    citability:   { score: 100, total_passed: 5, total_failed: 0 },
    authority:    { score: 51, total_passed: 4, total_failed: 4 },
    coverage:     { score: 73, total_passed: 6, total_failed: 2 },
  },
  bots: { googlebot: 'pass', gptbot: 'pass', claudebot: 'pass' },
  issueDistribution: { critical: 0, high: 2, medium: 5, low: 3, total: 10 },
};

// ─── Build slides array ───────────────────────────────────────────────────────
// Each slide needs: id, type, narration, data, duration (seconds)

const SLIDES = [
  {
    id: 8,
    type: 'aiVisibilityOverview',
    title: 'AI Visibility Overview',
    subtitle: `AI Score: ${aiHubSnapshot.overallScore}/100`,
    narration: 'Your AI Visibility score is 42 out of 100.',
    data: { aiHubSnapshot },
    duration: 8,
  },
  {
    id: 9,
    type: 'aisoHub',
    title: 'AI Search Optimization',
    subtitle: `AISO Score: ${aisoData.score}/100`,
    narration: 'Your AISO score is 77 out of 100.',
    data: { aiso: aisoData },
    duration: 8,
  },
];

// Add durationInFrames at 24fps
const FPS = 24;
const slidesWithAudio = SLIDES.map(s => ({ ...s, durationInFrames: Math.round(s.duration * FPS) }));

// Total frames needed
const totalFrames = slidesWithAudio.reduce((acc, s) => acc + s.durationInFrames, 0);

const props = {
  slidesWithAudio,
  fps: FPS,
  durationInFrames: totalFrames,
  totalDuration: totalFrames / FPS,
  projectId: 'preview',
};

// ─── Render ───────────────────────────────────────────────────────────────────

console.log(`\n[capture-audit-slides] Bundling...`);
const bundleLocation = await bundle({
  entryPoint: path.join(ROOT, 'src', 'index.ts'),
  webpackOverride: (c) => c,
});

console.log(`[capture-audit-slides] Bundle ready.`);

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: 'AuditVideo',
  inputProps: props,
});

console.log(`[capture-audit-slides] Composition: ${composition.id} | ${composition.width}×${composition.height}`);

// Capture each slide at the midpoint of its time window
let frameOffset = 0;
for (const slide of slidesWithAudio) {
  const midFrame = frameOffset + Math.floor(slide.durationInFrames * 0.6);
  const outFile = path.join(OUT_DIR, `audit-slide-${String(slide.id).padStart(2,'0')}-${slide.type}.png`);

  process.stdout.write(`  Slide ${slide.id} (${slide.type}) @ frame ${midFrame}... `);
  try {
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outFile,
      frame: midFrame,
      inputProps: props,
      imageFormat: 'png',
      scale: 1,
    });
    process.stdout.write(`✅ ${path.basename(outFile)}\n`);
  } catch (err) {
    process.stdout.write(`❌ ${err.message}\n`);
  }

  frameOffset += slide.durationInFrames;
}

console.log(`\n[capture-audit-slides] Done. Output: ${OUT_DIR}`);
