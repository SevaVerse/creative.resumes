import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ogImageMeta } from "@/lib/ogImage";
import { roastTier } from "@/lib/roast/quips";

// Public, content-free landing page for a shared roast: it only knows the score.
type Params = { score: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return Array.from({ length: 101 }, (_, i) => ({ score: String(i) }));
}

function parse(score: string): number | null {
  const n = Number(score);
  return Number.isInteger(n) && n >= 0 && n <= 100 ? n : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const n = parse((await params).score);
  if (n === null) return {};
  const tier = roastTier(n);
  const title = `A resume just got roasted: ${n}/100 — ${tier.label} ${tier.emoji}`;
  const description = "Think yours would do better? Get a free, funny AI roast of your resume plus the fixes that matter. No sign-up.";
  const image = `/og/roast/${n}.png`;
  return {
    title: { absolute: title },
    description,
    // 101 near-identical pages: keep them out of search, but let crawlers follow the links.
    robots: { index: false, follow: true },
    alternates: { canonical: "/roast-my-resume/" },
    openGraph: { title, description, url: `/roast-my-resume/score/${n}/`, type: "website", images: ogImageMeta(image, title) },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function RoastScorePage({ params }: { params: Promise<Params> }) {
  const n = parse((await params).score);
  if (n === null) notFound();
  const tier = roastTier(n);
  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-12 px-4">
      <main className="w-full max-w-2xl flex flex-col gap-6 text-center">
        <div className="rounded-2xl p-8 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${tier.colour}, #7c2d12)` }}>
          <p className="text-sm uppercase tracking-wide opacity-90">Someone&apos;s resume came out</p>
          <p className="text-5xl font-extrabold mt-1">{tier.label} {tier.emoji}</p>
          <p className="mt-2 text-xl">Score: <strong>{n}/100</strong></p>
          <p className="mt-1 opacity-90">{tier.blurb}</p>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Think your resume would survive the roast?</h1>
        <p className="text-gray-600 dark:text-gray-300">Get a free, funny AI critique of your resume plus the fixes that matter. No sign-up, nothing stored.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/roast-my-resume/" className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold">Roast my resume 🔥</Link>
          <Link href="/ats-checker/" className="px-6 py-3 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-gray-200 font-semibold">Serious ATS check</Link>
        </div>
      </main>
    </div>
  );
}
