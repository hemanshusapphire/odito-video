/**
 * capture-scenes.mjs
 * Bundles the Remotion composition and captures one screenshot per scene
 * at the 75%-through frame (after animations complete).
 *
 * Output: temp/screenshots/scene-XX-<type>.png  (1920×1080)
 *
 * Usage:  node scripts/capture-scenes.mjs
 */

import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { createRequire } from 'module';
import { readFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PROPS_FILE = path.join(ROOT, 'temp', 'render-validation-props.json');
const ENTRY_POINT = path.join(ROOT, 'src', 'index.ts');
const OUT_DIR = path.join(ROOT, 'temp', 'screenshots');

mkdirSync(OUT_DIR, { recursive: true });

const renderData = JSON.parse(readFileSync(PROPS_FILE, 'utf8'));
const { props, sceneFrameMap } = renderData;

console.log(`\n[capture-scenes] Bundling composition from: ${ENTRY_POINT}`);
console.log('[capture-scenes] This takes ~60 seconds on first run...\n');

const bundleLocation = await bundle({
  entryPoint: ENTRY_POINT,
  webpackOverride: (config) => config,
});

console.log(`[capture-scenes] Bundle ready at: ${bundleLocation}`);

// Select the composition to get its metadata
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: 'HomepageAuditVideo',
  inputProps: props,
});

console.log(`[capture-scenes] Composition: ${composition.id} | ${composition.width}×${composition.height} | ${composition.durationInFrames} frames`);
console.log(`[capture-scenes] Rendering ${sceneFrameMap.length} scene screenshots...\n`);

const results = [];

for (const scene of sceneFrameMap) {
  const outFile = path.join(OUT_DIR, `scene-${String(scene.slideId).padStart(2,'0')}-${scene.type}.png`);
  const frameToCapture = scene.midFrame;

  process.stdout.write(`  Scene ${scene.slideId} (${scene.type}) @ frame ${frameToCapture}... `);

  try {
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outFile,
      frame: frameToCapture,
      inputProps: props,
      imageFormat: 'png',
      scale: 1,
    });
    process.stdout.write(`✅ ${path.basename(outFile)}\n`);
    results.push({ scene: scene.slideId, type: scene.type, frame: frameToCapture, file: outFile, ok: true });
  } catch (err) {
    process.stdout.write(`❌ ERROR: ${err.message}\n`);
    results.push({ scene: scene.slideId, type: scene.type, frame: frameToCapture, file: outFile, ok: false, error: err.message });
  }
}

console.log('\n[capture-scenes] Results:');
results.forEach(r => {
  if (r.ok) {
    console.log(`  ✅ ${r.file}`);
  } else {
    console.log(`  ❌ Scene ${r.scene}: ${r.error}`);
  }
});

console.log(`\n[capture-scenes] Done. Screenshots in: ${OUT_DIR}`);
