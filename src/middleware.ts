import { NextResponse } from 'next/server';

// Simple security middleware adding foundational headers.
// Adjust CSP sources as features evolve.
// जय श्री राम - Security through mindful constraints

const isProd = process.env.NODE_ENV === 'production';

// Content Security Policy (minimal, allow inline styles for Tailwind JIT if needed)
// Consider hashing inline scripts if any are introduced later.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js-agent.newrelic.com https://challenges.cloudflare.com https://*.cloudflare.com", // Next.js + New Relic + Turnstile + inline JSON-LD
  "style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com", // Tailwind injects styles + Turnstile styles
  "img-src 'self' data: blob: https://challenges.cloudflare.com", // Include Turnstile images
  "font-src 'self' data:",
  "connect-src 'self' https://*.newrelic.com https://challenges.cloudflare.com https://*.cloudflare.com", // New Relic data collection + Turnstile verification
  "frame-src https://challenges.cloudflare.com https://*.cloudflare.com", // Turnstile iframe
  "child-src https://challenges.cloudflare.com", // Additional for Turnstile
  "form-action 'self' https://challenges.cloudflare.com", // Turnstile form submissions
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

export function middleware(request: Request) {
  const existingId = request.headers.get('x-request-id');
  // Use Web Crypto (available in edge) rather than Node 'crypto'
  const requestId = existingId || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`);
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Content-Security-Policy', csp);
  if (isProd) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
