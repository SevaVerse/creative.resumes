import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { refreshJobs } from "@/lib/jobs/aggregate";
import { submitIndexNow } from "@/lib/jobs/indexnow";
import { JOB_CATEGORIES, jobDetailPath } from "@/lib/jobs/seo";
import { listActiveJobs } from "@/lib/db/jobs";
import { getBaseUrl } from "@/utils/baseUrl";
import { jsonError } from "@/lib/api/http";
import { logger, extractRequestId } from "@/utils/logger";

// Monthly job refresh (1st of each month). Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`
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
    const startedAt = new Date().toISOString();
    const stats = await refreshJobs();
    // "layout" scope invalidates /jobs, its category/detail pages and /jobs/feed.xml (tags carry
    // trailing slashes because of `trailingSlash: true`, so a plain "/jobs" path would not match).
    revalidatePath("/jobs", "layout");
    revalidatePath("/sitemap.xml");
    const indexNow = await notifySearchEngines(startedAt);
    return NextResponse.json({ ok: true, stats, indexNow });
  } catch (error) {
    log.error("jobs.refresh_failed", { error: (error as Error).message });
    return jsonError(500, "Job refresh failed");
  }
}

/** Pings IndexNow with the jobs landing pages and any listing first seen in this run. */
async function notifySearchEngines(since: string) {
  const baseUrl = getBaseUrl();
  const jobs = await listActiveJobs({ limit: 1000 }).catch(() => []);
  const fresh = jobs.filter((j) => j.first_seen_at >= since);
  if (fresh.length === 0) return { submitted: 0 };
  const urls = [
    `${baseUrl}/jobs/`,
    ...JOB_CATEGORIES.filter((c) => fresh.some(c.match)).map((c) => `${baseUrl}/jobs/${c.slug}/`),
    ...fresh.map((j) => `${baseUrl}${jobDetailPath(j.id)}`),
  ];
  return submitIndexNow(baseUrl, urls);
}
