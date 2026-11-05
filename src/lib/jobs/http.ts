const USER_AGENT = "SecureCVJobsBot/1.0 (+https://securecv.co.in/jobs)";

/** fetch with a timeout and a descriptive User-Agent. Throws on non-2xx. */
export async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 15_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "application/json, application/xml, text/xml, */*", ...(init.headers || {}) },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${new URL(url).host}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}
