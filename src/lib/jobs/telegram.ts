import "server-only";
import type { JobRow } from "@/types/database";
import { jobDetailPath, monthYear } from "./seo";
import { logger } from "@/utils/logger";

// Posts a digest of new listings to a Telegram channel after each refresh.
// Enabled only when TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID are set (the bot must be a
// channel admin). The token is a secret: it is never logged.

const JOBS_PER_MESSAGE = 15;
const MAX_MESSAGES = 3;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
}

/** Builds the HTML digest messages (pure, exported for tests). */
export function buildTelegramDigest(baseUrl: string, jobs: JobRow[], now = new Date()): string[] {
  if (jobs.length === 0) return [];
  // Government first (most-shared in channels), then soonest last date.
  const sorted = [...jobs].sort((a, b) =>
    a.sector === b.sector ? (a.last_date ?? "9999").localeCompare(b.last_date ?? "9999") : a.sector === "government" ? -1 : 1,
  );
  const shown = sorted.slice(0, JOBS_PER_MESSAGE * MAX_MESSAGES);
  const messages: string[] = [];
  for (let i = 0; i < shown.length; i += JOBS_PER_MESSAGE) {
    const lines = shown.slice(i, i + JOBS_PER_MESSAGE).map((j) => {
      const last = formatDate(j.last_date);
      const tag = j.sector === "government" ? "🏛" : "💼";
      const where = j.location ? ` · ${escapeHtml(j.location)}` : "";
      return `${tag} <a href="${escapeHtml(`${baseUrl}${jobDetailPath(j.id)}`)}">${escapeHtml(j.title)}</a> — ${escapeHtml(j.organization)}${where}${last ? ` · <b>apply by ${last}</b>` : ""}`;
    });
    const header = i === 0 ? `<b>🆕 ${jobs.length} new fresher jobs · ${escapeHtml(monthYear(now))}</b>\n\n` : "";
    messages.push(header + lines.join("\n"));
  }
  const footer = `\n\nAll listings: ${escapeHtml(`${baseUrl}/jobs/`)}\nFree fresher resume: ${escapeHtml(`${baseUrl}/resume-templates/campus/`)}\n<i>Never pay anyone to apply for a job.</i>`;
  messages[messages.length - 1] += footer;
  return messages;
}

export async function postJobsToTelegram(baseUrl: string, jobs: JobRow[]): Promise<{ posted: number }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHANNEL_ID?.trim();
  if (!token || !chatId || jobs.length === 0) return { posted: 0 };
  if (/localhost|127\.0\.0\.1/.test(baseUrl)) return { posted: 0 };

  let posted = 0;
  for (const text of buildTelegramDigest(baseUrl, jobs)) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        logger.warn("telegram.post_failed", { status: res.status });
        break;
      }
      posted++;
    } catch (error) {
      logger.warn("telegram.post_error", { error: (error as Error).message.replace(token, "[redacted]") });
      break;
    }
  }
  return { posted };
}
