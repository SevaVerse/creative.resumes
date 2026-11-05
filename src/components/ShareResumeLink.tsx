"use client";
import { useEffect, useState } from "react";
import { createResumeShare, getResumeShare, revokeResumeShare, type ResumeShareInfo } from "@/lib/resumesClient";

type Days = 7 | 30 | 90;

/** Opt-in public link for a saved resume. Off by default; private, expiring and revocable. */
export function ShareResumeLink({ resumeId }: { resumeId: string }) {
  const [open, setOpen] = useState(false);
  const [share, setShare] = useState<ResumeShareInfo | null>(null);
  const [days, setDays] = useState<Days>(30);
  const [hideContact, setHideContact] = useState(true);
  const [indexable, setIndexable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    getResumeShare(resumeId).then(setShare).catch(() => setShare(null));
  }, [open, resumeId]);

  const url = share ? `${window.location.origin}/r/${share.id}/` : "";

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      setShare(await createResumeShare(resumeId, { expiresInDays: days, indexable, hideContact }));
    } catch (e) {
      setError((e as Error).message || "Could not create the link.");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    setBusy(true);
    setError(null);
    try {
      await revokeResumeShare(resumeId);
      setShare(null);
    } catch (e) {
      setError((e as Error).message || "Could not turn off the link.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700"
        title="Create a private link to this saved resume"
      >
        🔗 Share link
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="share-link-title">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h2 id="share-link-title" className="text-lg font-bold text-gray-900 dark:text-white">Share a link to this resume</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">✕</button>
            </div>

            {share ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Anyone with this link can view the latest saved version until{" "}
                  <strong>{new Date(share.expires_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</strong>.
                  {share.hide_contact ? " Email and phone are hidden." : " Email and phone are visible."}
                  {share.indexable ? " Search engines may list it." : " Hidden from search engines."}
                </p>
                <div className="flex gap-2">
                  <input readOnly value={url} className="flex-1 min-w-0 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" onFocus={(e) => e.currentTarget.select()} />
                  <button type="button" onClick={copy} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">{copied ? "Copied ✓" : "Copy"}</button>
                </div>
                <div className="flex gap-2 justify-between">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 dark:text-blue-300 underline">Open</a>
                  <button type="button" onClick={revoke} disabled={busy} className="text-sm font-semibold text-red-700 dark:text-red-400 hover:underline disabled:opacity-50">Turn off link</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Off until you create it. The link shows your latest saved version and stops working when it expires or you turn it off.
                </p>
                <label className="flex items-center justify-between gap-3 text-sm text-gray-800 dark:text-gray-200">
                  Expires after
                  <select value={days} onChange={(e) => setDays(Number(e.target.value) as Days)} className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1">
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                  <input type="checkbox" checked={hideContact} onChange={(e) => setHideContact(e.target.checked)} />
                  Hide my email and phone number
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                  <input type="checkbox" checked={indexable} onChange={(e) => setIndexable(e.target.checked)} />
                  Let search engines list it (off by default)
                </label>
                <button type="button" onClick={create} disabled={busy} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50">
                  {busy ? "Creating…" : "Create link"}
                </button>
              </>
            )}
            {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Save your changes first — the link shows the last saved version.</p>
          </div>
        </div>
      )}
    </>
  );
}
