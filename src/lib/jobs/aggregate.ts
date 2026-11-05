import "server-only";
import { createHash } from "node:crypto";
import { getJobsConfig } from "./config";
import { classifySector, deriveTags, isEntryLevel, isIndiaOrRemote } from "./classify";
import { isSafeHttpUrl, toIsoDate, truncate } from "./text";
import { fetchAdzuna } from "./sources/adzuna";
import { fetchGreenhouseBoard } from "./sources/greenhouse";
import { fetchLeverCompany } from "./sources/lever";
import { fetchFeed } from "./sources/rss";
import { CURATED_JOBS } from "@/data/jobs/curated";
import type { JobSource, RawJob, SourceResult } from "./types";
import { pruneJobs, recordJobRun, upsertJobs, type JobUpsert } from "@/lib/db/jobs";
import { logger } from "@/utils/logger";

export function buildSources(): JobSource[] {
  const cfg = getJobsConfig();
  const sources: JobSource[] = [{ name: "Curated", fetch: async () => CURATED_JOBS }];
  if (cfg.adzuna) {
    const { appId, appKey } = cfg.adzuna;
    sources.push({ name: "Adzuna", fetch: () => fetchAdzuna(appId, appKey) });
  }
  for (const b of cfg.greenhouse) sources.push({ name: `Greenhouse:${b.slug}`, fetch: () => fetchGreenhouseBoard(b.slug, b.name) });
  for (const c of cfg.lever) sources.push({ name: `Lever:${c.slug}`, fetch: () => fetchLeverCompany(c.slug, c.name) });
  for (const f of cfg.feeds) sources.push({ name: `Feed:${f.name}`, fetch: () => fetchFeed(f) });
  return sources;
}

function normalizeUrl(url: string): string {
  const u = new URL(url);
  for (const p of [...u.searchParams.keys()]) if (/^utm_|^ref$|^source$/i.test(p)) u.searchParams.delete(p);
  u.hash = "";
  return u.toString();
}

function jobId(job: RawJob, url: string): string {
  // Dedupe by URL; fall back to org+title for sources that rotate tracking URLs.
  const key = job.source === "Adzuna" ? `${job.organization}|${job.title}|${job.location ?? ""}`.toLowerCase() : url;
  return createHash("sha256").update(key).digest("hex").slice(0, 24);
}

/** Classifies, filters and normalizes raw jobs into rows ready for storage. */
export function toEntryLevelRows(raw: RawJob[]): JobUpsert[] {
  const today = new Date().toISOString().slice(0, 10);
  const byId = new Map<string, JobUpsert>();
  for (const job of raw) {
    if (!job.title || !job.url || !isSafeHttpUrl(job.url)) continue;
    const sector = classifySector(job);
    if (!isEntryLevel(job, sector)) continue;
    if (sector === "private" && !isIndiaOrRemote(job.location)) continue;
    const lastDate = toIsoDate(job.lastDate);
    if (lastDate && lastDate.slice(0, 10) < today) continue;
    const url = normalizeUrl(job.url);
    const id = jobId(job, url);
    if (byId.has(id)) continue;
    byId.set(id, {
      id,
      title: truncate(job.title.trim(), 300),
      organization: truncate(job.organization.trim() || "Not disclosed", 200),
      location: job.location ? truncate(job.location.trim(), 200) : null,
      sector,
      source: job.source,
      url,
      summary: job.summary ? truncate(job.summary, 300) : null,
      employment_type: job.employmentType || null,
      posted_at: toIsoDate(job.postedAt),
      last_date: lastDate,
      tags: deriveTags(job),
    });
  }
  return [...byId.values()];
}

async function runSource(source: JobSource): Promise<SourceResult> {
  try {
    return { source: source.name, jobs: await source.fetch() };
  } catch (error) {
    return { source: source.name, jobs: [], error: (error as Error).message };
  }
}

/** Fetches all configured sources, stores entry-level jobs and prunes stale ones. */
export async function refreshJobs() {
  const startedAt = new Date().toISOString();
  const cfg = getJobsConfig();
  const results = await Promise.all(buildSources().map(runSource));
  const rows = toEntryLevelRows(results.flatMap((r) => r.jobs));
  const inserted = await upsertJobs(rows);
  const pruned = await pruneJobs(cfg.retentionDays);

  const stats = {
    sources: results.map((r) => ({ source: r.source, fetched: r.jobs.length, error: r.error })),
    accepted: rows.length,
    inserted,
    pruned,
    government: rows.filter((r) => r.sector === "government").length,
    private: rows.filter((r) => r.sector === "private").length,
  };
  for (const r of results) if (r.error) logger.warn("jobs.source_failed", { source: r.source, error: r.error });
  await recordJobRun(startedAt, stats);
  logger.info("jobs.refresh_complete", { accepted: stats.accepted, inserted, pruned });
  return stats;
}
