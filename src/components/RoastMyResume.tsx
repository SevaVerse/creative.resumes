"use client";
import { useState } from "react";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import { analyzeResume, type AtsResult } from "@/lib/ats/analyze";
import { fallbackRoast, roastSharePath, roastTier } from "@/lib/roast/quips";

type Roast = { score: number; roasts: string[]; fixes: string[]; ai: boolean; result: AtsResult };

const MIN_CHARS = 200;

export default function RoastMyResume() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState<Roast | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setNotice(null);
    // The score is computed locally with the same rules as the ATS checker.
    const result = analyzeResume(text);
    const local = { score: result.overall, roasts: fallbackRoast(result), fixes: result.issues.slice(0, 3).map((i) => i.fix), ai: false, result };
    try {
      const res = await fetch("/api/roast/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json().catch(() => ({}))) as { roasts?: string[]; fixes?: string[]; error?: string };
      if (res.ok && data.roasts?.length) {
        setRoast({ ...local, roasts: data.roasts, fixes: data.fixes?.length ? data.fixes : local.fixes, ai: true });
      } else {
        if (res.status === 429 && data.error) setNotice(data.error);
        setRoast(local);
      }
    } catch {
      setRoast(local);
    } finally {
      setLoading(false);
      setTimeout(() => document.getElementById("roast-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  const tier = roast ? roastTier(roast.score) : null;
  const tooShort = text.trim().length < MIN_CHARS;

  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="font-semibold text-gray-900 dark:text-white">Paste your resume text</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          maxLength={12000}
          placeholder="Open your resume, select all (Ctrl+A), copy and paste it here. Remove your phone number if you like — the roast doesn't need it."
          className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 outline-none"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={tooShort || loading}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Preheating the oven…" : "Roast my resume 🔥"}
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {tooShort && text.length > 0 ? `Paste at least ${MIN_CHARS} characters. ` : ""}
          Free, no sign-up. Your text is sent to our AI provider to write the jokes and is not stored.
        </span>
      </div>

      {roast && tier && (
        <section id="roast-result" className="flex flex-col gap-5 scroll-mt-20" aria-live="polite">
          {notice && <p className="text-sm text-amber-700 dark:text-amber-300">{notice} Showing a quick local roast instead.</p>}
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${tier.colour}, #7c2d12)` }}>
            <p className="text-sm uppercase tracking-wide opacity-90">Your resume is</p>
            <p className="text-4xl font-extrabold">{tier.label} {tier.emoji}</p>
            <p className="mt-1 text-lg">Score: <strong>{roast.score}/100</strong> · {tier.blurb}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50/70 dark:bg-orange-950/30">
              <h2 className="font-bold text-gray-900 dark:text-white">The roast {roast.ai ? "" : "(quick version)"}</h2>
              <ul className="mt-2 space-y-2 text-gray-800 dark:text-gray-200">
                {roast.roasts.map((r) => <li key={r}>🔥 {r}</li>)}
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-green-200 dark:border-green-900 bg-green-50/70 dark:bg-green-950/30">
              <h2 className="font-bold text-gray-900 dark:text-white">The fix</h2>
              <ul className="mt-2 space-y-2 text-gray-800 dark:text-gray-200">
                {roast.fixes.map((f) => <li key={f}>✅ {f}</li>)}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-col gap-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Sharing posts only your score and tier — never your resume text or details.
            </p>
            <ShareButtons
              url={roastSharePath(roast.score)}
              text={`My resume just got roasted: ${roast.score}/100, “${tier.label}” ${tier.emoji}. Dare to roast yours (free, no sign-up)?`}
              label="Share your roast"
            />
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg">Cool it down in minutes</p>
              <p className="text-sm text-blue-50">Fix it in the free builder, or check it against a job description.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/?template=atsclassic" className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold whitespace-nowrap">Open the builder →</Link>
              <Link href="/ats-checker/" className="px-4 py-2 rounded-lg border border-white/70 font-semibold whitespace-nowrap">ATS checker</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
