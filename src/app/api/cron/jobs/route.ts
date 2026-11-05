import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { refreshJobs } from "@/lib/jobs/aggregate";
import { jsonError } from "@/lib/api/http";
import { logger, extractRequestId } from "@/utils/logger";

// Weekly job refresh. Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`
// (schedule in vercel.json). Can also be triggered manually with the same header.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const provided = req.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const log = logger.withRequest(extractRequestId(req.headers));
  if (!authorized(req)) return jsonError(401, "Unauthorized");
  try {
    const stats = await refreshJobs();
    // "layout" scope invalidates /jobs and /jobs/feed.xml (tags carry trailing slashes
    // because of `trailingSlash: true`, so a plain "/jobs" path would not match).
    revalidatePath("/jobs", "layout");
    return NextResponse.json({ ok: true, stats });
  } catch (error) {
    log.error("jobs.refresh_failed", { error: (error as Error).message });
    return jsonError(500, "Job refresh failed");
  }
}
