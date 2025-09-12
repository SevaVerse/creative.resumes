import { NextRequest } from "next/server";

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

async function launchBrowser() {
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
    console.log("Failed to launch with puppeteer-core, trying fallback:", error);

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
      console.log("Successfully launched browser with Vercel fallback");
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
      console.log("Successfully launched browser with local dev fallback");
      return browser;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Starting PDF export...");
    const payload = await req.json();
    console.log("Payload received:", payload.selectedTemplate);

    const browser = await launchBrowser();
    console.log("Browser launched successfully");

    const page = await browser.newPage();
    console.log("New page created");

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const encoded = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");
    const url = `${origin}/print?data=${encodeURIComponent(encoded)}`;
    console.log("Generated URL:", url);

    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    console.log("Page loaded successfully");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    console.log("PDF generated successfully, size:", pdf.length);

    await browser.close();

    // Wrap Buffer into a Uint8Array for Web Response compatibility
    return new Response(new Uint8Array(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="resume.pdf"`,
        },
      });
  } catch (error) {
    console.error("PDF export error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
