require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const AudioService = require('./services/audioService');
const jobService = require('./shared/jobService');
const processors = require('./processors');

/**
 * Video Generation Worker — Router
 *
 * Responsibility: receive a job, identify its type, route to the correct processor.
 * Nothing else. All business logic lives in processors/.
 *
 * Backward compatibility: if videoType is absent, defaults to FULL_AUDIT so
 * existing backend dispatchers that pre-date this refactor continue to work.
 */
class VideoWorker {
  constructor() {
    this.app = express();
    this.port = process.env.VIDEO_WORKER_PORT || 8001;

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) throw new Error('BACKEND_URL environment variable is required');
    this.backendUrl = backendUrl;

    this.audioService = new AudioService();

    // Backend public path — identical detection logic as before
    if (process.env.BACKEND_PUBLIC_PATH) {
      this.backendPublicPath = process.env.BACKEND_PUBLIC_PATH;
      console.log(`[VIDEO_WORKER] Backend public path from ENV: ${this.backendPublicPath}`);
    } else {
      const possibleBackendPaths = [
        path.resolve(__dirname, '../odito_backend/public'),
        path.resolve(__dirname, '../odito-backend/public'),
        'D:\\new\\Odito\\odito_backend\\public',
        '/root/odito/odito_backend/public',
        '/root/odito/odito-backend/public'
      ];

      console.log(`[VIDEO_WORKER] 🔍 Auto-detecting backend public path...`);
      this.backendPublicPath = possibleBackendPaths.find(p => fs.existsSync(p));

      if (!this.backendPublicPath) {
        console.error(`[VIDEO_WORKER] ❌ Backend public path not found! Tried:`);
        possibleBackendPaths.forEach((p, i) => {
          console.error(`[VIDEO_WORKER]   ${i + 1}. ${p} (${fs.existsSync(p) ? 'EXISTS' : 'NOT FOUND'})`);
        });
        throw new Error('Backend public path not found - cannot continue');
      }

      console.log(`[VIDEO_WORKER] ✅ Auto-detected backend public path: ${this.backendPublicPath}`);
    }

    const { getDatabaseConfig } = require('./config/env.js');
    const dbConfig = getDatabaseConfig();
    this.mongoUri = dbConfig.uri;

    // Shared services context passed to every processor
    this.services = {
      audioService: this.audioService,
      config: {
        backendUrl: this.backendUrl,
        backendPublicPath: this.backendPublicPath
      }
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.connectMongo();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Health check
    this.app.post('/workers/health', (req, res) => {
      console.log('[VIDEO_WORKER] Health check received');
      res.json({ success: true, message: 'Video worker is healthy', timestamp: new Date().toISOString() });
    });

    // Main job endpoint — routes to the correct processor
    this.app.post('/jobs/video-generation', async (req, res) => {
      try {
        const { jobId, videoType, ...jobData } = req.body;

        console.log(`[VIDEO_WORKER] Job received | jobId=${jobId} | videoType=${videoType || 'FULL_AUDIT (default)'}`);

        // jobId is the only field validated here — all type-specific validation is in processors
        if (!jobId || typeof jobId !== 'string' || jobId.trim().length === 0) {
          console.error(`[VIDEO_WORKER] ❌ INVALID jobId | jobId=${jobId}`);
          return res.status(400).json({ success: false, message: 'Valid jobId is required', jobId });
        }

        const sanitizedJobId = jobId.trim().replace(/[^a-zA-Z0-9-_]/g, '');

        // Backward compatibility: absent videoType → FULL_AUDIT
        const resolvedType = videoType || 'FULL_AUDIT';

        const processor = processors[resolvedType];
        if (!processor) {
          console.error(`[VIDEO_WORKER] ❌ Unknown videoType: ${resolvedType}`);
          return res.status(400).json({ success: false, message: `Unknown videoType: ${resolvedType}` });
        }

        console.log(`[VIDEO_WORKER] ✅ Routing to ${resolvedType} processor | jobId=${sanitizedJobId}`);
        console.log(`[VIDEO_WORKER] 🔍 Job data keys:`, Object.keys(jobData));

        // Acknowledge immediately
        res.json({
          success: true,
          message: 'Video generation job accepted',
          jobId: sanitizedJobId,
          videoType: resolvedType
        });

        // Process asynchronously
        const job = { jobId: sanitizedJobId, videoType: resolvedType, ...jobData };

        processor.process(job, this.services).catch(async (error) => {
          console.error(`[VIDEO_WORKER] ❌ CRITICAL: Processor failed | jobId=${sanitizedJobId} | type=${resolvedType}:`, error);
          await jobService.updateJobStatus(this.backendUrl, sanitizedJobId, 'failed', {
            error: { message: error.message, stack: error.stack, timestamp: new Date(), criticalFailure: true },
            progress: 0,
            currentStep: 'Failed - Critical Error'
          });
        });

      } catch (error) {
        console.error('[VIDEO_WORKER] Error receiving job:', error);
        res.status(500).json({ success: false, message: 'Failed to accept job', error: error.message });
      }
    });
  }

  async connectMongo() {
    try {
      await mongoose.connect(this.mongoUri);
      console.log('[VIDEO_WORKER] Connected to MongoDB');
      console.log(`🔗 [VIDEO_WORKER] Connected to MongoDB database: ${mongoose.connection.name}`);
    } catch (error) {
      console.error('[VIDEO_WORKER] MongoDB connection failed:', error);
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🤖 Video Worker started on port ${this.port}`);
      console.log(`🚀 Ready to receive video generation jobs from Node.js backend`);
      console.log(`📡 Backend URL: ${this.backendUrl}`);
      console.log(`📋 Registered processors: ${Object.keys(processors).join(', ')}`);
    });
  }
}

if (require.main === module) {
  const worker = new VideoWorker();
  worker.start();
}

module.exports = VideoWorker;
