import fs from 'fs';
import path from 'path';

const src = path.resolve('temp/screenshots/scene-06-homepageAIVisibility.png');
const dest = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/d0d48a30-080a-479d-95dd-e622ddf99514/scene-06-homepageAIVisibility.png';

try {
  fs.copyFileSync(src, dest);
  console.log('Successfully copied screenshot to artifact directory.');
} catch (err) {
  console.error('Error copying file:', err);
}
