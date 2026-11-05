import "server-only";
import type { InStatement, Row } from "@libsql/client";
import { getDb, nowIso } from "./client";
import type { JobRow, JobSector } from "@/types/database";

function toJob(row: Row): JobRow {
  let tags: string[] = [];
  try {
    tags = row.tags ? (JSON.parse(String(row.tags)) as string[]) : [];
  } catch {
    tags = [];
  }
  const s = (v: unknown) => (v === null || v === undefined ? null : String(v));
  return {
    id: String(row.id),
    title: String(row.title),
    organization: String(row.organization),
    location: s(row.location),
    sector: row.sector === "government" ? "government" : "private",
    source: String(row.source),
    url: String(row.url),
    summary: s(row.summary),
    employment_type: s(row.employment_type),
    posted_at: s(row.posted_at),
    last_date: s(row.last_date),
    tags,
    first_seen_at: String(row.first_seen_at),
    last_seen_at: String(row.last_seen_at),
  };
}

export type JobUpsert = Omit<JobRow, "first_seen_at" | "last_seen_at">;

/** Inserts new jobs and refreshes last_seen_at for ones already stored. Returns count of new rows. */
export async function upsertJobs(jobs: JobUpsert[]): Promise<number> {
  if (jobs.length === 0) return 0;
  const db = await getDb();
  const now = nowIso();
  const before = await db.execute("SELECT COUNT(*) AS n FROM jobs");
  const statements: InStatement[] = jobs.map((j) => ({
    sql: `INSERT INTO jobs (id, title, organization, location, sector, source, url, summary, employment_type,
                            posted_at, last_date, tags, first_seen_at, last_seen_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (id) DO UPDATE SET
            title = excluded.title,
            location = excluded.location,
            summary = COALESCE(excluded.summary, jobs.summary),
            last_date = COALESCE(excluded.last_date, jobs.last_date),
            tags = excluded.tags,
            last_seen_at = excluded.last_seen_at`,
    args: [
      j.id, j.title, j.organization, j.location, j.sector, j.source, j.url, j.summary, j.employment_type,
      j.posted_at, j.last_date, JSON.stringify(j.tags), now, now,
    ],
  }));
  for (let i = 0; i < statements.length; i += 200) {
    await db.batch(statements.slice(i, i + 200), "write");
  }
  const after = await db.execute("SELECT COUNT(*) AS n FROM jobs");
  return Number(after.rows[0]?.n ?? 0) - Number(before.rows[0]?.n ?? 0);
}

/** Removes listings not seen recently or whose last date has passed. */
export async function pruneJobs(retentionDays: number): Promise<number> {
  const db = await getDb();
  const cutoff = new Date(Date.now() - retentionDays * 86_400_000).toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const rs = await db.execute({
    sql: "DELETE FROM jobs WHERE last_seen_at < ? OR (last_date IS NOT NULL AND substr(last_date, 1, 10) < ?)",
    args: [cutoff, today],
  });
  return rs.rowsAffected;
}

// Listings whose last date has passed are hidden at read time: the refresh that deletes them
// runs only monthly, and a closed vacancy must not be shown (or offered to Google for Jobs) meanwhile.
// Same UTC-day rule as pruneJobs(), so a listing stays visible through its last date.
const OPEN_SQL = "(last_date IS NULL OR substr(last_date, 1, 10) >= ?)";
const todayUtc = () => new Date().toISOString().slice(0, 10);

export async function listActiveJobs(options: { sector?: JobSector; limit?: number } = {}): Promise<JobRow[]> {
  const db = await getDb();
  const limit = Math.min(Math.max(options.limit ?? 500, 1), 1000);
  const rs = options.sector
    ? await db.execute({
        sql: `SELECT * FROM jobs WHERE sector = ? AND ${OPEN_SQL} ORDER BY first_seen_at DESC, posted_at DESC LIMIT ?`,
        args: [options.sector, todayUtc(), limit],
      })
    : await db.execute({
        sql: `SELECT * FROM jobs WHERE ${OPEN_SQL} ORDER BY first_seen_at DESC, posted_at DESC LIMIT ?`,
        args: [todayUtc(), limit],
      });
  return rs.rows.map(toJob);
}

/** A single open listing (expired ones return null, so their detail pages 404 like pruned ones). */
export async function getJobById(id: string): Promise<JobRow | null> {
  if (!/^[a-f0-9]{24}$/.test(id)) return null;
  const db = await getDb();
  const rs = await db.execute({ sql: `SELECT * FROM jobs WHERE id = ? AND ${OPEN_SQL} LIMIT 1`, args: [id, todayUtc()] });
  return rs.rows[0] ? toJob(rs.rows[0]) : null;
}

export type JobRunStats = Record<string, unknown>;

export async function recordJobRun(startedAt: string, stats: JobRunStats): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO job_runs (id, started_at, finished_at, stats) VALUES (?, ?, ?, ?)",
    args: [crypto.randomUUID(), startedAt, nowIso(), JSON.stringify(stats)],
  });
}

export async function getLastJobRun(): Promise<{ finished_at: string; stats: JobRunStats } | null> {
  const db = await getDb();
  const rs = await db.execute("SELECT finished_at, stats FROM job_runs WHERE finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1");
  const row = rs.rows[0];
  if (!row) return null;
  let stats: JobRunStats = {};
  try {
    stats = JSON.parse(String(row.stats)) as JobRunStats;
  } catch {
    stats = {};
  }
  return { finished_at: String(row.finished_at), stats };
}
