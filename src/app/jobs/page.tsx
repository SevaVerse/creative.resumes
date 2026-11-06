import type { Metadata } from "next";
import Link from "next/link";
import JobsBoard from "@/components/jobs/JobsBoard";
import JobCategoryNav from "@/components/jobs/JobCategoryNav";
import JobsFaq from "@/components/jobs/JobsFaq";
import OfficialPortals from "@/components/jobs/OfficialPortals";
import JobAlertsCta from "@/components/jobs/JobAlertsCta";
import { loadJobsData } from "@/lib/jobs/load";
import {
  JOB_CATEGORIES,
  breadcrumbJsonLd,
  faqJsonLd,
  itemListJsonLd,
  jsonLd,
  monthYear,
  type FaqItem,
} from "@/lib/jobs/seo";
import { getBaseUrl } from "@/utils/baseUrl";

// Listings are refreshed monthly by /api/cron/jobs; the page itself is cached for an hour.
export const revalidate = 3600;

const JOBS_FAQ: FaqItem[] = [
  { q: "What are fresher jobs?", a: "Jobs open to candidates with little or no work experience (0–1 years): internships, apprenticeships, trainee programmes, entry-level private roles and government vacancies filled through exams." },
  { q: "How often is this fresher jobs list updated?", a: "Every month. New listings are marked “New”, and listings whose last date has passed are removed automatically." },
  { q: "Is it free to apply?", a: "Yes. SecureCV never charges for jobs, and every listing links to the original posting — the employer's careers page, the recruiting body's official notice, or the job board it was listed on. Never pay an agent to get a job." },
  { q: "How do I make a resume as a fresher?", a: "Lead with education, then projects, internships and skills. SecureCV's free Campus template is designed for freshers and exports an ATS-friendly PDF." },
];

export async function generateMetadata(): Promise<Metadata> {
  const { jobs, lastRun } = await loadJobsData();
  const when = monthYear(lastRun ? new Date(lastRun) : new Date());
  const count = jobs.length > 0 ? `${jobs.length}+ ` : "";
  const description = `${count}latest fresher jobs in India for ${when}: entry-level private jobs, internships, apprenticeships and government vacancies for freshers. Updated monthly — free, no sign-up.`;
  return {
    title: { absolute: `Fresher Jobs ${when} — Latest Entry-Level, Govt & Private Jobs in India | SecureCV` },
    description,
    keywords: [
      "fresher jobs", "jobs for freshers", "fresher jobs this month", `fresher jobs ${when}`, "entry level jobs India",
      "government jobs for freshers", "private jobs for freshers", "internships for freshers", "apprenticeship", "graduate trainee jobs",
    ],
    alternates: { canonical: "/jobs/", types: { "application/rss+xml": "/jobs/feed.xml" } },
    openGraph: {
      title: `Fresher Jobs ${when} | SecureCV`,
      description,
      url: "/jobs/",
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Fresher jobs this month on SecureCV" }],
    },
    twitter: { card: "summary_large_image", title: `Fresher Jobs ${when} | SecureCV`, description, images: ["/og-image.png"] },
  };
}

export default async function JobsPage() {
  const { jobs, lastRun } = await loadJobsData();
  const generatedAt = new Date().toISOString();
  const baseUrl = getBaseUrl();
  const counts = Object.fromEntries(JOB_CATEGORIES.map((c) => [c.slug, jobs.filter(c.match).length]));

  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Fresher Jobs This Month",
      url: `${baseUrl}/jobs/`,
      description: "Monthly list of entry-level government and private jobs for freshers in India.",
      ...(lastRun ? { dateModified: lastRun } : {}),
      isPartOf: { "@type": "WebSite", name: "SecureCV", url: baseUrl },
    },
    itemListJsonLd(baseUrl, jobs),
    faqJsonLd(JOBS_FAQ),
    breadcrumbJsonLd(baseUrl, [
      { name: "Home", path: "/" },
      { name: "Fresher Jobs", path: "/jobs/" },
    ]),
  ];

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <main className="w-full max-w-6xl flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">{monthYear(lastRun ? new Date(lastRun) : new Date())}</p>
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

        <JobAlertsCta />

        <JobCategoryNav counts={counts} />

        <JobsBoard jobs={jobs} generatedAt={generatedAt} />

        <OfficialPortals />

        <JobsFaq items={JOBS_FAQ} />

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Listings link to third-party sites. SecureCV does not verify employers — never pay to apply for a job, and report
          suspicious listings to the official portal. Beware of fraud.
        </p>
      </main>
    </div>
  );
}
