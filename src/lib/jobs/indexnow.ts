import "server-only";
import { logger } from "@/utils/logger";

// IndexNow (Bing, Yandex, Seznam, Naver…) lets us tell search engines about new
// URLs right after each monthly refresh instead of waiting for a recrawl.
// Enabled only when INDEXNOW_KEY is set; the key is served at /indexnow-key.txt.

const KEY_RE = /^[a-zA-Z0-9-]{8,128}$/;

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && KEY_RE.test(key) ? key : null;
}

export async function submitIndexNow(baseUrl: string, urls: string[]): Promise<{ submitted: number; status?: number }> {
  const key = getIndexNowKey();
  if (!key || urls.length === 0) return { submitted: 0 };
  let host: string;
  try {
    host = new URL(baseUrl).host;
  } catch {
    return { submitted: 0 };
  }
  if (/^(localhost|127\.|0\.0\.0\.0)/.test(host)) return { submitted: 0 };
  const urlList = urls.slice(0, 10_000);
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: `${baseUrl}/indexnow-key.txt`, urlList }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) logger.warn("indexnow.submit_failed", { status: res.status });
    return { submitted: res.ok ? urlList.length : 0, status: res.status };
  } catch (error) {
    logger.warn("indexnow.submit_error", { error: (error as Error).message });
    return { submitted: 0 };
  }
}
