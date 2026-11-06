import type { MetadataRoute } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { getBaseUrl } from "@/utils/baseUrl";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { getLastJobRun, listActiveJobs } from "@/lib/db/jobs";
import { JOB_CATEGORIES, jobDetailPath } from "@/lib/jobs/seo";
import type { JobRow } from "@/types/database";
import { logger } from "@/utils/logger";
import { TEMPLATE_IDS } from "@/types/resume";
import { RESUME_FORMATS } from "@/data/resumeFormats";

// Regenerate hourly so new monthly listings reach crawlers quickly.
export const revalidate = 3600;

// Bump when the homepage content actually changes, so crawlers aren't told it changes hourly.
const HOME_LAST_MODIFIED = new Date("2026-11-05");

async function loadJobs(): Promise<{ jobs: JobRow[]; lastRun: Date }> {
  try {
    const [jobs, run] = await Promise.all([listActiveJobs({ limit: 1000 }), getLastJobRun()]);
    return { jobs, lastRun: run ? new Date(run.finished_at) : new Date() };
  } catch (error) {
    logger.error("sitemap.jobs_load_failed", { error: (error as Error).message });
    // At build time, fall back to a sitemap without jobs so a DB blip can't fail the deploy.
    // During ISR revalidation, throw instead: Next.js then keeps serving the last good sitemap
    // rather than caching one with every job and category URL missing.
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return { jobs: [], lastRun: new Date() };
    throw error;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const { jobs, lastRun } = await loadJobs();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: HOME_LAST_MODIFIED,
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
      url: `${baseUrl}/ats-checker/`,
      lastModified: new Date("2026-11-05"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/roast-my-resume/`,
      lastModified: new Date("2026-11-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resume-templates/`,
      lastModified: new Date("2026-11-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/free-resume-builder/`,
      lastModified: new Date("2026-11-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resume-format/`,
      lastModified: new Date("2026-11-05"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...RESUME_FORMATS.map((f) => ({
      url: `${baseUrl}/resume-format/${f.slug}/`,
      lastModified: new Date("2026-11-05"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...TEMPLATE_IDS.map((id) => ({
      url: `${baseUrl}/resume-templates/${id}/`,
      lastModified: new Date("2026-11-05"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${baseUrl}/privacy/`,
      lastModified: new Date("2025-09-18"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date(BLOG_POSTS[0]?.published ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}/`,
      lastModified: new Date(post.updated ?? post.published),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
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
