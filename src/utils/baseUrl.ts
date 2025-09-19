// Centralized base URL resolver for server and client environments
// Order of preference:
// 1) APP_BASE_URL (explicit, server)
// 2) NEXT_PUBLIC_APP_URL (public, client/server)
// 3) Derived from headers (x-forwarded-proto/host or host)
// 4) VERCEL_URL (https)
// 5) window.location.origin (client fallback)
// 6) http://localhost:3000 (final fallback)

type HeaderLike = Headers | Record<string, string | null | undefined> | undefined;

function readHeader(headers: HeaderLike, name: string): string | undefined {
  if (!headers) return undefined;
  try {
    if (typeof (headers as Headers).get === "function") {
      const v = (headers as Headers).get(name);
      return v === null ? undefined : v || undefined;
    }
  } catch {}
  const rec = headers as Record<string, string | null | undefined>;
  const val = rec?.[name] ?? rec?.[name.toLowerCase()];
  return (val ?? undefined) as string | undefined;
}

export function getBaseUrl(headers?: HeaderLike): string {
  // 1) Explicit server override
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;

  // 2) Public app URL
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;

  // 3) Derive from request headers (works on server routes)
  const xfProto = readHeader(headers, "x-forwarded-proto");
  const xfHost = readHeader(headers, "x-forwarded-host");
  if (xfProto && xfHost) return `${xfProto}://${xfHost}`;

  const host = readHeader(headers, "host");
  if (host) {
    // Guess protocol: default https for common cloud domains
    const likelyHttps = /vercel\.app$|netlify\.app$|azurewebsites\.net$|herokuapp\.com$/.test(host);
    return `${likelyHttps ? "https" : "http"}://${host}`;
  }

  // 4) Vercel env
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // 5) Client-side fallback
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  // 6) Default local
  return "http://localhost:3000";
}
