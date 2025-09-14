/**
 * Direct Log API Forwarding to New Relic.
 *
 * Buffers logs and forwards them in batches to New Relic Log API.
 * Only active if NEW_RELIC_LOG_API_KEY is set.
 * Designed for Node runtime (not Edge).
 *
 * Env vars:
 * - NEW_RELIC_LOG_API_KEY: Your license key or ingest key
 * - NEW_RELIC_LOG_API_ENDPOINT: Log API endpoint (defaults to US)
 * - NEW_RELIC_APP_NAME: Service name (defaults to resume_builder)
 */

interface LogEntry {
  timestamp: number;
  message: string;
  level: string;
  [key: string]: unknown;
}

const QUEUE: LogEntry[] = [];
let flushing = false;
const MAX_BATCH = 50;
const FLUSH_INTERVAL_MS = 2000;
const ENDPOINT = process.env.NEW_RELIC_LOG_API_ENDPOINT || 'https://log-api.newrelic.com/log/v1';
const API_KEY = process.env.NEW_RELIC_LOG_API_KEY || process.env.NEW_RELIC_LICENSE_KEY;

export function enqueueLog(entry: Record<string, unknown>): void {
  if (!API_KEY) return; // Disabled if no key

  // Normalize fields for New Relic
  const { msg, level, time, requestId, durationMs, ...rest } = entry;
  const normalized: LogEntry = {
    timestamp: time ? (typeof time === 'string' ? Date.parse(time) : Date.now()) : Date.now(),
    message: typeof msg === 'string' ? msg : String(msg),
    level: typeof level === 'string' ? level : 'info',
    'request.id': typeof requestId === 'string' ? requestId : undefined,
    'duration.ms': typeof durationMs === 'number' ? durationMs : undefined,
    'event.name': typeof msg === 'string' ? msg : String(msg),
    ...rest
  };

  QUEUE.push(normalized);
  if (QUEUE.length >= MAX_BATCH) void flush();
}

async function flush() {
  if (flushing || !API_KEY || QUEUE.length === 0) return;
  flushing = true;
  const batch = QUEUE.splice(0, MAX_BATCH);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY
      },
      body: JSON.stringify({
        common: {
          attributes: {
            'service.name': process.env.NEW_RELIC_APP_NAME || 'resume_builder',
            'runtime': 'node',
            'region': process.env.VERCEL_REGION || 'unknown'
          }
        },
        logs: batch
      })
    });

    if (!response.ok) {
      throw new Error(`Log API error: ${response.status}`);
    }
  } catch {
    // Re-queue on failure (simple retry)
    QUEUE.unshift(...batch);
    // Optional: log locally if needed, but avoid recursion
  } finally {
    flushing = false;
  }
}

// Periodic flush
setInterval(() => { void flush(); }, FLUSH_INTERVAL_MS).unref?.();

// Graceful shutdown flush (Node only)
process.on?.('exit', () => { void flush(); });
process.on?.('SIGTERM', () => { void flush(); });
process.on?.('SIGINT', () => { void flush(); });