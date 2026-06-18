const fullAuditProcessor    = require('./fullAuditProcessor');
const homepageAuditProcessor = require('./homepageAuditProcessor');

/**
 * Processor Registry
 * Maps videoType identifiers to their processor modules.
 *
 * Rules:
 * - Each processor exports { process(job, services) }
 * - Adding a new video type = one new file + one new entry here
 * - worker.js never changes when new types are added
 *
 * FULL_AUDIT is the default for backward compatibility —
 * jobs dispatched without a videoType field route here.
 */
const registry = {
  FULL_AUDIT:     fullAuditProcessor,
  HOMEPAGE_AUDIT: homepageAuditProcessor
};

module.exports = registry;
