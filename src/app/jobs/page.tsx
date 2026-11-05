import type { Metadata } from "next";
import Link from "next/link";
import JobsBoard from "@/components/jobs/JobsBoard";
import { getLastJobRun, listActiveJobs } from "@/lib/db/jobs";
import { OFFICIAL_PORTALS } from "@/data/jobs/officialPortals";
import type { JobRow } from "@/types/database";
import { getBaseUrl } from "@/utils/baseUrl";
import { logger } from "@/utils/logger";

// Listings are refreshed monthly by /api/cron/jobs; the page itself is cached for an hour.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fresher Jobs This Month — Entry-Level Government & Private Jobs in India",
  description:
    "A monthly, free list of entry-level jobs, internships, apprenticeships and government vacancies for freshers in India. No sign-up, no tracking.",
  alternates: { canonical: "/jobs", types: { "application/rss+xml": "/jobs/feed.xml" } },
  openGraph: {
    title: "Fresher Jobs This Month | SecureCV",
    description: "Entry-level government and private openings for freshers, refreshed every month.",
    url: "/jobs",
    type: "website",
  },
};

async function loadData(): Promise<{ jobs: JobRow[]; lastRun: string | null }> {
  try {
    const [jobs, run] = await Promise.all([listActiveJobs({ limit: 600 }), getLastJobRun()]);
    return { jobs, lastRun: run?.finished_at ?? null };
  } catch (error) {
    logger.warn("jobs.page_load_failed", { error: (error as Error).message });
    return { jobs: [], lastRun: null };
  }
}

function monthOf(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}

export default async function JobsPage() {
  const { jobs, lastRun } = await loadData();
  const generatedAt = new Date().toISOString();
  const baseUrl = getBaseUrl();

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Fresher Jobs This Month",
            url: `${baseUrl}/jobs`,
            description: "Monthly list of entry-level government and private jobs for freshers in India.",
            isPartOf: { "@type": "WebSite", name: "SecureCV", url: baseUrl },
          }),
        }}
      />
      <main className="w-full max-w-6xl flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">{monthOf(lastRun)}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Fresher jobs this month</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            Entry-level openings, internships, apprenticeships and government vacancies for freshers in India — collected
            from public job APIs and official feeds and refreshed every month. Always verify details and apply on the
            official website; SecureCV never charges for jobs.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/?template=campus" className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              Build a fresher resume (free) →
            </Link>
            <a href="/jobs/feed.xml" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
              RSS feed
            </a>
            {lastRun && (
              <span className="self-center text-xs text-gray-500 dark:text-gray-400">
                Last refreshed {new Date(lastRun).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST
              </span>
            )}
          </div>
        </header>

        <JobsBoard jobs={jobs} generatedAt={generatedAt} />

        <section className="p-6 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/60 dark:bg-orange-950/20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Official government job portals</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Government vacancies are always announced first on these official sites. Bookmark them.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {OFFICIAL_PORTALS.map((p) => (
              <li key={p.url}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-orange-100 dark:border-neutral-800 hover:border-orange-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{p.name} ↗</span>
                  <span className="block text-xs text-gray-600 dark:text-gray-400">{p.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Listings link to third-party sites. SecureCV does not verify employers — never pay to apply for a job, and report
          suspicious listings to the official portal. Beware of fraud.
        </p>
      </main>
    </div>
  );
}
