// Minimal ambient module declarations for optional serverless PDF deps.
// These are used via dynamic import; at build time on environments where
// packages aren't installed locally, we still want type-check to pass.

declare module "@sparticuz/chromium" {
  export const args: string[];
  export const headless: boolean | "new";
  export const defaultViewport: unknown;
  export function executablePath(): Promise<string>;
}

declare module "puppeteer-core" {
  const puppeteerCore: {
    launch: (options?: unknown) => unknown;
  };
  export default puppeteerCore;
}
