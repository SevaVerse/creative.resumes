import Link from "next/link";
import type { Metadata } from "next";
import { BLOG_POSTS, formatPostDate } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Resume Writing Blog — Guides for Freshers, ATS Tips & Templates",
  description:
    "Free, practical resume guides: writing a fresher resume with no experience, getting past ATS filters, choosing a template, and making your job search greener.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "SecureCV Blog — Resume Guides & Tips",
    description: "Practical resume guides for freshers and professionals. No fluff, no tracking.",
    url: "/blog",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SecureCV Blog" }],
  },
};

export default function BlogIndexPage() {
  return (
    <main className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-12 px-4">
      <div className="z-10 w-full max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Resume guides &amp; tips</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Practical advice for writing a resume that gets read — by recruiters and by applicant tracking systems.
          </p>
        </header>
        <ul className="grid gap-5 md:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 p-6 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition"
              >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{post.title}</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex-grow">{post.description}</p>
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <time dateTime={post.published}>{formatPostDate(post.published)}</time> · {post.readingMinutes} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
