/**
 * capture-single.mjs
 * Re-captures one scene using the existing bundle.
 * Usage: node scripts/capture-single.mjs <sceneIndex 1-11>
 */
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
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

const targetId = parseInt(process.argv[2] || '3', 10);
const scene = sceneFrameMap.find(s => s.slideId === targetId);
if (!scene) { console.error('Scene not found:', targetId); process.exit(1); }

console.log(`[capture-single] Bundling... (scene ${targetId}: ${scene.type})`);
const bundleLocation = await bundle({ entryPoint: ENTRY_POINT, webpackOverride: c => c });

const composition = await selectComposition({ serveUrl: bundleLocation, id: 'HomepageAuditVideo', inputProps: props });

const outFile = path.join(OUT_DIR, `scene-${String(scene.slideId).padStart(2,'0')}-${scene.type}.png`);
console.log(`[capture-single] Rendering frame ${scene.midFrame}...`);

await renderStill({ composition, serveUrl: bundleLocation, output: outFile, frame: scene.midFrame, inputProps: props, imageFormat: 'png', scale: 1 });

console.log(`[capture-single] ✅ ${outFile}`);
