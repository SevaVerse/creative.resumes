// Links to the public job-alert channels. Renders nothing until a channel URL is configured.
// NEXT_PUBLIC_* values are inlined at build time.

function safeUrl(value: string | undefined, allowed: RegExp): string | null {
  const v = value?.trim();
  return v && allowed.test(v) ? v : null;
}

export default function JobAlertsCta({ compact = false }: { compact?: boolean }) {
  const telegram = safeUrl(process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL, /^https:\/\/t\.me\/[A-Za-z0-9_+/-]+$/);
  const whatsapp = safeUrl(process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL, /^https:\/\/(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9]+$/);
  if (!telegram && !whatsapp) return null;
  return (
    <section
      aria-label="Job alerts"
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/30 ${compact ? "p-3" : "p-4"}`}
    >
      <p className="text-sm text-gray-800 dark:text-gray-200">
        <strong>🔔 Get new fresher jobs first.</strong> One digest a month with every new listing — free, no spam.
      </p>
      <div className="flex gap-2 shrink-0">
        {telegram && (
          <a href={telegram} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold">
            Join on Telegram
          </a>
        )}
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold">
            Follow on WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}
