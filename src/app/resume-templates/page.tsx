import type { Metadata } from "next";
import Link from "next/link";
import ScaledPreview from "@/components/ScaledPreview";
import { TAG_LABELS, TEMPLATE_LIST, carbonScore } from "@/components/templates/registry";
import { SAMPLE_EXPERIENCED, SAMPLE_FRESHER } from "@/components/templates/sampleData";
import { breadcrumbJsonLd, jsonLd } from "@/lib/jobs/seo";
import { TEMPLATE_CONTENT } from "@/data/templateContent";
import { TEMPLATE_COUNT } from "@/lib/site";
import { getBaseUrl } from "@/utils/baseUrl";

const title = `${TEMPLATE_COUNT} Free Resume Templates — ATS-Friendly, Fresher & Creative (PDF)`;
const description = `Browse ${TEMPLATE_COUNT} free resume templates with live examples: ATS-friendly, fresher and creative designs. Fill one in online and download a PDF — no sign-up, no paywall at download.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/resume-templates/" },
  openGraph: { title, description, url: "/resume-templates/", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function ResumeTemplatesIndex() {
  const baseUrl = getBaseUrl();
  const structured = [
    breadcrumbJsonLd(baseUrl, [
      { name: "Home", path: "/" },
      { name: "Resume templates", path: "/resume-templates/" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      numberOfItems: TEMPLATE_LIST.length,
      itemListElement: TEMPLATE_LIST.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${t.label} resume template`,
        url: `${baseUrl}/resume-templates/${t.id}/`,
      })),
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <main className="w-full max-w-6xl flex flex-col gap-6">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline">Home</Link> › Resume templates
        </nav>
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Free resume templates</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            {TEMPLATE_COUNT} designs, each shown with a real example. Pick one, fill in your details and download a PDF —
            free, without signing up. Not sure which to choose? Use an <strong>ATS-safe</strong> template for online job
            portals and a creative one for direct emails and referrals.
          </p>
        </header>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATE_LIST.map((t) => {
            const Tpl = t.Component;
            const sample = t.tags.includes("fresher") ? SAMPLE_FRESHER : SAMPLE_EXPERIENCED;
            return (
              <li key={t.id} className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 overflow-hidden flex flex-col">
                {/* Overlay link, not a wrapper: templates contain their own <a> tags and nested anchors break hydration. */}
                <div className="relative border-b border-gray-200 dark:border-neutral-800">
                  <ScaledPreview maxHeight={320}>
                    <Tpl {...sample} />
                  </ScaledPreview>
                  <Link href={`/resume-templates/${t.id}/`} className="absolute inset-0" aria-label={`${t.label} resume template`} />
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    <Link href={`/resume-templates/${t.id}/`} className="hover:underline">{t.label}</Link>
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{TEMPLATE_CONTENT[t.id].headline}</p>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {t.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">{TAG_LABELS[tag]}</span>
                    ))}
                    <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">Carbon {carbonScore(t)}/10</span>
                  </div>
                  <div className="mt-auto pt-2 flex gap-2">
                    <Link href={`/?template=${t.id}`} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">Use this template</Link>
                    <Link href={`/resume-templates/${t.id}/`} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-700 text-sm text-gray-700 dark:text-gray-200">Details</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Already have a resume? <Link href="/ats-checker/" className="text-blue-700 dark:text-blue-300 underline">Check its ATS score for free</Link> or
          browse <Link href="/jobs/" className="text-blue-700 dark:text-blue-300 underline">fresher jobs</Link>.
        </p>
      </main>
    </div>
  );
}
