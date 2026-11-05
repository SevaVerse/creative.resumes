import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/utils/auth/session";
import { jsonError, readJsonBody, isPlainObject } from "@/lib/api/http";
import { logger, extractRequestId } from "@/utils/logger";
import { createRateLimiter } from "@/utils/rateLimit";
import { SHARE_EXPIRY_DAYS, createShare, getActiveShare, revokeShares, type ShareExpiryDays } from "@/lib/db/shares";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const shareLimiter = createRateLimiter(60_000, 10);
const ID_PATTERN = /^[0-9a-f-]{36}$/i;

async function resolve(ctx: Ctx): Promise<{ userId: string; id: string } | Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError(401, "Please sign in.");
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) return jsonError(400, "Invalid resume id");
  return { userId, id };
}

/** The resume's active public link, or null. */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const r = await resolve(ctx);
  if (r instanceof Response) return r;
  const share = await getActiveShare(r.userId, r.id);
  return NextResponse.json({ share }, { headers: { "Cache-Control": "no-store" } });
}

/** Creates a link (replacing any existing one). Body: { expiresInDays: 7|30|90, indexable?: boolean, hideContact?: boolean }. */
export async function POST(req: NextRequest, ctx: Ctx) {
  const log = logger.withRequest(extractRequestId(req.headers));
  const r = await resolve(ctx);
  if (r instanceof Response) return r;
  if (!shareLimiter.check(`share:${r.userId}`).allowed) return jsonError(429, "Too many requests");

  const body = await readJsonBody<unknown>(req, 1024);
  if (!isPlainObject(body)) return jsonError(400, "Invalid request body");
  const days = body.expiresInDays ?? 30;
  if (!SHARE_EXPIRY_DAYS.includes(days as ShareExpiryDays)) return jsonError(400, `expiresInDays must be one of ${SHARE_EXPIRY_DAYS.join(", ")}`);
  // Private by default: hidden from search and without email/phone unless the owner opts in.
  const indexable = body.indexable === true;
  const hideContact = body.hideContact !== false;

  try {
    const share = await createShare(r.userId, r.id, { expiresInDays: days as ShareExpiryDays, indexable, hideContact });
    if (!share) return jsonError(404, "Resume not found");
    log.info("resume_share.created", { userId: r.userId, days, indexable, hideContact });
    return NextResponse.json({ share }, { status: 201 });
  } catch (error) {
    log.error("resume_share.create_failed", { error: (error as Error).message });
    return jsonError(500, "Failed to create link");
  }
}

/** Revokes the resume's public link(s) immediately. */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const log = logger.withRequest(extractRequestId(req.headers));
  const r = await resolve(ctx);
  if (r instanceof Response) return r;
  try {
    const revoked = await revokeShares(r.userId, r.id);
    log.info("resume_share.revoked", { userId: r.userId, revoked });
    return NextResponse.json({ ok: true, revoked });
  } catch (error) {
    log.error("resume_share.revoke_failed", { error: (error as Error).message });
    return jsonError(500, "Failed to revoke link");
  }
}
