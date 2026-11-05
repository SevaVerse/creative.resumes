import type { Metadata } from "next";
import Link from "next/link";
import AtsChecker from "@/components/AtsChecker";
import JobsFaq from "@/components/jobs/JobsFaq";
import { breadcrumbJsonLd, faqJsonLd, jsonLd, type FaqItem } from "@/lib/jobs/seo";
import { getBaseUrl } from "@/utils/baseUrl";
import { ogImageMeta } from "@/lib/ogImage";

const title = "Free ATS Resume Checker — Score & Job Description Keyword Match";
const description =
  "Check your resume's ATS score for free. Paste your resume and a job description to see missing keywords, section gaps and weak bullets. Runs in your browser — no sign-up, nothing uploaded.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["ATS checker", "ATS resume checker", "ATS score", "resume keyword match", "resume scanner", "free ATS checker", "job description keyword match"],
  alternates: { canonical: "/ats-checker/" },
  openGraph: { title, description, url: "/ats-checker/", type: "website", images: ogImageMeta("/og/ats.png", "Free ATS resume checker") },
  twitter: { card: "summary_large_image", title, description, images: ["/og/ats.png"] },
};

const FAQ: FaqItem[] = [
  { q: "What is an ATS?", a: "An applicant tracking system is software companies use to collect and filter applications. It reads your resume as text, looks for standard sections and matches keywords from the job description before a recruiter sees it." },
  { q: "How is the score calculated?", a: "Four checks: keyword match against the job description (35%), standard sections and contact details (25%), impact language such as action verbs and numbers (25%), and readability such as length and parser-unfriendly symbols (15%). Without a job description the other three are re-weighted." },
  { q: "Is my resume uploaded?", a: "No. The checker runs entirely in your browser. Your text is never sent to a server or stored." },
  { q: "Is this the same as a real ATS?", a: "No tool can reproduce every vendor's ATS. This is a transparent, rule-based estimate of the things most ATS software and recruiters look for. Use it to find gaps, not as a guarantee." },
  { q: "What is a good ATS score?", a: "Aim for 75 or more, with most high-priority keywords matched. Only add keywords for skills you actually have — interviews will test them." },
];

export default function AtsCheckerPage() {
  const baseUrl = getBaseUrl();
  const structured = [
    breadcrumbJsonLd(baseUrl, [
      { name: "Home", path: "/" },
      { name: "ATS resume checker", path: "/ats-checker/" },
    ]),
    faqJsonLd(FAQ),
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "SecureCV ATS Resume Checker",
      url: `${baseUrl}/ats-checker/`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      description,
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <main className="w-full max-w-6xl flex flex-col gap-6">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline">Home</Link> › ATS resume checker
        </nav>
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Free ATS resume checker</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            See how applicant tracking systems read your resume. Get a score, the job-description keywords you are
            missing, and specific fixes — in seconds, with nothing uploaded.
          </p>
          <p className="text-sm">
            <Link href="/" className="text-blue-700 dark:text-blue-300 underline">Starting from scratch? Build an ATS-friendly resume instead →</Link>
          </p>
        </header>

        <AtsChecker />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">How to beat ATS filters</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Use standard headings: Summary, Experience, Education, Skills, Projects.</li>
              <li>Use the job ad&apos;s exact wording for skills you have (e.g. “REST APIs”, not just “APIs”).</li>
              <li>Keep it one column without text in images, icons or tables.</li>
              <li>Start bullets with an action verb and include a number.</li>
              <li>Export a text-based PDF, not a scanned image.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">ATS-safe templates</h2>
            <p className="mt-2">These templates use structures ATS software parses cleanly:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><Link href="/resume-templates/atsclassic/" className="text-blue-700 dark:text-blue-300 underline">ATS Classic</Link> — plain and parser-safe</li>
              <li><Link href="/resume-templates/campus/" className="text-blue-700 dark:text-blue-300 underline">Campus</Link> — for freshers</li>
              <li><Link href="/resume-templates/developer/" className="text-blue-700 dark:text-blue-300 underline">Developer</Link> — for software roles</li>
              <li><Link href="/resume-templates/executive/" className="text-blue-700 dark:text-blue-300 underline">Executive</Link> — for senior roles</li>
            </ul>
          </div>
        </section>

        <JobsFaq items={FAQ} />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Looking for openings? Browse <Link href="/jobs/" className="text-blue-700 dark:text-blue-300 underline">fresher jobs this month</Link>.
        </p>
      </main>
    </div>
  );
}
