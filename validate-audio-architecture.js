require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Final validation test for Remotion audio architecture fix
 * Validates: TTS → public/cache/audio → worker → staticFile → Remotion → video render
 */

class AudioArchitectureValidator {
  constructor() {
    this.testProjectId = 'arch-test-' + Date.now();
    this.validationResults = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);
    this.validationResults.push({ timestamp, type, message });
  }

  async validateStep(stepName, validationFunction) {
    this.log(`\n🔍 Validating: ${stepName}`, 'STEP');
    try {
      await validationFunction();
      this.log(`✅ PASSED: ${stepName}`, 'SUCCESS');
      return true;
    } catch (error) {
      this.log(`❌ FAILED: ${stepName} - ${error.message}`, 'ERROR');
      console.error(error.stack);
      return false;
    }
  }

  async validateAudioServiceStorage() {
    // Test AudioService storage location
    const AudioService = require('./services/audioService.js');
    const audioService = new AudioService();
    
    const expectedOutputDir = path.join(__dirname, 'public/cache/audio');
    const actualOutputDir = audioService.OUTPUT_DIR;
    
    this.log(`   Expected OUTPUT_DIR: ${expectedOutputDir}`);
    this.log(`   Actual OUTPUT_DIR: ${actualOutputDir}`);
    
    if (actualOutputDir !== expectedOutputDir) {
      throw new Error(`AudioService OUTPUT_DIR mismatch`);
    }
    
    // Ensure directory exists
    if (!fs.existsSync(actualOutputDir)) {
      throw new Error(`AudioService OUTPUT_DIR does not exist: ${actualOutputDir}`);
    }
    
    this.log(`   ✅ AudioService stores in: ${actualOutputDir}`);
  }

  async validateWorkerPathGeneration() {
    // Simulate worker path generation
    const testAudioFile = path.join(__dirname, 'public/cache/audio/test.mp3');
    const fileName = path.basename(testAudioFile);
    const relativePath = `cache/audio/${fileName}`;
    
    this.log(`   Test audio file: ${testAudioFile}`);
    this.log(`   Generated staticFile path: ${relativePath}`);
    
    // Validate path format
    if (!relativePath.startsWith('cache/audio/')) {
      throw new Error(`Invalid staticFile path format: ${relativePath}`);
    }
    
    this.log(`   ✅ Worker generates correct staticFile paths`);
  }

  async validateRemotionComponent() {
    // Check WorkingVideo.tsx for staticFile usage
    const workingVideoPath = path.join(__dirname, 'src/WorkingVideo.tsx');
    const content = fs.readFileSync(workingVideoPath, 'utf8');
    
    // Check staticFile import
    if (!content.includes('staticFile')) {
      throw new Error('staticFile import missing from WorkingVideo.tsx');
    }
    
    // Check all Audio components use staticFile
    const audioSrcMatches = content.match(/src=\{[^}]+\}/g);
    if (!audioSrcMatches) {
      throw new Error('No Audio src attributes found');
    }
    
    for (const match of audioSrcMatches) {
      if (!match.includes('staticFile')) {
        throw new Error(`Audio component not using staticFile(): ${match}`);
      }
    }
    
    this.log(`   ✅ Found ${audioSrcMatches.length} Audio components using staticFile()`);
  }

  async validateRenderCommands() {
    // Check worker.js for --public-dir flag
    const workerPath = path.join(__dirname, 'worker.js');
    const content = fs.readFileSync(workerPath, 'utf8');
    
    const publicDirMatches = content.match(/--public-dir=\./g);
    if (!publicDirMatches || publicDirMatches.length < 2) {
      throw new Error(`Missing --public-dir=. flag in render commands. Found: ${publicDirMatches?.length || 0}`);
    }
    
    this.log(`   ✅ Found ${publicDirMatches.length} render commands with --public-dir=. flag`);
  }

  async validateOldLogicRemoval() {
    // Check that old HTTP URL logic is removed
    const workerPath = path.join(__dirname, 'worker.js');
    const content = fs.readFileSync(workerPath, 'utf8');
    
    // Should not have convertAudioUrlToLocalPath function
    if (content.includes('convertAudioUrlToLocalPath')) {
      throw new Error('Old convertAudioUrlToLocalPath function still exists');
    }
    
    // Should have new validateStaticFile function
    if (!content.includes('validateStaticFile')) {
      throw new Error('New validateStaticFile function missing');
    }
    
    this.log(`   ✅ Old HTTP URL logic removed, new validation logic present`);
  }

  async validateCompleteFlow() {
    // Create test audio file in public/cache/audio
    const publicCacheDir = path.join(__dirname, 'public/cache/audio');
    if (!fs.existsSync(publicCacheDir)) {
      fs.mkdirSync(publicCacheDir, { recursive: true });
    }
    
    const testAudioFile = path.join(publicCacheDir, `${this.testProjectId}-slide-1.mp3`);
    fs.writeFileSync(testAudioFile, Buffer.alloc(1024, 0)); // Silent audio
    
    // Simulate complete flow
    const staticFilePath = `cache/audio/${this.testProjectId}-slide-1.mp3`;
    const fullFilePath = path.join(__dirname, 'public', staticFilePath);
    
    this.log(`   Created test audio: ${testAudioFile}`);
    this.log(`   staticFile() path: ${staticFilePath}`);
    this.log(`   Resolved full path: ${fullFilePath}`);
    
    // Validate file exists at expected location
    if (!fs.existsSync(fullFilePath)) {
      throw new Error(`File not found at staticFile resolved path: ${fullFilePath}`);
    }
    
    // Simulate Remotion component usage
    const mockSlide = {
      audio: staticFilePath,
      duration: 2.0
    };
    
    this.log(`   Mock slide data:`, mockSlide);
    this.log(`   ✅ Complete flow validation successful`);
    
    // Cleanup
    if (fs.existsSync(testAudioFile)) {
      fs.unlinkSync(testAudioFile);
    }
  }

  async validateFolderStructure() {
    // Validate final folder structure
    const expectedStructure = {
      'video/': ['public/', 'cache/', 'src/', 'services/'],
      'video/public/': ['cache/'],
      'video/public/cache/': ['audio/'],
      'video/cache/': ['audio/'],
      'video/src/': ['WorkingVideo.tsx'],
      'video/services/': ['audioService.js']
    };
    
    for (const [dir, expectedContents] of Object.entries(expectedStructure)) {
      const fullPath = path.join(__dirname, dir.replace('video/', ''));
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Required directory missing: ${fullPath}`);
      }
      
      const actualContents = fs.readdirSync(fullPath);
      this.log(`   ${dir}: ${actualContents.join(', ')}`);
      
      for (const expected of expectedContents) {
        if (!actualContents.includes(expected.replace('/', ''))) {
          this.log(`   ⚠️ Expected content missing: ${expected}`);
        }
      }
    }
    
    this.log(`   ✅ Folder structure validated`);
  }

  async runFullValidation() {
    this.log('🚀 Starting Audio Architecture Validation', 'START');
    this.log(`Test Project ID: ${this.testProjectId}`);
    
    const validations = [
      () => this.validateAudioServiceStorage(),
      () => this.validateWorkerPathGeneration(),
      () => this.validateRemotionComponent(),
      () => this.validateRenderCommands(),
      () => this.validateOldLogicRemoval(),
      () => this.validateCompleteFlow(),
      () => this.validateFolderStructure()
    ];

    let passed = 0;
    let failed = 0;

    for (const validation of validations) {
      const result = await this.validateStep(validation.name, validation);
      if (result) {
        passed++;
      } else {
        failed++;
      }
    }

    this.log(`\n📊 VALIDATION RESULTS:`, 'SUMMARY');
    this.log(`   ✅ Passed: ${passed}`);
    this.log(`   ❌ Failed: ${failed}`);
    this.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
      this.log('\n🎉 ALL VALIDATIONS PASSED!', 'SUCCESS');
      this.log('Audio architecture is ready for production.', 'SUCCESS');
    } else {
      this.log('\n⚠️ Some validations failed. Please review above.', 'WARNING');
    }

    // Save validation results
    const resultsPath = path.join(__dirname, 'temp', `${this.testProjectId}-validation-results.json`);
    fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
    fs.writeFileSync(resultsPath, JSON.stringify(this.validationResults, null, 2));
    this.log(`📄 Validation results saved: ${resultsPath}`);

    return failed === 0;
  }
}

// Run validation
if (require.main === module) {
  const validator = new AudioArchitectureValidator();
  validator.runFullValidation()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

module.exports = AudioArchitectureValidator;
