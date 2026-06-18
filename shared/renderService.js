const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// VIDEO_ROOT is the video/ directory regardless of where this file lives (video/shared/)
const VIDEO_ROOT = path.resolve(__dirname, '..');

/**
 * Shared Render Service
 * Extracted from VideoWorker class — identical behavior, identical output.
 * compositionId is now a parameter so processors can route to different compositions.
 */

/**
 * Validate that a staticFile path exists in the public directory.
 * Identical to VideoWorker.validateStaticFile() — uses VIDEO_ROOT as __dirname substitute.
 *
 * @param {string} staticPath - Relative path like "cache/audio/file.mp3"
 * @returns {boolean} True if file exists
 */
function validateStaticFile(staticPath) {
  const fullPath = path.join(VIDEO_ROOT, 'public', staticPath);
  const exists = fs.existsSync(fullPath);

  console.log(`[RENDER_SERVICE] 🔍 Validating staticFile: ${staticPath}`);
  console.log(`[RENDER_SERVICE]   Full path: ${fullPath}`);
  console.log(`[RENDER_SERVICE]   Exists: ${exists}`);

  if (exists) {
    const stats = fs.statSync(fullPath);
    console.log(`[RENDER_SERVICE]   Size: ${stats.size} bytes`);
  }

  return exists;
}

/**
 * Validate all audio paths before rendering.
 * Identical to VideoWorker.validateAllAudioPaths().
 *
 * @param {Array} slidesWithAudio - Slide objects with audio paths
 * @throws {Error} If any audio file is missing
 */
function validateAllAudioPaths(slidesWithAudio) {
  console.log(`[RENDER_SERVICE] 🔍 Validating all audio paths before rendering...`);

  const missingFiles = [];
  const foundFiles = [];

  slidesWithAudio.forEach((slide, index) => {
    const audioPath = slide.audio;
    console.log(`[RENDER_SERVICE]   Slide ${index + 1}: ${audioPath}`);

    if (validateStaticFile(audioPath)) {
      const fullPath = path.join(VIDEO_ROOT, 'public', audioPath);
      const stats = fs.statSync(fullPath);
      console.log(`[RENDER_SERVICE]     ✅ Found (${stats.size} bytes)`);
      foundFiles.push({ slide: index + 1, path: audioPath, size: stats.size });
    } else {
      console.error(`[RENDER_SERVICE]     ❌ MISSING staticFile: ${audioPath}`);
      missingFiles.push({ slide: index + 1, path: audioPath });
    }
  });

  console.log(`[RENDER_SERVICE] 📊 Audio validation summary:`);
  console.log(`[RENDER_SERVICE]   ✅ Found: ${foundFiles.length} files`);
  console.log(`[RENDER_SERVICE]   ❌ Missing: ${missingFiles.length} files`);

  if (missingFiles.length > 0) {
    console.error(`[RENDER_SERVICE] ❌ MISSING AUDIO FILES:`);
    missingFiles.forEach(({ slide, path: p }) => {
      console.error(`[RENDER_SERVICE]   Slide ${slide}: ${p}`);
    });
    throw new Error(`Cannot render video: ${missingFiles.length} audio files are missing. Slides: ${missingFiles.map(m => m.slide).join(', ')}`);
  }

  console.log(`[RENDER_SERVICE] ✅ All audio files validated successfully`);
  return foundFiles;
}

/**
 * Render a video using the Remotion CLI.
 * Extracted from VideoWorker.renderVideoWithSlides() — identical behavior.
 * compositionId is now parameterized instead of hardcoded.
 *
 * @param {string} entityId - projectId or auditId (used for output filename)
 * @param {string} jobId - Job ID (used for output filename)
 * @param {Array} slidesWithAudio - Slides with per-slide audio
 * @param {string} compositionId - Remotion composition ID (e.g. 'AuditVideo', 'HomepageAuditVideo')
 * @param {Object} config - { backendPublicPath, backendUrl }
 * @returns {Promise<string>} Video URL
 */
