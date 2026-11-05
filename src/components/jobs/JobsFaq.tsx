import type { FaqItem } from "@/lib/jobs/seo";

/** Visible FAQ — must mirror the FAQPage JSON-LD emitted on the same page. */
export default function JobsFaq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Frequently asked questions</h2>
      {items.map((f) => (
        <details key={f.q} className="p-4 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70">
          <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">{f.q}</summary>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{f.a}</p>
        </details>
      ))}
    </section>
  );
}
