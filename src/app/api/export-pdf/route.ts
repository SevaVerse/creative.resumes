import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/db/rateLimits";
import { insertAnalyticsEvent } from "@/lib/db/analytics";
import { logger, extractRequestId } from "@/utils/logger";
import { getCorsHeaders, clientKey } from "@/utils/cors";
import { getSessionUserId } from "@/utils/auth/session";
import { isTemplateId } from "@/types/resume";
import { isPlainObject, readJsonBody } from "@/lib/api/http";
import { toResumeData } from "@/lib/resumeData";
import { tailwindCssFor } from "@/lib/pdf/tailwind";
import chromium from "@sparticuz/chromium-min";
import puppeteerCore, { type Browser } from "puppeteer-core";
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

// Chromium build for Vercel's x64 functions. Its version must match @sparticuz/chromium-min in
// package.json (138.0.2); update both together. CHROMIUM_PACK_URL can point at a self-hosted copy.
const remoteExecutablePath =
  process.env.CHROMIUM_PACK_URL ||
  "https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack.x64.tar";

// A resume with a compressed profile photo (inline data URL) fits well within this; same budget
// as saved resumes (see src/app/api/resumes/validate.ts).
const MAX_PDF_BODY_BYTES = 3_000_000;

// Exports per minute, shared across server instances.
const PDF_LIMIT_ANON = 3; // per client
const PDF_LIMIT_USER = 10; // per signed-in user

type SimpleLogger = { info: (m:string,e?:Record<string,unknown>)=>void; warn: (m:string,e?:Record<string,unknown>)=>void; debug:(m:string,e?:Record<string,unknown>)=>void };

// Each request launches and closes its own browser. A shared module-level instance is unsafe
// because Fluid Compute runs concurrent requests in one process: one request closing it would
// kill another request's render mid-way.
async function launchBrowser(log: SimpleLogger = logger): Promise<Browser> {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (isProduction) {
    log.info("pdf.launch.production_mode");
    try {
      const browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(remoteExecutablePath),
        headless: true,
      });
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

/** Normalizes the untrusted request body into template props (same rules as public resume pages). */
function toPrintPayload(body: Record<string, unknown>): PrintPayload {
  return {
    // Photos are inline data: images only, so headless Chrome never fetches user-supplied URLs.
    ...toResumeData(body),
    selectedTemplate: isTemplateId(body.selectedTemplate) ? body.selectedTemplate : "minimalist",
  };
}

async function renderResumeHtml(payload: PrintPayload): Promise<string> {
  // Dynamic imports to avoid Turbopack restriction on react-dom/server in route handlers
  const React = (await import('react')).default;
  const { renderToString } = await import('react-dom/server');
  const { default: PrintResume } = await import('@/components/PrintResume');
  const resumeHtml = renderToString(React.createElement(PrintResume, payload));
  const css = await tailwindCssFor(resumeHtml);

  // Self-contained page: no scripts and no external resources.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
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
}

function jsonResponse(status: number, body: Record<string, unknown>, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
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
    log.info(userId ? 'pdf.authenticated' : 'pdf.anonymous_request', { userId });

    const rl = userId
      ? await checkRateLimit("pdf:user", userId, 60_000, PDF_LIMIT_USER)
      : await checkRateLimit("pdf:anon", clientKey(req.headers), 60_000, PDF_LIMIT_ANON);
    const rateLimitHeaderValue = String(userId ? PDF_LIMIT_USER : PDF_LIMIT_ANON);

    if (!rl.allowed) {
      log.warn('pdf.rate_limited', { userId, retryAfterMs: rl.retryAfterMs, anonymous: !userId });
      return jsonResponse(429, { error: "Too many export requests", retryAfterMs: rl.retryAfterMs }, {
        "Retry-After": Math.ceil((rl.retryAfterMs || 0) / 1000).toString(),
        "RateLimit-Limit": rateLimitHeaderValue,
        "RateLimit-Remaining": "0",
        ...corsHeaders,
      });
    }
    log.info('pdf.start', { remaining: rl.remaining });

    const body = await readJsonBody<unknown>(req, MAX_PDF_BODY_BYTES);
    if (!isPlainObject(body)) {
      return jsonResponse(400, { error: "Resume data is invalid or too large" }, corsHeaders);
    }
    const payload = toPrintPayload(body);
    log.debug('pdf.payload', { selectedTemplate: payload.selectedTemplate });

    // Render before launching Chromium, so bad input fails fast and cheaply.
    const fullHtml = await renderResumeHtml(payload);

    browser = await launchBrowser(log);
    log.info("pdf.browser_ready");

    const page = await browser.newPage();
    // The page is fully self-contained: run no scripts and make no network requests
    // (inline data: images are still allowed).
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.url().startsWith("data:")) void request.continue();
      else void request.abort();
    });
    await page.setContent(fullHtml, { waitUntil: "load" });
    log.info("pdf.page_loaded");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    log.info("pdf.generated", { bytes: pdf.length });

    const durationMs = +(performance.now() - started).toFixed(2);
    log.info('pdf.success', { durationMs, userId, anonymous: !userId });
    // The public download counter is fed here, by real exports, not by a client-sent event.
    // Anonymous: only the template name is recorded.
    await insertAnalyticsEvent("resume_download", null, { template: payload.selectedTemplate }).catch((error: unknown) => {
      log.warn("pdf.analytics_failed", { error: error instanceof Error ? error.message : String(error) });
    });
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"`,
        "RateLimit-Limit": rateLimitHeaderValue,
        "RateLimit-Remaining": rl.remaining.toString(),
        "x-request-id": requestId || '',
        ...corsHeaders,
      },
    });
  } catch (error) {
    const durationMs = +(performance.now() - started).toFixed(2);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("pdf.error", { error: errorMessage, durationMs });
    // Internal details stay in the logs; the client gets a request id to report.
    return jsonResponse(500, { error: "Failed to generate the PDF. Please try again.", requestId }, corsHeaders);
  } finally {
    // Always release Chromium (closing the browser also closes its pages), even when rendering failed.
    if (browser) {
      await browser.close().catch((error: unknown) => {
        log.warn("pdf.browser_close_failed", { error: error instanceof Error ? error.message : String(error) });
      });
    }
  }
}
