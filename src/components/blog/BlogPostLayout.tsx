import type React from "react";
import Link from "next/link";
import { BLOG_POSTS, formatPostDate, getPost } from "@/lib/blog/posts";
import { getBaseUrl } from "@/utils/baseUrl";

// Typography for long-form posts without pulling in a prose plugin.
const ARTICLE_CLASSES = [
  "text-gray-800 dark:text-gray-200 leading-7",
  "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-3",
  "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 dark:[&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2",
  "[&_p]:my-4",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1.5",
  "[&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2",
  "[&_strong]:text-gray-900 dark:[&_strong]:text-white",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 dark:[&_blockquote]:text-gray-400",
  "[&_table]:w-full [&_table]:my-6 [&_table]:text-sm [&_th]:text-left [&_th]:font-semibold [&_th]:border-b [&_th]:border-gray-300 dark:[&_th]:border-neutral-700 [&_th]:py-2 [&_th]:pr-3",
  "[&_td]:border-b [&_td]:border-gray-200 dark:[&_td]:border-neutral-800 [&_td]:py-2 [&_td]:pr-3",
  "[&_code]:font-mono [&_code]:text-sm [&_code]:bg-gray-100 dark:[&_code]:bg-neutral-800 [&_code]:px-1 [&_code]:rounded",
].join(" ");

export default function BlogPostLayout({ slug, children }: { slug: string; children: React.ReactNode }) {
  const post = getPost(slug);
  const baseUrl = getBaseUrl();
  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    author: { "@type": "Person", name: "Seva" },
    publisher: { "@type": "Organization", name: "SecureCV" },
    mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
    image: `${baseUrl}/og-image.png`,
    keywords: post.keywords.join(", "),
  };

  return (
    <main className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-12 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="z-10 w-full max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:underline">Blog</Link>
        </nav>
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{post.title}</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">{post.description}</p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            By Seva · <time dateTime={post.published}>{formatPostDate(post.published)}</time> · {post.readingMinutes} min read
          </p>
        </header>

        <div className={ARTICLE_CLASSES}>{children}</div>

        <aside className="mt-12 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/30 p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Build your resume for free</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Fresher-friendly and ATS-safe templates, AI rewrite and instant PDF export. No ads, no trackers.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Start building
          </Link>
        </aside>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Keep reading</h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="block h-full rounded-lg border border-gray-200 dark:border-neutral-800 p-4 hover:border-blue-400 dark:hover:border-blue-500 transition"
                  >
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
