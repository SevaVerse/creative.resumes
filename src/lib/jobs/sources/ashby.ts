import { fetchWithTimeout } from "../http";
import { stripHtml, toIsoDate, truncate } from "../text";
import type { RawJob } from "../types";

// Public Ashby job boards: https://developers.ashbyhq.com/docs/public-job-posting-api (no key required).
type AshbyLocation = { location?: string; address?: { postalAddress?: { addressCountry?: string } } };
type AshbyJob = AshbyLocation & {
  title: string;
  jobUrl: string;
  employmentType?: string;
  publishedAt?: string;
  isListed?: boolean;
  isRemote?: boolean;
  descriptionPlain?: string;
  secondaryLocations?: AshbyLocation[];
};

const EMPLOYMENT_TYPES: Record<string, string> = {
  FullTime: "Full-time",
  PartTime: "Part-time",
  Intern: "Internship",
  Contract: "Contract",
  Temporary: "Temporary",
};

/** The India location of a multi-location posting if it has one, otherwise the primary location. */
function pickLocation(job: AshbyJob): string | null {
  const all = [job, ...(job.secondaryLocations ?? [])];
  const india = all.find((l) => /india/i.test(l.address?.postalAddress?.addressCountry ?? ""));
  const chosen = india ?? job;
  const country = chosen.address?.postalAddress?.addressCountry;
  const name = chosen.location ?? "";
  if (!name) return country ?? null;
  return country && !name.toLowerCase().includes(country.toLowerCase()) ? `${name}, ${country}` : name;
}

export async function fetchAshbyBoard(board: string, displayName?: string): Promise<RawJob[]> {
  const res = await fetchWithTimeout(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}`);
  const body = (await res.json()) as { jobs?: AshbyJob[] };
  return (body.jobs ?? [])
    .filter((j) => j.isListed !== false && j.title && j.jobUrl)
    .map((j) => ({
      source: "Ashby",
      title: j.title,
      organization: displayName || board,
      url: j.jobUrl,
      location: pickLocation(j),
      employmentType: (j.employmentType && EMPLOYMENT_TYPES[j.employmentType]) || null,
      summary: j.descriptionPlain ? truncate(stripHtml(j.descriptionPlain), 280) : null,
      postedAt: toIsoDate(j.publishedAt),
      sector: "private" as const,
    }));
}
