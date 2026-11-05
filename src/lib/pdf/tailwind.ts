import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { compile } from "tailwindcss";

// Tailwind CSS for server-rendered PDF HTML, compiled on the server from exactly the classes the
// rendered resume uses. This replaces the Tailwind Play CDN script, so headless Chrome needs no
// network access and no JavaScript, and the PDF uses the same Tailwind version as the live preview.
//
// tailwindcss/index.css is self-contained (no @imports). It is read from disk at runtime, so
// next.config.ts lists it in outputFileTracingIncludes for the export-pdf function.

const TAILWIND_DIR = path.join(process.cwd(), "node_modules", "tailwindcss");
const TAILWIND_CSS = path.join(TAILWIND_DIR, "index.css");

let source: Promise<string> | null = null;

function tailwindSource(): Promise<string> {
  source ??= readFile(TAILWIND_CSS, "utf8").catch((error) => {
    source = null; // retry on the next request
    throw error;
  });
  return source;
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&lt;": "<", "&gt;": ">" };

/** Class names in React-rendered HTML (`class="..."`, entity-escaped by React). */
export function classCandidates(html: string): string[] {
  const out = new Set<string>();
  for (const match of html.matchAll(/\sclass="([^"]*)"/g)) {
    const value = match[1].replace(/&(?:amp|quot|#x27|#39|lt|gt);/g, (e) => ENTITIES[e]);
    for (const name of value.split(/\s+/)) if (name) out.add(name);
  }
  return [...out];
}

/** Compiled CSS (preflight, theme variables and the used utilities) for the given HTML. */
export async function tailwindCssFor(html: string): Promise<string> {
  const css = await tailwindSource();
  // A fresh compiler per call: build() accumulates candidates, and a shared one would grow
  // with every template ever exported. Compiling the base stylesheet takes a few milliseconds.
  const compiler = await compile('@import "tailwindcss";', {
    base: TAILWIND_DIR,
    loadStylesheet: async (id, base) => {
      if (id !== "tailwindcss") throw new Error(`Unexpected stylesheet import in PDF CSS: ${id}`);
      return { path: TAILWIND_CSS, base, content: css };
    },
  });
  return compiler.build(classCandidates(html));
}
