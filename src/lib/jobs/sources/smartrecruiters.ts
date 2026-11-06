import { fetchWithTimeout } from "../http";
import { toIsoDate } from "../text";
import type { RawJob } from "../types";

// Public SmartRecruiters postings: https://developers.smartrecruiters.com/docs/posting-api (no key required).
// Only India postings are requested (`country=in`), so large global employers stay cheap to poll.
type SmartRecruitersPosting = {
  id: string;
  name: string;
  releasedDate?: string;
  company?: { identifier?: string; name?: string };
  location?: { city?: string; remote?: boolean };
  typeOfEmployment?: { label?: string };
  experienceLevel?: { id?: string };
};

const PAGE_SIZE = 100;
const MAX_PAGES = 3;
// SmartRecruiters' own seniority field. Only "internship" is trusted: employers also tag roles asking for
// 5+ years as "entry_level", so those still have to pass the normal entry-level title checks.
const isInternship = (p: SmartRecruitersPosting) => p.experienceLevel?.id === "internship";
const titleCase = (s: string) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());

export async function fetchSmartRecruitersCompany(company: string, displayName?: string): Promise<RawJob[]> {
  const jobs: RawJob[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({ country: "in", limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) });
    const res = await fetchWithTimeout(
      `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company)}/postings?${params}`
    );
    const body = (await res.json()) as { totalFound?: number; content?: SmartRecruitersPosting[] };
    const content = body.content ?? [];
    for (const p of content) {
      const city = p.location?.city?.trim();
      const internship = isInternship(p);
      jobs.push({
        source: "SmartRecruiters",
        title: p.name,
        organization: displayName || company,
        url: `https://jobs.smartrecruiters.com/${encodeURIComponent(p.company?.identifier || company)}/${encodeURIComponent(p.id)}`,
        location: [city && titleCase(city), p.location?.remote ? "Remote" : null, "India"].filter(Boolean).join(", "),
        employmentType: internship ? "Internship" : (p.typeOfEmployment?.label ?? null),
        postedAt: toIsoDate(p.releasedDate),
        sector: "private",
        trustedEntryLevel: internship,
      });
    }
    if (content.length < PAGE_SIZE || jobs.length >= (body.totalFound ?? 0)) break;
  }
  return jobs;
}
