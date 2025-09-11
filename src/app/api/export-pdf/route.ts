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
    launch: (options?: { args?: string[] }) => Promise<Browser>;
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
  } catch {
    // Fallback to full puppeteer for local dev
    const puppeteer = (await import("puppeteer")) as unknown as PuppeteerModule;
    return puppeteer.default.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  }
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    const origin =
      process.env.APP_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const encoded = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");
    const url = `${origin}/print?data=${encodeURIComponent(encoded)}`;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

  // Wrap Buffer into a Uint8Array for Web Response compatibility
  return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}
