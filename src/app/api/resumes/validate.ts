import { isPlainObject } from "@/lib/api/http";
import { isTemplateId, type TemplateId } from "@/types/resume";

export const MAX_RESUME_BYTES = 2_500_000; // allows a compressed profile photo data URL
export const MAX_NAME_LENGTH = 120;

export type ResumeInput = { name?: string; template?: TemplateId; data?: Record<string, unknown> };

/** Validates a create/update payload. Returns an error message or the normalized input. */
export function validateResumeInput(body: unknown, requireAll: boolean): ResumeInput | string {
  if (!isPlainObject(body)) return "Invalid request body";
  const out: ResumeInput = {};

  if (body.name !== undefined || requireAll) {
    if (typeof body.name !== "string" || !body.name.trim()) return "Resume name is required";
    if (body.name.trim().length > MAX_NAME_LENGTH) return `Resume name must be at most ${MAX_NAME_LENGTH} characters`;
    out.name = body.name.trim();
  }
  if (body.template !== undefined || requireAll) {
    if (!isTemplateId(body.template)) return "Unknown template";
    out.template = body.template;
  }
  if (body.data !== undefined || requireAll) {
    if (!isPlainObject(body.data)) return "Resume data must be an object";
    out.data = body.data;
  }
  if (!requireAll && Object.keys(out).length === 0) return "Nothing to update";
  return out;
}
