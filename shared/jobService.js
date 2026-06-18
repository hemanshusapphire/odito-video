require('dotenv').config();
const axios = require('axios');

/**
 * Shared Job Service
 * Extracted from VideoWorker class — identical behavior, identical API.
 * Used by all processors to update job status and manage retry logic.
 */

/**
 * Update job status via backend API.
 * Identical to the original VideoWorker.updateJobStatus().
 *
 * @param {string} backendUrl - Backend base URL
 * @param {string} jobId - Job ID
 * @param {string} status - New status string
 * @param {Object} data - Additional update data
 */
async function updateJobStatus(backendUrl, jobId, status, data = {}) {
  try {
    const updateData = {
      status,
      ...data
    };

    if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    if (status === 'failed') {
      updateData.failed_at = new Date();
    }

    await axios.post(`${backendUrl}/api/jobs/update-status`, {
      jobId,
      ...updateData
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`[JOB_SERVICE] Status updated | jobId=${jobId} | status=${status}`);

  } catch (error) {
    console.error(`[JOB_SERVICE] Failed to update job status | jobId=${jobId}:`, error.message);
  }
}

/**
 * Determine whether a failed job should be retried.
 * Identical to the original VideoWorker.shouldRetryJob().
 *
 * @param {Error} error - The error that occurred
 * @param {number} retryCount - Current retry count
 * @param {number} maxRetries - Maximum allowed retries
 * @returns {boolean} True if should retry
 */
function shouldRetryJob(error, retryCount, maxRetries) {
  if (retryCount > maxRetries) return false;

  if (error.message?.includes('No video data found') ||
      error.message?.includes('validation') ||
      error.message?.includes('invalid')) {
    return false;
  }

  if (error.message?.includes('timeout') ||
      error.message?.includes('network') ||
      error.message?.includes('ECONNRESET') ||
      error.message?.includes('Audio generation failed') ||
      error.message?.includes('Video rendering failed') ||
      error.message?.includes('TTS') ||
      error.message?.includes('ElevenLabs') ||
      error.message?.includes('OpenAI')) {
    return true;
  }

  return true;
}

/**
 * Async sleep utility.
 * Identical to the original VideoWorker.sleep().
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { updateJobStatus, shouldRetryJob, sleep };
