import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicToken, createSessionId } from '@/utils/magicLink';
import { logger, extractRequestId } from '@/utils/logger';

const SESSION_COOKIE = 'rb_session';
const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12h

export async function POST(req: NextRequest) {
  const started = performance.now();
  const requestId = extractRequestId(req.headers);
  const log = logger.withRequest(requestId);
  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'token_required', requestId }, { status: 400 });
    }
    const result = verifyMagicToken(token);
    if (!result.valid || !result.email) {
      log.warn('login.verify_failed', { reason: result.reason });
      return NextResponse.json({ error: 'invalid_or_expired', reason: result.reason, requestId }, { status: 400 });
    }
    const sessionId = createSessionId();
    // Minimal session payload: we only store the email in a lightweight signed-ish cookie later if desired.
    // For the simplified variant we just issue an opaque id cookie (stateless for now).
    const res = NextResponse.json({ success: true, email: result.email, requestId });
    const secure = process.env.NODE_ENV === 'production';
    const cookieMaxAge = SESSION_TTL_SECONDS;
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: cookieMaxAge,
    });
    const durationMs = +(performance.now() - started).toFixed(2);
    log.info('login.session_established', { emailHash: hashEmail(result.email), durationMs });
    return res;
  } catch (err) {
    const durationMs = +(performance.now() - started).toFixed(2);
    logger.error('login.verify_error', { err: (err as Error).message, requestId, durationMs });
    return NextResponse.json({ error: 'internal', requestId }, { status: 500 });
  }
}

function hashEmail(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = Math.imul(31, hash) + email.charCodeAt(i) | 0;
  return 'h' + (hash >>> 0).toString(36);
}
