const path = require('path');
const fs = require('fs');

/**
 * Shared Audio Orchestrator
 * Extracted from VideoWorker.generatePerSlideAudioWithProgress() — identical behavior.
 * Generates per-slide TTS audio with job progress tracking.
 */

/**
 * Generate separate audio files for each slide with progress tracking.
 * Identical to VideoWorker.generatePerSlideAudioWithProgress().
 *
 * @param {Array} structuredSlides - Array of slide objects
 * @param {string} entityId - projectId or auditId (for file naming)
 * @param {string} jobId - Job ID for progress updates
 * @param {Object} audioService - AudioService instance
 * @param {Function} updateStatus - jobService.updateJobStatus bound to backendUrl
 * @returns {Promise<Array>} Array of audio file information
 */
async function generateWithProgress(structuredSlides, entityId, jobId, audioService, updateStatus) {
  try {
    console.log(`[AUDIO_ORCHESTRATOR] 🎙️ Starting per-slide audio generation with progress tracking`);

    const totalSlides = structuredSlides.length;
    const audioFiles = [];

    for (let i = 0; i < totalSlides; i++) {
      const slide = structuredSlides[i];
      const slideIndex = i + 1;
      console.log(`[AUDIO_ORCHESTRATOR] 🎵 Generating audio for slide ${slideIndex}/${totalSlides}: ${slide.title}`);

      try {
        const slideWithIndex = { ...slide, slideIndex };
        const slideAudioFiles = await audioService.generatePerSlideAudio([slideWithIndex], entityId);

        if (slideAudioFiles && slideAudioFiles.length > 0) {
          audioFiles.push(...slideAudioFiles);
          console.log(`[AUDIO_ORCHESTRATOR] ✅ Generated audio for slide ${slideIndex}`);
        } else {
          throw new Error(`No audio generated for slide ${slideIndex}`);
        }

        // Progress range: 20% to 70%
        const progress = 20 + ((i + 1) / totalSlides) * 50;

        await updateStatus(jobId, 'processing', {
          progress: Math.round(progress),
          currentStep: `Generating audio (${i + 1}/${totalSlides})`
        });

      } catch (error) {
        console.error(`[AUDIO_ORCHESTRATOR] ❌ Error generating audio for slide ${i + 1}:`, error);
        throw new Error(`Failed to generate audio for slide ${i + 1}: ${error.message}`);
      }
    }

    console.log(`[AUDIO_ORCHESTRATOR] ✅ Generated ${audioFiles.length} audio files with progress tracking`);

    // CRITICAL VALIDATION: Ensure unique audio files per slide
    const uniqueSlideIndices = [...new Set(audioFiles.map(audio => audio.slideIndex))];
    if (uniqueSlideIndices.length !== audioFiles.length) {
      throw new Error(`Duplicate audio files detected: Expected ${audioFiles.length} unique files, got ${uniqueSlideIndices.length} unique slide indices`);
    }

    audioFiles.forEach((audioFile) => {
      console.log(`[AUDIO_ORCHESTRATOR] 🎵 Slide ${audioFile.slideIndex}: ${audioFile.audioPath} (${audioFile.duration.toFixed(2)}s)`);
    });

    return audioFiles;

  } catch (error) {
    console.error('[AUDIO_ORCHESTRATOR] ❌ Error generating per-slide audio with progress:', error);
    throw error;
  }
}

/**
 * Attach validated audio files to slides.
 * Extracted from the attachment block inside VideoWorker.processVideoJob().
 * Identical behavior — validates duration, resolves relative paths.
 *
 * @param {Array} structuredSlides - Slide objects
 * @param {Array} audioFiles - Audio file objects from generateWithProgress
 * @returns {Array} Slides with attached audio
 */
function attachAudioToSlides(structuredSlides, audioFiles) {
  const path = require('path');
  const fs = require('fs');

  return structuredSlides.map((slide, index) => {
    const audioFile = audioFiles.find(audio => audio.slideIndex === index + 1);
    if (!audioFile) {
      throw new Error(`Missing audio file for slide ${index + 1}`);
    }

    console.log(`[AUDIO_ORCHESTRATOR] 🔍 Validating audio file for slide ${index + 1}:`);
    console.log(`[AUDIO_ORCHESTRATOR]   Audio URL: ${audioFile.audioPath}`);
    console.log(`[AUDIO_ORCHESTRATOR]   Duration: ${audioFile.duration.toFixed(2)} seconds`);

    const minDuration = 2.0;
    const maxDuration = 60.0;

    if (audioFile.duration < minDuration) {
      console.warn(`[AUDIO_ORCHESTRATOR] ⚠️ Audio duration too short (${audioFile.duration.toFixed(2)}s), using minimum`);
      audioFile.duration = minDuration;
    } else if (audioFile.duration > maxDuration) {
      console.warn(`[AUDIO_ORCHESTRATOR] ⚠️ Audio duration too long (${audioFile.duration.toFixed(2)}s), capping at maximum`);
      audioFile.duration = maxDuration;
    }

    if (!fs.existsSync(audioFile.audioPath)) {
      throw new Error(`Audio file not found on disk for slide ${index + 1}: ${audioFile.audioPath}`);
    }

    console.log(`[AUDIO_ORCHESTRATOR]   ✅ File exists on disk`);
    console.log(`[AUDIO_ORCHESTRATOR]   🎯 Final duration: ${audioFile.duration.toFixed(2)}s`);

    const fileName = path.basename(audioFile.audioPath);
    const relativeAudioPath = `cache/audio/${fileName}`;
    console.log(`[AUDIO_ORCHESTRATOR] 🎵 Using staticFile() path: ${relativeAudioPath}`);

    console.log(`[AUDIO_ORCHESTRATOR] 🔍 Path conversion debug:`);
    console.log(`[AUDIO_ORCHESTRATOR]   Original absolute: ${audioFile.audioPath}`);
    console.log(`[AUDIO_ORCHESTRATOR]   Relative path: ${relativeAudioPath}`);
    console.log(`[AUDIO_ORCHESTRATOR]   File exists: ${fs.existsSync(audioFile.audioPath)}`);

    return {
      ...slide,
      audio: relativeAudioPath,
      duration: audioFile.duration,
      durationInFrames: Math.round(audioFile.duration * 30)
    };
  });
}

module.exports = { generateWithProgress, attachAudioToSlides };
