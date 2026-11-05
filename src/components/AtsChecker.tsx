"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import { analyzeResume, type AtsResult, type Severity } from "@/lib/ats/analyze";

const SEVERITY_STYLE: Record<Severity, string> = {
  high: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100",
  medium: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100",
  low: "border-gray-300 bg-gray-50 text-gray-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200",
};

function scoreColour(n: number): string {
  if (n >= 75) return "text-green-600 dark:text-green-400";
  if (n >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function Bar({ label, value, hint }: { label: string; value: number | null; hint: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-800 dark:text-gray-200" title={hint}>{label}</span>
        <span className="text-gray-600 dark:text-gray-400">{value === null ? "add a job description" : `${value}/100`}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${value ?? 0}%` }} />
      </div>
    </div>
  );
}

export default function AtsChecker() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [result, setResult] = useState<AtsResult | null>(null);
  const [copied, setCopied] = useState(false);

  const missing = useMemo(() => result?.keywords.filter((k) => !k.inResume) ?? [], [result]);
  const matched = useMemo(() => result?.keywords.filter((k) => k.inResume) ?? [], [result]);

  const run = () => {
    setResult(analyzeResume(resume, job));
    setTimeout(() => document.getElementById("ats-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const copyMissing = async () => {
    try {
      await navigator.clipboard.writeText(missing.map((k) => k.term).join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const tooShort = resume.trim().split(/\s+/).filter(Boolean).length < 30;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">1. Paste your resume text</span>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={14}
            placeholder="Open your resume PDF or Word file, select all (Ctrl+A), copy and paste it here."
            className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">2. Paste the job description <span className="font-normal text-gray-500">(optional, recommended)</span></span>
          <textarea
            value={job}
            onChange={(e) => setJob(e.target.value)}
            rows={14}
            placeholder="Paste the job ad to see which of its keywords your resume is missing."
            className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={tooShort}
          className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check my resume
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          🔒 Runs in your browser. Your resume is not uploaded or stored.
          {tooShort && resume.length > 0 ? " Paste at least 30 words." : ""}
        </span>
      </div>

      {result && (
        <section id="ats-results" className="flex flex-col gap-6 scroll-mt-20" aria-live="polite">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">ATS readiness score</span>
              <span className={`text-6xl font-extrabold ${scoreColour(result.overall)}`}>{result.overall}</span>
              <span className="text-sm text-gray-500">out of 100</span>
            </div>
            <div className="md:col-span-2 flex flex-col gap-3">
              <Bar label="Keyword match" value={result.scores.keywords} hint="Share of the job description's key terms found in your resume" />
              <Bar label="Sections" value={result.scores.sections} hint="Contact details and standard headings ATS software looks for" />
              <Bar label="Impact language" value={result.scores.impact} hint="Action verbs, numbers and absence of weak phrases" />
              <Bar label="Readability" value={result.scores.readability} hint="Length, line length and parser-unfriendly symbols" />
            </div>
          </div>

          {result.keywords.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-bold text-gray-900 dark:text-white">Missing keywords ({missing.length})</h2>
                  {missing.length > 0 && (
                    <button type="button" onClick={copyMissing} className="text-xs underline text-gray-700 dark:text-gray-300">
                      {copied ? "Copied ✓" : "Copy list"}
                    </button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {missing.length === 0 && <span className="text-sm text-gray-600 dark:text-gray-400">None — great match.</span>}
                  {missing.map((k) => (
                    <span key={k.term} className={`px-2 py-0.5 rounded text-xs ${k.priority === "high" ? "bg-red-600 text-white" : "bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100"}`}>
                      {k.term}{k.priority === "high" ? " ★" : ""}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-gray-500">★ = mentioned often in the job description. Only add skills you genuinely have.</p>
              </div>
              <div className="p-4 rounded-xl border border-green-200 dark:border-green-900 bg-green-50/60 dark:bg-green-950/30">
                <h2 className="font-bold text-gray-900 dark:text-white">Matched keywords ({matched.length})</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {matched.map((k) => (
                    <span key={k.term} className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100">{k.term}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">What to fix ({result.issues.length})</h2>
            {result.issues.length === 0 && <p className="text-sm text-gray-600 dark:text-gray-300">No issues found. Nice work.</p>}
            {result.issues.map((i) => (
              <div key={i.message} className={`p-3 rounded-lg border text-sm ${SEVERITY_STYLE[i.severity]}`}>
                <p className="font-semibold">{i.message}</p>
                <p className="mt-0.5">{i.fix}</p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg">Fix it in minutes with an ATS-safe template</p>
              <p className="text-sm text-blue-50">Import your resume, rewrite bullets with AI and download a clean PDF. Free, no sign-up.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/?template=atsclassic" className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold whitespace-nowrap">Open the builder →</Link>
              <Link href="/resume-templates/" className="px-4 py-2 rounded-lg border border-white/70 font-semibold whitespace-nowrap">Templates</Link>
            </div>
          </div>

          <ShareButtons
            url="/ats-checker/"
            text={`My resume scored ${result.overall}/100 on this free ATS checker (runs in your browser, no sign-up). Check yours:`}
            label="Share your score"
          />
        </section>
      )}
    </div>
  );
}
