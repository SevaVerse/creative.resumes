"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { JobRow, JobSector } from "@/types/database";

type SectorFilter = "all" | JobSector;
const NEW_WINDOW_MS = 30 * 86_400_000;

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** WhatsApp share link to the job's SecureCV page (job news spreads through WhatsApp groups). Call on click only. */
function whatsAppShareUrl(title: string, organization: string, id: string): string {
  const origin = window.location.origin;
  return `https://wa.me/?text=${encodeURIComponent(`${title} at ${organization} — fresher job: ${origin}/jobs/listing/${id}/`)}`;
}

export default function JobsBoard({ jobs, generatedAt }: { jobs: JobRow[]; generatedAt: string }) {
  const [sector, setSector] = useState<SectorFilter>("all");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [onlyNew, setOnlyNew] = useState(false);

  const now = new Date(generatedAt).getTime();
  const isNew = (j: JobRow) => now - new Date(j.first_seen_at).getTime() < NEW_WINDOW_MS;

  const counts = useMemo(() => ({
    all: jobs.length,
    government: jobs.filter((j) => j.sector === "government").length,
    private: jobs.filter((j) => j.sector === "private").length,
  }), [jobs]);

  const allTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const j of jobs) for (const t of j.tags) freq.set(t, (freq.get(t) || 0) + 1);
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 10);
  }, [jobs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) =>
      (sector === "all" || j.sector === sector) &&
      (!tag || j.tags.includes(tag)) &&
      (!onlyNew || now - new Date(j.first_seen_at).getTime() < NEW_WINDOW_MS) &&
      (!q || `${j.title} ${j.organization} ${j.location ?? ""}`.toLowerCase().includes(q))
    );
  }, [jobs, sector, tag, onlyNew, query, now]);

  const sectorTabs: { id: SectorFilter; label: string }[] = [
    { id: "all", label: `All (${counts.all})` },
    { id: "government", label: `Government (${counts.government})` },
    { id: "private", label: `Private (${counts.private})` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sector">
          {sectorTabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={sector === t.id}
              onClick={() => setSector(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                sector === t.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white/70 dark:bg-neutral-900/70 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-neutral-700 hover:border-blue-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, organisation or city"
          aria-label="Search jobs"
          className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 mr-2">
          <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} className="h-4 w-4 rounded" />
          New this month only
        </label>
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(tag === t ? null : t)}
            className={`px-2.5 py-1 rounded-full text-xs border ${
              tag === t ? "bg-teal-600 text-white border-teal-600" : "border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400">
          {jobs.length === 0
            ? "This month's listings are being prepared. Check back soon — meanwhile, use the official portals below."
            : "No jobs match these filters."}
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((j) => (
            <li key={j.id} className="flex flex-col gap-2 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">
                    <Link href={`/jobs/listing/${j.id}/`} className="hover:underline">{j.title}</Link>
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{j.organization}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    j.sector === "government"
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                  }`}>
                    {j.sector === "government" ? "Govt" : "Private"}
                  </span>
                  {isNew(j) && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">New</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                {j.location && <span>📍 {j.location}</span>}
                {j.employment_type && <span>🕒 {j.employment_type}</span>}
                {formatDate(j.posted_at) && <span>Posted {formatDate(j.posted_at)}</span>}
                {formatDate(j.last_date) && <span className="font-semibold text-red-700 dark:text-red-300">Last date {formatDate(j.last_date)}</span>}
              </div>
              {j.summary && <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{j.summary}</p>}
              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {j.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[11px] bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">{t}</span>
                  ))}
                </div>
                <a
                  href={j.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="shrink-0 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                >
                  View &amp; apply ↗
                </a>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-gray-400">via {j.source}</p>
                <button
                  type="button"
                  onClick={() => window.open(whatsAppShareUrl(j.title, j.organization, j.id), "_blank", "noopener,noreferrer")}
                  className="text-[11px] font-semibold text-green-700 dark:text-green-400 hover:underline"
                  aria-label={`Share ${j.title} on WhatsApp`}
                >
                  Share on WhatsApp
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
