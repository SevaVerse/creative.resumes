import "server-only";
import { cache } from "react";
import { getJobById, getLastJobRun, listActiveJobs } from "@/lib/db/jobs";
import type { JobRow } from "@/types/database";
import { logger } from "@/utils/logger";

// Cached per request so generateMetadata and the page share one DB read.

export const loadJobsData = cache(async (): Promise<{ jobs: JobRow[]; lastRun: string | null }> => {
  try {
    const [jobs, run] = await Promise.all([listActiveJobs({ limit: 600 }), getLastJobRun()]);
    return { jobs, lastRun: run?.finished_at ?? null };
  } catch (error) {
    logger.warn("jobs.page_load_failed", { error: (error as Error).message });
    return { jobs: [], lastRun: null };
  }
});

export const loadJob = cache(async (id: string): Promise<JobRow | null> => {
  try {
    return await getJobById(id);
  } catch (error) {
    logger.warn("jobs.detail_load_failed", { error: (error as Error).message });
    return null;
  }
});
