/**
 * CORS headers for API routes that may be called from the static frontend origin.
 */
export function getCorsHeaders(origin?: string | null): HeadersInit {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://securecv.co.in',
    'https://www.securecv.co.in',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean) as string[]

  const isAllowed = !!origin && allowedOrigins.includes(origin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

/** Best-effort client key for anonymous rate limiting. */
export function clientKey(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers.get('x-real-ip')
    || headers.get('user-agent')
    || 'anonymous'
}
