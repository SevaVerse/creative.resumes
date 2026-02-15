import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

// Simple security middleware adding foundational headers.
// Adjust CSP sources as features evolve.
// जय श्री राम - Security through mindful constraints

const isProd = process.env.NODE_ENV === 'production';

// Content Security Policy (updated for Supabase)
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js-agent.newrelic.com https://challenges.cloudflare.com https://*.cloudflare.com", // Next.js + New Relic + Turnstile
  "style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com", // Tailwind + Turnstile styles
  "img-src 'self' data: blob: https: https://challenges.cloudflare.com", // Supabase Storage + Turnstile
  "font-src 'self' data:",
  "connect-src 'self' https://*.newrelic.com https://challenges.cloudflare.com https://*.cloudflare.com https://*.supabase.co wss://*.supabase.co", // Add Supabase
  "frame-src https://challenges.cloudflare.com https://*.cloudflare.com", // Turnstile iframe
  "child-src https://challenges.cloudflare.com",
  "form-action 'self' https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

export async function middleware(request: NextRequest) {
  const existingId = request.headers.get('x-request-id');
  const requestId = existingId || crypto.randomUUID();
  
  // Update Supabase session
  const response = await updateSession(request);
  
  // Add security headers
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
