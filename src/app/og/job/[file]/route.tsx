import { loadJob } from "@/lib/jobs/load";
import { renderOgCard } from "@/lib/ogImage";

// Served at /og/job/<id>.png (the extension avoids the trailing-slash redirect).

function shortDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const id = (await params).file.replace(/\.png$/, "");
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
