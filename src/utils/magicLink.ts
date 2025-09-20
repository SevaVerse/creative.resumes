import crypto from 'crypto';

// Lightweight stateless magic link tokens with HMAC integrity.
// Format: base64url(header).base64url(payload).base64url(signature)
// header: { alg: 'HS256', v: 1 }
// payload: { e: email, exp: unixSeconds, iat: unixSeconds, rnd: randomHex }
// No replay cache in this simplified variant.

const ALGO = 'HS256';
const VERSION = 1;
const DEFAULT_TTL_SECONDS = 15 * 60; // 15 minutes

function b64url(data: Buffer | string) {
  return Buffer.from(data).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// Accept plain object-like values
function b64urlJson(obj: object) {
  return b64url(JSON.stringify(obj));
}

function hmac(secret: string, data: string) {
  return b64url(crypto.createHmac('sha256', secret).update(data).digest());
}

export interface MagicTokenPayload {
  e: string; // email (normalized lower-case)
  exp: number; // expiry (unix seconds)
  iat: number; // issued at (unix seconds)
  rnd: string; // random entropy
}

export function generateMagicToken(emailRaw: string, opts?: { ttlSeconds?: number; secret?: string }): string {
  const secret = opts?.secret || process.env.MAGIC_LINK_SECRET;
  if (!secret) throw new Error('MAGIC_LINK_SECRET not set');
  const email = emailRaw.trim().toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const payload: MagicTokenPayload = {
    e: email,
    iat: now,
    exp: now + (opts?.ttlSeconds || DEFAULT_TTL_SECONDS),
    rnd: crypto.randomBytes(8).toString('hex'),
  };
  const header = { alg: ALGO, v: VERSION };
  const h = b64urlJson(header);
  const p = b64urlJson(payload);
  const sig = hmac(secret, `${h}.${p}`);
  return `${h}.${p}.${sig}`;
}

export interface VerifyResult {
  valid: boolean;
  reason?: string;
  email?: string;
  payload?: MagicTokenPayload;
}

export function verifyMagicToken(token: string, opts?: { secret?: string }): VerifyResult {
  try {
    const secret = opts?.secret || process.env.MAGIC_LINK_SECRET;
    if (!secret) return { valid: false, reason: 'secret_missing' };
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, reason: 'format' };
    const [hB64, pB64, sig] = parts;
    const expectedSig = hmac(secret, `${hB64}.${pB64}`);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return { valid: false, reason: 'bad_sig' };
    }
    const headerJson = Buffer.from(hB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const header = JSON.parse(headerJson);
    if (header.alg !== ALGO || header.v !== VERSION) {
      return { valid: false, reason: 'header' };
    }
    const payloadJson = Buffer.from(pB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload: MagicTokenPayload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return { valid: false, reason: 'expired', payload };
    if (!payload.e || typeof payload.e !== 'string') return { valid: false, reason: 'email_missing', payload };
    return { valid: true, email: payload.e, payload };
  } catch {
    return { valid: false, reason: 'exception' };
  }
}

export function createSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}
