// Lightweight structured logger for server routes.
// Emits JSON lines to stdout suitable for piping into log aggregation / APM enrichers.
// LOG_LEVEL controls minimum level (debug < info < warn < error). Default: info.
// Adds requestId correlation (if available) and monotonic duration helpers.
// जय श्री राम

import { enqueueLog } from './logForwarder';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const envLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const minLevel = levelOrder[envLevel] ?? levelOrder.info;

interface LogFields {
  msg: string;
  level: LogLevel;
  requestId?: string;
  durationMs?: number;
  [key: string]: unknown;
}

function emit(fields: LogFields) {
  if (levelOrder[fields.level] < minLevel) return;
  const line = JSON.stringify({
    time: new Date().toISOString(),
    ...fields,
  });
  process.stdout.write(line + '\n');
  // Forward to New Relic Log API if configured
  enqueueLog(fields);
}

export const logger = {
  debug(msg: string, extra?: Record<string, unknown>) { emit({ level: 'debug', msg, ...extra }); },
  info(msg: string, extra?: Record<string, unknown>) { emit({ level: 'info', msg, ...extra }); },
  warn(msg: string, extra?: Record<string, unknown>) { emit({ level: 'warn', msg, ...extra }); },
  error(msg: string, extra?: Record<string, unknown>) { emit({ level: 'error', msg, ...extra }); },
  withRequest(requestId?: string) {
    const base = { requestId };
    return {
      debug: (msg: string, extra?: Record<string, unknown>) => emit({ level: 'debug', msg, ...base, ...extra }),
      info: (msg: string, extra?: Record<string, unknown>) => emit({ level: 'info', msg, ...base, ...extra }),
      warn: (msg: string, extra?: Record<string, unknown>) => emit({ level: 'warn', msg, ...base, ...extra }),
      error: (msg: string, extra?: Record<string, unknown>) => emit({ level: 'error', msg, ...base, ...extra }),
  time(msg: string) {
        const start = performance.now();
        return {
          end(extra?: Record<string, unknown>) {
            const durationMs = +(performance.now() - start).toFixed(2);
            emit({ level: 'info', msg, durationMs, ...base, ...extra });
          },
        };
      },
    };
  },
};

export function extractRequestId(headers: Headers | Record<string, string | undefined>) {
  if (headers instanceof Headers) {
    return headers.get('x-request-id') || undefined;
  }
  return (headers['x-request-id'] as string) || undefined;
}
