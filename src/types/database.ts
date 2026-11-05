// Row types for the libSQL (Turso) database. See src/lib/db/schema.ts.
import type { TemplateId } from "./resume";

export type Resume = {
  id: string;
  user_id: string;
  name: string;
  template: TemplateId;
  data: Record<string, unknown>;
  last_edited_at: string;
  created_at: string;
};

export type ResumeUpdate = Partial<Pick<Resume, "name" | "template" | "data">>;

export const ANALYTICS_EVENT_TYPES = [
  "page_view",
  "resume_download",
  "ai_rewrite",
  "template_change",
  "resume_upload",
  "resume_save",
  "resume_load",
  "jobs_view",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export function isAnalyticsEventType(value: unknown): value is AnalyticsEventType {
  return typeof value === "string" && (ANALYTICS_EVENT_TYPES as readonly string[]).includes(value);
}

export type JobSector = "government" | "private";

export type JobRow = {
  id: string;
  title: string;
  organization: string;
  location: string | null;
  sector: JobSector;
  source: string;
  url: string;
  summary: string | null;
  employment_type: string | null;
  posted_at: string | null;
  last_date: string | null;
  tags: string[];
  first_seen_at: string;
  last_seen_at: string;
};
