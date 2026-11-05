import Link from "next/link";
import { JOB_CATEGORIES } from "@/lib/jobs/seo";

/** Crawlable links between the /jobs landing pages (internal linking for SEO). */
export default function JobCategoryNav({ current, counts }: { current?: string; counts?: Record<string, number> }) {
  return (
    <nav aria-label="Browse fresher jobs by category" className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Browse fresher jobs by category and city</h2>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href="/jobs/"
            aria-current={!current ? "page" : undefined}
            className={`inline-block px-3 py-1 rounded-full text-xs border ${!current ? "bg-teal-600 text-white border-teal-600" : "border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-teal-500"}`}
          >
            All fresher jobs
          </Link>
        </li>
        {JOB_CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/jobs/${c.slug}/`}
              aria-current={current === c.slug ? "page" : undefined}
              className={`inline-block px-3 py-1 rounded-full text-xs border ${current === c.slug ? "bg-teal-600 text-white border-teal-600" : "border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-teal-500"}`}
            >
              {c.label}
              {counts && counts[c.slug] ? ` (${counts[c.slug]})` : ""}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
