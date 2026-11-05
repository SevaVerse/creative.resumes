import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateMeta } from "@/components/templates/registry";
import { getPublicShare } from "@/lib/db/shares";
import { toResumeData } from "@/lib/resumeData";

// Always rendered on request so revocation and expiry take effect immediately.
export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const found = await getPublicShare((await params).slug);
  if (!found) return { title: "Link not available", robots: { index: false, follow: false } };
  const data = toResumeData(found.resume.data, { hideContact: found.share.hide_contact });
  const title = data.name ? `${data.name} — Resume` : "Resume";
  return {
    title: { absolute: `${title} | Made with SecureCV` },
    description: data.summary ? data.summary.slice(0, 160) : "Resume shared with SecureCV.",
    // Private by default: only links the owner explicitly made searchable may be indexed.
    robots: found.share.indexable
      ? { index: true, follow: false, unavailable_after: new Date(found.share.expires_at).toUTCString() }
      : { index: false, follow: false, nocache: true },
    alternates: { canonical: `/r/${found.share.id}/` },
    openGraph: { title, type: "profile", url: `/r/${found.share.id}/` },
    twitter: { card: "summary", title },
  };
}

export default async function SharedResumePage({ params }: { params: Promise<Params> }) {
  const found = await getPublicShare((await params).slug);
  if (!found) notFound();
  const data = toResumeData(found.resume.data, { hideContact: found.share.hide_contact });
  const Tpl = getTemplateMeta(found.resume.template).Component;
  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-neutral-950 flex flex-col items-center py-6 px-2 sm:px-4">
      <main className="w-full max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
          <Tpl {...data} />
        </div>
        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400 print:hidden">
          <span>
            Shared by its owner · Updated {new Date(found.resume.last_edited_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <Link href="/" className="font-semibold text-blue-700 dark:text-blue-300 hover:underline">
            Made with SecureCV — build yours free, no sign-up →
          </Link>
        </footer>
      </main>
    </div>
  );
}
