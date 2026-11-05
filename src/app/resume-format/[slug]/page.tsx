import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ScaledPreview from "@/components/ScaledPreview";
import ShareButtons from "@/components/ShareButtons";
import JobsFaq from "@/components/jobs/JobsFaq";
import { TEMPLATES } from "@/components/templates/registry";
import { SAMPLE_EXPERIENCED, SAMPLE_FRESHER } from "@/components/templates/sampleData";
import { RESUME_FORMATS, getResumeFormat } from "@/data/resumeFormats";
import { breadcrumbJsonLd, faqJsonLd, jsonLd } from "@/lib/jobs/seo";
import { ogImageMeta } from "@/lib/ogImage";
import { getBaseUrl } from "@/utils/baseUrl";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return RESUME_FORMATS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const f = getResumeFormat((await params).slug);
  if (!f) return {};
  const path = `/resume-format/${f.slug}/`;
  const image = `/og/format/${f.slug}.png`;
  return {
    title: f.title,
    description: f.description,
    keywords: f.keywords,
    alternates: { canonical: path },
    openGraph: { title: f.title, description: f.description, url: path, type: "article", images: ogImageMeta(image, f.h1) },
    twitter: { card: "summary_large_image", title: f.title, description: f.description, images: [image] },
  };
}

export default async function ResumeFormatPage({ params }: { params: Promise<Params> }) {
  const f = getResumeFormat((await params).slug);
  if (!f) notFound();
  const tpl = TEMPLATES[f.template];
  const Tpl = tpl.Component;
  const sample = tpl.tags.includes("fresher") ? SAMPLE_FRESHER : SAMPLE_EXPERIENCED;
  const baseUrl = getBaseUrl();
  const path = `/resume-format/${f.slug}/`;
  const others = RESUME_FORMATS.filter((o) => o.slug !== f.slug);
  const structured = [
    breadcrumbJsonLd(baseUrl, [
      { name: "Home", path: "/" },
      { name: "Resume formats", path: "/resume-format/" },
      { name: f.h1, path },
    ]),
    faqJsonLd(f.faq),
  ];

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <main className="w-full max-w-5xl flex flex-col gap-8">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:underline">Home</Link> › <Link href="/resume-format/" className="hover:underline">Resume formats</Link> › {f.h1}
        </nav>
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{f.h1}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-200 max-w-3xl">{f.intro}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/?template=${f.template}`} className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              Start with the {tpl.label} template — free →
            </Link>
            <Link href="/ats-checker/" className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-gray-200 font-semibold">
              Check an existing resume
            </Link>
          </div>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Section order and what to write</h2>
          <ol className="flex flex-col gap-3">
            {f.sections.map((s, i) => (
              <li key={s.name} className="flex gap-3 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70">
                <span className="shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{s.name}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{s.what}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sample</h2>
          <pre className="whitespace-pre-wrap break-words p-4 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-sm text-gray-800 dark:text-gray-200 font-mono">{f.sample}</pre>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Common mistakes</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            {f.mistakes.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-2 flex flex-col gap-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recommended template: {tpl.label}</h2>
            <p className="text-gray-700 dark:text-gray-300">{tpl.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/?template=${f.template}`} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">Use this template</Link>
              <Link href={`/resume-templates/${f.template}/`} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-gray-200">About {tpl.label}</Link>
            </div>
            <ShareButtons url={path} text={`${f.h1} — free guide with sample and template:`} label="Share this guide" />
          </div>
          <figure className="md:col-span-3 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden bg-white">
            <ScaledPreview maxHeight={520}>
              <Tpl {...sample} />
            </ScaledPreview>
            <figcaption className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">Example using the {tpl.label} template (sample data).</figcaption>
          </figure>
        </section>

        <JobsFaq items={f.faq} />

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">More resume formats</h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/resume-format/${o.slug}/`} className="inline-block px-3 py-1 rounded-full text-xs border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-blue-500">{o.h1}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
