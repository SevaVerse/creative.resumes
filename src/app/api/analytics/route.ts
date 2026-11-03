import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/utils/auth/session";
import { insertAnalyticsEvent } from "@/lib/db/analytics";
import { isPlainObject, jsonError, readJsonBody } from "@/lib/api/http";
import { isAnalyticsEventType } from "@/types/database";
import { createRateLimiter } from "@/utils/rateLimit";
import { clientKey } from "@/utils/cors";
import { logger } from "@/utils/logger";

export const runtime = "nodejs";

const limiter = createRateLimiter(60_000, 60);

// Accepts first-party, anonymous-by-default event counts. No IPs or user agents are stored.
export async function POST(req: NextRequest) {
  if (!limiter.check(`analytics:${clientKey(req.headers)}`).allowed) {
    return new NextResponse(null, { status: 204 }); // drop silently
  }
  const body = await readJsonBody<unknown>(req, 2_048);
  if (!isPlainObject(body) || !isAnalyticsEventType(body.event_type)) {
    return jsonError(400, "Invalid event");
  }
  const metadata = isPlainObject(body.metadata) ? body.metadata : null;
  try {
    await insertAnalyticsEvent(body.event_type, await getSessionUserId(), metadata);
  } catch (error) {
    logger.warn("analytics.insert_failed", { error: (error as Error).message });
  }
  return new NextResponse(null, { status: 204 });
}
