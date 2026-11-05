import { OFFICIAL_PORTALS } from "@/data/jobs/officialPortals";

export default function OfficialPortals() {
  return (
    <section className="p-6 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/60 dark:bg-orange-950/20">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Official government job portals</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Government vacancies are always announced first on these official sites. Bookmark them.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {OFFICIAL_PORTALS.map((p) => (
          <li key={p.url}>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-orange-100 dark:border-neutral-800 hover:border-orange-400">
              <span className="font-semibold text-gray-900 dark:text-white">{p.name} ↗</span>
              <span className="block text-xs text-gray-600 dark:text-gray-400">{p.description}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
