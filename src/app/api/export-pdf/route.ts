import { NextRequest } from "next/server";
import { pdfLimiter, buildKey } from "@/utils/rateLimit";
import { logger, extractRequestId } from "@/utils/logger";
import { getRedis } from "@/utils/redis";
import { getBaseUrl } from "@/utils/baseUrl";
import { verifySupabaseAuth, getCorsHeaders } from "@/utils/supabase/jwt";
import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

// जय श्री राम - May this PDF generation be blessed
export const runtime = "nodejs"; // Puppeteer requires Node runtime (not Edge)

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// Add type declaration for global temp storage
declare global {
  var tempPdfData: Map<string, string> | undefined;
}

// Minimal runtime types to avoid using `any`
type GotoOptions = {
  waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  timeout?: number;
};
type PdfOptions = {
  format?: string;
  printBackground?: boolean;
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
};
type Page = {
  goto: (url: string, options?: GotoOptions) => Promise<void>;
  pdf: (options?: PdfOptions) => Promise<Buffer>;
  setContent: (html: string, options?: { waitUntil?: string }) => Promise<void>;
  evaluate: (pageFunction: (html: string) => void, html: string) => Promise<void>;
};
type Browser = {
  newPage: () => Promise<Page>;
  close: () => Promise<void>;
};
const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

let browserInstance: Browser | null = null;

type SimpleLogger = { info: (m:string,e?:Record<string,unknown>)=>void; warn: (m:string,e?:Record<string,unknown>)=>void; debug:(m:string,e?:Record<string,unknown>)=>void };

async function getBrowser(log: SimpleLogger = logger) {
  if (browserInstance) return browserInstance;

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  
  if (isProduction) {
    log.info("pdf.launch.production_mode");
    try {
      browserInstance = (await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(remoteExecutablePath),
        headless: true,
      })) as Browser;
      log.info("pdf.launch.production_success");
    } catch (error) {
      log.warn("pdf.launch.production_failed", { error: (error as Error).message });
      throw error;
    }
  } else {
    log.info("pdf.launch.development_mode");
    try {
      browserInstance = (await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
      })) as Browser;
      log.info("pdf.launch.development_success");
    } catch (error) {
      log.warn("pdf.launch.development_failed", { error: (error as Error).message });
      throw error;
    }
  }
  return browserInstance;
}

// Keep the old function name for compatibility
async function launchBrowser(log: SimpleLogger = logger) {
  return getBrowser(log);
}

export async function POST(req: NextRequest) {
  const started = performance.now();
  const requestId = extractRequestId(req.headers);
  const log = logger.withRequest(requestId);
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  try {
    // Verify Supabase authentication
    const authResult = await verifySupabaseAuth(req);
    if (!authResult.authenticated) {
      log.warn('pdf.unauthorized', { error: authResult.error });
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Please sign in to export PDFs.' }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    
    log.info('pdf.authenticated', { userId: authResult.userId });
    
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    // Perform rate limit check (per authenticated user, not IP)
    const rlKey = buildKey(["pdf", authResult.userId!]);
    const rl = pdfLimiter.check(rlKey);
    if (!rl.allowed) {
      log.warn('pdf.rate_limited', { userId: authResult.userId, retryAfterMs: rl.retryAfterMs });
      return new Response(
        JSON.stringify({ error: "Too many export requests", retryAfterMs: rl.retryAfterMs }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((rl.retryAfterMs || 0) / 1000).toString(),
            "RateLimit-Limit": "10",
            "RateLimit-Remaining": "0",
            ...corsHeaders,
          },
        }
      );
    }
    log.info('pdf.start', { remaining: rl.remaining });
    const payload = await req.json();
    log.debug('pdf.payload', { selectedTemplate: payload?.selectedTemplate });

    const browser = await launchBrowser(log);
    if (!browser) {
      throw new Error("Failed to launch browser");
    }
    log.info("pdf.browser_ready");

    const page = await browser.newPage();
    log.debug("pdf.page_created");

    const origin = getBaseUrl(req.headers);
    
    // Store payload temporarily and get an ID to avoid URL length limits
    const tempId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempData = JSON.stringify(payload);
    
    // Store in memory (in production, use Redis/database)
    globalThis.tempPdfData = globalThis.tempPdfData || new Map();
    globalThis.tempPdfData.set(tempId, tempData);
    
    // Clean up after 5 minutes
    setTimeout(() => {
      globalThis.tempPdfData?.delete(tempId);
    }, 5 * 60 * 1000);
    
    const url = `${origin}/print?id=${tempId}`;
    
    log.debug("pdf.url", { tempId, dataSize: tempData.length });

    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    log.info("pdf.page_loaded");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    log.info("pdf.generated", { bytes: pdf.length });

    await browser.close();

    // Best-effort increment of download metric (non-blocking)
    try {
      const redis = getRedis();
      if (redis) {
        await redis.incr("resume_downloads");
      }
    } catch {}

    // Wrap Buffer into a Uint8Array for Web Response compatibility
    const durationMs = +(performance.now() - started).toFixed(2);
    log.info('pdf.success', { durationMs, userId: authResult.userId });
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"`,
        "RateLimit-Limit": "10",
        "RateLimit-Remaining": rl.remaining.toString(),
        "x-request-id": requestId || '',
        ...corsHeaders,
      },
    });
  } catch (error) {
    const durationMs = +(performance.now() - started).toFixed(2);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("pdf.error", { error: errorMessage, durationMs, requestId });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
}
