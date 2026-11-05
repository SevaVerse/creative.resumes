import { fetchWithTimeout } from "../http";
import { toIsoDate } from "../text";
import type { RawJob } from "../types";

// Public Greenhouse job boards: https://developers.greenhouse.io/job-board.html (no key required).
type GreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  updated_at?: string;
  first_published?: string;
  location?: { name?: string };
};

export async function fetchGreenhouseBoard(board: string, displayName?: string): Promise<RawJob[]> {
  const res = await fetchWithTimeout(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs`);
  const body = (await res.json()) as { jobs?: GreenhouseJob[] };
  return (body.jobs ?? []).map((j) => ({
    source: "Greenhouse",
    title: j.title,
    organization: displayName || board,
    url: j.absolute_url,
    location: j.location?.name ?? null,
    postedAt: toIsoDate(j.first_published || j.updated_at),
    sector: "private" as const,
  }));
}
