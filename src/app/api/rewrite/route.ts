import { NextRequest, NextResponse } from "next/server";
import { rewriteText, type RewriteType, type Tone, type Action, isAIRewriterEnabled, estimateTokens } from "@/utils/groq";
import { logger, extractRequestId } from "@/utils/logger";
import { createRateLimiter } from "@/utils/rateLimit";
import { verifySupabaseAuth, getCorsHeaders } from "@/utils/supabase/jwt";

// Rate limiting for AI rewrite requests (per user)
const rewriteLimiter = createRateLimiter(60 * 1000, 20); // 20 requests per minute

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(req: NextRequest) {
  const started = performance.now();
  const requestId = extractRequestId(req.headers);
  const log = logger.withRequest(requestId);
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  try {
    // Check if AI rewriter is enabled
    if (!isAIRewriterEnabled()) {
      log.warn('rewrite.disabled');
      return NextResponse.json(
        { error: "AI rewriter is not enabled" }, 
        { 
          status: 503,
          headers: corsHeaders,
        }
      );
    }

    // Verify Supabase authentication
    const authResult = await verifySupabaseAuth(req);
    if (!authResult.authenticated) {
      log.warn('rewrite.unauthorized', { error: authResult.error });
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to use AI rewrite.' },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }
    
    log.info('rewrite.authenticated', { userId: authResult.userId });

    // Rate limiting check (per authenticated user)
    const rlKey = `rewrite:${authResult.userId}`;
    const rl = rewriteLimiter.check(rlKey);
    
    if (!rl.allowed) {
      log.warn('rewrite.rate_limited', { userId: authResult.userId, retryAfterMs: rl.retryAfterMs });
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
            ...corsHeaders,
          }
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { text, type, tone = 'professional', action = 'improve' } = body;

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

    // Validate tone
    const validTones: Tone[] = ['professional', 'casual', 'technical'];
    if (!validTones.includes(tone as Tone)) {
      log.warn('rewrite.invalid_tone', { tone, validTones });
      return NextResponse.json(
        { error: `Invalid tone. Must be one of: ${validTones.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate action
    const validActions: Action[] = ['improve', 'expand', 'condense', 'achievements'];
    if (!validActions.includes(action as Action)) {
      log.warn('rewrite.invalid_action', { action, validActions });
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    log.info('rewrite.start', { 
      type, 
      tone,
      action,
      originalLength: text.length,
      estimatedTokens: estimateTokens(text),
      remaining: rl.remaining
    });

    // Perform the rewrite
    const rewrittenText = await rewriteText(text.trim(), type as RewriteType, tone as Tone, action as Action);

    const durationMs = +(performance.now() - started).toFixed(2);

    log.info('rewrite.success', {
      type,
      tone,
      action,
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
      tone,
      action,
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
        ...corsHeaders,
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
        { status: 500, headers: corsHeaders }
      );
    }

    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return NextResponse.json(
        { error: "AI service quota exceeded. Please try again later." },
        { status: 503, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to rewrite text. Please try again.",
        requestId 
      },
      { status: 500, headers: corsHeaders }
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