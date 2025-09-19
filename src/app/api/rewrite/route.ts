import { NextRequest, NextResponse } from "next/server";
import { rewriteText, type RewriteType, isAIRewriterEnabled, estimateTokens } from "@/utils/groq";
import { logger, extractRequestId } from "@/utils/logger";
import { createRateLimiter } from "@/utils/rateLimit";

// Rate limiting for AI rewrite requests (per IP)
const rewriteLimiter = createRateLimiter(60 * 1000, 20); // 20 requests per minute

export async function POST(req: NextRequest) {
  const started = performance.now();
  const requestId = extractRequestId(req.headers);
  const log = logger.withRequest(requestId);
  
  try {
    // Check if AI rewriter is enabled
    if (!isAIRewriterEnabled()) {
      log.warn('rewrite.disabled');
      return NextResponse.json(
        { error: "AI rewriter is not enabled" }, 
        { status: 503 }
      );
    }

    // Rate limiting check
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rlKey = `rewrite:${ip}`;
    const rl = rewriteLimiter.check(rlKey);
    
    if (!rl.allowed) {
      log.warn('rewrite.rate_limited', { ip, retryAfterMs: rl.retryAfterMs });
      return NextResponse.json(
        { 
          error: "Too many rewrite requests", 
          retryAfterMs: rl.retryAfterMs 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rl.retryAfterMs || 0) / 1000).toString(),
            "RateLimit-Limit": "20",
            "RateLimit-Remaining": rl.remaining.toString(),
          }
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { text, type } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      log.warn('rewrite.invalid_input', { hasText: !!text, textType: typeof text });
      return NextResponse.json(
        { error: "Text is required and must be a string" },
        { status: 400 }
      );
    }

    if (!type || typeof type !== 'string') {
      log.warn('rewrite.invalid_type', { hasType: !!type, typeValue: type });
      return NextResponse.json(
        { error: "Type is required and must be a valid RewriteType" },
        { status: 400 }
      );
    }

    // Validate text length (prevent abuse)
    if (text.length > 2000) {
      log.warn('rewrite.text_too_long', { length: text.length });
      return NextResponse.json(
        { error: "Text is too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    if (text.trim().length < 10) {
      log.warn('rewrite.text_too_short', { length: text.trim().length });
      return NextResponse.json(
        { error: "Text is too short (minimum 10 characters)" },
        { status: 400 }
      );
    }

    // Validate rewrite type
    const validTypes: RewriteType[] = [
      'job_summary', 
      'experience', 
      'skill_description', 
      'summary', 
      'projects'
    ];
    
    if (!validTypes.includes(type as RewriteType)) {
      log.warn('rewrite.invalid_rewrite_type', { type, validTypes });
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    log.info('rewrite.start', { 
      type, 
      originalLength: text.length,
      estimatedTokens: estimateTokens(text),
      remaining: rl.remaining
    });

    // Perform the rewrite
    const rewrittenText = await rewriteText(text.trim(), type as RewriteType);

    const durationMs = +(performance.now() - started).toFixed(2);

    log.info('rewrite.success', {
      type,
      originalLength: text.length,
      rewrittenLength: rewrittenText.length,
      savedChars: text.length - rewrittenText.length,
      durationMs,
      requestId
    });

    return NextResponse.json({
      success: true,
      original: text,
      rewritten: rewrittenText,
      type,
      stats: {
        originalLength: text.length,
        rewrittenLength: rewrittenText.length,
        savedChars: text.length - rewrittenText.length,
        estimatedTokens: estimateTokens(text + rewrittenText),
      },
      requestId
    }, {
      headers: {
        "RateLimit-Limit": "20",
        "RateLimit-Remaining": rl.remaining.toString(),
      }
    });

  } catch (error) {
    const durationMs = +(performance.now() - started).toFixed(2);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    log.error('rewrite.error', {
      error: errorMessage,
      durationMs,
      requestId
    });

    // Check if it's a Groq API error
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return NextResponse.json(
        { error: "AI service configuration error" },
        { status: 500 }
      );
    }

    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return NextResponse.json(
        { error: "AI service quota exceeded. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to rewrite text. Please try again.",
        requestId 
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to rewrite text." },
    { status: 405 }
  );
}