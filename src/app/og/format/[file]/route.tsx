import { RESUME_FORMATS, getResumeFormat } from "@/data/resumeFormats";
import { renderOgCard } from "@/lib/ogImage";

// Served at /og/format/<slug>.png (the extension avoids the trailing-slash redirect).
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return RESUME_FORMATS.map((f) => ({ file: `${f.slug}.png` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const f = getResumeFormat((await params).file.replace(/\.png$/, ""));
  if (!f) return new Response("Not found", { status: 404 });
  return renderOgCard({ eyebrow: "Free resume format guide", title: f.h1, subtitle: "Section order, sample, common mistakes and a free template." });
}
