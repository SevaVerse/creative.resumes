import type { JobSector } from "@/types/database";

/** A job as returned by a source adapter, before classification and storage. */
export type RawJob = {
  source: string;
  title: string;
  organization: string;
  url: string;
  location?: string | null;
  summary?: string | null;
  employmentType?: string | null;
  postedAt?: string | null;
  lastDate?: string | null;
  /** Set when the source itself is known to be government/private. */
  sector?: JobSector;
  /** Skip the entry-level keyword check (e.g. a feed that is already fresher-only). */
  trustedEntryLevel?: boolean;
};

export type SourceResult = { source: string; jobs: RawJob[]; error?: string };

export type JobSource = { name: string; fetch: () => Promise<RawJob[]> };
