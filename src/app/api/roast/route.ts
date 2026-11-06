import { NextRequest, NextResponse } from "next/server";
import { getGroq, GROQ_MODEL, isAIRewriterEnabled } from "@/utils/groq";
import { logger, extractRequestId } from "@/utils/logger";
import { checkRateLimit } from "@/lib/db/rateLimits";
import { clientKey, getCorsHeaders } from "@/utils/cors";
import { jsonError, readJsonBody, isPlainObject } from "@/lib/api/http";

export const runtime = "nodejs";

// No sign-in needed (it is a top-of-funnel tool), so limits are per client, kept tight, and shared
// across server instances (each roast is a paid AI call).
const ROAST_WINDOW_MS = 10 * 60_000;
const ROAST_LIMIT = 5;

const MAX_CHARS = 12_000;
const MIN_CHARS = 200;
const MAX_BODY_BYTES = 64 * 1024;

const SYSTEM_PROMPT = `You are a witty, kind career coach doing a light-hearted "roast" of a resume, like a friendly stand-up comic who genuinely wants the person to get hired.
Rules:
- Be funny about the RESUME (vague bullets, missing numbers, buzzwords, length, formatting), never about the person, their background, college, gender, age, religion, caste, region or appearance.
- Never repeat the person's name, email, phone, address, employer names or any other identifying detail.
- No profanity or slurs. Keep each line under 30 words.
- Then give concrete, practical fixes.
Respond ONLY with JSON: {"roasts": [3 or 4 short funny lines], "fixes": [3 short actionable fixes]}.`;

function cleanLines(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.replace(/\s+/g, " ").trim().slice(0, 240))
    .filter((v) => v.length > 0)
    .slice(0, max);
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get("origin")) });
}

export async function POST(req: NextRequest) {
  const started = performance.now();
  const log = logger.withRequest(extractRequestId(req.headers));
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (!isAIRewriterEnabled()) {
    // The client falls back to locally generated roast lines.
    return jsonError(503, "AI roast is not available right now", corsHeaders);
  }

  const rl = await checkRateLimit("roast", clientKey(req.headers), ROAST_WINDOW_MS, ROAST_LIMIT);
  if (!rl.allowed) {
    log.warn("roast.rate_limited", { retryAfterMs: rl.retryAfterMs });
    return NextResponse.json(
      { error: "Too many roasts. Give the oven a few minutes to cool down.", retryAfterMs: rl.retryAfterMs },
      { status: 429, headers: { "Retry-After": Math.ceil((rl.retryAfterMs ?? 0) / 1000).toString(), ...corsHeaders } },
    );
  }

  const body = await readJsonBody<unknown>(req, MAX_BODY_BYTES);
  if (!isPlainObject(body) || typeof body.text !== "string") return jsonError(400, "Resume text is required", corsHeaders);
  const text = body.text.trim();
  if (text.length < MIN_CHARS) return jsonError(400, `Paste at least ${MIN_CHARS} characters of your resume`, corsHeaders);
  if (text.length > MAX_CHARS) return jsonError(400, `Resume text is too long (max ${MAX_CHARS} characters)`, corsHeaders);

  try {
    const response = await getGroq().chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Roast this resume:\n"""\n${text}\n"""` },
      ],
      temperature: 0.9,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });
    const raw = response.choices[0]?.message?.content ?? "";
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    const roasts = isPlainObject(parsed) ? cleanLines(parsed.roasts, 4) : [];
    const fixes = isPlainObject(parsed) ? cleanLines(parsed.fixes, 3) : [];
    if (roasts.length === 0) throw new Error("empty_roast");

    // Lengths and timings only: resume text and AI output are never logged.
    log.info("roast.success", { chars: text.length, roasts: roasts.length, durationMs: +(performance.now() - started).toFixed(0) });
    return NextResponse.json({ roasts, fixes }, { headers: { "Cache-Control": "no-store", ...corsHeaders } });
  } catch (error) {
    log.error("roast.error", { error: (error as Error).message, durationMs: +(performance.now() - started).toFixed(0) });
    return jsonError(502, "The roast burned. Please try again.", corsHeaders);
  }
}
