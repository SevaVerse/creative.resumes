import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/utils/auth/session";
import { createResume, listResumes } from "@/lib/db/resumes";
import { jsonError, readJsonBody } from "@/lib/api/http";
import { logger, extractRequestId } from "@/utils/logger";
import { createRateLimiter } from "@/utils/rateLimit";
import { MAX_RESUME_BYTES, validateResumeInput } from "./validate";

export const runtime = "nodejs";

const writeLimiter = createRateLimiter(60_000, 30);

export async function GET(req: NextRequest) {
  const log = logger.withRequest(extractRequestId(req.headers));
  const userId = await getSessionUserId();
  if (!userId) return jsonError(401, "Please sign in to view saved resumes.");
  try {
    const resumes = await listResumes(userId);
    return NextResponse.json({ resumes });
  } catch (error) {
    log.error("resumes.list_failed", { error: (error as Error).message });
    return jsonError(500, "Failed to load resumes");
  }
}

export async function POST(req: NextRequest) {
  const log = logger.withRequest(extractRequestId(req.headers));
  const userId = await getSessionUserId();
  if (!userId) return jsonError(401, "Please sign in to save resumes.");
  if (!writeLimiter.check(`resumes:${userId}`).allowed) return jsonError(429, "Too many requests");

  const body = await readJsonBody<unknown>(req, MAX_RESUME_BYTES);
  if (!body) return jsonError(413, "Resume payload is invalid or too large");
  const input = validateResumeInput(body, true);
  if (typeof input === "string") return jsonError(400, input);

  try {
    const resume = await createResume(userId, {
      name: input.name!,
      template: input.template!,
      data: input.data!,
    });
    log.info("resumes.created", { resumeId: resume.id });
    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    log.error("resumes.create_failed", { error: (error as Error).message });
    return jsonError(500, "Failed to save resume");
  }
}
