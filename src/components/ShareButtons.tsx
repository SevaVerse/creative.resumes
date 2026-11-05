"use client";
import { useEffect, useState } from "react";

type Props = {
  /** Absolute or root-relative URL to share; resolved against the current origin. */
  url: string;
  /** Message placed before the link (WhatsApp/Telegram/X). */
  text: string;
  label?: string;
  className?: string;
};

// Plain share links (no third-party SDKs or trackers). WhatsApp and Telegram come first
// because that is where job news and resume tips spread among students in India.
export default function ShareButtons({ url, text, label = "Share", className = "" }: Props) {
  const [absUrl, setAbsUrl] = useState(url);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    try {
      setAbsUrl(new URL(url, window.location.origin).toString());
    } catch {}
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, [url]);

  const enc = encodeURIComponent;
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${absUrl}`)}`, cls: "bg-green-600 hover:bg-green-700" },
    { name: "Telegram", href: `https://t.me/share/url?url=${enc(absUrl)}&text=${enc(text)}`, cls: "bg-sky-500 hover:bg-sky-600" },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(absUrl)}`, cls: "bg-blue-700 hover:bg-blue-800" },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(absUrl)}`, cls: "bg-neutral-900 hover:bg-black" },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${absUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: text, text, url: absUrl });
    } catch {}
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}:</span>
      {canNativeShare && (
        <button type="button" onClick={nativeShare} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gray-700 hover:bg-gray-800">
          Share…
        </button>
      )}
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white ${l.cls}`}
          aria-label={`Share on ${l.name}`}
        >
          {l.name}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
