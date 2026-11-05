import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/utils/auth/session";
import { jsonError } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/db/rateLimits";
import { logger, extractRequestId } from "@/utils/logger";
import { isAIRewriterEnabled } from "@/utils/groq";
import { DOCX_TYPE, PDF_TYPE, extractResumeText, structureResume } from "@/lib/resumeParser";

// Replaces the former Supabase Edge Function `parse-resume`.
export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_BYTES = 5 * 1024 * 1024;
// Imports per user per hour, shared across server instances (each is a paid AI call).
const PARSE_LIMIT = 10;

export async function POST(req: NextRequest) {
  const log = logger.withRequest(extractRequestId(req.headers));
  const userId = await getSessionUserId();
  if (!userId) return jsonError(401, "You must be signed in to import a resume.");
  if (!isAIRewriterEnabled()) return jsonError(503, "Resume import is not enabled");

  const rl = await checkRateLimit("parse", userId, 60 * 60 * 1000, PARSE_LIMIT);
  if (!rl.allowed) return jsonError(429, "Too many imports. Please try again later.");

  let file: File | null = null;
  try {
    const form = await req.formData();
    const value = form.get("file");
    file = value instanceof File ? value : null;
  } catch {
    return jsonError(400, "Expected multipart form data with a 'file' field");
  }
  if (!file) return jsonError(400, "No file provided");
  if (file.size > MAX_FILE_BYTES) return jsonError(413, "File must be smaller than 5MB");
  if (file.type !== PDF_TYPE && file.type !== DOCX_TYPE) return jsonError(415, "Please upload a PDF or DOCX file");

  try {
    const text = await extractResumeText(new Uint8Array(await file.arrayBuffer()), file.type);
    if (text.length < 50) return jsonError(422, "Could not read text from this file (is it a scanned image?)");
    const data = await structureResume(text);
    log.info("parse_resume.success", { contentType: file.type, chars: text.length });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    log.error("parse_resume.failed", { error: (error as Error).message });
    return jsonError(500, "Failed to parse resume. Please try another file.");
  }
}
