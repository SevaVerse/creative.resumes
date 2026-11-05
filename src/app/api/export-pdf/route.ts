import { NextRequest } from "next/server";
import { pdfLimiter, createRateLimiter, buildKey } from "@/utils/rateLimit";
import { logger, extractRequestId } from "@/utils/logger";
import { getCorsHeaders, clientKey } from "@/utils/cors";
import { getSessionUserId } from "@/utils/auth/session";
import { isTemplateId } from "@/types/resume";
import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import type { PrintPayload } from "@/components/PrintResume";

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

// Minimal runtime types to avoid using `any`
type PdfOptions = {
  format?: string;
  printBackground?: boolean;
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
};
type Page = {
  goto: (url: string, options?: Record<string, unknown>) => Promise<void>;
  pdf: (options?: PdfOptions) => Promise<Buffer>;
  setContent: (html: string, options?: Record<string, unknown>) => Promise<void>;
  evaluate: (pageFunction: (html: string) => void, html: string) => Promise<void>;
};
type Browser = {
  newPage: () => Promise<Page>;
  close: () => Promise<void>;
};
const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

const anonymousPdfLimiter = createRateLimiter(60_000, 3);

type SimpleLogger = { info: (m:string,e?:Record<string,unknown>)=>void; warn: (m:string,e?:Record<string,unknown>)=>void; debug:(m:string,e?:Record<string,unknown>)=>void };

// Each request launches and closes its own browser. A shared module-level instance is unsafe
// because Fluid Compute runs concurrent requests in one process: one request closing it would
// kill another request's render mid-way.
async function launchBrowser(log: SimpleLogger = logger): Promise<Browser> {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (isProduction) {
    log.info("pdf.launch.production_mode");
    try {
      const browser = (await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(remoteExecutablePath),
        headless: true,
      })) as Browser;
      log.info("pdf.launch.production_success");
      return browser;
    } catch (error) {
      log.warn("pdf.launch.production_failed", { error: (error as Error).message });
      throw error;
    }
  }

  log.info("pdf.launch.development_mode");
  try {
    const browser = (await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    })) as Browser;
    log.info("pdf.launch.development_success");
    return browser;
  } catch (error) {
    log.warn("pdf.launch.development_failed", { error: (error as Error).message });
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const started = performance.now();
  const requestId = extractRequestId(req.headers);
  const log = logger.withRequest(requestId);
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  let browser: Browser | null = null;

  try {
    // Signed-in users (Auth.js session cookie) get a higher export limit.
    const userId = (await getSessionUserId()) || undefined;
    let rateLimitHeaderValue = '3';
    let rateLimitRemainingValue = '0';
    log.info(userId ? 'pdf.authenticated' : 'pdf.anonymous_request', { userId });

    const anonymousKey = clientKey(req.headers);

    const rl = userId
      ? pdfLimiter.check(buildKey(["pdf", userId]))
      : anonymousPdfLimiter.check(buildKey(["pdf", "anonymous", anonymousKey]));

    rateLimitHeaderValue = userId ? '10' : '3';
    rateLimitRemainingValue = rl.remaining.toString();

    if (!rl.allowed) {
      log.warn('pdf.rate_limited', { userId, retryAfterMs: rl.retryAfterMs, anonymous: !userId });
      return new Response(
        JSON.stringify({ error: "Too many export requests", retryAfterMs: rl.retryAfterMs }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((rl.retryAfterMs || 0) / 1000).toString(),
            "RateLimit-Limit": rateLimitHeaderValue,
            "RateLimit-Remaining": "0",
            ...corsHeaders,
          },
        }
      );
    }
    log.info('pdf.start', { remaining: rl.remaining });
    const payload = await req.json();
    log.debug('pdf.payload', { selectedTemplate: payload?.selectedTemplate });

    browser = await launchBrowser(log);
    log.info("pdf.browser_ready");

    const page = await browser.newPage();
    log.debug("pdf.page_created");

    // Render the resume template to HTML server-side
    const printPayload: PrintPayload = {
      selectedTemplate: isTemplateId(payload?.selectedTemplate) ? payload.selectedTemplate : "minimalist",
      name: payload.name || '',
      email: payload.email || '',
      phone: payload.phone || '',
      website: payload.website || '',
      linkedin: payload.linkedin || '',
      summary: payload.summary || '',
      experiences: payload.experiences || [],
      education: payload.education || '',
      skills: payload.skills || [],
      certifications: payload.certifications || '',
      projects: payload.projects || '',
      // Only inline images: headless Chrome must not fetch arbitrary user-supplied URLs.
      profilePictureUrl: typeof payload.profilePictureUrl === 'string' && payload.profilePictureUrl.startsWith('data:image/')
        ? payload.profilePictureUrl
        : '',
    };

    // Dynamic imports to avoid Turbopack restriction on react-dom/server in route handlers
    const React = (await import('react')).default;
    const { renderToString } = await import('react-dom/server');
    const { default: PrintResume } = await import('@/components/PrintResume');
    const resumeHtml = renderToString(React.createElement(PrintResume, printPayload));
    
    // Build a complete self-contained HTML page with inline Tailwind-like styles
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 0; background: #fff; font-family: Arial, Helvetica, sans-serif; }
    .resume-container { width: 100%; max-width: 100%; }
  </style>
</head>
<body>
  <div style="min-height: 100vh; background: white; display: flex; align-items: flex-start; justify-content: center; padding: 24px;">
    ${resumeHtml}
  </div>
</body>
</html>`;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    log.info("pdf.page_loaded");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    log.info("pdf.generated", { bytes: pdf.length });

    // Wrap Buffer into a Uint8Array for Web Response compatibility
    const durationMs = +(performance.now() - started).toFixed(2);
    log.info('pdf.success', { durationMs, userId, anonymous: !userId });
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"`,
        "RateLimit-Limit": rateLimitHeaderValue,
        "RateLimit-Remaining": rateLimitRemainingValue,
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
  } finally {
    // Always release Chromium (closing the browser also closes its pages), even when rendering failed.
    if (browser) {
      await browser.close().catch((error: unknown) => {
        log.warn("pdf.browser_close_failed", { error: error instanceof Error ? error.message : String(error) });
      });
    }
  }
}
