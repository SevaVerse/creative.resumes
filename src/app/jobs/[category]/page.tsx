import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JobsBoard from "@/components/jobs/JobsBoard";
import JobCategoryNav from "@/components/jobs/JobCategoryNav";
import JobsFaq from "@/components/jobs/JobsFaq";
import OfficialPortals from "@/components/jobs/OfficialPortals";
import { loadJobsData } from "@/lib/jobs/load";
import {
  JOB_CATEGORIES,
  breadcrumbJsonLd,
  faqJsonLd,
  getJobCategory,
  itemListJsonLd,
  jsonLd,
  monthYear,
} from "@/lib/jobs/seo";
import { getBaseUrl } from "@/utils/baseUrl";

export const revalidate = 3600;
// Only the configured categories exist; anything else is a 404.
export const dynamicParams = false;

type Params = { category: string };

export function generateStaticParams(): Params[] {
  return JOB_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getJobCategory(slug);
  if (!category) return {};
  const { jobs, lastRun } = await loadJobsData();
  const count = jobs.filter(category.match).length;
  const when = monthYear(lastRun ? new Date(lastRun) : new Date());
  const path = `/jobs/${category.slug}/`;
  const description = count > 0 ? `${count} openings · ${category.description}` : category.description;
  return {
    title: `${category.title} (${when})`,
    description,
    keywords: category.keywords,
    alternates: { canonical: path },
    // An empty listing page is thin content: keep it out of the index until jobs appear.
    robots: count > 0 ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${category.title} (${when}) | SecureCV`,
      description,
      url: path,
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: category.h1 }],
    },
    twitter: { card: "summary_large_image", title: `${category.h1} (${when})`, description, images: ["/og-image.png"] },
  };
}

export default async function JobCategoryPage({ params }: { params: Promise<Params> }) {
  const { category: slug } = await params;
  const category = getJobCategory(slug);
  if (!category) notFound();

  const { jobs: allJobs, lastRun } = await loadJobsData();
  const jobs = allJobs.filter(category.match);
  const counts = Object.fromEntries(JOB_CATEGORIES.map((c) => [c.slug, allJobs.filter(c.match).length]));
  const baseUrl = getBaseUrl();
  const path = `/jobs/${category.slug}/`;
  const when = monthYear(lastRun ? new Date(lastRun) : new Date());

  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.h1,
      url: `${baseUrl}${path}`,
      description: category.description,
      ...(lastRun ? { dateModified: lastRun } : {}),
      isPartOf: { "@type": "WebSite", name: "SecureCV", url: baseUrl },
    },
    itemListJsonLd(baseUrl, jobs),
    breadcrumbJsonLd(baseUrl, [
      { name: "Home", path: "/" },
      { name: "Fresher Jobs", path: "/jobs/" },
      { name: category.label, path },
    ]),
    ...(category.faq.length > 0 ? [faqJsonLd(category.faq)] : []),
  ];

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <main className="w-full max-w-6xl flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:underline">Home</Link> ›{" "}
            <Link href="/jobs/" className="hover:underline">Fresher Jobs</Link> › <span>{category.label}</span>
          </nav>
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Updated {when}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{category.h1}</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">{category.intro}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/?template=campus" className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              Build a fresher resume (free) →
            </Link>
            <Link href="/jobs/" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800">
              All fresher jobs
            </Link>
          </div>
        </header>

        <JobCategoryNav current={category.slug} counts={counts} />

        <JobsBoard jobs={jobs} generatedAt={new Date().toISOString()} />

        <OfficialPortals />

        <JobsFaq items={category.faq} />

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Listings link to third-party sites. SecureCV does not verify employers — never pay to apply for a job, and report
          suspicious listings to the official portal. Beware of fraud.
        </p>
      </main>
    </div>
  );
}
