import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/utils/auth/session";
import { deleteResume, getResume, updateResume } from "@/lib/db/resumes";
import { jsonError, readJsonBody } from "@/lib/api/http";
import { logger, extractRequestId } from "@/utils/logger";
import { createRateLimiter } from "@/utils/rateLimit";
import { MAX_RESUME_BYTES, validateResumeInput } from "../validate";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const writeLimiter = createRateLimiter(60_000, 60); // autosave + manual saves
const ID_PATTERN = /^[0-9a-f-]{36}$/i;

async function resolve(ctx: Ctx): Promise<{ userId: string; id: string } | Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError(401, "Please sign in.");
  const { id } = await ctx.params;
  if (!ID_PATTERN.test(id)) return jsonError(400, "Invalid resume id");
  return { userId, id };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const r = await resolve(ctx);
  if (r instanceof Response) return r;
  const resume = await getResume(r.userId, r.id);
  if (!resume) return jsonError(404, "Resume not found");
  return NextResponse.json({ resume });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const log = logger.withRequest(extractRequestId(req.headers));
  const r = await resolve(ctx);
  if (r instanceof Response) return r;
  if (!writeLimiter.check(`resume:${r.userId}`).allowed) return jsonError(429, "Too many requests");

  const body = await readJsonBody<unknown>(req, MAX_RESUME_BYTES);
  if (!body) return jsonError(413, "Resume payload is invalid or too large");
  const input = validateResumeInput(body, false);
  if (typeof input === "string") return jsonError(400, input);

  try {
    const resume = await updateResume(r.userId, r.id, input);
    if (!resume) return jsonError(404, "Resume not found");
    return NextResponse.json({ resume });
  } catch (error) {
    log.error("resumes.update_failed", { error: (error as Error).message });
    return jsonError(500, "Failed to update resume");
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const log = logger.withRequest(extractRequestId(req.headers));
  const r = await resolve(ctx);
  if (r instanceof Response) return r;
  try {
    const deleted = await deleteResume(r.userId, r.id);
    if (!deleted) return jsonError(404, "Resume not found");
    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error("resumes.delete_failed", { error: (error as Error).message });
    return jsonError(500, "Failed to delete resume");
  }
}
