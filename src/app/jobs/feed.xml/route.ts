import { listActiveJobs } from "@/lib/db/jobs";
import { getBaseUrl } from "@/utils/baseUrl";
import { jobDetailPath } from "@/lib/jobs/seo";

export const revalidate = 3600;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** RSS 2.0 feed of the latest fresher jobs (for readers, Telegram/WhatsApp channel bots, etc.). */
export async function GET() {
  const baseUrl = getBaseUrl();
  const jobs = await listActiveJobs({ limit: 100 }).catch(() => []);
  const items = jobs
    .map((j) => {
      const desc = [j.organization, j.location, j.sector === "government" ? "Government" : "Private", j.last_date ? `Last date: ${j.last_date.slice(0, 10)}` : null]
        .filter(Boolean)
        .join(" · ");
      return `<item>
  <title>${esc(`${j.title} — ${j.organization}`)}</title>
  <link>${esc(`${baseUrl}${jobDetailPath(j.id)}`)}</link>
  <guid isPermaLink="false">${esc(j.id)}</guid>
  <pubDate>${new Date(j.first_seen_at).toUTCString()}</pubDate>
  <category>${j.sector}</category>
  <description>${esc(desc + (j.summary ? ` — ${j.summary}` : ""))}</description>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>SecureCV — Fresher Jobs This Week</title>
  <link>${esc(`${baseUrl}/jobs/`)}</link>
  <description>Entry-level government and private jobs for freshers in India, refreshed weekly.</description>
  <language>en-IN</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600" },
  });
}
