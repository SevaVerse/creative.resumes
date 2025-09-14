import { NextRequest } from "next/server";
import { pdfLimiter, buildKey } from "@/utils/rateLimit";
import { logger, extractRequestId } from "@/utils/logger";

// जय श्री राम - May this PDF generation be blessed
export const runtime = "nodejs"; // Puppeteer requires Node runtime (not Edge)

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
};
type Browser = {
  newPage: () => Promise<Page>;
  close: () => Promise<void>;
};
type ChromiumModule = {
  args: string[];
  headless: boolean | "new";
  defaultViewport?: unknown;
  executablePath: () => Promise<string>;
};
type PuppeteerCoreModule = {
  default: {
    launch: (options: {
      args?: string[];
      defaultViewport?: unknown;
      executablePath?: string;
      headless?: boolean | "new";
    }) => Promise<Browser>;
  };
};
type PuppeteerModule = {
  default: {
    launch: (options?: { args?: string[]; headless?: boolean }) => Promise<Browser>;
  };
};

type SimpleLogger = { info: (m:string,e?:Record<string,unknown>)=>void; warn: (m:string,e?:Record<string,unknown>)=>void; debug:(m:string,e?:Record<string,unknown>)=>void };
async function launchBrowser(log: SimpleLogger = logger) {
  // Prefer puppeteer-core + @sparticuz/chromium for serverless (Vercel)
  try {
    // Optional dependencies resolved dynamically (names as variables to avoid TS resolution at build time)
    const chromiumModuleName = "@sparticuz/chromium" as string;
    const puppeteerCoreModuleName = "puppeteer-core" as string;
    const chromium = (await import(chromiumModuleName)) as unknown as ChromiumModule;
    const puppeteerCore = (await import(puppeteerCoreModuleName)) as unknown as PuppeteerCoreModule;
    const executablePath = await chromium.executablePath();
    const browser = await puppeteerCore.default.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
    return browser;
  } catch (error) {
  log.warn("pdf.launch.fallback", { error: (error as Error).message });

    // Check if we're in production (Vercel) or development
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

    if (isProduction) {
      // For Vercel/serverless: Use minimal args optimized for serverless
      const puppeteer = (await import("puppeteer")) as unknown as PuppeteerModule;
      const browser = await puppeteer.default.launch({
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding"
        ],
        headless: true
      });
      log.info("pdf.launch.vercel_fallback");
      return browser;
    } else {
      // For local development (Windows): Use Windows-optimized args
      const puppeteer = (await import("puppeteer")) as unknown as PuppeteerModule;
      const browser = await puppeteer.default.launch({
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu"
        ],
        headless: true
      });
      log.info("pdf.launch.local_fallback");
      return browser;
    }
  }
}

export async function POST(req: NextRequest) {
  const started = performance.now();
  const requestId = extractRequestId(req.headers);
  const log = logger.withRequest(requestId);
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    // Perform rate limit check early (per IP only – could include template if desired)
    const rlKey = buildKey(["pdf", ip]);
    const rl = pdfLimiter.check(rlKey);
    if (!rl.allowed) {
      log.warn('pdf.rate_limited', { ip, retryAfterMs: rl.retryAfterMs });
      return new Response(
        JSON.stringify({ error: "Too many export requests", retryAfterMs: rl.retryAfterMs }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((rl.retryAfterMs || 0) / 1000).toString(),
            "RateLimit-Limit": "10",
            "RateLimit-Remaining": "0",
          },
        }
      );
    }
    log.info('pdf.start', { remaining: rl.remaining });
    const payload = await req.json();
    log.debug('pdf.payload', { selectedTemplate: payload?.selectedTemplate });

    const browser = await launchBrowser(log);
    log.info("pdf.browser_ready");

    const page = await browser.newPage();
    log.debug("pdf.page_created");

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const encoded = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");
    const url = `${origin}/print?data=${encodeURIComponent(encoded)}`;
  log.debug("pdf.url", { url });

  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  log.info("pdf.page_loaded");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    log.info("pdf.generated", { bytes: pdf.length });

    await browser.close();

    // Wrap Buffer into a Uint8Array for Web Response compatibility
    const durationMs = +(performance.now() - started).toFixed(2);
    log.info('pdf.success', { durationMs });
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"`,
        "RateLimit-Limit": "10",
        "RateLimit-Remaining": rl.remaining.toString(),
        "x-request-id": requestId || '',
      },
    });
  } catch (error) {
    const durationMs = +(performance.now() - started).toFixed(2);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("pdf.error", { error: errorMessage, durationMs, requestId });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
