import "server-only";
import { createHash } from "node:crypto";
import { getJobsConfig, type BoardConfig } from "./config";
import { classifySector, deriveTags, isEntryLevel, isIndiaOrRemote } from "./classify";
import { isSafeHttpUrl, toIsoDate, truncate } from "./text";
import { fetchAdzuna } from "./sources/adzuna";
import { fetchAshbyBoard } from "./sources/ashby";
import { fetchGreenhouseBoard } from "./sources/greenhouse";
import { fetchLeverCompany } from "./sources/lever";
import { fetchSmartRecruitersCompany } from "./sources/smartrecruiters";
import { fetchFeed } from "./sources/rss";
import { CURATED_JOBS } from "@/data/jobs/curated";
import type { JobSource, RawJob, SourceResult, SourceScope } from "./types";
import { pruneJobs, recordJobRun, upsertJobs, type JobUpsert } from "@/lib/db/jobs";
import { logger } from "@/utils/logger";

// Each adapter's `source` value as stored on its rows, and the fetcher for one board.
const ATS_ADAPTERS: Record<BoardConfig["ats"], { source: string; fetch: (slug: string, name?: string) => Promise<RawJob[]> }> = {
  greenhouse: { source: "Greenhouse", fetch: fetchGreenhouseBoard },
  lever: { source: "Lever", fetch: fetchLeverCompany },
  ashby: { source: "Ashby", fetch: fetchAshbyBoard },
  smartrecruiters: { source: "SmartRecruiters", fetch: fetchSmartRecruitersCompany },
};

function boardSource(b: BoardConfig): JobSource {
  const adapter = ATS_ADAPTERS[b.ats];
  return {
    name: `${adapter.source}:${b.slug}`,
    fetch: () => adapter.fetch(b.slug, b.name),
    // Adapters store the display name (or the slug) as the organization, so it identifies the board's rows.
    scope: { source: adapter.source, organization: truncate((b.name || b.slug).trim(), 200) },
  };
}

export function buildSources(): JobSource[] {
  const cfg = getJobsConfig();
  const sources: JobSource[] = [{ name: "Curated", fetch: async () => CURATED_JOBS, scope: { source: "Curated" } }];
  if (cfg.adzuna) {
    const { appId, appKey } = cfg.adzuna;
    sources.push({ name: "Adzuna", fetch: () => fetchAdzuna(appId, appKey), scope: { source: "Adzuna" } });
  }
  for (const b of cfg.boards) sources.push(boardSource(b));
  for (const f of cfg.feeds) sources.push({ name: `Feed:${f.name}`, fetch: () => fetchFeed(f), scope: { source: f.name } });
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

async function runSource(source: JobSource): Promise<SourceResult & { scope: SourceScope }> {
  try {
    return { source: source.name, jobs: await source.fetch(), scope: source.scope };
  } catch (error) {
    return { source: source.name, jobs: [], error: (error as Error).message, scope: source.scope };
  }
}

/** Fetches all configured sources, stores entry-level jobs and prunes stale ones. */
export async function refreshJobs() {
  const startedAt = new Date().toISOString();
  const cfg = getJobsConfig();
  const results = await Promise.all(buildSources().map(runSource));
  const rows = toEntryLevelRows(results.flatMap((r) => r.jobs));
  const inserted = await upsertJobs(rows);
  // A monthly run replaces last month's listings. Rows from a source that failed this run are kept
  // (until their last date) instead of being dropped, so one broken board doesn't empty its listings
  // or stop the others from being cleaned up.
  const failed = results.filter((r) => r.error);
  const pruned = await pruneJobs(cfg.retentionDays, failed.map((r) => r.scope));

  const stats = {
    sources: results.map((r) => ({ source: r.source, fetched: r.jobs.length, error: r.error })),
    failedSources: failed.length,
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
