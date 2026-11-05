import type { JobSector } from "@/types/database";
import type { FeedConfig } from "./sources/rss";

// All sources are configured through environment variables so the list can grow
// without code changes. See .env.example for the format.

export type JobsConfig = {
  adzuna?: { appId: string; appKey: string };
  greenhouse: { slug: string; name?: string }[];
  lever: { slug: string; name?: string }[];
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

export function getJobsConfig(): JobsConfig {
  const { ADZUNA_APP_ID, ADZUNA_APP_KEY } = process.env;
  return {
    adzuna: ADZUNA_APP_ID && ADZUNA_APP_KEY ? { appId: ADZUNA_APP_ID, appKey: ADZUNA_APP_KEY } : undefined,
    greenhouse: parseSlugList(process.env.GREENHOUSE_BOARDS),
    lever: parseSlugList(process.env.LEVER_COMPANIES),
    feeds: parseFeeds(process.env.JOB_FEEDS),
    retentionDays: Math.max(7, Number(process.env.JOBS_RETENTION_DAYS) || 21),
  };
}
