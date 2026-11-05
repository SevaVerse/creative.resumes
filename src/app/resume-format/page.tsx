import type { Metadata } from "next";
import Link from "next/link";
import { RESUME_FORMATS } from "@/data/resumeFormats";
import { breadcrumbJsonLd, jsonLd } from "@/lib/jobs/seo";
import { getBaseUrl } from "@/utils/baseUrl";

const title = "Resume Formats for Indian Job Seekers — Freshers, Engineering, B.Com, Govt Jobs";
const description =
  "Free resume format guides for India: freshers, B.Tech/B.E., B.Com, government jobs, biodata and internships — section order, samples, mistakes to avoid and free templates.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/resume-format/" },
  openGraph: { title, description, url: "/resume-format/", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function ResumeFormatsIndex() {
  const baseUrl = getBaseUrl();
  const structured = breadcrumbJsonLd(baseUrl, [
    { name: "Home", path: "/" },
    { name: "Resume formats", path: "/resume-format/" },
  ]);
  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <main className="w-full max-w-5xl flex flex-col gap-6">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline">Home</Link> › Resume formats
        </nav>
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Resume formats for Indian job seekers</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            What to include, in what order, for the job you are applying to — with a sample and a free template for each.
          </p>
        </header>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESUME_FORMATS.map((f) => (
            <li key={f.slug}>
              <Link href={`/resume-format/${f.slug}/`} className="block h-full p-5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 hover:border-blue-500">
                <h2 className="font-bold text-gray-900 dark:text-white">{f.h1}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{f.description}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Ready to write? <Link href="/" className="text-blue-700 dark:text-blue-300 underline">Open the free builder</Link>, browse{" "}
          <Link href="/resume-templates/" className="text-blue-700 dark:text-blue-300 underline">templates</Link>, or find{" "}
          <Link href="/jobs/" className="text-blue-700 dark:text-blue-300 underline">fresher jobs</Link>.
        </p>
      </main>
    </div>
  );
}