async function render(entityId, jobId, slidesWithAudio, compositionId, config) {
  try {
    console.log(`[RENDER_SERVICE] 🎬 RENDER VIDEO STARTED`);
    console.log(`[RENDER_SERVICE] 📊 Entity: ${entityId}, Job: ${jobId}, Composition: ${compositionId}`);
    console.log(`[RENDER_SERVICE] 📋 Slides count: ${slidesWithAudio.length}`);

    // CRITICAL: Validate all audio paths exist before rendering
    console.log(`[RENDER_SERVICE] 🔍 PRE-RENDER VALIDATION STARTED`);
    validateAllAudioPaths(slidesWithAudio);
    console.log(`[RENDER_SERVICE] ✅ PRE-RENDER VALIDATION PASSED`);

    const videoDir = path.join(config.backendPublicPath, 'videos');
    const videoFileName = `${entityId}-${jobId}.mp4`;
    const videoPath = path.join(videoDir, videoFileName);

    console.log(`[RENDER_SERVICE] 🎬 Video output path: ${videoPath}`);
    console.log(`[RENDER_SERVICE] 📁 Video directory: ${videoDir}`);

    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
      console.log(`[RENDER_SERVICE] ✅ Created videos directory: ${videoDir}`);
    } else {
      console.log(`[RENDER_SERVICE] ✅ Videos directory exists: ${videoDir}`);
    }

    console.log(`[RENDER_SERVICE] 🎵 Using ${slidesWithAudio.length} slides with per-slide audio`);

    const totalDuration = slidesWithAudio.reduce((sum, slide) => sum + slide.duration, 0);
    const fps = 24;
    const totalDurationInFrames = Math.round(totalDuration * fps);

    console.log(`[RENDER_SERVICE] 🕐 Total video duration: ${totalDuration.toFixed(2)} seconds`);
    console.log(`[RENDER_SERVICE] 🎞️ Total duration frames: ${totalDurationInFrames} frames at ${fps} FPS`);

    console.log(`[RENDER_SERVICE] 📊 Slide-by-slide duration breakdown:`);
    slidesWithAudio.forEach((slide, index) => {
      console.log(`[RENDER_SERVICE]   Slide ${index + 1} (${slide.type}): ${slide.duration.toFixed(2)}s = ${slide.durationInFrames} frames`);
    });

    console.log('FINAL AUDIO PATH SENT TO REMOTION:', slidesWithAudio[0]?.audio);

    const inputData = {
      projectId: entityId,
      slidesWithAudio,
      fps,
      durationInFrames: totalDurationInFrames,
      totalDuration
    };

    const tempDir = path.join(VIDEO_ROOT, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const inputDataPath = path.join(tempDir, `${entityId}-input.json`);
    fs.writeFileSync(inputDataPath, JSON.stringify(inputData, null, 2));

    console.log('FINAL SLIDES DATA:', JSON.stringify(slidesWithAudio, null, 2));

    console.log(`[RENDER_SERVICE] 🎬 Starting Remotion render | composition=${compositionId}`);
    console.log(`[RENDER_SERVICE] 📊 Slides with audio: ${slidesWithAudio.length}`);
    console.log(`[RENDER_SERVICE] 🕐 Total duration: ${totalDuration.toFixed(2)} seconds`);
    console.log(`[RENDER_SERVICE] 🎞️ Total frames: ${totalDurationInFrames} frames (dynamic)`);
    console.log(`[RENDER_SERVICE] 📹 Video output: ${videoPath}`);

    const renderStartTime = Date.now();
    console.log(`[RENDER_SERVICE] ⏱️ Render start time: ${new Date(renderStartTime).toISOString()}`);

    return new Promise((resolve, reject) => {
      // Run the Remotion CLI JS script directly via node rather than via the .cmd
      // wrapper. The .cmd file is a batch script that requires cmd.exe, and cmd.exe
      // with /s strips the outer quotes from paths containing spaces, producing the
      // "'D:\d' is not recognized" error. Using process.execPath (the node binary)
      // with the JS script as an array argument lets libuv/CreateProcess quote every
      // argument correctly without any shell involvement.
      const remotionScript = path.join(VIDEO_ROOT, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');

      if (!fs.existsSync(remotionScript)) {
        reject(new Error(`Remotion CLI script not found at ${remotionScript}. Run npm install.`));
        return;
      }

      const remotionArgs = [
        remotionScript,
        'render',
        'src/index.ts',
        compositionId,
        videoPath,
        `--props=${inputDataPath}`,
        `--duration=${totalDurationInFrames}`,
        '--codec', 'h264',
        '--pixel-format', 'yuv420p',
        '--public-dir=public',
        '--concurrency=4',
        '--log=info',
        '--overwrite'
      ];

      const nodeExe = process.execPath;

      console.log(`[RENDER_SERVICE] remotionScript: ${remotionScript}`);
      console.log(`[RENDER_SERVICE] videoPath: ${videoPath}`);
      console.log(`[RENDER_SERVICE] inputDataPath: ${inputDataPath}`);
      console.log(`[RENDER_SERVICE] publicDir: ${path.join(VIDEO_ROOT, 'public')}`);
      console.log(`[RENDER_SERVICE] spawn command: ${nodeExe}`);
      console.log(`[RENDER_SERVICE] spawn args:`, JSON.stringify(remotionArgs, null, 2));
      console.log(`[RENDER_SERVICE] spawn method: spawn(nodeExe, remotionArgs, { shell: false })`);

      const remotion = spawn(nodeExe, remotionArgs, {
        cwd: VIDEO_ROOT,
        stdio: 'pipe',
        shell: false
      });

      let stdout = '';
      let stderr = '';

      // Stream output in real-time so render progress is visible in the parent console.
      // Without this, stdio:pipe is completely silent until the child exits.
      remotion.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        process.stdout.write('[REMOTION STDOUT] ' + chunk);
      });

      remotion.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        process.stderr.write('[REMOTION STDERR] ' + chunk);
      });

      remotion.on('exit', (code, signal) => {
        console.log(`[RENDER_SERVICE] [REMOTION EXIT] code=${code} signal=${signal}`);
      });

      remotion.on('close', (code, signal) => {
        const renderEndTime = Date.now();
        const renderDuration = (renderEndTime - renderStartTime) / 1000;
        console.log(`[RENDER_SERVICE] [REMOTION CLOSE] code=${code} signal=${signal}`);
        console.log(`[RENDER_SERVICE] ⏱️ Render end time: ${new Date(renderEndTime).toISOString()}`);
        console.log(`[RENDER_SERVICE] ⏱️ Total render duration: ${renderDuration.toFixed(2)} seconds (${(renderDuration / 60).toFixed(2)} minutes)`);

        if (code === 0 && fs.existsSync(videoPath)) {
          console.log(`[RENDER_SERVICE] ✅ Video rendered successfully: ${videoPath}`);
          const stats = fs.statSync(videoPath);
          console.log(`[RENDER_SERVICE] 📊 Video file size: ${stats.size} bytes`);
          console.log(`[RENDER_SERVICE] 📅 Created at: ${stats.birthtime}`);

          const { getMediaUrls } = require('../config/env.js');
          const mediaUrls = getMediaUrls();
          const videoUrl = `${mediaUrls.video}/${entityId}.mp4`;
          console.log(`[RENDER_SERVICE] 📡 Video URL: ${videoUrl}`);
          resolve(videoUrl);
        } else {
          console.error(`[RENDER_SERVICE] ❌ Render failed. code=${code}`);
          console.error(`[RENDER_SERVICE] ❌ stdout (last 2000 chars): ${stdout.slice(-2000)}`);
          console.error(`[RENDER_SERVICE] ❌ stderr (last 2000 chars): ${stderr.slice(-2000)}`);

          if (fs.existsSync(videoPath)) {
            const stats = fs.statSync(videoPath);
            console.log(`[RENDER_SERVICE] ⚠️ Partial file exists: ${videoPath} (${stats.size} bytes)`);
          } else {
            console.log(`[RENDER_SERVICE] ❌ Output file not created: ${videoPath}`);
          }

          // Keep the error message compact — full output already streamed above
          const errorSummary = (stderr || stdout).slice(-500) || `exit code ${code}`;
          reject(new Error(`Video rendering failed (code ${code}): ${errorSummary}`));
        }
      });

      remotion.on('error', (error) => {
        console.error(`[RENDER_SERVICE] [REMOTION PROCESS ERROR] ${error.message}`);
        console.error(error);
        reject(error);
      });

      setTimeout(() => {
        remotion.kill();
        reject(new Error('Video rendering timed out after 10 minutes'));
      }, 10 * 60 * 1000);
    });

  } catch (error) {
    throw new Error(`Video rendering setup failed: ${error.message}`);
  }
}

module.exports = { render, validateStaticFile, validateAllAudioPaths };
