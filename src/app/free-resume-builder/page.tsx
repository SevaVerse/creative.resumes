import type { Metadata } from "next";
import Link from "next/link";
import JobsFaq from "@/components/jobs/JobsFaq";
import { breadcrumbJsonLd, faqJsonLd, jsonLd, type FaqItem } from "@/lib/jobs/seo";
import { TEMPLATE_COUNT } from "@/lib/site";
import { getBaseUrl } from "@/utils/baseUrl";

const title = "Free Resume Builder With No Paywall — Download Your PDF Free";
const description = `A genuinely free resume builder: ${TEMPLATE_COUNT} templates, PDF download without sign-up, no watermark, no trial and no card. Open source and privacy-first.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: ["free resume builder no paywall", "free resume builder no sign up", "resume builder free download", "free resume maker without watermark", "truly free resume builder"],
  alternates: { canonical: "/free-resume-builder/" },
  openGraph: { title, description, url: "/free-resume-builder/", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

// Comparison against common freemium patterns, not named products.
const ROWS: { feature: string; here: string; typical: string }[] = [
  { feature: "Download a PDF", here: "Free, no sign-up", typical: "Often requires a paid plan or trial" },
  { feature: "Watermark", here: "None", typical: "Sometimes added on free exports" },
  { feature: "Payment card", here: "Never asked", typical: "Often required to start a trial" },
  { feature: "Templates", here: `All ${TEMPLATE_COUNT} free`, typical: "Best designs often marked premium" },
  { feature: "Account", here: "Optional (only for cloud save, AI rewrite and import)", typical: "Usually required before you start" },
  { feature: "Ads and trackers", here: "None", typical: "Common" },
  { feature: "Source code", here: "Open source (MIT)", typical: "Closed" },
];

const CHECKS = [
  "Before typing anything, look for the price of downloading — not of building. “Free to create” often means “pay to download”.",
  "Check whether free downloads add a watermark or are limited to a .txt export.",
  "Read the trial terms: a low-cost trial may renew automatically into a monthly plan.",
  "Check how cancellation works before you enter a card.",
  "Look for a privacy policy that says what happens to your resume data.",
];

const FAQ: FaqItem[] = [
  { q: "Is SecureCV really free?", a: `Yes. All ${TEMPLATE_COUNT} templates, PDF download, the ATS checker, the resume roast and the fresher jobs board are free. There is no trial, no card and no watermark.` },
  { q: "Do I need to sign up to download?", a: "No. You can build and download a PDF without an account. Signing in with Google or GitHub is free and optional; it adds cloud save, AI rewrite and resume import." },
  { q: "How is it paid for?", a: "SecureCV runs on low-cost infrastructure and voluntary donations. It has no ads and does not sell data. The code is open source under the MIT licence." },
  { q: "Is there a download limit?", a: "To prevent abuse, PDF exports are rate limited (a few per minute). Normal use never hits it." },
];

export default function FreeResumeBuilderPage() {
  const baseUrl = getBaseUrl();
  const structured = [
    breadcrumbJsonLd(baseUrl, [
      { name: "Home", path: "/" },
      { name: "Free resume builder", path: "/free-resume-builder/" },
    ]),
    faqJsonLd(FAQ),
  ];
  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <main className="w-full max-w-4xl flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline">Home</Link> › Free resume builder
        </nav>
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">A free resume builder with no paywall</h1>
          <p className="text-lg text-gray-700 dark:text-gray-200">
            Many “free” resume builders let you spend half an hour writing, then ask you to pay when you click Download.
            SecureCV doesn&apos;t: build your resume, download the PDF, done. No sign-up, no card, no watermark.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">Build my resume — free →</Link>
            <Link href="/resume-templates/" className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-gray-200 font-semibold">See all {TEMPLATE_COUNT} templates</Link>
          </div>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">SecureCV vs a typical freemium resume builder</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-900 text-left text-gray-700 dark:text-gray-300">
                <tr>
                  <th scope="col" className="p-3">&nbsp;</th>
                  <th scope="col" className="p-3">SecureCV</th>
                  <th scope="col" className="p-3">Typical freemium builder</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.feature} className="border-t border-gray-200 dark:border-neutral-800">
                    <th scope="row" className="p-3 text-left font-semibold text-gray-900 dark:text-white">{r.feature}</th>
                    <td className="p-3 text-green-700 dark:text-green-400">✓ {r.here}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{r.typical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">“Typical” describes common freemium patterns, not any specific product. Always check a tool&apos;s current pricing page.</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">How to spot a download paywall before you start</h2>
          <ol className="list-decimal pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            {CHECKS.map((c) => <li key={c}>{c}</li>)}
          </ol>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/ats-checker/" className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-blue-500">
            <h2 className="font-bold text-gray-900 dark:text-white">Free ATS checker</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Score your resume against a job description.</p>
          </Link>
          <Link href="/resume-format/" className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-blue-500">
            <h2 className="font-bold text-gray-900 dark:text-white">Resume formats</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Freshers, engineering, B.Com, govt jobs and more.</p>
          </Link>
          <Link href="/privacy/" className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-blue-500">
            <h2 className="font-bold text-gray-900 dark:text-white">Privacy</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Exactly what data leaves your browser, and when.</p>
          </Link>
        </section>

        <JobsFaq items={FAQ} />
      </main>
    </div>
  );
}
