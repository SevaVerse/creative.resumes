import { TEMPLATES, carbonScore } from "@/components/templates/registry";
import { renderOgCard } from "@/lib/ogImage";
import { TEMPLATE_IDS, isTemplateId } from "@/types/resume";

// Served at /og/template/<id>.png (the extension avoids the trailing-slash redirect).
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return TEMPLATE_IDS.map((id) => ({ file: `${id}.png` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const id = (await params).file.replace(/\.png$/, "");
  const meta = isTemplateId(id) ? TEMPLATES[id] : TEMPLATES.minimalist;
  return renderOgCard({
    eyebrow: `Free resume template · Carbon ${carbonScore(meta)}/10`,
    title: `${meta.label} resume template`,
    subtitle: meta.description,
  });
}
