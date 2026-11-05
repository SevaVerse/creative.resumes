import { loadJob } from "@/lib/jobs/load";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/ogImage";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Fresher job on SecureCV";
export const revalidate = 3600;

function shortDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await loadJob(id);
  if (!job) {
    return renderOgCard({ eyebrow: "Fresher jobs", title: "Latest fresher jobs in India", subtitle: "Government and private openings, refreshed monthly." });
  }
  const lastDate = shortDate(job.last_date);
  const government = job.sector === "government";
  return renderOgCard({
    eyebrow: `${government ? "Government" : "Private"} job · Freshers${lastDate ? ` · Apply by ${lastDate}` : ""}`,
    title: job.title,
    subtitle: [job.organization, job.location].filter(Boolean).join(" · "),
    accent: government ? "#ea580c" : "#2563eb",
  });
}
