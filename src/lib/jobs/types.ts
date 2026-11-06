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

/** Stored rows a source is responsible for: all rows with `source`, or only those for one `organization`. */
export type SourceScope = { source: string; organization?: string };

export type JobSource = { name: string; fetch: () => Promise<RawJob[]>; scope: SourceScope };
