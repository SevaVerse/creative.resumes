/**
 * New Relic APM configuration (optional agent).
 *
 * IMPORTANT: Do NOT hard‑code your license key. Provide it via the
 * environment: NEW_RELIC_LICENSE_KEY. This file is committed safely because
 * it only references process.env variables.
 *
 * For APM (optional):
 *   1. npm install newrelic --save
 *   2. Set env vars (example):
 *        NEW_RELIC_LICENSE_KEY=... (keep secret – never commit)
 *        NEW_RELIC_APP_NAME=resume_builder
 *        NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
 *        NEW_RELIC_LOG_LEVEL=info
 *   3. Preload the agent for Node runtime only:
 *        (PowerShell)   $env:NODE_OPTIONS='-r ./newrelic.js'; npm start
 *        (Unix)         NODE_OPTIONS="-r ./newrelic.js" npm start
 *
 * For Log Forwarding Only (no agent needed):
 *   - Set NEW_RELIC_LOG_API_KEY and NEW_RELIC_LOG_API_ENDPOINT
 *   - Logs will be forwarded directly to New Relic Log API
 *
 * Notes / Constraints:
 * - New Relic only instruments the Node.js (Edge / Web runtime not supported).
 * - For Next.js 15 App Router, only pages & API routes executing in the Node
 *   runtime will be instrumented (NOT edge middleware/functions).
 * - Safe no‑op if the 'newrelic' package is not installed yet.
 */

'use strict';

// Export standard New Relic config expected by the agent (CommonJS)
// Only export if agent is installed and license key is set
if (process.env.NEW_RELIC_LICENSE_KEY) {
  exports.config = {
    app_name: [process.env.NEW_RELIC_APP_NAME || 'resume_builder'],
    license_key: process.env.NEW_RELIC_LICENSE_KEY || '',
    distributed_tracing: {
      enabled: process.env.NEW_RELIC_DISTRIBUTED_TRACING_ENABLED === 'true'
    },
    logging: {
      level: process.env.NEW_RELIC_LOG_LEVEL || 'info'
    },
    allow_all_headers: true,
    attributes: {
      // Include request correlation fields if present in logs/headers
      include: [
        'request.headers.x-request-id',
        'request.headers.x-forwarded-for',
        'request.id',
        'requestId'
      ]
    },
    // Reduce noise in small demo environments (can adjust later)
    transaction_tracer: {
      enabled: true,
      record_sql: 'obfuscated'
    },
    slow_sql: { enabled: false },
    browser_monitoring: { enabled: false }, // Disabled - using stub functions in browser instead
    utilization: { detect_aws: true, detect_docker: true },
    // Disable agent application logging since we're forwarding directly via Log API
    application_logging: {
      enabled: false,
      forwarding: { enabled: false },
      metrics: { enabled: false },
      local_decorating: { enabled: false }
    }
  };
}

// Light optional runtime notice (only when agent present & license configured)
// Use dynamic import to satisfy ESM-aware linters while staying in CJS context
if (process.env.NEW_RELIC_LICENSE_KEY) {
  try {
    // @ts-expect-error dynamic optional dependency (not installed by default)
    import('newrelic').then(agent => {
      if (agent) {
        process.stdout.write('[newrelic] agent initialized for ' + (exports.config?.app_name?.join(',') || 'resume_builder') + '\n');
      }
    }).catch(() => {});
  } catch {
    // silent noop
  }
}
