import { fetchWithTimeout } from "../http";
import { stripHtml, toIsoDate, truncate } from "../text";
import type { RawJob } from "../types";

// Public Lever postings API: https://github.com/lever/postings-api (no key required).
type LeverPosting = {
  id: string;
  text: string;
  hostedUrl: string;
  createdAt?: number;
  descriptionPlain?: string;
  /** ISO 3166-1 alpha-2, e.g. "IN". */
  country?: string;
  categories?: { location?: string; commitment?: string; team?: string };
};

/** Lever locations are often a bare city ("Noida, UP"); name the country so the India filter can see it. */
function locationOf(p: LeverPosting): string | null {
  const loc = p.categories?.location?.trim() || null;
  if (p.country?.toUpperCase() !== "IN") return loc;
  return loc && /india/i.test(loc) ? loc : [loc, "India"].filter(Boolean).join(", ");
}

export async function fetchLeverCompany(company: string, displayName?: string): Promise<RawJob[]> {
  const res = await fetchWithTimeout(`https://api.lever.co/v0/postings/${encodeURIComponent(company)}?mode=json`);
  const body = (await res.json()) as LeverPosting[];
  return (Array.isArray(body) ? body : []).map((p) => ({
    source: "Lever",
    title: p.text,
    organization: displayName || company,
    url: p.hostedUrl,
    location: locationOf(p),
    employmentType: p.categories?.commitment ?? null,
    summary: p.descriptionPlain ? truncate(stripHtml(p.descriptionPlain), 280) : null,
    postedAt: toIsoDate(p.createdAt),
    sector: "private" as const,
  }));
}
