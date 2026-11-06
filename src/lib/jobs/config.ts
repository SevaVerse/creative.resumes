import type { JobSector } from "@/types/database";
import type { FeedConfig } from "./sources/rss";
import { EMPLOYER_BOARDS, type AtsProvider } from "@/data/jobs/employers";

// Employer ATS boards come from the verified registry in src/data/jobs/employers.ts; environment
// variables can add more without a deploy. Other sources are configured through environment
// variables only. See .env.example for the format.

export type BoardConfig = { ats: AtsProvider; slug: string; name?: string };

export type JobsConfig = {
  adzuna?: { appId: string; appKey: string };
  boards: BoardConfig[];
  feeds: FeedConfig[];
  retentionDays: number;
};

function parseSlugList(value?: string): { slug: string; name?: string }[] {
  return (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [slug, ...rest] = entry.split(":");
      return { slug: slug.trim(), name: rest.join(":").trim() || undefined };
    })
    .filter((e) => /^[a-z0-9_-]+$/i.test(e.slug));
}

// JOB_FEEDS="government|UPSC|https://example.gov.in/rss.xml;private|Some Board|https://..."
function parseFeeds(value?: string): FeedConfig[] {
  return (value || "")
    .split(/[;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [sector, name, url] = entry.split("|").map((p) => p.trim());
      return { sector: sector as JobSector, name, url };
    })
    .filter((f) => (f.sector === "government" || f.sector === "private") && f.name && /^https?:\/\//.test(f.url || ""));
}

const BOARD_ENV: Record<AtsProvider, string> = {
  greenhouse: "GREENHOUSE_BOARDS",
  lever: "LEVER_COMPANIES",
  ashby: "ASHBY_BOARDS",
  smartrecruiters: "SMARTRECRUITERS_COMPANIES",
};

/** Registry boards plus any extra ones from env, without duplicates (slugs compared case-insensitively). */
function getBoards(): BoardConfig[] {
  const boards: BoardConfig[] = EMPLOYER_BOARDS.map(({ ats, slug, name }) => ({ ats, slug, name }));
  const seen = new Set(boards.map((b) => `${b.ats}:${b.slug.toLowerCase()}`));
  for (const [ats, envName] of Object.entries(BOARD_ENV) as [AtsProvider, string][]) {
    for (const entry of parseSlugList(process.env[envName])) {
      const key = `${ats}:${entry.slug.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      boards.push({ ats, ...entry });
    }
  }
  return boards;
}

export function getJobsConfig(): JobsConfig {
  const { ADZUNA_APP_ID, ADZUNA_APP_KEY } = process.env;
  return {
    adzuna: ADZUNA_APP_ID && ADZUNA_APP_KEY ? { appId: ADZUNA_APP_ID, appKey: ADZUNA_APP_KEY } : undefined,
    boards: getBoards(),
    feeds: parseFeeds(process.env.JOB_FEEDS),
    retentionDays: Math.max(7, Number(process.env.JOBS_RETENTION_DAYS) || 21),
  };
}
