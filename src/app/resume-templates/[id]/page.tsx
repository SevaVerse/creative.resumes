import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ScaledPreview from "@/components/ScaledPreview";
import ShareButtons from "@/components/ShareButtons";
import JobsFaq from "@/components/jobs/JobsFaq";
import { TAG_LABELS, TEMPLATES, TEMPLATE_LIST, carbonScore } from "@/components/templates/registry";
import { SAMPLE_EXPERIENCED, SAMPLE_FRESHER } from "@/components/templates/sampleData";
import { TEMPLATE_CONTENT } from "@/data/templateContent";
import { breadcrumbJsonLd, faqJsonLd, jsonLd } from "@/lib/jobs/seo";
import { isTemplateId } from "@/types/resume";
import { getBaseUrl } from "@/utils/baseUrl";
import { ogImageMeta } from "@/lib/ogImage";

type Params = { id: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return TEMPLATE_LIST.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  if (!isTemplateId(id)) return {};
  const meta = TEMPLATES[id];
  const content = TEMPLATE_CONTENT[id];
  const angle = meta.tags.includes("fresher") ? "For Freshers" : meta.tags.includes("ats") ? "ATS-Friendly" : "Creative Design";
  const title = `Free ${meta.label} Resume Template (PDF) — ${angle}`;
  const description = `${content.intro.split(". ")[0]}. Free to use online with a live preview and PDF download — no sign-up, no paywall.`;
  const path = `/resume-templates/${id}/`;
  return {
    title,
    description: description.slice(0, 300),
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", images: ogImageMeta(`/og/template/${id}.png`, `${meta.label} resume template`) },
    twitter: { card: "summary_large_image", title, description, images: [`/og/template/${id}.png`] },
  };
}

export default async function TemplatePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  if (!isTemplateId(id)) notFound();
  const meta = TEMPLATES[id];
  const content = TEMPLATE_CONTENT[id];
  const Tpl = meta.Component;
  const sample = meta.tags.includes("fresher") ? SAMPLE_FRESHER : SAMPLE_EXPERIENCED;
  const baseUrl = getBaseUrl();
  const path = `/resume-templates/${id}/`;

  // Related: templates sharing a tag first, then the rest, so every page links to others.
  const related = [
    ...TEMPLATE_LIST.filter((t) => t.id !== id && t.tags.some((tag) => meta.tags.includes(tag))),
    ...TEMPLATE_LIST.filter((t) => t.id !== id && !t.tags.some((tag) => meta.tags.includes(tag))),
  ].slice(0, 4);

  const structured = [
    breadcrumbJsonLd(baseUrl, [
      { name: "Home", path: "/" },
      { name: "Resume templates", path: "/resume-templates/" },
      { name: meta.label, path },
    ]),
    faqJsonLd(content.faq),
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: `${meta.label} resume template`,
      description: meta.description,
      url: `${baseUrl}${path}`,
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT",
      publisher: { "@type": "Organization", name: "SecureCV", url: baseUrl },
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <main className="w-full max-w-6xl flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline">Home</Link> › <Link href="/resume-templates/" className="hover:underline">Resume templates</Link> › {meta.label}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{meta.label} resume template</h1>
            <p className="text-lg text-gray-700 dark:text-gray-200">{content.headline}</p>
            <p className="text-gray-600 dark:text-gray-300">{content.intro}</p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {meta.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">{TAG_LABELS[tag]}</span>
              ))}
              <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200">Carbon score {carbonScore(meta)}/10</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/?template=${id}`} className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Use {meta.label} — free →
              </Link>
              <Link href="/ats-checker/" className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-gray-200 font-semibold">
                Check my ATS score
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">No sign-up and no paywall at download. Your draft stays in your browser.</p>

            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Best for</h2>
              <ul className="mt-2 list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                {content.bestFor.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">What you get</h2>
              <ul className="mt-2 list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                {content.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </section>
            <section className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">Tip</h2>
              <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">{content.tip}</p>
            </section>
            <ShareButtons url={path} text={`Free ${meta.label} resume template — no sign-up, no paywall:`} label="Share this template" />
          </div>

          <figure className="lg:col-span-3 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white">
            <ScaledPreview>
              <Tpl {...sample} />
            </ScaledPreview>
            <figcaption className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">Example resume using the {meta.label} template (sample data).</figcaption>
          </figure>
        </div>

        <JobsFaq items={content.faq} />

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Similar templates</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {related.map((t) => (
              <li key={t.id}>
                <Link href={`/resume-templates/${t.id}/`} className="block p-4 rounded-lg border border-gray-200 dark:border-neutral-800 hover:border-blue-500 h-full">
                  <span className="font-semibold text-gray-900 dark:text-white">{t.label}</span>
                  <span className="block mt-1 text-xs text-gray-600 dark:text-gray-400">{t.description}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <Link href="/resume-templates/" className="text-blue-700 dark:text-blue-300 underline">See all templates</Link> ·{" "}
            <Link href="/jobs/" className="text-blue-700 dark:text-blue-300 underline">Fresher jobs this month</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
