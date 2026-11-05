import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadJob } from "@/lib/jobs/load";
import {
  JOB_CATEGORIES,
  breadcrumbJsonLd,
  jobDescription,
  jobDetailPath,
  jobPostingJsonLd,
  jobValidThrough,
  jsonLd,
} from "@/lib/jobs/seo";
import { getBaseUrl } from "@/utils/baseUrl";

// Rendered on first request and cached; the monthly cron revalidates /jobs/*.
export const revalidate = 3600;

type Params = { id: string };

// No pages at build time; each listing is generated on first visit, then cached (ISR).
export function generateStaticParams(): Params[] {
  return [];
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const job = await loadJob(id);
  if (!job) return { title: "Job not found", robots: { index: false, follow: true } };
  const where = job.location ? ` in ${job.location}` : "";
  const title = `${job.title} at ${job.organization}${where} — Fresher Job`;
  const description = jobDescription(job).slice(0, 300);
  const path = jobDetailPath(job.id);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
    // Drop expired listings from search results promptly.
    robots: { index: true, follow: true, unavailable_after: new Date(jobValidThrough(job)).toUTCString() },
  };
}

export default async function JobListingPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const job = await loadJob(id);
  if (!job) notFound();

  const baseUrl = getBaseUrl();
  const related = JOB_CATEGORIES.filter((c) => c.match(job)).slice(0, 4);
  const structured = [
    jobPostingJsonLd(job, baseUrl),
    breadcrumbJsonLd(baseUrl, [
      { name: "Home", path: "/" },
      { name: "Fresher Jobs", path: "/jobs/" },
      ...(related[0] ? [{ name: related[0].label, path: `/jobs/${related[0].slug}/` }] : []),
      { name: job.title, path: jobDetailPath(job.id) },
    ]),
  ];
  const posted = formatDate(job.posted_at ?? job.first_seen_at);
  const lastDate = formatDate(job.last_date);

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <main className="w-full max-w-3xl flex flex-col gap-6">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline">Home</Link> › <Link href="/jobs/" className="hover:underline">Fresher Jobs</Link>
          {related[0] && (
            <> › <Link href={`/jobs/${related[0].slug}/`} className="hover:underline">{related[0].label}</Link></>
          )}
        </nav>

        <header className="flex flex-col gap-2">
          <span className={`self-start px-2 py-0.5 rounded-full text-xs font-semibold ${
            job.sector === "government"
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
          }`}>
            {job.sector === "government" ? "Government job" : "Private job"}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">{job.organization}</p>
        </header>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {job.location && (<div><dt className="text-gray-500 dark:text-gray-400">Location</dt><dd className="font-medium text-gray-900 dark:text-white">{job.location}</dd></div>)}
          {job.employment_type && (<div><dt className="text-gray-500 dark:text-gray-400">Type</dt><dd className="font-medium text-gray-900 dark:text-white">{job.employment_type}</dd></div>)}
          {posted && (<div><dt className="text-gray-500 dark:text-gray-400">Posted</dt><dd className="font-medium text-gray-900 dark:text-white">{posted}</dd></div>)}
          {lastDate && (<div><dt className="text-gray-500 dark:text-gray-400">Last date to apply</dt><dd className="font-semibold text-red-700 dark:text-red-300">{lastDate}</dd></div>)}
          <div><dt className="text-gray-500 dark:text-gray-400">Experience</dt><dd className="font-medium text-gray-900 dark:text-white">Freshers / entry level</dd></div>
        </dl>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">About this opening</h2>
          <p className="text-gray-700 dark:text-gray-300">{jobDescription(job)}</p>
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">{t}</span>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <a href={job.url} target="_blank" rel="nofollow noopener noreferrer" className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            View &amp; apply on official site ↗
          </a>
          <Link href="/?template=campus" className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold">
            Make a fresher resume for this job (free) →
          </Link>
        </div>
        <p className="text-[11px] text-gray-400">Source: {job.source}</p>

        {related.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">More fresher jobs like this</h2>
            <ul className="flex flex-wrap gap-2">
              {related.map((c) => (
                <li key={c.slug}>
                  <Link href={`/jobs/${c.slug}/`} className="inline-block px-3 py-1 rounded-full text-xs border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-teal-500">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          SecureCV does not verify employers — never pay to apply for a job, and confirm every detail in the official
          notification before applying.
        </p>
      </main>
    </div>
  );
}
