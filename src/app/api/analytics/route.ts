import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/utils/auth/session";
import { insertAnalyticsEvent } from "@/lib/db/analytics";
import { checkRateLimit } from "@/lib/db/rateLimits";
import { isPlainObject, jsonError, readJsonBody } from "@/lib/api/http";
import { isAnalyticsEventType } from "@/types/database";
import { createRateLimiter } from "@/utils/rateLimit";
import { clientKey } from "@/utils/cors";
import { logger } from "@/utils/logger";

export const runtime = "nodejs";

const limiter = createRateLimiter(60_000, 60);

// The page-hit counter is public (builder header), so a client counts at most once per window.
const PAGE_VIEW_WINDOW_MS = 30 * 60_000;

const MAX_METADATA_KEYS = 8;
const MAX_METADATA_STRING = 120;

/** Keeps only a few short, flat values: metadata is free-form client input. */
function sanitizeMetadata(value: unknown): Record<string, string | number | boolean | null> | null {
  if (!isPlainObject(value)) return null;
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, v] of Object.entries(value).slice(0, MAX_METADATA_KEYS)) {
    if (!/^[a-z_]{1,40}$/.test(key)) continue;
    if (typeof v === "string") out[key] = v.slice(0, MAX_METADATA_STRING);
    else if ((typeof v === "number" && Number.isFinite(v)) || typeof v === "boolean" || v === null) out[key] = v;
  }
  return Object.keys(out).length > 0 ? out : null;
}

// Accepts first-party, anonymous-by-default event counts. No IPs or user agents are stored.
export async function POST(req: NextRequest) {
  const client = clientKey(req.headers);
  if (!limiter.check(`analytics:${client}`).allowed) {
    return new NextResponse(null, { status: 204 }); // drop silently
  }
  const body = await readJsonBody<unknown>(req, 2_048);
  if (!isPlainObject(body) || !isAnalyticsEventType(body.event_type)) {
    return jsonError(400, "Invalid event");
  }
  const eventType = body.event_type;

  // Downloads are recorded by /api/export-pdf when a PDF is actually generated; accepting them
  // from clients would let anyone inflate the public counter. Still 204 so older clients don't error.
  if (eventType === "resume_download") return new NextResponse(null, { status: 204 });

  if (eventType === "page_view") {
    const rl = await checkRateLimit("page_view", client, PAGE_VIEW_WINDOW_MS, 1);
    if (!rl.allowed) return new NextResponse(null, { status: 204 });
  }

  try {
    await insertAnalyticsEvent(eventType, await getSessionUserId(), sanitizeMetadata(body.metadata));
  } catch (error) {
    logger.warn("analytics.insert_failed", { error: (error as Error).message });
  }
  return new NextResponse(null, { status: 204 });
}
