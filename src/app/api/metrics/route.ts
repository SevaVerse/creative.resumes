import { NextResponse } from "next/server";
import { getMetrics } from "@/lib/db/analytics";
import { logger } from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/metrics — aggregated, anonymous counts for the builder header. */
export async function GET() {
  try {
    const metrics = await getMetrics();
    return NextResponse.json(metrics, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    logger.warn("metrics.failed", { error: (error as Error).message });
    return NextResponse.json({ page_hits: 0, resume_downloads: 0, by_template: {} });
  }
}
