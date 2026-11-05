import { fetchWithTimeout } from "../http";
import { stripHtml, toIsoDate, truncate } from "../text";
import type { RawJob } from "../types";

// Adzuna job search API (free developer key): https://developer.adzuna.com/
// Country "in" = India. We run a few fresher-oriented queries limited to the last 7 days.

type AdzunaResult = {
  id: string;
  title: string;
  description?: string;
  redirect_url: string;
  created?: string;
  contract_time?: string;
  contract_type?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
};

const QUERIES = ["fresher", "graduate trainee", "entry level", "internship", "apprentice"];

export async function fetchAdzuna(appId: string, appKey: string, maxPerQuery = 50): Promise<RawJob[]> {
  const jobs: RawJob[] = [];
  for (const what of QUERIES) {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what,
      max_days_old: "7",
      results_per_page: String(Math.min(50, maxPerQuery)),
      sort_by: "date",
      "content-type": "application/json",
    });
    const res = await fetchWithTimeout(`https://api.adzuna.com/v1/api/jobs/in/search/1?${params}`);
    const body = (await res.json()) as { results?: AdzunaResult[] };
    for (const r of body.results ?? []) {
      jobs.push({
        source: "Adzuna",
        title: stripHtml(r.title),
        organization: r.company?.display_name || "Company not disclosed",
        url: r.redirect_url,
        location: r.location?.display_name ?? null,
        summary: truncate(stripHtml(r.description), 280),
        employmentType: [r.contract_time, r.contract_type].filter(Boolean).join(", ").replace(/_/g, " ") || null,
        postedAt: toIsoDate(r.created),
        trustedEntryLevel: what === "fresher" || what === "graduate trainee",
      });
    }
  }
  return jobs;
}
