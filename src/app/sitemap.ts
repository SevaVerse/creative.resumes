import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/utils/baseUrl";
import { getLastJobRun, listActiveJobs } from "@/lib/db/jobs";
import { JOB_CATEGORIES, jobDetailPath } from "@/lib/jobs/seo";
import type { JobRow } from "@/types/database";
import { logger } from "@/utils/logger";

// Regenerate hourly so new monthly listings reach crawlers quickly.
export const revalidate = 3600;

async function loadJobs(): Promise<{ jobs: JobRow[]; lastRun: Date }> {
  try {
    const [jobs, run] = await Promise.all([listActiveJobs({ limit: 1000 }), getLastJobRun()]);
    return { jobs, lastRun: run ? new Date(run.finished_at) : new Date() };
  } catch (error) {
    logger.warn("sitemap.jobs_load_failed", { error: (error as Error).message });
    return { jobs: [], lastRun: new Date() };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const { jobs, lastRun } = await loadJobs();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs/`,
      lastModified: lastRun,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy/`,
      lastModified: new Date("2025-09-18"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/privacy-first-resume-builder/`,
      lastModified: new Date("2025-06-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Only categories with listings — empty ones are noindex.
  const categoryPages: MetadataRoute.Sitemap = JOB_CATEGORIES.filter((c) => jobs.some(c.match)).map((c) => ({
    url: `${baseUrl}/jobs/${c.slug}/`,
    lastModified: lastRun,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const jobPages: MetadataRoute.Sitemap = jobs.map((j) => ({
    url: `${baseUrl}${jobDetailPath(j.id)}`,
    lastModified: new Date(j.last_seen_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...jobPages];
}
