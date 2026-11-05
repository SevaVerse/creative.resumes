import type { Metadata } from "next";
import Link from "next/link";
import RoastMyResume from "@/components/RoastMyResume";
import JobsFaq from "@/components/jobs/JobsFaq";
import { breadcrumbJsonLd, faqJsonLd, jsonLd, type FaqItem } from "@/lib/jobs/seo";
import { ogImageMeta } from "@/lib/ogImage";
import { getBaseUrl } from "@/utils/baseUrl";

const title = "Roast My Resume — Free, Funny AI Resume Feedback";
const description =
  "Get your resume roasted by AI: a funny, honest critique plus the fixes that matter. Free, no sign-up, and your resume is not stored. Share your score with friends.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["roast my resume", "resume roast", "AI resume feedback", "resume review free", "funny resume review"],
  alternates: { canonical: "/roast-my-resume/" },
  openGraph: { title, description, url: "/roast-my-resume/", type: "website", images: ogImageMeta("/og/roast/start.png", "Roast my resume") },
  twitter: { card: "summary_large_image", title, description, images: ["/og/roast/start.png"] },
};

const FAQ: FaqItem[] = [
  { q: "Is my resume stored?", a: "No. The text is sent to our AI provider (Groq) only to write the jokes and is not saved by SecureCV. The score itself is calculated in your browser." },
  { q: "What gets shared when I share my roast?", a: "Only your score and tier (for example “62/100 — Medium rare”). Your resume text, name and contact details are never part of the shared link or image." },
  { q: "How is the score calculated?", a: "With the same transparent rules as our free ATS checker: standard sections and contact details, impact language (action verbs, numbers) and readability." },
  { q: "Will it be mean?", a: "It's playful, not personal. The AI is told to joke about the resume — vague bullets, buzzwords, missing numbers — and never about you." },
];

export default function RoastPage() {
  const baseUrl = getBaseUrl();
  const structured = [
    breadcrumbJsonLd(baseUrl, [
      { name: "Home", path: "/" },
      { name: "Roast my resume", path: "/roast-my-resume/" },
    ]),
    faqJsonLd(FAQ),
  ];
  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <main className="w-full max-w-4xl flex flex-col gap-6">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline">Home</Link> › Roast my resume
        </nav>
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Roast my resume 🔥</h1>
          <p className="text-gray-600 dark:text-gray-300">
            A funny, honest critique of your resume — then the fixes that actually matter. Free, no sign-up, nothing stored.
            Prefer it straight? Use the <Link href="/ats-checker/" className="text-blue-700 dark:text-blue-300 underline">ATS checker</Link>.
          </p>
        </header>
        <RoastMyResume />
        <JobsFaq items={FAQ} />
      </main>
    </div>
  );
}
