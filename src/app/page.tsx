import Link from "next/link";
import HomeBuilder from "@/components/HomeBuilder";
import JobsFaq from "@/components/jobs/JobsFaq";
import { TEMPLATE_LIST } from "@/components/templates/registry";
import { faqJsonLd, jsonLd, type FaqItem } from "@/lib/jobs/seo";
import { TEMPLATE_COUNT } from "@/lib/site";

// Visible FAQ mirrored by the FAQPage JSON-LD below (homepage only, not every page).
const HOME_FAQ: FaqItem[] = [
  {
    q: "Is SecureCV really free?",
    a: `Yes. All ${TEMPLATE_COUNT} templates, AI rewrite, the ATS checker, PDF export and the fresher jobs board are free. There is no trial and no paywall when you download your PDF.`,
  },
  {
    q: "Do I need to sign up?",
    a: "No. You can build, preview and download a resume without an account. Signing in with Google or GitHub is optional and only adds cloud save across devices.",
  },
  {
    q: "Do you store my resume data?",
    a: "Drafts stay in your browser by default. If you sign in you can choose to save resumes to your account. PDF rendering is transient and nothing is kept without your consent.",
  },
  {
    q: "Are the templates ATS-friendly?",
    a: "ATS Classic, Campus, Nordic, Developer, Executive and Minimalist use simple single-column structures and standard headings that applicant tracking systems parse cleanly. You can check any resume with the free ATS checker.",
  },
  {
    q: "Can I import my existing resume?",
    a: "Yes. Upload a PDF or DOCX — including the PDF LinkedIn exports from your profile — and SecureCV fills in your details automatically.",
  },
  {
    q: "What is the carbon score?",
    a: "Each template gets a score based on ink coverage, colour and print area. A higher score means less ink and energy when printed.",
  },
];

export default function HomePage() {
  const landing = (
    <section className="z-10 w-full max-w-6xl flex flex-col gap-8 mt-6" aria-label="About SecureCV">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(HOME_FAQ)) }} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/ats-checker/" className="p-5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 hover:border-blue-500">
          <h2 className="font-bold text-gray-900 dark:text-white">🎯 Free ATS resume checker</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Paste your resume and a job description to see your score and the keywords you are missing. Runs in your browser.</p>
        </Link>
        <Link href="/resume-templates/" className="p-5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 hover:border-blue-500">
          <h2 className="font-bold text-gray-900 dark:text-white">🎨 {TEMPLATE_COUNT} free resume templates</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">See every template filled with a real example, with ATS and fresher-friendly picks marked.</p>
        </Link>
        <Link href="/jobs/" className="p-5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 hover:border-blue-500">
          <h2 className="font-bold text-gray-900 dark:text-white">💼 Fresher jobs in India</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Entry-level government and private openings, refreshed every month. Share them on WhatsApp in one tap.</p>
        </Link>
      </div>
      <nav aria-label="Resume templates" className="flex flex-wrap gap-2 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Templates:</span>
        {TEMPLATE_LIST.map((t) => (
          <Link key={t.id} href={`/resume-templates/${t.id}/`} className="text-blue-700 dark:text-blue-300 hover:underline">
            {t.label}
          </Link>
        ))}
      </nav>
      <JobsFaq items={HOME_FAQ} />
    </section>
  );
  return <HomeBuilder landingContent={landing} />;
}
