import "server-only";
import { getDb, nowIso } from "./client";
import type { AnalyticsEventType } from "@/types/database";
import { isTemplateId } from "@/types/resume";

export async function insertAnalyticsEvent(
  eventType: AnalyticsEventType,
  userId: string | null,
  metadata: Record<string, unknown> | null
): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO analytics (id, user_id, event_type, metadata, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [crypto.randomUUID(), userId, eventType, metadata ? JSON.stringify(metadata) : null, nowIso()],
  });
}

export async function getMetrics(): Promise<{
  page_hits: number;
  resume_downloads: number;
  by_template: Record<string, number>;
}> {
  const db = await getDb();
  const [counts, byTemplate] = await db.batch(
    [
      `SELECT
         SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_hits,
         SUM(CASE WHEN event_type = 'resume_download' THEN 1 ELSE 0 END) AS resume_downloads
       FROM analytics`,
      `SELECT COALESCE(json_extract(metadata, '$.template'), 'unknown') AS template, COUNT(*) AS n
       FROM analytics WHERE event_type = 'resume_download' GROUP BY 1`,
    ],
    "read"
  );
  const row = counts.rows[0];
  const templates: Record<string, number> = {};
  // Only real template ids: older rows came from client-sent metadata and may hold arbitrary text.
  for (const r of byTemplate.rows) if (isTemplateId(r.template)) templates[r.template] = Number(r.n);
  return {
    page_hits: Number(row?.page_hits ?? 0),
    resume_downloads: Number(row?.resume_downloads ?? 0),
    by_template: templates,
  };
}
